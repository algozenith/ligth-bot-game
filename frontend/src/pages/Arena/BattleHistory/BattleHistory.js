import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../../context/AuthContext";
import './BattleHistory.css';

export default function BattleHistory({ onClose }) {
    const { token } = useAuth();
    const navigate = useNavigate();
    
    // Data State
    const [history, setHistory] = useState([]);
    const [filter, setFilter] = useState('ALL'); 
    
    // Revenge State
    const [revengeTarget, setRevengeTarget] = useState(null); 

    // --- POLLING EFFECT ---
    useEffect(() => {
        if(!token) return;

        // 1. Define the fetch function
        const fetchHistory = () => {
            fetch(`${process.env.REACT_APP_API_URL}/user/arena/history`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                // Optional: Check if data actually changed to avoid unnecessary re-renders, 
                // but React state updates are usually efficient enough for simple lists.
                setHistory(data);
            })
            .catch(err => console.error("Failed to load history", err));
        };

        // 2. Call immediately on mount
        fetchHistory();

        // 3. Set up Polling (every 5 seconds)
        const intervalId = setInterval(fetchHistory, 5000);

        // 4. Cleanup on unmount (Stop polling when window closes)
        return () => clearInterval(intervalId);

    }, [token]);

    const filteredHistory = history.filter(item => {
        if (filter === 'ALL') return true;
        return item.type === filter;
    });

    const handleRevengeClick = (opponentName) => setRevengeTarget(opponentName);
    
    const confirmRevenge = () => {
        if (onClose) onClose();
        navigate(`/attack/${revengeTarget}`);
    };

    const cancelRevenge = () => setRevengeTarget(null);

const handleReplay = (log) => {
    // Ensure we have programs. 
    // Even if the user placed 0 commands, the replay should technically load an empty sidebar.
    // We strictly check for 'undefined' or 'null' rather than truthiness if possible.
    if (!log.replay_programs) {
        alert("Corrupted data: No command logs found for this battle.");
        return;
    }
    
    if (onClose) onClose();
    navigate("/replay", { state: { log: log } });
};

    return (
        <div className="battle-history-container">
            
            {/* --- REVENGE OVERLAY (Global) --- */}
            {revengeTarget && (
                <div className="revenge-overlay">
                    <div className="revenge-box">
                        <div className="revenge-header-line">⚠ COUNTER-STRIKE PROTOCOL ⚠</div>
                        
                        <div className="revenge-content">
                            <p className="revenge-label">LOCKED TARGET:</p>
                            <h1 className="target-name">{revengeTarget.toUpperCase()}</h1>
                            
                            <div className="revenge-info-grid">
                                <div className="info-cell">
                                    <span>TYPE</span>
                                    <strong>RETALIATION</strong>
                                </div>
                                <div className="info-cell">
                                    <span>STATUS</span>
                                    <strong className="blink-text">READY</strong>
                                </div>
                            </div>

                            <p className="revenge-flavor">
                                Launching this attack will bypass standard matchmaking. 
                                Cost is standard. Glory is eternal.
                            </p>
                            
                            <div className="revenge-actions">
                                <button className="btn-launch" onClick={confirmRevenge}>🚀 LAUNCH ASSAULT</button>
                                <button className="btn-cancel" onClick={cancelRevenge}>STAND DOWN</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- STANDARD LOG HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#fff' }}>Battle Log</h3>
                {onClose && (
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                )}
            </div>
            
            <div className="history-tabs">
                <button className={filter === 'ALL' ? 'active' : ''} onClick={() => setFilter('ALL')}>ALL</button>
                <button className={filter === 'ATTACK' ? 'active' : ''} onClick={() => setFilter('ATTACK')}>Attacks</button>
                <button className={filter === 'DEFENSE' ? 'active' : ''} onClick={() => setFilter('DEFENSE')}>Defenses</button>
            </div>

            <div className="history-list">
                {filteredHistory.length === 0 ? (
                    <div className="no-history">No battle records found.</div>
                ) : (
                    filteredHistory.map((log, index) => (
                        <div key={index} className={`history-card ${log.isWin ? 'win' : 'loss'}`}>
                            <div className="card-icon">
                                {log.type === 'ATTACK' ? '⚔️' : '🛡️'}
                            </div>
                            
                            <div className="card-details">
                                <div className="card-header">
                                    <span className="opponent">
                                        {log.type === 'ATTACK' ? `vs ${log.opponent}` : `by ${log.opponent}`}
                                    </span>
                                    <span className="timestamp">
                                        {new Date(log.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <div className="card-result">
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <span className={`result-badge ${log.isWin ? 'win-badge' : 'loss-badge'}`}>
                                            {log.isWin ? 'VICTORY' : 'DEFEAT'}
                                        </span>
                                        <span className="score-text">Score: {log.score}</span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {log.replay_programs && (
                                            <button className="btn-replay" onClick={() => handleReplay(log)} title="Watch Replay">📹</button>
                                        )}
                                        {log.type === 'DEFENSE' && !log.isWin && (
                                            log.revenged ? (
                                                <span className="badge-avenged">✔ AVENGED</span>
                                            ) : (
                                                <button className="btn-revenge" onClick={() => handleRevengeClick(log.opponent)}>
                                                    REVENGE 💢
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}