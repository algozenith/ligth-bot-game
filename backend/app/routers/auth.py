from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
from datetime import date

from app.models import UserCreate, Token
from app.database import get_db
from app.sql_models import User
from app.config import GOOGLE_CLIENT_ID, DEFAULT_BASE, MAX_LIVES
from app.auth import get_password_hash, verify_password, create_access_token
from app.routers.levels import check_daily_reset

router = APIRouter(tags=["Authentication"])

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check existing
    existing = db.query(User).filter(User.username == user.username).first()
    if existing:
        raise HTTPException(400, "Username already exists")

    new_user = User(
        username=user.username,
        password=get_password_hash(user.password),
        base=DEFAULT_BASE,
        # SQL Defaults handle coins/trophies, but being explicit is safe:
        tutorial_progress=1,
        coins=0,
        trophies=1000,
        wins=0,
        experience=0,
        # --- NEW: Initialize Lives ---
        lives=MAX_LIVES,
        last_lives_reset=date.today()
    )
    db.add(new_user)
    db.commit()
    return {"message": "User registered"}

@router.post("/token", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form.username).first()

    if not user:
        raise HTTPException(401, "Incorrect username or password")
    
    if user.auth_provider == "google":
        raise HTTPException(400, "Use Google login")

    if not verify_password(form.password, user.password):
        raise HTTPException(401, "Incorrect username or password")

    # --- NEW: Check Daily Reset on Login ---
    # FIX: Call the helper function passing the user object
    if check_daily_reset(user): 
        db.commit() # Commit the reset if it happened

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/auth/google")
def google_auth(payload: dict, db: Session = Depends(get_db)):
    token = payload.get("token")
    if not token:
        raise HTTPException(400, "Token missing")

    try:
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
    except Exception as e:
        print(f"Google Auth Error: {e}")
        raise HTTPException(401, "Invalid Google token")

    email = idinfo.get("email")
    if not email:
        raise HTTPException(400, "Email not found in token")

    username = email.split("@")[0]

    user = db.query(User).filter(User.username == username).first()

    # Create Google user if they don't exist
    if not user:
        user = User(
            username=username,
            auth_provider="google",
            base=DEFAULT_BASE,
            tutorial_progress=1,
            coins=0,
            trophies=1000,
            wins=0,
            experience=0,
            # --- NEW: Initialize Lives ---
            lives=MAX_LIVES,
            last_lives_reset=date.today()
        )
        db.add(user)
        db.commit()
    else:
        # Existing user: Check Daily Reset
        # FIX: Call the helper function passing the user object
        if check_daily_reset(user):
            db.commit()

    access_token = create_access_token({"sub": username})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "username": username
    }