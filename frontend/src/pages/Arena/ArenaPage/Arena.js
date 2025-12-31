import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Arena.css";
import { useAuth } from "../../../context/AuthContext";
import BattleHistory from "../BattleHistory/BattleHistory";

const API_URL = process.env.REACT_APP_API_URL;

export default function Arena() {
    const navigate = useNavigate();
    const { token, logout } = useAuth();
    
    // Data State
    const [bases, setBases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userStats, setUserStats] = useState(null); 

    // UI State
    const [leaderboard, setLeaderboard] = useState([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showBattleLog, setShowBattleLog] = useState(false);
    const [lbTab, setLbTab] = useState("alltime"); 
    const [attackError, setAttackError] = useState(null);

    // --- 1. INITIAL FETCH ---
    useEffect(() => {
        let isMounted = true;
        const initArena = async () => {
            if (!token) return navigate("/login");
            try {
                const [profileRes, oppRes] = await Promise.all([
                    fetch(`${API_URL}/user/profile`, { headers: { "Authorization": `Bearer ${token}` } }),
                    fetch(`${API_URL}/user/arena/opponents`, { headers: { "Authorization": `Bearer ${token}` } })
                ]);

                if (profileRes.status === 401) { logout(); navigate("/login"); return; }

                if (isMounted) {
                    if (profileRes.ok) {
                        const profileData = await profileRes.json();
                        setUserStats(profileData); 
                    }
                    if (oppRes.ok) {
                        setBases(await oppRes.json());
                    }
                }
            } catch (err) { 
                console.error("Arena Init Error:", err); 
            } finally { 
                if (isMounted) setLoading(false); 
            }
        };
        initArena();
        return () => { isMounted = false; };
    }, [token, navigate, logout]);

    // --- 2. LEADERBOARD FETCH ---
    useEffect(() => {
        if (!showLeaderboard) return;
        const fetchLB = async () => {
            try {
                const res = await fetch(`${API_URL}/leaderboard?period=${lbTab}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) setLeaderboard(await res.json());
            } catch (err) { console.error("LB Fetch Error:", err); }
        };
        fetchLB();
    }, [lbTab, showLeaderboard, token]);

    // --- 3. ATTACK HANDLER ---
    const handleAttack = (targetUsername, snapshotId) => {
        if (userStats && userStats.lives <= 0) {
            setAttackError("You have 0 Lives! Come back tomorrow.");
            setTimeout(() => setAttackError(null), 3000);
            return;
        }
        navigate(`/attack/${targetUsername}?snapshot=${snapshotId}`);
    };

    const getRankIcon = (index) => {
        if (index === 0) return "🥇";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";
        return `#${index + 1}`;
    };

    return (
        <div className="arena-container">
            {/* ERROR TOAST */}
            {attackError && (
                <div style={{
                    position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
                    background: '#ff4d4d', color: 'white', padding: '10px 20px', borderRadius: '8px',
                    fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    animation: 'fadeIn 0.3s ease-in-out'
                }}>
                    ⛔ {attackError}
                </div>
            )}

            <div className="arena-top-nav">
                <button className="btn-back-home" onClick={() => navigate("/")}>← MAIN MENU</button>
                
                <div className="arena-social-buttons">
                    {/* Stylish Lives Display */}
                    {userStats && (
                        <div className="lives-display-badge" title="Daily Energy" style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "linear-gradient(145deg, #2b2b2b, #1a1a1a)",
                            padding: "6px 16px",
                            borderRadius: "50px",
                            border: "1px solid rgba(255, 77, 77, 0.3)",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                            marginRight: "15px",
                            height: "36px"
                        }}>
                            <span style={{ 
                                fontSize: "1.2rem", 
                                filter: "drop-shadow(0 0 2px rgba(255, 77, 77, 0.8))" 
                            }}>❤️</span>
                            <span style={{ 
                                color: "#fff", 
                                fontWeight: "700", 
                                fontSize: "1.1rem",
                                fontFamily: "'Segoe UI', Roboto, sans-serif"
                            }}>
                                {userStats.lives}
                            </span>
                        </div>
                    )}

                    <button className="btn-social" onClick={() => setShowBattleLog(true)}>⚔️ BATTLE LOG</button>
                    <button className="btn-social" onClick={() => setShowLeaderboard(true)}>🏆 HALL OF FAME</button>
                </div>
            </div>

            <div className="arena-header">
                <h1 className="arena-title">GLOBAL ARENA</h1>
                <div className="arena-subtitle">Simulate attacks on enemy systems to test your logic</div>

                {/* --- NEW: GAME TIP --- */}
                {/* Shows only if user has lives (>0) but is not full (<5) */}
                {userStats && userStats.lives > 0 && userStats.lives < (userStats.max_lives || 5) && (
                    <div style={{
                        marginTop: '15px',
                        fontSize: '0.9rem',
                        color: '#a0aec0',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '6px 18px',
                        borderRadius: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        animation: 'fadeIn 0.5s ease-in'
                    }}>
                        <span style={{ fontSize: '1.1rem' }}>💡</span> 
                        <span>
                            Tip: Defeat opponents with a <strong style={{color: '#bc13fe'}}>Higher Level</strong> than you to restore <strong style={{color: '#ff4d4d'}}>❤️ Lives</strong>!
                        </span>
                    </div>
                )}
            </div>

            <div className="arena-main-column" style={{ padding: '0 40px' }}>
                {loading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                ) : (
                    <div className="arena-grid">
                        {bases.length === 0 ? (
                             <div className="no-bases"><h2>No Targets Detected</h2></div>
                        ) : (
                            bases.map((base) => (
                                <div key={base.id} className="arena-card">
                                    <div className="card-header">
                                        <div>
                                            <h3 className="card-name">{base.name || "Outpost"}</h3>
                                            <div className="card-user">TARGET: {base.username}</div>
                                        </div>
                                        <div className="card-grid-badge">{base.gridSize}x{base.gridSize}</div>
                                    </div>

                                    <div className="card-stats">
                                        <div className="stat-item">
                                            <span className="stat-val" style={{color: '#bc13fe'}}>LVL {base.level}</span>
                                            <span className="stat-lbl">Rank</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-val">{base.goals?.length || 0}</span>
                                            <span className="stat-lbl">Goals</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-val">{base.trophies || 0}</span>
                                            <span className="stat-lbl">Trophies</span>
                                        </div>
                                    </div>

                                    <button 
                                        className="btn-attack" 
                                        // Disable visually if 0 lives
                                        style={userStats?.lives <= 0 ? { 
                                            background: '#555', 
                                            cursor: 'not-allowed', 
                                            opacity: 0.7,
                                            transform: 'none',
                                            boxShadow: 'none'
                                        } : {}}
                                        onClick={() => handleAttack(base.username, base.id)}
                                    >
                                        {userStats?.lives > 0 ? "INITIATE SIMULATION" : "NO ENERGY"}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* LEADERBOARD MODAL */}
            {showLeaderboard && (
                <div className="modal-backdrop" onClick={() => setShowLeaderboard(false)}>
                    <div className="modal-content leaderboard-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🏆 HALL OF FAME</h3>
                            <button onClick={() => setShowLeaderboard(false)} className="close-btn">✕</button>
                        </div>
                        
                        <div className="lb-tab-container">
                            <button className={`lb-tab ${lbTab === 'daily' ? 'active' : ''}`} onClick={() => setLbTab('daily')}>TODAY</button>
                            <button className={`lb-tab ${lbTab === 'weekly' ? 'active' : ''}`} onClick={() => setLbTab('weekly')}>THIS WEEK</button>
                            <button className={`lb-tab ${lbTab === 'alltime' ? 'active' : ''}`} onClick={() => setLbTab('alltime')}>ALL-TIME</button>
                        </div>

                        <div className="modal-body">
                            <table className="leaderboard-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>User</th>
                                        <th>Wins ({lbTab})</th>
                                        <th className="text-right">Trophies</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((u, i) => (
                                        <tr key={i} className={u.username === userStats?.username ? "row-highlight" : ""}>
                                            <td className="rank-col">{getRankIcon(i)}</td>
                                            <td className="user-col">{u.username}</td>
                                            <td>{u.wins}</td>
                                            <td className="trophy-col">{u.trophies} 🏆</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* BATTLE LOG MODAL */}
            {showBattleLog && (
                <div className="modal-backdrop" onClick={() => setShowBattleLog(false)}>
                    <div className="modal-content battle-log-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-body"><BattleHistory onClose={() => setShowBattleLog(false)} /></div>
                    </div>
                </div>
            )}
        </div>
    );
}