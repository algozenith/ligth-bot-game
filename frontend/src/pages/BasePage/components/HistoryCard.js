import React, { useRef, useState, useEffect, useMemo } from "react";
import Visualizer3D from "../../../components/MainGame/Visualizer3d/Visualizer3d";
import Visualizer from "../../../components/MainGame/Visualizer/Visualizer";
import { fixLevelData, MUSIC_OPTIONS } from "../utils/baseUtils";

const HistoryCard = ({ entry, onDeploy, onUpdateName }) => {
    const cardRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [viewMode, setViewMode] = useState("3d");
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(entry.level.name || "");
    const safeLevel = useMemo(() => fixLevelData(entry.level), [entry.level]);

    const musicLabel = MUSIC_OPTIONS.find(m => m.key === safeLevel.music)?.label || "Custom";

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { rootMargin: "100px", threshold: 0.1 });

        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, []);

    const handleSaveName = async (e) => {
        e.stopPropagation();
        if (tempName.trim() === "") return;
        const success = await onUpdateName(entry.id, tempName);
        if (success) setIsEditingName(false);
    };

    return (
        <div className="history-card" ref={cardRef}>
            <div className="history-viz-frame">
                <div className="card-viz-controls">
                     <button className="card-viz-toggle" onClick={(e) => { e.stopPropagation(); setViewMode(viewMode === "3d" ? "2d" : "3d"); }}>
                        {viewMode === "3d" ? "VIEW 2D" : "VIEW 3D"}
                     </button>
                </div>
                <div className="viz-inner-container">
                    {isVisible ? (
                        viewMode === "3d" ? (
                            <Visualizer3D level={safeLevel} robot={safeLevel.start} lit={new Set()} isEditable={false} isThumbnail={true} />
                        ) : (
                            <Visualizer level={safeLevel} robot={safeLevel.start} lit={new Set()} isEditable={false} />
                        )
                    ) : (
                        <div className="viz-loading-placeholder"><span>Loading...</span></div>
                    )}
                </div>
            </div>
            <div className="history-card-info">
                <div className="history-card-header">
                    {isEditingName ? (
                        <div className="history-name-edit-group">
                            <input className="history-name-input" value={tempName} onChange={(e) => setTempName(e.target.value)} autoFocus />
                            <button className="btn-save-name" onClick={handleSaveName}>✔</button>
                            <button className="btn-cancel-name" onClick={() => {setIsEditingName(false); setTempName(entry.level.name);}}>✖</button>
                        </div>
                    ) : (
                        <div className="history-card-title-row">
                            <div className="history-card-title" title={entry.level.name}>{entry.level.name || "Untitled Base"}</div>
                            <button className="btn-edit-name-trigger" onClick={() => setIsEditingName(true)}>✏️</button>
                        </div>
                    )}
                    <div className="history-card-meta">{new Date(entry.submittedAt).toLocaleDateString()}</div>
                </div>
                <div className="history-card-stats">
                    <div className="stat-pill">📐 {safeLevel.gridSize}</div>
                    <div className="stat-pill">⭐ {safeLevel.goals.length}</div>
                    <div className="stat-pill" title="Music Track">{musicLabel}</div>
                </div>
                <button className="btn-history-deploy" onClick={() => onDeploy(entry)}>RESTORE BASE</button>
            </div>
        </div>
    );
};
export default HistoryCard;