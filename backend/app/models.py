from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, date


# -----------------------------
# CORE LEVEL MODELS
# -----------------------------

class Goal(BaseModel):
    x: int
    y: int


class IceTile(BaseModel):
    x: int
    y: int


class Start(BaseModel):
    x: int
    y: int
    dir: int


class Level(BaseModel):
    id: Optional[Union[int, str]] = None
    name: str = ""
    description: str = ""

    music: Optional[str] = Field(
        default=None,
        description="Background music key for this base"
    )

    start: Start
    goals: List[Goal] = Field(default_factory=list)
    heights: List[List[int]]
    gridSize: int

    teleportLinks: Dict[str, Any] = Field(default_factory=dict)
    elevatorMeta: Dict[str, Any] = Field(default_factory=dict)
    iceTiles: List[IceTile] = Field(default_factory=list)

    class Config:
        extra = "allow"


# -----------------------------
# PROGRAMS (CODE SNAPSHOT)
# -----------------------------

class Programs(BaseModel):
    main: List[Optional[str]] = Field(default_factory=list)

    # Frontend compatibility: p1 / p2 → backend m1 / m2
    m1: List[Optional[str]] = Field(default_factory=list, alias="p1")
    m2: List[Optional[str]] = Field(default_factory=list, alias="p2")

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True


# -----------------------------
# BASE SNAPSHOT (ATOMIC UNIT)
# -----------------------------

class BaseSnapshot(BaseModel):
    level: Level
    programs: Programs


class SubmitPayload(BaseSnapshot):
    pass


class DraftPayload(BaseSnapshot):
    pass


class BaseResponse(BaseSnapshot):
    pass


# -----------------------------
# AUTH / USER
# -----------------------------

class UserCreate(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


# --- NEW: Full User Profile Response ---
class UserResponse(BaseModel):
    username: str
    coins: int
    trophies: int
    wins: int
    experience: int
    
    # Lives System
    lives: int
    max_lives: int = 5 # Default constant for UI reference
    
    # Optional: Send the reset date if the UI needs to show "Resets tomorrow"
    last_lives_reset: Optional[date] = None

    class Config:
        orm_mode = True


class ProgressPayload(BaseModel):
    progress: int


class BaseLevelPayload(BaseModel):
    level: Dict[str, Any]


# -----------------------------
# LEADERBOARD
# -----------------------------

class LeaderboardEntry(BaseModel):
    username: str
    trophies: int
    wins: int
    experience: int = 0


# -----------------------------
# BATTLE / ARENA MODELS
# -----------------------------

# app/models.py

class BattleReportPayload(BaseModel):
    """Data sent FROM Client TO Server after a battle"""
    targetUser: str
    isWin: bool
    score: int
    coinsEarned: int
    
    # FIX: Make these Optional so the request doesn't fail if Frontend omits them
    experienceEarned: Optional[int] = 0  
    timeRemaining: Optional[int] = 0
    
    replay_programs: Optional[Dict[str, Any]] = None
    level_snapshot: Optional[Dict[str, Any]] = None
    snapshotId: Optional[str] = None
    
class BattleHistoryItem(BaseModel):
    id: int
    opponent: str
    type: str
    isWin: bool
    score: int
    timestamp: datetime
    replay_programs: Optional[Dict[str, List[Optional[str]]]] = None
    level_config: Optional[Dict[str, Any]] = None
    revenged: bool = False

    class Config:
        orm_mode = True


# -----------------------------
# BASE HISTORY (IMPORTANT)
# -----------------------------

class BaseHistoryItem(BaseModel):
    id: str
    level: Level
    programs: Programs
    submittedAt: datetime

    class Config:
        orm_mode = True


# -----------------------------
# ARENA
# -----------------------------

class ArenaTargetResponse(BaseModel):
    level: Dict[str, Any]
    remainingTime: int  # seconds


class ArenaReportPayload(BaseModel):
    targetUser: str
    isWin: bool
    score: int
    coinsEarned: int
    timeRemaining: int
    replay_programs: Optional[Dict[str, Any]] = None
    level_snapshot: Optional[Dict[str, Any]] = None


class BattleResultPayload(BaseModel):
    """Response sent FROM Server TO Client after processing results"""
    isWin: bool
    experienceEarned: int
    trophiesDelta: int = 0
    
    # Updated Lives status so UI can update hearts immediately
    lives: int
    max_lives: int = 5