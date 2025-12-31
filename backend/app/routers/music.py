import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

router = APIRouter(prefix="/music", tags=["Music"])

CURRENT_FILE_DIR = Path(__file__).resolve().parent
MUSIC_DIR = CURRENT_FILE_DIR.parent / "music"
ALLOWED_EXTENSIONS = {".mp3", ".ogg", ".wav"}

@router.get("/{music_key}")
def get_music(music_key: str):
    if not MUSIC_DIR.exists():
        print(f"❌ ERROR: Music directory NOT found at: {MUSIC_DIR}")
        print(f"   (Script is running from: {CURRENT_FILE_DIR})")
        raise HTTPException(status_code=500, detail="Music configuration error")

    for ext in ALLOWED_EXTENSIONS:
        safe_key = os.path.basename(music_key)
        music_path = MUSIC_DIR / f"{safe_key}{ext}"
        
        if music_path.exists():
            return FileResponse(
                path=music_path,
                media_type="audio/mpeg",
                filename=music_path.name
            )

    print(f"⚠️ Music file not found: {music_key} in {MUSIC_DIR}")
    raise HTTPException(status_code=404, detail="Music track not found")