from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
import os
from dotenv import load_dotenv

# SECURITY CONFIG
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# SECURITY TOOLS
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

MAX_LIVES = 5

# GAME DEFAULTS
# Default configuration for a 6x6 empty base
DEFAULT_BASE_MUSIC = "default_base"
DEFAULT_BASE = {
    "level": {
        "id": "base-init",
        "name": "New Sector",

        # 🎵 NEW: default base music
        "music": DEFAULT_BASE_MUSIC,

        "gridSize": 6,
        "heights": [[0] * 6 for _ in range(6)],  # 6x6 grid of zeros

        # ✅ FIX 1: Add a Goal at (0,0)
        "goals": [{"x": 0, "y": 0}],

        "start": {"x": 0, "y": 0, "dir": 1},
        "iceTiles": [],
        "teleportLinks": {},
        "elevatorMeta": {}
    },
    "programs": {
        # ✅ FIX 2: Pre-fill first command with "L" (Light)
        "main": ["L"] + [None] * 11,
        "m1": [None] * 8,
        "m2": [None] * 8
    }
}
