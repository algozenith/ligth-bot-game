import React from "react";
import Visualizer3D from "../../../components/MainGame/Visualizer3d/Visualizer3d";
import Visualizer from "../../../components/MainGame/Visualizer/Visualizer";
import RightSidebar from "../../../components/RightSide/RightSidebar/RightSidebar";
import BottomBar from "../../../components/BottomBar/BottomBar";
import { MUSIC_OPTIONS } from "../utils/baseUtils";
import "./EditMode.css";

const EditMode = ({ 
    editorData, setEditorData, setMusicTrack, 
    game, use3D, setUse3D, 
    handleGridResize, handleCancelEditing, 
    handleTileAction, pendingTpStart, 
    stats, onOpenDrafts, onSaveDraft, onSubmitBase, 
    onOpenInstructions 
}) => {
    return (
        <div className="edit-mode-wrapper">
            <div className="edit-main-column">
                {/* TOP BAR */}
                <div className="edit-top-bar">
                    {/* LEFT: Level & Name */}
                    <div className="bar-left-group">
                        <div className="level-hud-badge" title="Your Current Architect Level">
                            <span className="level-hud-label">LVL</span>
                            <span className="level-hud-val">{stats.level}</span>
                        </div>
                        <div className="name-input-wrapper">
                            <input 
                                className="edit-title-input" 
                                value={editorData.name || ""} 
                                onChange={(e) => setEditorData({...editorData, name: e.target.value})} 
                                placeholder="Base Name..." 
                            />
                        </div>
                    </div>

                    {/* MIDDLE: Controls (Music & Grid) */}
                    <div className="bar-section controls">
                        <div className="control-group">
                            <label className="bar-label">MUSIC:</label>
                            <select 
                                className="music-select"
                                value={editorData.music || "default_base"}
                                onChange={(e) => {
                                    const newTrack = e.target.value;
                                    setEditorData({ ...editorData, music: newTrack });
                                    setMusicTrack(newTrack);
                                }}
                            >
                                {MUSIC_OPTIONS.map(opt => (
                                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="v-sep"></div>
                        <div className="control-group">
                            <label className="bar-label">GRID:</label>
                            <div className="grid-tabs">
                                {[6, 8, 10].map(size => (
                                    <button 
                                        key={size} 
                                        onClick={() => handleGridResize(size)} 
                                        className={`btn-grid-tab ${editorData.gridSize === size ? "active" : ""}`}
                                    >
                                        {size}x{size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="bar-section actions">
                        <button onClick={onOpenDrafts} className="btn-drafts-load">
                            <span>📂</span> Load
                        </button>
                        <button onClick={handleCancelEditing} className="btn-cancel-edit">
                            Exit
                        </button>
                    </div>
                </div>

                {/* WORKSPACE */}
                <div className="edit-workspace">
                    {use3D ? (
                        <Visualizer3D
                            key={`3d-${editorData.gridSize}`}
                            robot={game.robot} lit={game.lit} level={game.currentLevel || editorData}
                            isEditable={true} isRunning={game.isRunning}
                            pendingTpStart={pendingTpStart} onTileAction={handleTileAction}
                            lastTeleportKey={game.lastTeleportKey} teleportFX={game.teleportFX}
                            userLevel={stats.level}
                        />
                    ) : (
                        <Visualizer
                            key={`2d-${editorData.gridSize}`}
                            robot={game.robot} lit={game.lit} level={game.currentLevel || editorData}
                            isEditable={true} isRunning={game.isRunning}
                            pendingTpStart={pendingTpStart} onTileAction={handleTileAction}
                            lastTeleportKey={game.lastTeleportKey} teleportFX={game.teleportFX}
                            userLevel={stats.level}
                        />
                    )}
                    
                    {/* The Command Palette */}
                    <RightSidebar {...game} />
                </div>

                {/* BOTTOM BAR (Play/Submit) */}
                <div className="edit-bottom-bar-wrapper">
                    <BottomBar
                        currentLevel={editorData}
                        onRun={game.runProgram} onReset={game.resetGame}
                        onSubmit={onSubmitBase} onSave={onSaveDraft}
                        showSubmit={true} showSave={true}
                        isRunning={game.isRunning} message={game.gameMessage}
                        speed={game.speed} setSpeed={game.setSpeed}
                        use3D={use3D} setUse3D={setUse3D}
                        onOpenInstructions={onOpenInstructions}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditMode;