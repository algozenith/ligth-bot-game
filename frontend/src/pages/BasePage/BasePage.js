import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./BasePage.css"; 

import useLightbotGame from "../../game/useLightbotGame";
import InstructionsPanel from "../../components/InstructionsPanel/InstructionsPanel";
import { useAuth } from "../../context/AuthContext";
import { useMusic } from "../../context/MusicContext"; 

// Modularized imports
import { normalizePrograms, fixLevelData, UNLOCK_LEVELS } from "./utils/baseUtils";
import { useBaseManager } from "./hooks/useBaseManager";

// Components
import Popup from "./components/Popup";
import ViewMode from "./components/ViewMode";
import EditMode from "./components/EditMode";
import DraftsModal from "./components/DraftsModal";
import HistoryModal from "./components/HistoryModal";

export default function BasePage() {
    const navigate = useNavigate();
    const { token, logout } = useAuth();
    const manager = useBaseManager(token, navigate, logout);
    
    // Global Music Context
    const { musicTrack, setMusicTrack } = useMusic();

    const [editorData, setEditorData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // 🎵 TRACKING "COMMITTED" MUSIC (Safe version to revert to)
    const committedMusicRef = useRef("default_base");

    useEffect(() => {
        if (manager.baseSnapshot?.level?.music) {
            committedMusicRef.current = manager.baseSnapshot.level.music;
        }
    }, [manager.baseSnapshot]);

    useEffect(() => {
        return () => {
            setMusicTrack(committedMusicRef.current);
        };
    }, [setMusicTrack]); 

    const [modals, setModals] = useState({ drafts: false, history: false, instructions: false });
    const [popup, setPopup] = useState({ isOpen: false, message: "", type: "alert", onConfirm: null });
    const [pendingTpStart, setPendingTpStart] = useState(null);
    const [use3D, setUse3D] = useState(true);

    const activeLevel = useMemo(() => {
        return isEditing ? editorData : manager.baseSnapshot?.level;
    }, [isEditing, editorData, manager.baseSnapshot]);

    const gameLevels = useMemo(() => [activeLevel || {}], [activeLevel]);
    const game = useLightbotGame(gameLevels, 0);
    
    // Music Sync
    useEffect(() => {
        if (manager.loading || !activeLevel) return;
        const desiredMusic = activeLevel.music || "default_base";
        if (musicTrack !== desiredMusic) {
            setMusicTrack(desiredMusic);
        }
    }, [activeLevel?.music, musicTrack, setMusicTrack, manager.loading]); 

    // Initialize Game Programs
    useEffect(() => {
        if (!isEditing && manager.baseSnapshot?.programs && game.setPrograms) {
            const normalized = normalizePrograms(manager.baseSnapshot.programs);
            game.setPrograms(normalized);
        }
    }, [manager.baseSnapshot, isEditing, game.setPrograms]);

    // Sync Grid Size
    useEffect(() => {
        if (activeLevel?.gridSize && game.updateGridSize) {
            game.updateGridSize(activeLevel.gridSize);
        }
    }, [activeLevel?.gridSize]);

    // ✅ FIX: ROBUST STATS FALLBACK
    // If userProfile isn't loaded yet, default to these safe values
    // to match the new backend structure.
    const stats = manager.userProfile || {
        rank: "NOVICE",
        level: 1,
        exp: 0,             
        expToNextLevel: 500, // Safe default to avoid division by zero
        trophies: 0,
        coins: 0
    };

    const tierClass = `tier-${(stats.rank || "novice").toLowerCase()}`;
    const toggleModal = (name, val) => setModals(prev => ({ ...prev, [name]: val }));
    const showAlert = (msg) => setPopup({ isOpen: true, message: msg, type: "alert" });
    const showConfirm = (msg, fn) => setPopup({ isOpen: true, message: msg, type: "confirm", onConfirm: () => { fn(); setPopup(p => ({...p, isOpen:false})); } });

    const handleStartEditing = () => {
        if (manager.baseSnapshot?.level) {
            setEditorData(structuredClone(manager.baseSnapshot.level));
            if (game.setPrograms && manager.baseSnapshot.programs) {
                const normalized = normalizePrograms(manager.baseSnapshot.programs);
                game.setPrograms(normalized);
            }
            setIsEditing(true);
            game.resetGame();
        }
    };

    const handleCancelEditing = () => {
        showConfirm("Discard unsaved changes?", () => {
            setMusicTrack(committedMusicRef.current);
            setIsEditing(false);
        });
    };

    const handleGridResize = (newSize) => {
        if (editorData.gridSize === newSize) return;
        showConfirm(`Reset grid to ${newSize}x${newSize}? Map will be cleared!`, () => {
            setEditorData(prev => ({
                ...prev,
                music: prev.music || "default_base",
                gridSize: newSize,
                heights: Array.from({ length: newSize }, () => Array(newSize).fill(0)),
                goals: [], teleportLinks: {}, elevatorMeta: {}, iceTiles: [], start: { x: 0, y: 0, dir: 1 }
            }));
        });
    };

    // 🔒 TILE ACTION HANDLER WITH LEVEL LOCKS
    const handleTileAction = useCallback((x, y, action) => {
        if (!isEditing) return;

        // 1. CHECK UNLOCKS (Safety check)
        if (action === "toggle-ice" && stats.level < UNLOCK_LEVELS.ICE) {
            showAlert(`🔒 Ice Tiles are locked! Reach Level ${UNLOCK_LEVELS.ICE} to unlock.`);
            return;
        }
        if (action.startsWith("elev-") && stats.level < UNLOCK_LEVELS.ELEVATOR) {
            showAlert(`🔒 Elevators are locked! Reach Level ${UNLOCK_LEVELS.ELEVATOR} to unlock.`);
            return;
        }
        if ((action.startsWith("tp-") || action === "tp-delete") && stats.level < UNLOCK_LEVELS.TELEPORT) {
            showAlert(`🔒 Teleporters are locked! Reach Level ${UNLOCK_LEVELS.TELEPORT} to unlock.`);
            return;
        }

        // 2. PROCEED IF UNLOCKED
        const key = `${x},${y}`;
        setEditorData(prev => {
            const next = structuredClone(prev); 
            if (action.startsWith("elev-")) {
                if (action === "elev-unset") delete next.elevatorMeta[key];
                else {
                    const metaMap = { "elev-right": {dx:1,dy:0,dir:"right",type:"row"}, "elev-left": {dx:-1,dy:0,dir:"left",type:"row"}, "elev-down": {dx:0,dy:1,dir:"down",type:"col"}, "elev-up": {dx:0,dy:-1,dir:"up",type:"col"} };
                    if(metaMap[action]) next.elevatorMeta[key] = metaMap[action];
                }
            } 
            else if (action === "tp-start") setPendingTpStart(key);
            else if (action === "tp-end") {
                if(pendingTpStart && pendingTpStart !== key) { next.teleportLinks[pendingTpStart] = key; setPendingTpStart(null); } else showAlert("Invalid Teleport Destination");
            }
            else if (action === "tp-delete") { delete next.teleportLinks[key]; if(pendingTpStart === key) setPendingTpStart(null); }
            else if (action === "toggle-ice") {
                const idx = next.iceTiles.findIndex(t => t.x === x && t.y === y);
                if (idx >= 0) next.iceTiles.splice(idx, 1); else next.iceTiles.push({ x, y });
            }
            else {
                if (action === "start") next.start = { x, y, dir: next.start.dir };
                if (action === "rotate") next.start.dir = (next.start.dir + 1) % 4;
                if (action === "toggle-goal") {
                    const idx = next.goals.findIndex(g => g.x === x && g.y === y);
                    if (idx >= 0) next.goals.splice(idx, 1); else next.goals.push({ x, y });
                }
                if (action === "height-plus") next.heights[y][x]++;
                if (action === "height-minus") next.heights[y][x] = Math.max(0, next.heights[y][x] - 1);
            }
            return next;
        });
    }, [isEditing, pendingTpStart, stats.level]);

    const onOpenDrafts = async () => { if(await manager.loadDrafts()) toggleModal("drafts", true); };
    const onOpenHistory = async () => { if(await manager.loadHistory()) toggleModal("history", true); };
    
    const onSaveDraft = async () => {
        const snapshot = { level: game.currentLevel || editorData, programs: game.programs || { main: [], m1: [], m2: [] } };
        if (await manager.saveDraft(snapshot)) showAlert("💾 Draft Saved!"); else showAlert("Failed to save draft.");
    };
    
    const onLoadDraft = (draft) => {
        showConfirm("Load draft? Unsaved changes will be lost.", () => {
            const loadedLevel = fixLevelData(draft.level);
            setEditorData(loadedLevel);
            if (loadedLevel.music) setMusicTrack(loadedLevel.music);
            if (game.setPrograms && draft.programs) { const normalized = normalizePrograms(draft.programs); game.setPrograms(normalized); }
            setIsEditing(true); toggleModal("drafts", false);
        });
    };
    
    const onDeleteDraft = (id, e) => { e.stopPropagation(); showConfirm("Delete this draft?", () => manager.deleteDraft(id)); };
    const onRestoreHistory = (entry) => {
        showConfirm("Restore this version?", async () => {
            const res = await manager.restoreHistory(entry.id);
            if(res.success) {
                const restoredLevel = fixLevelData(res.data.level); const normalizedProgs = normalizePrograms(entry.programs);
                manager.setBaseSnapshot({ level: restoredLevel, programs: normalizedProgs });
                if (game.setPrograms) game.setPrograms(normalizedProgs);
                toggleModal("history", false); setIsEditing(false); showAlert("✅ Base Restored Successfully!");
            } else showAlert("Failed to restore.");
        });
    };

    const onSubmitBase = async () => {
        const lvl = game.currentLevel || editorData;
        if(lvl.goals.length === 0) return showAlert("⚠️ You must place at least one Goal (Star)!");
        const programs = game.programs || { main: [], m1: [], m2: [] };
        const res = await manager.deployBase(lvl, programs);
        if(res.message) { 
            showAlert(res.message); 
            manager.setBaseSnapshot({ level: lvl, programs: programs }); 
            setIsEditing(false); 
        } 
        else showAlert(res.detail || "Validation Failed");
    };

    if (manager.loading) return (<div className="loading-container"><div className="loader-spinner"></div><h2>Accessing Command Link...</h2></div>);

    return (
        <div className={`base-page-root ${tierClass}`}>
            <div className="base-page-container">
                {/* 1. Generic Popup */}
                {popup.isOpen && <Popup {...popup} onCancel={() => setPopup(p => ({...p, isOpen:false}))} />}

                {/* 2. View Mode */}
                {!isEditing && manager.baseSnapshot && (
                    <ViewMode 
                        manager={manager} stats={stats} 
                        handleStartEditing={handleStartEditing} 
                        onOpenHistory={onOpenHistory} 
                        navigate={navigate} 
                    />
                )}

                {/* 3. Edit Mode */}
                {isEditing && editorData && (
                    <EditMode 
                        editorData={editorData} setEditorData={setEditorData} setMusicTrack={setMusicTrack}
                        game={game} use3D={use3D} setUse3D={setUse3D}
                        handleGridResize={handleGridResize} handleCancelEditing={handleCancelEditing}
                        handleTileAction={handleTileAction} pendingTpStart={pendingTpStart}
                        stats={stats} onOpenDrafts={onOpenDrafts} onSaveDraft={onSaveDraft}
                        onSubmitBase={onSubmitBase} onOpenInstructions={() => toggleModal("instructions", true)}
                    />
                )}

                {/* 4. Modals (Clean & Modular) */}
                <DraftsModal 
                    isOpen={modals.drafts}
                    onClose={() => toggleModal("drafts", false)}
                    drafts={manager.drafts}
                    onLoad={onLoadDraft}
                    onDelete={onDeleteDraft}
                />

                <HistoryModal
                    isOpen={modals.history}
                    onClose={() => toggleModal("history", false)}
                    history={manager.history}
                    onRestore={onRestoreHistory}
                    onUpdateName={manager.updateHistoryName}
                />

                {modals.instructions && <InstructionsPanel mode="custom" onClose={() => toggleModal("instructions", false)} />}
            </div>
        </div>
    );
}