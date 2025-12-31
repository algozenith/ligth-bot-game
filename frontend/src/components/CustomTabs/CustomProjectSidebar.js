// src/components/CustomTabs/CustomProjectSidebar.js
import "./CustomProjectSidebar.css";

export default function CustomProjectSidebar({
  levels,
  activeIndex,
  setActiveIndex,
  onAdd,
  onRemove,
}) {
  return (
    <div className="proj-sidebar">
      <div className="sidebar-header">
        <span>Custom Levels</span>

        <button className="add-btn" onClick={onAdd}>
          +
        </button>
      </div>

      <div className="sidebar-list">
        {levels.map((lvl, i) => (
          <div
            key={lvl.id}
            className={`sidebar-item ${
              i === activeIndex ? "active" : ""
            }`}
            onClick={() => setActiveIndex(i)}
          >
            <span className="level-name">{lvl.name}</span>

            <button
              className="close-btn"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(i);
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
