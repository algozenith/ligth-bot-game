// src/components/LevelSidebar/LevelSidebar.js
import React, { useEffect } from "react"; // 1. Import useEffect
import "./LevelSidebar.css";
import { FaLock, FaUnlock } from "react-icons/fa";
import { BsListNested } from "react-icons/bs";

export default function LevelSidebar({
  levels,
  currentIndex,
  onSelect,
  open,
  setOpen,
  progress,
}) {

  // 2. Add this Effect to auto-close on mobile when the page loads
  useEffect(() => {
    // Check if device is mobile/tablet (<= 1024px)
    if (window.innerWidth <= 1024) {
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

  if (!levels || !Array.isArray(levels) || levels.length === 0) {
    return (
      <div className="level-sidebar">
        <div className="empty-msg">Loading levels...</div>
      </div>
    );
  }

  const handleLevelClick = (index) => {
    onSelect(index);
    if (window.innerWidth <= 1024) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* 1. FLOATING MOBILE TRIGGER 
          (Only shows if sidebar is CLOSED on mobile) */}
      {!open && (
        <button 
          className="mobile-sidebar-trigger" 
          onClick={() => setOpen(true)}
          title="Open Levels"
        >
          »
        </button>
      )}

      {/* 2. MOBILE BACKDROP 
          (Clicking outside the sidebar closes it) */}
      {open && (
        <div 
          className="sidebar-backdrop"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(2px)",
            zIndex: 999, /* Below sidebar (1000) but above game */
            display: window.innerWidth <= 1024 ? "block" : "none"
          }}
        />
      )}

      {/* 3. THE SIDEBAR */}
      <div className={`level-sidebar ${open ? "open" : "closed"}`}>
        <div className="sidebar-header">
          {open && <span className="title">📋 Levels</span>}
          <button className="sidebar-toggle" onClick={() => setOpen(!open)}>
            {open ? "«" : "»"}
          </button>
        </div>

        <div className="sidebar-content">
          {levels.map((lvl, idx) => {
            const active = idx === currentIndex;

            // 🔥 Level is unlocked when lvl.id <= progress
            const unlocked = lvl.id <= progress;

            return (
              <div
                key={lvl.id}
                className={`level-item ${active ? "active" : ""} ${
                  unlocked ? "unlocked" : "locked"
                }`}
                onClick={() => {
                  if (unlocked) handleLevelClick(idx);
                }}
                title={`${lvl.name}`}
              >
                {open ? (
                  <>
                    <span className="level-id">{lvl.id}.</span>
                    <span className="level-name">{lvl.name}</span>
                  </>
                ) : (
                  <BsListNested size={18} />
                )}

                {/* Lock/Unlock icon */}
                {unlocked ? (
                  <FaUnlock className="unlock-icon" />
                ) : (
                  <FaLock className="lock-icon" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}