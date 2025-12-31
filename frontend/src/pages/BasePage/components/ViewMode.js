import React from "react";
import Visualizer3D from "../../../components/MainGame/Visualizer3d/Visualizer3d";

const ViewMode = ({ manager, stats, handleStartEditing, onOpenHistory, navigate }) => {
    
    // ✅ FIX: DYNAMIC PROGRESS BAR CALCULATION
    const xpNeeded = stats.expToNextLevel || 500; // Value from backend (e.g. 732)
    const currentXp = stats.exp || 0;             // Value from backend (e.g. 150)
    
    // Calculate percentage (clamp between 0 and 100)
    const percent = Math.min(100, Math.max(0, (currentXp / xpNeeded) * 100));

    return (
        <div className="view-mode-wrapper">
            <div className="view-left-panel">
                <div className="view-visualizer-card">
                    <Visualizer3D level={manager.baseSnapshot.level} robot={manager.baseSnapshot.level.start} lit={new Set()} isEditable={false} isRunning={false} showStartWhenIdle={true} />
                </div>
            </div>
            <div className="view-right-panel">
                <div className="view-label">Current Deployment</div>
                <h1 className="view-title">YOUR BASE</h1>
                <p className="view-subtitle">"{manager.baseSnapshot.level.name || "Unnamed Sector"}"</p>
                
                <div className="view-stat-grid">
                    <div className="view-stat-box"><span className="view-stat-val">🏆 {stats.trophies}</span><span className="view-stat-lbl">Trophies</span></div>
                    <div className="view-stat-box"><span className="view-stat-val">💰 {stats.coins}</span><span className="view-stat-lbl">Coins</span></div>
                </div>

                <div style={{ margin: "20px 0", width: "100%" }}>
                    <div className="view-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{color: "#00d2ff"}}>{stats.rank}</span>
                        <span className="view-level-indicator">LEVEL {stats.level}</span>
                    </div>
                    
                    {/* Progress Bar Container */}
                    <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "10px", overflow: "hidden", marginTop: "5px" }}>
                        {/* Dynamic Width Bar */}
                        <div style={{ 
                            height: "100%", 
                            width: `${percent}%`, 
                            background: "var(--primary)", 
                            transition: "width 0.5s ease" 
                        }}></div>
                    </div>
                    
                    {/* Dynamic Text Label */}
                    <div style={{ fontSize: "0.7rem", color: "#888", textAlign: "right", marginTop: "5px", fontFamily: "monospace" }}>
                        {currentXp} / {xpNeeded} EXP
                    </div>
                </div>

                <button className="btn-modify" onClick={handleStartEditing}>🛠️ Modify Defenses</button>
                <button className="btn-history-view" onClick={onOpenHistory}>📜 Submission History</button>
                <button className="btn-return" onClick={() => navigate("/")}>← Return to Main Menu</button>
            </div>
        </div>
    );
};
export default ViewMode;