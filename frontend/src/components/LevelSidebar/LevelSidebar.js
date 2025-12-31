import React from "react";
import "./LevelSidebar.css";
import { FaLock, FaUnlock } from "react-icons/fa";
import { BsListNested } from "react-icons/bs";

export default function LevelSidebar({
  levels,
  currentIndex,
  onSelect,
  open,
  setOpen,
  progress,   // ✅ YOU MUST RECEIVE THIS FROM PARENT
}) {
  if (!levels || !Array.isArray(levels) || levels.length === 0) {
    return (
      <div className="level-sidebar">
        <div className="empty-msg">Loading levels...</div>
      </div>
    );
  }

  return (
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
                if (unlocked) onSelect(idx);
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
  );
}
