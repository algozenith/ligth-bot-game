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
  onOpenInstructions, // NEW PROP
}) {
  const toggleView = () => setUse3D(!use3D);

  return (
    <div className="bottombar">
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
            <option value={50}>Lightning ⚡</option>
          </select>
        </div>

        {/* Toggle View Button */}
        <button
          className={`btn-main view-toggle-btn ${
            use3D ? "view-on" : "view-off"
          }`}
          disabled={false}
          onClick={toggleView}
        >
          {use3D ? "2D View 🟦" : "3D View ✨"}
        </button>

        {/* NEW How to Play Button */}
        <button
          className="btn-main info-btn"
          onClick={onOpenInstructions}
        >
          ℹ How to Play
        </button>

        {/* Reset always allowed */}
        <button className="btn-main reset-btn" onClick={onReset}>
          ⟲ Reset
        </button>

        {/* Run always shown */}
        <button
          className="btn-main run-btn"
          disabled={isRunning}
          onClick={onRun}
        >
          ▶ Run
        </button>

        {/* Optional save/submit */}
        {showSave && (
          <button className="btn-main save-btn" onClick={onSave}>
            💾 Save
          </button>
        )}

        {showSubmit && (
          <button
            className="btn-main submit-btn"
            disabled={isRunning}
            onClick={onSubmit}
          >
            ⭐ Submit
          </button>
        )}
      </div>
    </div>
  );
}
