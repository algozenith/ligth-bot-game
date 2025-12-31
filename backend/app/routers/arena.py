from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, func
from sqlalchemy.orm.attributes import flag_modified

from app.database import get_db
from app.sql_models import User, BattleLog
from app.auth import get_current_user
# Ensure these Pydantic models exist in your app.models
from app.models import LeaderboardEntry, BattleReportPayload, ArenaTargetResponse
# --- UPDATED IMPORTS: Import the standalone helper functions ---
from app.routers.levels import (
    get_level_from_exp, 
    calculate_attack_exp,
    check_daily_reset,      # NEW
    deduct_life,            # NEW
    handle_win_restoration  # NEW
)

router = APIRouter(tags=["Arena"])

# --- HELPERS ---

def get_active_attack(user: User, target_username: str) -> Optional[dict]:
    """Finds an ongoing attack session against a specific target."""
    attacks = user.active_attacks or []
    for attack in attacks:
        if attack.get("target_user") == target_username:
            return attack
    return None

def clear_active_attack(user: User, target_username: str):
    """Removes the attack session after battle ends."""
    if user.active_attacks:
        # Create a new list excluding the target to ensure clean state
        updated_attacks = [
            a for a in user.active_attacks 
            if a.get("target_user") != target_username
        ]
        user.active_attacks = updated_attacks
        # Notify SQLAlchemy that the JSON field has changed
        flag_modified(user, "active_attacks")

# --- ENDPOINTS ---

