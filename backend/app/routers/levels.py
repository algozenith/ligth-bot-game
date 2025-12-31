from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
# from app.sql_models import CustomLevel
from app.models import SubmitPayload
from app.simulator import run_lightbot
import math
from Levels.levels import LEVELS
from datetime import date
from app.config import MAX_LIVES  # Ensure MAX_LIVES is in your config.py

router = APIRouter(tags=["Levels"])

# --- VALIDATION HELPERS ---

def _validate_grid(level: dict):
    size = level.get("gridSize")
    heights = level.get("heights")

    if not size or not isinstance(heights, list):
        raise HTTPException(400, "Invalid grid data")

    if len(heights) != size or any(len(row) != size for row in heights):
        raise HTTPException(400, "Heights do not match gridSize")


def _handle_simulation_errors(result: dict):
    if result.get("success"):
        return

    reason = result.get("reason")
    errors = {
        "NO_GOALS": "Add at least one goal",
        "GOALS_NOT_LIT": "Not all goals were lit",
        "TIME_LIMIT_EXCEEDED": "Infinite loop detected",
    }

    raise HTTPException(400, errors.get(reason, f"Simulation failed: {reason}"))


# --- EXPERIENCE & GAME LOGIC ---

def exp_required_for_level(level: int) -> int:
    """XP needed to reach next level"""
    return int(500 * (level))


def get_level_from_exp(exp: int) -> int:
    level = 1
    while exp >= exp_required_for_level(level):
        exp -= exp_required_for_level(level)
        level += 1
    return level


def calculate_attack_exp(attacker_level: int, defender_level: int) -> int:
    base_exp = 200

    level_diff = defender_level - attacker_level
    multiplier = 1 + (level_diff * 0.15)

    # Clamp reward
    multiplier = max(0.5, min(multiplier, 2.5))

    return int(base_exp * multiplier)


# --- LIVES SYSTEM LOGIC ---
# Call these from auth.py, users.py, and arena.py

def check_daily_reset(user) -> bool:
    """
    Checks if today is a new day. Resets lives if true.
    Usage: if check_daily_reset(current_user): db.commit()
    """
    today = date.today()
    # If last_lives_reset is None (legacy users) or different date
    if user.last_lives_reset != today:
        user.lives = MAX_LIVES
        user.last_lives_reset = today
        return True # Indicates a change happened
    return False


def deduct_life(user) -> bool:
    """
    Safely removes a life.
    Usage: deduct_life(current_user)
    """
    if user.lives > 0:
        user.lives -= 1
        return True
    return False


def handle_win_restoration(user, opponent_level: int) -> int:
    """
    Simpler Hardcore Logic:
    - If Opponent Level > User Level: +1 Life.
    - Otherwise: No lives restored.
    """
    
    user_level = get_level_from_exp(user.experience)
    
    lives_restored = 0
    
    # The Logic
    if opponent_level > user_level:
        if user.lives < MAX_LIVES:
            user.lives += 1
            lives_restored = 1
            print(f"[LIVES] Underdog Win! (Opp: {opponent_level} > You: {user_level}) -> +1 Life")
        else:
            print(f"[LIVES] Underdog Win, but lives full.")
    else:
        print(f"[LIVES] Standard Win (Opp: {opponent_level} <= You: {user_level}) -> No Life Restored")

    return lives_restored