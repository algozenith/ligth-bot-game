import React from "react";
import "./InstructionsPanel.css";

/* ===== Icons copied inline to match CommandPalette ===== */

function ForwardIcon({ size = 16 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M8 5l9 7-9 7V5z" fill="currentColor" />
    </svg>
  );
}

function JumpIcon({ size = 16 }) {
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

export default function InstructionsPanel({ onClose, mode = "game" }) {
  const isEditor = mode === "custom";

  return (
    <div className="inst-overlay" onClick={onClose}>
      <div className="inst-box" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="inst-header">
          <h2 className="inst-title">
            {isEditor ? "Level Editor Manual" : "How to Play"}
          </h2>
          <button className="inst-close" onClick={onClose}>✕</button>
        </div>

        {/* CONTENT */}
        <div className="inst-content">
          <div className="inst-grid">

            {/* LEFT COLUMN */}
            <div className="inst-col">

              <section className="inst-section">
                <h3>🎯 The Objective</h3>
                <p>
                  Program the robot to light up every <strong>Goal Tile</strong> (⭐).
                  When all goal tiles are lit, the level is complete.
                </p>
              </section>

              <section className="inst-section">
                <h3>🕹️ Basic Commands</h3>
                <ul>
                  <li>
                    <span className="cmd-badge"><ForwardIcon /></span>
                    <span><strong>Forward:</strong> Move 1 tile forward. Cannot move up walls.</span>
                  </li>
                  <li>
                    <span className="cmd-badge">💡</span>
                    <span><strong>Light:</strong> Toggles the light on the current tile.</span>
                  </li>
                  <li>
                    <span className="cmd-badge">⟲</span>
                    <span><strong>Turn Left:</strong> Rotate 90° counter-clockwise.</span>
                  </li>
                  <li>
                    <span className="cmd-badge">⟳</span>
                    <span><strong>Turn Right:</strong> Rotate 90° clockwise.</span>
                  </li>
                </ul>
              </section>

              <section className="inst-section">
                <h3>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <JumpIcon /> Jumping Physics
                  </span>
                </h3>
                <p>The <strong>Jump</strong> command combines a move and a vertical action:</p>
                <ul>
                  <li><strong>Up:</strong> Can jump UP exactly 1 height level.</li>
                  <li><strong>Down:</strong> Can jump DOWN any number of height levels.</li>
                  <li><strong>Flat:</strong> Cannot jump on flat ground (use Forward).</li>
                </ul>
              </section>

              <section className="inst-section">
                <h3>🧠 Sub-Programs (Proc)</h3>
                <p>Run out of space in Main? Use helper methods!</p>
                <ul>
                  <li><span className="cmd-badge">F1</span> Runs commands in Proc 1.</li>
                  <li><span className="cmd-badge">F2</span> Runs commands in Proc 2.</li>
                  <li><em>Recursion is allowed (M1 can call M1).</em></li>
                </ul>
              </section>

            </div>

            {/* RIGHT COLUMN */}
            <div className="inst-col">

              <section className="inst-section">
                <h3>❄️ Ice Tiles</h3>
                <p>When stepping onto a blue-white Ice tile, physics takes over:</p>
                <ol>
                  <li>The robot slides automatically in its facing direction.</li>
                  <li>It stops only when hitting a <strong>Wall</strong> or <strong>Normal Tile</strong>.</li>
                  <li>You cannot turn while sliding.</li>
                </ol>
              </section>

              <section className="inst-section">
                <h3>⚡ Special Tiles</h3>
                <div className="mechanic-grid">
                  <div className="mechanic-item">
                    <strong>🔁</strong>
                    <span><strong>Teleporters:</strong> Instantly moves robot to the linked pair tile.</span>
                  </div>
                  <div className="mechanic-item">
                    <strong>🛗</strong>
                    <span><strong>Elevators:</strong> Automatically slides the robot one tile in the arrow direction.</span>
                  </div>
                </div>
              </section>

              {isEditor && (
                <section className="inst-section editor-section">
                  <h3>🛠️ Editor Tools</h3>
                  <ul>
                    <li><strong>Right Click:</strong> Open tile context menu.</li>
                    <li><strong>Height +/-:</strong> Raise or lower terrain.</li>
                    <li><strong>Start:</strong> Place the robot spawn point.</li>
                    <li><strong>Run:</strong> Test your level immediately.</li>
                  </ul>
                </section>
              )}

              <section className="inst-section">
                <h3>⚠️ Game Rules</h3>
                <ul>
                  <li><strong>Blocking:</strong> Walls or falling off-map stops the robot.</li>
                  <li><strong>Infinite Loops:</strong> Endless recursion halts execution safely.</li>
                </ul>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
