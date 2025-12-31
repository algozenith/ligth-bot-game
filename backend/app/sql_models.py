from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.database import Base
from app.config import DEFAULT_BASE

class User(Base):
    __tablename__ = "users"

    username = Column(String, primary_key=True, index=True)
    password = Column(String)
    auth_provider = Column(String, default="local")
    
    # Game Stats
    coins = Column(Integer, default=0)
    trophies = Column(Integer, default=1000)
    wins = Column(Integer, default=0)
    experience = Column(Integer, default=0)
    tutorial_progress = Column(Integer, default=1)
    joined_at = Column(DateTime, default=datetime.utcnow)

    # --- NEW: Lives System Fields ---
    lives = Column(Integer, default=5)
    # We use Date (YYYY-MM-DD) to track the last reset day
    last_lives_reset = Column(Date, default=date.today)

    # We store the entire BaseSnapshot ({level:..., programs:...}) here
    base = Column(JSON, default=DEFAULT_BASE) 
    
    # Store drafts and base history as JSON lists
    drafts = Column(JSON, default=list) 
    base_history = Column(JSON, default=list)
    
    # Active attacks session (JSON is easiest for this temporary state)
    active_attacks = Column(JSON, default=list)

    # Relationships
    battle_logs_attacker = relationship("BattleLog", foreign_keys="[BattleLog.attacker_id]", back_populates="attacker")
    battle_logs_defender = relationship("BattleLog", foreign_keys="[BattleLog.defender_id]", back_populates="defender")

class BattleLog(Base):
    """Stores history separately so we can query it efficiently"""
    __tablename__ = "battle_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    attacker_id = Column(String, ForeignKey("users.username"))
    defender_id = Column(String, ForeignKey("users.username"))
    
    winner_id = Column(String) # Username of winner
    score = Column(Integer)
    
    # Store replay data (programs used) and snapshot
    replay_data = Column(JSON) 
    level_snapshot = Column(JSON)

    attacker = relationship("User", foreign_keys=[attacker_id], back_populates="battle_logs_attacker")
    defender = relationship("User", foreign_keys=[defender_id], back_populates="battle_logs_defender")

    is_revenged = Column(Boolean, default=False)