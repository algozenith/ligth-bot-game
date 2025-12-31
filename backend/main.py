import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
# Ensure all models are imported so tables are created
import app.sql_models 
from app.routers import auth, arena, bases, levels, music, users, tutorials

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting up: Creating Database Tables...")
    Base.metadata.create_all(bind=engine)
    yield
    print("🛑 Shutting down...")

app = FastAPI(
    title="Lightbot API",
    version="2.0.0",
    lifespan=lifespan
)

# --- NUCLEAR CORS SETUP (ALLOW ALL) ---
# This fixes the "CORS Policy" error by allowing any origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Allows ALL origins
    allow_credentials=True,
    allow_methods=["*"],      # Allows ALL methods
    allow_headers=["*"],      # Allows ALL headers
)
# --------------------------------------

# 5. Include Routers
app.include_router(auth.router)
app.include_router(bases.router)
app.include_router(arena.router)
app.include_router(levels.router)
app.include_router(users.router)
app.include_router(music.router)
app.include_router(tutorials.router)

@app.get("/")
def read_root():
    return {
        "status": "online", 
        "database": "connected", 
        "version": "2.0 SQL Edition"
    }