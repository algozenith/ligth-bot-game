// src/components/RightSide/ProgramGrid/ProgramGrid.js
import "./ProgramGrid.css";

function ForwardIconSmall() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14">
      <path d="M8 5l9 7-9 7V5z" fill="white" />
    </svg>
  );
}

function SpringImgSmall() {
  return (
    <img
      src="/images.png"
      alt="jump"
      width={14}
      height={14}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
}

const ICONS = {
  F: <ForwardIconSmall />,
  L: "💡",
  TL: "⟲",
  TR: "⟳",
  J: <SpringImgSmall />,
  M1: "F1",
  M2: "F2",
  D: "⌫",
  C: "🧹",
};

export default function ProgramGrid({
  title,
  panelId,
  commands,
  activeProgram,
  execPointer,
  onCellClick,

  selectedTool,   // ⭐ NEW
  allowedTools,   // ⭐ NEW
}) {
  const isToolAllowed = (tool) => {
    if (!allowedTools) return true;
    return allowedTools.includes(tool);
  };

  return (
    <div className={`pg-panel ${activeProgram === panelId ? "pg-active" : ""}`}>
      <div className="pg-title">{title}</div>

      <div className="pg-grid">
        {commands.map((cmd, i) => {
          const icon = ICONS[cmd] ?? cmd;

          const exec =
            execPointer?.panel === panelId &&
            execPointer?.index === i;

          return (
            <div
              key={i}
              className={`pg-cell ${exec ? "exec" : ""}`}
              onClick={() => {
                if (!isToolAllowed(selectedTool)) return; // ⭐ block illegal placement
                onCellClick(panelId, i);
              }}
            >
              {icon}
            </div>
          );
        })}
      </div>
    </div>
  );
}
