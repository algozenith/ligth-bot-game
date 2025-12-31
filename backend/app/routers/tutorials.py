from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel

# Database Imports
from app.database import get_db
from app.sql_models import User
from app.auth import get_current_user  
from app.models import ProgressPayload
from Levels.tutorial_levels import TUTORIAL_LEVELS

router = APIRouter(tags=["User Progress"])

@router.get("/user/progress_tutorial")
def get_progress(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == current_user).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"progress": user.tutorial_progress}

@router.post("/user/progress_tutorial")
def update_progress(
    payload: ProgressPayload, 
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == current_user).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Only update if new progress is greater
    if payload.progress > user.tutorial_progress:
        user.tutorial_progress = payload.progress
        db.commit()  # Save changes to SQL

    return {"message": "Progress saved"}

@router.get("/tutorial_levels")
def get_tutorial_levels():
    return TUTORIAL_LEVELS