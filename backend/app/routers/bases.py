from uuid import uuid4
from datetime import datetime
from typing import List, Dict, Any

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.database import get_db
from app.sql_models import User
from app.auth import get_current_user  # Updated import location
from app.models import SubmitPayload, BaseSnapshot, BaseHistoryItem
from app.simulator import run_lightbot
from app.routers.levels import _validate_grid, _handle_simulation_errors # Ensure correct relative import if needed

router = APIRouter(prefix="/user/base", tags=["Bases"])

# -----------------------------
# Helper: Compare layouts only
# -----------------------------

def _is_same_layout(level1: Dict[str, Any], level2: Dict[str, Any]) -> bool:
    """
    Checks if the structural layout of the level is identical.
    Ignores name/description differences.
    """
    keys = [
        "gridSize", "heights", "start", "goals",
        "iceTiles", "teleportLinks", "elevatorMeta"
    ]
    # Use .get() to safely handle missing keys (e.g. older versions)
    return all(level1.get(k) == level2.get(k) for k in keys)


# =======================
# ACTIVE BASE
# =======================

@router.get("")
def get_user_base(
    current_user: str = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user: 
        raise HTTPException(404, "User not found")
    
    # Return empty default if None, but SQL model usually has default
    return user.base or {}


@router.post("/submit")
def submit_user_base(
    payload: SubmitPayload, 
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user: 
        raise HTTPException(404, "User not found")

    level_data = payload.level.dict()
    # Use by_alias=False to store canonical keys "m1"/"m2"
    program_data_sim = payload.programs.dict(by_alias=False)
    
    # Normalize data defaults
    level_data.setdefault("elevatorMeta", {})
    level_data.setdefault("teleportLinks", {})
    level_data.setdefault("iceTiles", [])
    
    # 1. Validate Structure
    _validate_grid(level_data)
    
    # 2. Validate Solution (Simulation)
    result = run_lightbot(level_data, program_data_sim)
    _handle_simulation_errors(result)

    # 3. Create Snapshot
    new_snapshot = {
        "level": level_data,
        "programs": program_data_sim
    }

    # 4. Update Active Base
    user.base = new_snapshot
    
    # 5. Update History
    if user.base_history is None:
        user.base_history = []
        
    # Check if layout changed significantly before saving to history
    # Filter existing history to avoid duplicates if logic requires, 
    # but standard practice is just to append valid submissions.
    # Here we adopt your original logic: remove duplicates if layout is identical
    user.base_history = [
        h for h in user.base_history 
        if not _is_same_layout(h["level"], level_data)
    ]
    
    history_entry = {
        "id": str(uuid4()),
        "level": level_data,
        "programs": program_data_sim,
        "submittedAt": datetime.utcnow().isoformat(),
    }
    
    user.base_history.append(history_entry)
    
    # Trim to last 20
    if len(user.base_history) > 20:
        user.base_history = user.base_history[-20:]

    # Crucial for SQLAlchemy JSON updates
    flag_modified(user, "base_history") 
    
    db.commit()
    return {"message": "Base validated & deployed"}


# =======================
# HISTORY
# =======================

@router.get("/history", response_model=List[BaseHistoryItem])
def get_base_history(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user: 
        raise HTTPException(404, "User not found")

    # Return reversed (newest first)
    history = user.base_history or []
    return history[::-1]


@router.post("/restore/{history_id}")
def restore_history_base(
    history_id: str, 
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user: 
        raise HTTPException(404, "User not found")

    history = user.base_history or []
    entry = next((h for h in history if h["id"] == history_id), None)

    if not entry:
        raise HTTPException(404, "History entry not found")

    # Set active base to this entry
    user.base = {
        "level": entry["level"],
        "programs": entry["programs"],
    }
    
    db.commit()

    return {
        "message": "Base restored successfully",
        "level": entry["level"],
        "programs": entry["programs"],
    }


@router.patch("/history/{entry_id}/name")
def update_history_name(
    entry_id: str,
    payload: Dict[str, str],
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user: 
        raise HTTPException(404, "User not found")

    new_name = payload.get("name")
    if not new_name:
        raise HTTPException(400, "Name is required")

    history = user.base_history or []
    found = False
    
    for entry in history:
        if entry["id"] == entry_id:
            entry["level"]["name"] = new_name
            found = True
            break
            
    if not found:
        raise HTTPException(404, "History entry not found")

    flag_modified(user, "base_history")
    db.commit()
    
    return {"message": "Name updated", "newName": new_name}


# =======================
# DRAFTS
# =======================

@router.get("/drafts")
def get_base_drafts(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user: 
        raise HTTPException(404, "User not found")

    return user.drafts or []

@router.post("/draft")
def save_new_draft(
    payload: BaseSnapshot, 
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user: 
        raise HTTPException(404, "User not found")
    
    draft = {
        "id": str(uuid4()),
        "name": payload.level.name or "Untitled Draft",
        "level": payload.level.dict(),
        "programs": payload.programs.dict(by_alias=False),
        "updatedAt": datetime.utcnow().isoformat(),
    }

    if user.drafts is None: 
        user.drafts = []
        
    user.drafts.append(draft)
    flag_modified(user, "drafts")
    
    db.commit()
    return {"message": "Draft saved", "draftId": draft["id"]}

@router.delete("/draft/{draft_id}")
def delete_draft(
    draft_id: str, 
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user: 
        raise HTTPException(404, "User not found")

    initial_len = len(user.drafts or [])
    user.drafts = [d for d in (user.drafts or []) if d["id"] != draft_id]
    
    if len(user.drafts) == initial_len:
        raise HTTPException(404, "Draft not found")

    flag_modified(user, "drafts")
    db.commit()
    
    return {"message": "Draft deleted"}