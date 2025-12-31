import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Confetti from "react-confetti"; 

import useLightbotGame from "../../../game/useLightbotGame";
import Visualizer3D from "../../../components/MainGame/Visualizer3d/Visualizer3d";
import RightSidebar from "../../../components/RightSide/RightSidebar/RightSidebar";
import BottomBar from "../../../components/BottomBar/BottomBar";
import Visualizer from "../../../components/MainGame/Visualizer/Visualizer";
import InstructionsPanel from "../../../components/InstructionsPanel/InstructionsPanel";
import "./AttackPage.css";
import { useAuth } from "../../../context/AuthContext";
import { useMusic } from "../../../context/MusicContext"; 

// --- CONFIG ---
const API_URL = process.env.REACT_APP_API_URL;

const POINTS_PER_SECOND_LEFT = 10; 
const BASE_WIN_POINTS = 500;       
const BASE_COIN_REWARD = 50;      

export default function AttackPage() {
    const { username } = useParams(); 
    const [searchParams] = useSearchParams(); 
    const navigate = useNavigate();
    const { token } = useAuth();
    
    // ✅ GLOBAL MUSIC CONTROL
    const { setMusicTrack } = useMusic();
    
    const snapshotId = searchParams.get("snapshot");

    const [use3D, setUse3D] = useState(true);
    const [showInstructions, setShowInstructions] = useState(false);
    
    // --- STATE ---
    const [levelData, setLevelData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Battle State
    const [battleResult, setBattleResult] = useState(null); 
    const [showResultModal, setShowResultModal] = useState(false);
    
    // Timer State
    const [timeLeft, setTimeLeft] = useState(null); 
    
    // Refs
    const timerIntervalRef = useRef(null);
    const isGameOverRef = useRef(false);
    const programsRef = useRef(null);

    const formatTime = (seconds) => {
        if (seconds === null || seconds < 0) return "00:00";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // --- 1. GAME ENGINE HOOK ---
    const onLevelComplete = async ({ steps }) => {
        if(isGameOverRef.current) return; 
        handleLocalBattleResult(true, steps);
    };

    const game = useLightbotGame(
        levelData ? [levelData] : [], 
        0, 
        onLevelComplete
    );

    // --- SYNC REF WITH LATEST CODE ---
    useEffect(() => {
        const currentCode = game.programs || game.functions;
        if (currentCode) {
            programsRef.current = currentCode;
        }
    }, [game.programs, game.functions]);

    // --- 2. INITIALIZATION (FETCH OPPONENT & HANDLE MUSIC) ---
    useEffect(() => {
        let isMounted = true;

        async function initAttackSession() {
            if (!token) return navigate("/login");

            try {
                let fetchUrl = `${API_URL}/user/arena/target/${username}`;
                if (snapshotId) {
                    fetchUrl += `?snapshotId=${snapshotId}`;
                }

                const res = await fetch(fetchUrl, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    
                    if (isMounted) {
                        const levelObj = data.level || data;
                        const levelWithId = { ...levelObj, id: 999 };
                        
                        setLevelData(levelWithId);

                        // 🎵 1. PLAY OPPONENT MUSIC
                        const opponentMusic = levelWithId.music || "cyber_theme_01";
                        setMusicTrack(opponentMusic);

                        const serverTime = data.remainingTime !== undefined ? data.remainingTime : 300;
                        setTimeLeft(Math.max(0, serverTime)); 
                        
                        setLoading(false);
                    }
                } 
                else {
                    alert("Target not found or Attack Invalid!");
                    navigate("/arena");
                }
            } 
            catch (err) {
                console.error("Attack Init Error:", err);
                navigate("/arena");
            } 
            finally {
                if (isMounted) setLoading(false);
            }
        }

        initAttackSession();

        // 🎵 2. CLEANUP: RESTORE USER MUSIC ON EXIT
        return () => {
            isMounted = false;
            if (token) {
                // Fetch the logged-in user's base music preference
                fetch(`${API_URL}/user/base`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => {
                    const userTheme = data?.level?.music || "default_base";
                    setMusicTrack(userTheme); // ✅ Revert to player's theme
                })
                .catch(err => {
                    console.warn("Could not restore user music", err);
                    setMusicTrack("default_base"); // Fallback
                });
            } else {
                setMusicTrack("default_base");
            }
        };
    }, [username, token, navigate, snapshotId, setMusicTrack]);

    // --- 3. SYNC GRID SIZE ---
    useEffect(() => {
        if (levelData && levelData.gridSize && game.updateGridSize) {
            game.updateGridSize(levelData.gridSize);
        }
    }, [levelData]); 

    // --- 4. TIMER (VISUAL COUNTDOWN) ---
    useEffect(() => {
        if (!loading && levelData && !isGameOverRef.current && timeLeft !== null) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            
            timerIntervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerIntervalRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
    }, [loading, levelData]); 

    // --- 5. TIMEOUT ---
    useEffect(() => {
        if (timeLeft === 0 && !isGameOverRef.current && !loading) {
            handleLocalBattleResult(false, 0, "TIMEOUT");
        }
    }, [timeLeft, loading]);

    // --- 6. RESULT HANDLING (UPDATED FOR SERVER SYNC) ---
    const handleLocalBattleResult = async (isWin, steps, failureReason = null) => {
        if (isGameOverRef.current) return; 
        isGameOverRef.current = true;
        clearInterval(timerIntervalRef.current);
        
        let score = 0; 
        let coins = 0; 
        let timeBonus = 0;

        if (isWin) {
            const safeTime = Math.max(0, timeLeft || 0);
            timeBonus = safeTime * POINTS_PER_SECOND_LEFT;
            const totalScore = BASE_WIN_POINTS + timeBonus;
            score = totalScore;
            coins = BASE_COIN_REWARD + Math.floor(totalScore / 50);
        }

        // 1. Submit to Server
        const serverResponse = await submitBattleResult({
            win: isWin,
            score,
            coins,
            programs: programsRef.current || game.programs
        });

        // 2. Use Server Data for XP (Anti-Farming Check)
        const finalXp = serverResponse?.gained_exp || 0;

        const resultObj = {
            win: isWin,
            score,
            coins,
            xp: finalXp, // ✅ Uses true server value
            timeBonus,
            stepsUsed: steps || 0,
            reason: failureReason
        };

        setBattleResult(resultObj);
        setShowResultModal(true);
    };

    const submitBattleResult = async (resultData) => {
        try {
            const res = await fetch(`${API_URL}/user/arena/report`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    targetUser: username,
                    snapshotId: snapshotId, 
                    isWin: resultData.win,
                    score: resultData.score,
                    coinsEarned: resultData.coins,
                    // experienceEarned: Not sent anymore, server calculates it
                    timeRemaining: timeLeft || 0, 
                    replay_programs: resultData.programs,
                    level_snapshot: levelData 
                })
            });
            if(res.ok) {
                return await res.json(); // Returns { gained_exp: ..., new_level: ... }
            }
        } catch (error) {
            console.error("Failed to report battle result", error);
        }
        return { gained_exp: 0 }; // Fallback
    };

    const handleRetreat = () => {
        if(window.confirm("Abort mission? This counts as a loss.")) {
            handleLocalBattleResult(false, 0, "ABORTED");
        }
    };

    if (loading) return <div className="loading-screen text-red">DECRYPTING FIREWALL...</div>;
    if (!levelData) return null;

    const timerColor = (timeLeft && timeLeft < 60) ? "text-red-alert" : "text-cyan";

    return (
        <div className="attack-page-container">
            {battleResult?.win && (
                <Confetti 
                    recycle={false} 
                    numberOfPieces={500} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999 }} 
                />
            )}

            <div className="attack-top-bar">
                <div className="attack-status">
                    <span className="blinking-dot"></span>
                    INTRUSION IN PROGRESS
                </div>
                
                <div className={`timer-display ${timerColor}`} style={{ fontSize: '1.5rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    T-MINUS: {formatTime(timeLeft)}
                </div>

                <div className="target-info">
                    <span className="target-label">TARGET:</span> 
                    <span className="target-name">{username.toUpperCase()}</span>
                </div>

                <div className="top-bar-actions">
                    <button className="btn-retreat" onClick={handleRetreat}>ABORT MISSION</button>
                </div>
            </div>

            <div className="attack-workspace">
                <div className="attack-visualizer-wrapper">
                    {use3D ? (
                        <Visualizer3D
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
                <RightSidebar {...game} />
            </div>

            <div className="attack-bottom-wrapper">
                <BottomBar
                    onRun={game.runProgram}
                    onReset={game.resetGame}
                    onSave={game.saveLevel}
                    onSubmit={game.submitLevel}
                    showSave={false}
                    showSubmit={false}
                    isRunning={game.isRunning}
                    message={game.gameMessage}
                    speed={game.speed}
                    setSpeed={game.setSpeed}
                    use3D={use3D}
                    setUse3D={setUse3D}
                    onOpenInstructions={() => setShowInstructions(true)}
                />
            </div>

            {showInstructions && (
                <InstructionsPanel
                mode="game"
                onClose={() => setShowInstructions(false)}
                />
            )}
            
            {showResultModal && battleResult && (
                <div className="battle-modal-overlay">
                    <div className={`battle-modal-content ${battleResult.win ? "win" : "loss"}`}>
                        <h1 className="battle-title">
                            {battleResult.win ? "SYSTEM BREACHED" : "CONNECTION LOST"}
                        </h1>
                        
                        {!battleResult.win && battleResult.reason === "TIMEOUT" && (
                            <h3 style={{color: '#ff4444', marginTop: '-10px'}}>FIREWALL LOCKDOWN (TIME UP)</h3>
                        )}

                        <div className="battle-stats">
                            {battleResult.win ? (
                                <>
                                    <div className="loot-row">
                                        <span className="label">Base Reward:</span>
                                        <span className="value">+{BASE_WIN_POINTS}</span>
                                    </div>
                                    <div className="loot-row">
                                        <span className="label">Time Bonus ({formatTime(timeLeft)} left):</span>
                                        <span className="value text-green">+{battleResult.timeBonus}</span>
                                    </div>
                                    <div className="loot-row highlight-row">
                                        <span className="label">TOTAL SCORE:</span>
                                        <span className="value text-cyan">{battleResult.score}</span>
                                    </div>
                                    <div className="loot-row coin-row">
                                        <span className="label">Coins Looted:</span>
                                        <span className="value text-gold">+{battleResult.coins} 🪙</span>
                                    </div>
                                    <div className="loot-row xp-row">
                                        <span className="label">Experience Gained:</span>
                                        <span className="value text-purple" style={{color: '#bc13fe'}}>+{battleResult.xp} XP</span>
                                    </div>
                                </>
                            ) : (
                                <div className="loot-row">
                                    <span className="label">Result:</span>
                                    <span className="value text-red">FAILED</span>
                                </div>
                            )}
                        </div>

                        <button className="btn-leave-arena" onClick={() => navigate("/arena")}>
                            RETURN TO BASE
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}