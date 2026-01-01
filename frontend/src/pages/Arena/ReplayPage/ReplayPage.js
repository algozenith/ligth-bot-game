import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Visualizer3D from "../../../components/MainGame/Visualizer3d/Visualizer3d";
import Visualizer from "../../../components/MainGame/Visualizer/Visualizer"; 
import BottomBar from "../../../components/BottomBar/BottomBar";
import RightSidebar from "../../../components/RightSide/RightSidebar/RightSidebar"; 
import InstructionsPanel from "../../../components/InstructionsPanel/InstructionsPanel"; 
import { useAuth } from "../../../context/AuthContext";
import useLightbotGame from "../../../game/useLightbotGame";
import { useMusic } from "../../../context/MusicContext"; 
import "./ReplayPage.css";

export default function ReplayPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { token, user } = useAuth(); 
    const { setMusicTrack } = useMusic(); 
    
    const replayData = location.state?.log; 

    const [levelData, setLevelData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [use3D, setUse3D] = useState(true); 
    const [showInstructions, setShowInstructions] = useState(false);

    const game = useLightbotGame(
        levelData ? [levelData] : [], 
        0, 
        () => {} 
    );

    // --- 1. HANDLE MUSIC ---
    useEffect(() => {
        if (replayData) {
            const historicalMusic = replayData.level_config?.music;
            if (historicalMusic) {
                setMusicTrack(historicalMusic);
            } else if (levelData?.music) {
                setMusicTrack(levelData.music);
            } else {
                setMusicTrack("cyber_theme_01");
            }
        }
        return () => {
            const userBaseMusic = user?.base?.level?.music;
            setMusicTrack(userBaseMusic || "cyber_theme_01");
        };
    }, [replayData, levelData, setMusicTrack, user]); 

    // --- 2. LOAD DATA ---
    useEffect(() => {
        if (!replayData) {
            alert("No replay data found.");
            navigate("/arena");
            return;
        }

        const loadLevel = async () => {
            if (replayData.level_config) {
                setLevelData({ ...replayData.level_config, id: 999 });
                setLoading(false);
                return;
            }

            console.warn("Snapshot missing. Fetching live base data...");
            let targetUsername = "";
            if (replayData.type === 'ATTACK') {
                targetUsername = replayData.opponent;
            } else {
                targetUsername = user?.username || "me"; 
            }

            try {
                const endpoint = targetUsername === "me" || targetUsername === user?.username
                    ? `${process.env.REACT_APP_API_URL}/user/base`
                    : `${process.env.REACT_APP_API_URL}/user/arena/target/${targetUsername}`;

                const res = await fetch(endpoint, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    const levelConfig = data.gridSize ? data : (data.level || data);
                    setLevelData({ ...levelConfig, id: 999 });
                } else {
                    throw new Error("Target base not found");
                }
            } catch (err) {
                console.error("Failed to load base for replay:", err);
                alert("Could not load the battle map.");
                navigate("/arena");
            } finally {
                setLoading(false);
            }
        };

        loadLevel();
    }, [replayData, navigate, token, user]);

    // --- 3. SYNC LOGIC ---
    useEffect(() => {
        if (levelData && game.updateGridSize) {
            game.updateGridSize(levelData.gridSize);
            
            if (replayData?.replay_programs) {
                const programs = typeof replayData.replay_programs === 'string' 
                    ? JSON.parse(replayData.replay_programs) 
                    : replayData.replay_programs;

                game.setFunctions(programs);
                
                const timer = setTimeout(() => {
                    game.runProgram(); 
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [levelData]); 

    if (loading) return (
        <div id="replay-page-root">
            <div className="replay-loading text-cyan">
                ACCESSING ARCHIVES... <br/>
                <span style={{fontSize:'0.8em', color:'#666'}}>Reconstructing Simulation</span>
            </div>
        </div>
    );

    return (
        <div id="replay-page-root">
            {/* HEADER */}
            <div className="replay-header">
                <div className="rec-indicator">
                    <span className="rec-dot"></span> REC
                </div>
                <div className="replay-info">
                    SECURITY FOOTAGE: {new Date(replayData.timestamp).toLocaleString()} <br/>
                    {replayData.type === 'ATTACK' 
                        ? `ATTACK ON: ${replayData.opponent.toUpperCase()}`
                        : `DEFENSE AGAINST: ${replayData.opponent.toUpperCase()}`
                    }
                </div>
                <button className="btn-close-replay" onClick={() => navigate("/arena")}>
                    CLOSE
                </button>
            </div>

            {/* MAIN WORKSPACE */}
            <div className="replay-workspace">
                {/* LEFT: VISUALIZER */}
                <div className="replay-visualizer-wrapper">
                    {use3D ? (
                        <Visualizer3D
                            robot={game.robot}
                            lit={game.lit}
                            level={game.currentLevel}
                            isEditable={false} 
                            isRunning={game.isRunning}
                            showStartWhenIdle={true}
                            lastTeleportKey={game.lastTeleportKey}
                            teleportFX={game.teleportFX}
                        />
                    ) : (
                        <Visualizer
                            robot={game.robot}
                            lit={game.lit}
                            level={game.currentLevel}
                            isEditable={false}
                            isRunning={game.isRunning}
                            showStartWhenIdle={true}
                            lastTeleportKey={game.lastTeleportKey}
                            pendingTpStart={game.pendingTpStart}
                            teleportFX={game.teleportFX}
                        />
                    )}
                </div>

                {/* RIGHT: COMMANDS */}
                <div className="replay-sidebar-wrapper">
                    <div className="replay-overlay-blocker"></div> 
                    <RightSidebar 
                        {...game} 
                        handleCellClick={() => {}} 
                        setSelectedTool={() => {}}
                        clearActiveProgram={() => {}}
                        clearAllPrograms={() => {}}
                    />
                </div>
            </div>

            {/* CONTROLS */}
            <div className="replay-controls">
                <BottomBar 
                    currentLevel={levelData}
                    onRun={game.runProgram}
                    onReset={game.resetGame}
                    showSubmit={false} 
                    showSave={false}
                    isRunning={game.isRunning}
                    message={"ARCHIVE FOOTAGE"}
                    speed={game.speed} 
                    setSpeed={game.setSpeed}
                    use3D={use3D}
                    setUse3D={setUse3D}
                    onOpenInstructions={() => setShowInstructions(true)}
                />
            </div>

            {/* HELP MODAL */}
            {showInstructions && (
                <InstructionsPanel
                    mode="game"
                    onClose={() => setShowInstructions(false)}
                />
            )}
        </div>
    );
}