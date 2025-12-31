import React, { useEffect } from "react";
import "./TileMenu.css";

// 🔒 UNLOCK CONSTANTS (Must match BasePage)
const UNLOCKS = {
  ICE: 5,
  ELEVATOR: 10,
  TELEPORT: 15
};

export default function TileMenu({
  top,
  left,
  onSelect,
  onClose,
  showTpStart = false,
  showTpEnd = false,
  showTpDelete = false,
  showSetElevRow = false,
  showUnsetElevRow = false,
  showSetElevCol = false,
  showUnsetElevCol = false,
  showToggleIce = false,
  isIce = false,
  userLevel = 1 // ⬅ NEW PROP
}) {
  useEffect(() => {
    const handleClick = (e) => {
      const menu = document.querySelector(".tile-menu");
      const grid = document.querySelector(".visualizer-grid"); // For 2D
      const canvas = document.querySelector("canvas"); // For 3D

      if (menu && menu.contains(e.target)) return;
      if (grid && grid.contains(e.target)) return;
      if (canvas && canvas === e.target) return; // Basic check for 3D canvas click

      onClose();
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  useEffect(() => {
    const closeOnEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEsc);
    return () => window.removeEventListener("keydown", closeOnEsc);
  }, [onClose]);

  const safeTop = Math.min(top, window.innerHeight - 300); // Increased buffer
  const safeLeft = Math.min(left, window.innerWidth - 220);

  // Helper to render locked state
  const renderLockedBtn = (label, reqLevel) => (
    <div className="menu-btn locked" title={`Unlocks at Level ${reqLevel}`}>
      <span style={{opacity: 0.5}}>{label}</span>
      <span className="lock-badge">🔒 Lvl {reqLevel}</span>
    </div>
  );

  const canUseIce = userLevel >= UNLOCKS.ICE;
  const canUseElev = userLevel >= UNLOCKS.ELEVATOR;
  const canUseTele = userLevel >= UNLOCKS.TELEPORT;

  return (
    <div className="tile-menu" style={{ top: safeTop, left: safeLeft }}>
      
      {/* 1. BASICS (Always Unlocked) */}
      <MenuButton label="🤖 Set Start" action="start" onSelect={onSelect} />
      <MenuButton label="↻ Rotate Robot" action="rotate" onSelect={onSelect} />
      <MenuButton label="⭐ Toggle Goal" action="toggle-goal" onSelect={onSelect} />

      {/* 2. HEIGHT (Always Unlocked) */}
      <div className="row-group">
        <div className="menu-label-btn">Height</div>
        <MiniBtn symbol="+" action="height-plus" onSelect={onSelect} />
        <MiniBtn symbol="−" action="height-minus" onSelect={onSelect} />
      </div>

      <div className="menu-separator"></div>

      {/* 3. ICE TILES (Lvl 5) */}
      {showToggleIce && (
        canUseIce ? (
          <MenuButton 
            label={isIce ? "🔥 Remove Ice" : "❄️ Add Ice"} 
            action="toggle-ice" 
            onSelect={onSelect} 
          />
        ) : (
          renderLockedBtn("❄️ Add Ice", UNLOCKS.ICE)
        )
      )}
      
      {/* 4. ELEVATORS (Lvl 10) */}
      {/* Only show row if at least one direction is valid to set/unset */}
      {(showSetElevRow || showSetElevCol || showUnsetElevRow || showUnsetElevCol) && (
        canUseElev ? (
          <div className="elevator-section">
            {(showSetElevRow || showSetElevCol) && (
              <div className="row-group">
                <div className="menu-label-btn">Elevator</div>
                {showSetElevCol && (
                  <>
                    <MiniBtn symbol="⬅" action="elev-left" onSelect={onSelect} />
                    <MiniBtn symbol="➡" action="elev-right" onSelect={onSelect} />
                  </>
                )}
                {showSetElevRow && (
                  <>
                    <MiniBtn symbol="⬆" action="elev-up" onSelect={onSelect} />
                    <MiniBtn symbol="⬇" action="elev-down" onSelect={onSelect} />
                  </>
                )}
              </div>
            )}
            {(showUnsetElevRow || showUnsetElevCol) && (
              <MenuButton label="🛑 Remove Elevator" action="elev-unset" onSelect={onSelect} />
            )}
          </div>
        ) : (
          renderLockedBtn("🛗 Elevators", UNLOCKS.ELEVATOR)
        )
      )}

      {/* 5. TELEPORTERS (Lvl 15) */}
      {(showTpStart || showTpEnd || showTpDelete) && (
        <div className="teleport-section">
          {canUseTele ? (
            <>
              {showTpStart && <MenuButton label="🌀 Set Teleport Start" action="tp-start" onSelect={onSelect} />}
              {showTpEnd && <MenuButton label="🎯 Set Teleport End" action="tp-end" onSelect={onSelect} />}
              {showTpDelete && <MenuButton label="❌ Delete Teleporter" action="tp-delete" onSelect={onSelect} />}
            </>
          ) : (
            renderLockedBtn("🌀 Teleporters", UNLOCKS.TELEPORT)
          )}
        </div>
      )}

      <button className="tile-menu-close" onClick={onClose}>✕ Close</button>
    </div>
  );
}

function MenuButton({ label, action, onSelect }) {
  return (
    <button
      className="menu-btn"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(action);
      }}
    >
      {label}
    </button>
  );
}

function MiniBtn({ symbol, action, onSelect }) {
  return (
    <button
      className="mini-btn"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(action);
      }}
    >
      {symbol}
    </button>
  );
}