@router.get("/user/arena/opponents")
def get_arena_opponents(
    current_user: str = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Fetch 50 random users who aren't me
    potential_opponents = db.query(User).filter(User.username != current_user).limit(50).all()
    
    opponents = []
    for u in potential_opponents:
        base_snapshot = u.base
        # Skip if user hasn't set up a base yet
        if not base_snapshot or "level" not in base_snapshot:
            continue
        
        level_data = base_snapshot["level"]
        # Calculate Level based on experience
        user_level = get_level_from_exp(u.experience)

        opponents.append({
            "id": u.username, 
            "username": u.username,
            "name": level_data.get("name", f"{u.username}'s Outpost"),
            "gridSize": level_data.get("gridSize", 6),
            "goals": level_data.get("goals", []),
            "trophies": u.trophies,
            "level": user_level
        })
    return opponents

@router.get("/user/arena/target/{target_id}", response_model=ArenaTargetResponse)
def get_arena_target(
    target_id: str, 
    snapshotId: Optional[str] = None,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attacker = db.query(User).filter(User.username == current_user).first()
    target_user = db.query(User).filter(User.username == target_id).first()
    
    if not attacker: raise HTTPException(404, "Attacker profile not found")
    if not target_user: raise HTTPException(404, "Target not found")
    
    # --- CHECK LIVES & DAILY RESET ---
    # FIX: Call the helper function passing the user object
    if check_daily_reset(attacker):
        db.commit() # Save the reset if it happened

    target_base = target_user.base
    if not target_base or "level" not in target_base:
        raise HTTPException(404, "Target base not found or undeployed")
    
    target_level_data = target_base["level"]

    # Check for Existing Session
    active_session = get_active_attack(attacker, target_id)
    
    now = datetime.utcnow()
    remaining_seconds = 0
    level_to_play = None

    if active_session:
        # --- RESUME EXISTING SESSION ---
        expires_at = datetime.fromisoformat(active_session["expires_at"])
        remaining_seconds = max(0, int((expires_at - now).total_seconds()))
        
        # Use frozen level from session
        level_to_play = active_session.get("frozen_level", target_level_data)
    else:
        # --- START NEW SESSION ---
        
        # ⛔ CRITICAL: Check Lives before starting new game
        if attacker.lives <= 0:
            raise HTTPException(403, "Out of Lives! Come back tomorrow or wait for reset.")

        level_to_play = target_level_data
        
        # Calculate time
        grid_size = level_to_play.get("gridSize", 6)
        minutes_allowed = max(5, grid_size)
        time_limit_seconds = minutes_allowed * 60
        expires_at = now + timedelta(seconds=time_limit_seconds)
        
        new_session = {
            "target_user": target_id,
            "started_at": now.isoformat(),
            "expires_at": expires_at.isoformat(),
            "snapshot_id": snapshotId,       
            "frozen_level": level_to_play 
        }
        
        # FIX: Safer list initialization and assignment for JSON columns
        current_attacks = list(attacker.active_attacks) if attacker.active_attacks else []
        current_attacks.append(new_session)
        attacker.active_attacks = current_attacks
        
        flag_modified(attacker, "active_attacks") # Crucial for JSON columns
        
        db.commit()
        
        remaining_seconds = time_limit_seconds

    return {
        "level": level_to_play,
        "remainingTime": remaining_seconds
    }

@router.post("/user/arena/report")
def report_battle(
    payload: BattleReportPayload, 
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # --- DEBUG LOG ---
    print(f"\n[REPORT START] User: {current_user} vs Target: {payload.targetUser}")
    print(f"[REPORT CLAIM] Client says Win? {payload.isWin}")

    attacker = db.query(User).filter(User.username == current_user).first()
    defender = db.query(User).filter(User.username == payload.targetUser).first()

    if not attacker: raise HTTPException(404, "Attacker profile not found")
    if payload.targetUser == current_user: raise HTTPException(400, "Cannot attack yourself")

    # Ensure lives are up to date (Just in case day rolled over mid-game)
    # FIX: Call as function
    check_daily_reset(attacker)

    # 1. RETRIEVE SESSION
    active_session = get_active_attack(attacker, payload.targetUser)
    
    # --- DEBUG LOG ---
    if not active_session:
        print(f"❌ [FAIL] No active session found in DB for {current_user}")
    else:
        print(f"✅ [OK] Session found. Expires at: {active_session['expires_at']}")

    # 2. VALIDATE TIME (With 15s Grace Period for Latency)
    if payload.isWin:
        if not active_session:
            print("⚠️ Denying Win: No Active Session")
            payload.isWin = False
        else:
            expires_at = datetime.fromisoformat(active_session["expires_at"])
            # Add 15 seconds buffer for network lag/loading times
            if datetime.utcnow() > (expires_at + timedelta(seconds=15)):
                print(f"⚠️ Denying Win: Time Expired! (Server: {datetime.utcnow()} > Limit: {expires_at})")
                payload.isWin = False
            else:
                print("✅ [OK] Time validation passed")

    # 3. CALCULATE REWARDS
    earned_exp = 0
    
    # Handle defender level safely
    defender_current_level = defender.base.get("level", {}) if (defender and defender.base) else {}
    final_snapshot = payload.level_snapshot or defender_current_level

    # Determine Opponent Level (for EXP and Life Restoration)
    attacker_level = get_level_from_exp(attacker.experience)
    defender_level = get_level_from_exp(defender.experience) if defender else attacker_level

    if payload.isWin:
        # Give Coins/Trophies
        attacker.coins += payload.coinsEarned
        attacker.trophies += 20
        attacker.wins += 1

        # --- ❤️ LIVES RESTORATION ---
        # User won -> Restore lives based on opponent difficulty
        # FIX: Call as helper function
        restored = handle_win_restoration(attacker, defender_level)
        print(f"[LIVES] Win against Lvl {defender_level}. Restored {restored} lives.")

        # Calculate EXP
        print(f"[MATH] Attacker Lvl: {attacker_level} vs Defender Lvl: {defender_level}")
        
        raw_exp = calculate_attack_exp(attacker_level, defender_level)
        print(f"[MATH] Raw calculated EXP: {raw_exp}")

        # Anti-Farming Check
        recent_attacks = db.query(BattleLog).filter(
            BattleLog.attacker_id == current_user,
            BattleLog.defender_id == payload.targetUser,
            BattleLog.timestamp > datetime.utcnow() - timedelta(minutes=30)
        ).count()

        if recent_attacks >= 3:
            print(f"⚠️ Farming Detected ({recent_attacks} recent). Slashing EXP.")
            earned_exp = int(raw_exp * 0.25)
        else:
            earned_exp = raw_exp

        attacker.experience += earned_exp
        
        # Defense Revenge Logic
        db.query(BattleLog).filter(
            BattleLog.defender_id == current_user,
            BattleLog.attacker_id == payload.targetUser,
            BattleLog.is_revenged == False
        ).update({BattleLog.is_revenged: True}, synchronize_session=False)

        if defender:
            defender.trophies = max(0, defender.trophies - 10)
    
    else:
        # --- 💔 LOSS PENALTY ---
        # User lost -> Deduct a life
        print(f"[LIVES] Defeat reported. Deducting life.")
        # FIX: Call as helper function
        deduct_life(attacker)

    # 4. SAVE LOG & CLEANUP
    log = BattleLog(
        attacker_id=attacker.username,
        defender_id=payload.targetUser,
        winner_id=current_user if payload.isWin else payload.targetUser,
        score=payload.score,
        timestamp=datetime.utcnow(),
        replay_data=payload.replay_programs,
        level_snapshot=final_snapshot,
        is_revenged=False 
    )
    db.add(log)
    
    clear_active_attack(attacker, payload.targetUser)
    db.commit()

    print(f"[RESULT] Final EXP awarded: {earned_exp}")
    
    return {
        "status": "success",
        "new_coins": attacker.coins,
        "new_trophies": attacker.trophies,
        "gained_exp": earned_exp if payload.isWin else 0,
        "new_level": get_level_from_exp(attacker.experience),
        "forced_loss": (not payload.isWin) and (active_session is not None),
        
        # 🆕 Return updated lives so Frontend can update hearts
        "lives": attacker.lives,
        "max_lives": 5 
    }

@router.get("/user/arena/history")
def get_battle_history(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Query BattleLogs where user is Attacker OR Defender
    # Order by newest first, limit 50
    logs = db.query(BattleLog).filter(
        or_(
            BattleLog.attacker_id == current_user,
            BattleLog.defender_id == current_user
        )
    ).order_by(desc(BattleLog.timestamp)).limit(50).all()

    formatted_history = []
    
    for log in logs:
        is_attack = (log.attacker_id == current_user)
        opponent = log.defender_id if is_attack else log.attacker_id
        
        user_won = (log.winner_id == current_user)
        
        formatted_history.append({
            "type": "ATTACK" if is_attack else "DEFENSE",
            "opponent": opponent,
            "isWin": user_won,
            "score": log.score,
            "timestamp": log.timestamp.isoformat(),
            "level_config": log.level_snapshot,
            "replay_programs": log.replay_data,
            "revenged": log.is_revenged, 
        })

    return formatted_history

@router.get("/leaderboard")
def get_leaderboard(
    period: str = "alltime",
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()
    start_time = None

    # 1. Determine Start Time based on period
    if period == "daily":
        # From today 00:00 UTC
        start_time = datetime.combine(now.date(), datetime.min.time())
    elif period == "weekly":
        # Last 7 days
        start_time = now - timedelta(days=7)
    elif period == "alltime":
        # No start time limit
        start_time = None
    else:
        return []

    # 2. Build the Query using BattleLog for ACCURACY
    # We join User & BattleLog to count actual wins recorded in history.
    query = (
        db.query(
            User.username.label("username"),
            func.count(BattleLog.id).label("wins"),
            User.trophies.label("trophies")
        )
        .join(BattleLog, BattleLog.winner_id == User.username)
    )

    # 3. Apply Time Filter (if applicable)
    if start_time:
        query = query.filter(BattleLog.timestamp >= start_time)

    # 4. Group, Order, and Fetch
    # Note: We group by username and trophies to satisfy SQL standards
    leaderboard = (
        query
        .group_by(User.username, User.trophies)
        .order_by(
            desc("wins"),           # Most wins in this period
            desc(User.trophies)     # Tie-breaker: most trophies
        )
        .limit(10)
        .all()
    )

    return [
        {
            "username": row.username,
            "wins": row.wins,
            "trophies": row.trophies,
        }
        for row in leaderboard
    ]