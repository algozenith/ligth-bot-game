// src/components/RightSide/RightSidebar/CommandPalette.js
import "./CommandPalette.css";

function ForwardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M8 5l9 7-9 7V5z" fill="white" />
    </svg>
  );
}

function SpringImg({ size = 20 }) {
  return (
    <img
      src="/images.png"
      alt="jump"
      width={size}
      height={size}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
}

export default function CommandPalette({
  selectedTool,
  setSelectedTool,
  onClearActive,
  onClearAll,
  isRunning,
  allowedTools,   // ⭐ NEW
}) {
  const buttons = [
    { id: "F", element: <ForwardIcon /> },
    { id: "L", element: "💡" },
    { id: "TL", element: "⟲" },
    { id: "TR", element: "⟳" },
    { id: "J", element: <SpringImg /> },
    { id: "M1", element: "F1" },
    { id: "M2", element: "F2" },
    { id: "D", element: "⌫" },
    { id: "C", element: "🧹" },
    { id: "All", element: "🗑" },
  ];

  // ⭐ Check if tool should be disabled for this tutorial level
  const isDisabledTool = (toolId) => {
    if (!allowedTools) return false;        // no restriction
    if (toolId === "C" || toolId === "All") return false; // always allowed
    return !allowedTools.includes(toolId);  // disable if not included
  };

  return (
    <div className="cmd-grid" role="toolbar">
      {buttons.map((btn) => (
        <button
          key={btn.id}
          type="button"
          className={`cmd-item ${selectedTool === btn.id ? "active" : ""}`}
          disabled={isRunning || isDisabledTool(btn.id)}   // ⭐ fixed
          aria-pressed={selectedTool === btn.id}
          onClick={() => {
            if (btn.id === "C") return onClearActive();
            if (btn.id === "All") return onClearAll();
            if (isDisabledTool(btn.id)) return;            // safety
            setSelectedTool(btn.id);
          }}
        >
          {btn.element}
        </button>
      ))}
    </div>
  );
}
