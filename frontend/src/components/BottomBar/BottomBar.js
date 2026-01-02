import React from "react";
import "./BottomBar.css";

export default function BottomBar({
  onRun,
  onReset,
  isRunning,
  message,
  speed,
  setSpeed,
  use3D,
  setUse3D,
  showSubmit = false,
  showSave = false,
  onSave,
  onSubmit,
  onOpenInstructions,
}) {
  const toggleView = () => setUse3D(!use3D);

  return (
    <div className="bottombar">
      {/* Message: Hidden on mobile via CSS */}
      <div className="bottombar-message">
        {message || "Ready"}
      </div>

      <div className="bottombar-right">
        {/* Speed Control */}
        <div className="speed-control">
          <label className="speed-label">Speed:</label>
          <select
            className="speed-select"
            disabled={isRunning}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            <option value={10200}>Slow</option>
            <option value={500}>Normal</option>
            <option value={150}>Fast</option>
            <option value={50}>⚡</option>
          </select>
        </div>

        {/* Toggle View */}
        <button
          className={`btn-main view-toggle-btn ${use3D ? "view-on" : "view-off"}`}
          onClick={toggleView}
        >
          {use3D ? (
             <>
               <span className="btn-label">2D View</span> 🟦
             </>
          ) : (
             <>
               <span className="btn-label">3D View</span> ✨
             </>
          )}
        </button>

        {/* Instructions */}
        <button className="btn-main info-btn" onClick={onOpenInstructions}>
          ℹ <span className="btn-label">Help</span>
        </button>

        {/* Save */}
        {showSave && (
          <button className="btn-main save-btn" onClick={onSave}>
            💾 <span className="btn-label">Save</span>
          </button>
        )}

        {/* Reset */}
        <button className="btn-main reset-btn" onClick={onReset}>
          ⟲ <span className="btn-label">Reset</span>
        </button>

        {/* Run (Most important) */}
        <button
          className="btn-main run-btn"
          disabled={isRunning}
          onClick={onRun}
        >
          ▶ <span className="btn-label">Run</span>
        </button>

        {/* Submit */}
        {showSubmit && (
          <button
            className="btn-main submit-btn"
            disabled={isRunning}
            onClick={onSubmit}
          >
            ⭐ <span className="btn-label">Submit</span>
          </button>
        )}
      </div>
    </div>
  );
}