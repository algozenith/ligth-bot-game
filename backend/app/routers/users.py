from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel

from app.database import get_db
from app.sql_models import User, BattleLog
from app.auth import get_current_user  
from app.models import BattleResultPayload
from app.config import MAX_LIVES

# --- IMPORT HELPERS ---
from app.routers.levels import (
    get_level_from_exp, 
    exp_required_for_level,
    check_daily_reset,  # NEW
    deduct_life         # NEW
)

router = APIRouter(tags=["User Profile"])

@router.get("/me")
def get_me(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch user from SQL
    user = db.query(User).filter(User.username == current_user).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # --- NEW: Check Daily Reset ---
    # FIX: Call as helper function
    if check_daily_reset(user):
        db.commit()

    # BaseSnapshot-aware base info
    base_snapshot = user.base or {}
    base_info = None

    if base_snapshot and "level" in base_snapshot:
        level = base_snapshot["level"]
        base_info = {
            "name": level.get("name", "Unknown Base"),
            "gridSize": level.get("gridSize"),
            "goals": len(level.get("goals", []))
        }

    return {
        "username": user.username,
        "tutorial_progress": user.tutorial_progress,
        "coins": user.coins,
        "trophies": user.trophies,
        "wins": user.wins,
        "base_info": base_info,
        
        # --- NEW: Lives Data ---
        "lives": user.lives,
        "max_lives": MAX_LIVES
    }

@router.get("/user/profile")
def get_profile(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == current_user).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Optional: Check reset here too ensuring profile view is always accurate
    # FIX: Call as helper function
    if check_daily_reset(user):
        db.commit()

    total_exp = user.experience

    current_level = get_level_from_exp(total_exp)

    # Calculate cumulative XP required to reach CURRENT level
    xp_for_current_level = 0
    for l in range(1, current_level):
        xp_for_current_level += exp_required_for_level(l)
    
    # XP earned strictly within this level
    exp_in_current_level = total_exp - xp_for_current_level
    
    # XP needed to finish this level
    xp_needed_for_next = exp_required_for_level(current_level)
    # -----------------------------------

    # Calculate Total Battles efficiently using SQL Count
    total_battles = db.query(BattleLog).filter(
        or_(
            BattleLog.attacker_id == user.username, 
            BattleLog.defender_id == user.username
        )
    ).count()

    # Rank based on level
    rank = "NOVICE"
    if current_level > 5:
        rank = "ADEPT"
    if current_level > 10:
        rank = "ELITE"
    if current_level > 20:
        rank = "MASTER"

    return {
        "username": user.username,
        "level": current_level,
        "exp": exp_in_current_level,
        "total_exp": total_exp,
        "expToNextLevel": xp_needed_for_next, 
        "trophies": user.trophies,
        "totalWins": user.wins,
        "totalBattles": total_battles,
        "coins": user.coins,
        "rank": rank,
        "joinedAt": user.joined_at,
        
        # New Stats
        "lives": user.lives
    }


# -----------------------------
# Battle result (Post-Game Stats)
# -----------------------------

@router.post("/user/add_battle_result")
def add_battle_result(
    payload: BattleResultPayload,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates user stats after a PvE or local battle.
    Note: PvP Arena battles use /arena/report instead.
    """
    user = db.query(User).filter(User.username == current_user).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check reset before applying game logic
    # FIX: Call as helper function
    check_daily_reset(user)

    # Update Stats
    user.experience += payload.experienceEarned

    if payload.isWin:
        user.wins += 1
        # NOTE: We generally don't restore lives for PvE wins (like tutorials),
        # only PvP. But if you want to, you can call handle_win_restoration(user, 1) here.
    else:
        # --- NEW: Deduct Life on Loss ---
        # FIX: Call as helper function
        deduct_life(user)

    # Ensure trophies don't go below 0
    new_trophies = user.trophies + payload.trophiesDelta
    user.trophies = max(0, new_trophies)

    db.commit()  # Persist changes to Database

    return {
        "message": "Battle result processed",
        "total_exp": user.experience,
        "level": get_level_from_exp(user.experience), # Dynamic Level
        
        # Return updated lives so frontend can update HUD
        "lives": user.lives,
        "max_lives": MAX_LIVES
    }