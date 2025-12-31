import { useNavigate } from "react-router-dom";
import "./TopBar.css";

export default function TopBar({ level, showCreate = true }) {
  const navigate = useNavigate();
  const levelLabel = level ? `${level.id}. ${level.name}` : "Loading...";

  return (
    <div className="topbar">

      {/* LEFT */}
      <div className="topbar-left">
        <div className="topbar-logo">BOT RAIDER</div>
      </div>

      {/* CENTER */}
      <div className="topbar-center">
        <span className="level-label">LEVEL</span>
        <span className="level-title">{levelLabel}</span>
      </div>

      {/* RIGHT */}
      <div className="topbar-right">
        {showCreate && (
          <button
            className="topbar-create-btn"
            onClick={() => navigate("/custom-level")}
          >
            ✦ Create Level
          </button>
        )}
      </div>

    </div>
  );
}
