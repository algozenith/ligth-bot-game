import React, { useState, useEffect } from "react";
import "../../App.css";
import "./TutorialPage.css";

import useLightbotGame from "../../game/useLightbotGame";
import TopBar from "../../components/TopBar/TopBar";
import LevelSidebar from "../../components/LevelSidebar/LevelSidebar";
import Visualizer from "../../components/MainGame/Visualizer/Visualizer";
import Visualizer3D from "../../components/MainGame/Visualizer3d/Visualizer3d";
import RightSidebar from "../../components/RightSide/RightSidebar/RightSidebar";
import BottomBar from "../../components/BottomBar/BottomBar";
import InstructionsPanel from "../../components/InstructionsPanel/InstructionsPanel";

// 1. Import the Auth Hook (Assumes you have created AuthContext.js)
import { useAuth } from "../../context/AuthContext"; 
import { useMusic } from "../../context/MusicContext";

// --- CONFIG ---
const API_URL = process.env.REACT_APP_API_URL;

export default function TutorialPage() {
  // Data State
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Game State
  const [tutorialLevelIndex, setTutorialLevelIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [use3D, setUse3D] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  // Animation states
  const [showSuccess, setShowSuccess] = useState(false);
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  // Unlock progress
  const [progress, setProgress] = useState(1);

  const { token } = useAuth(); 
  const { setMusicTrack } = useMusic();

  // --- 1. INITIALIZE DATA (Levels, Progress, Music) ---
  useEffect(() => {
    async function initTutorialPage() {
      try {
        // A. Fetch Tutorial Levels
        const levelsRes = await fetch(`${API_URL}/tutorial_levels`);
        const levelsData = await levelsRes.json();
        setLevels(levelsData);

        // B. Check Token from Context
        if (token) {
          // Logged In: Fetch Progress & Music Preference in parallel
          const [progRes, baseRes] = await Promise.all([
            fetch(`${API_URL}/user/progress_tutorial`, { headers: { "Authorization": `Bearer ${token}` } }),
            fetch(`${API_URL}/user/base`, { headers: { "Authorization": `Bearer ${token}` } })
          ]);

          if (progRes.ok) {
            const progData = await progRes.json();
            setProgress(progData.progress);
          }

          if (baseRes.ok) {
            const baseData = await baseRes.json();
            if (baseData?.level?.music) {
              setMusicTrack(baseData.level.music);
            } 
            else {
              setMusicTrack("default_base");
            }
          }
        } 

        setLoading(false);
      } 
      catch (err) {
        console.error("Tutorial Init Error:", err);
        setLoading(false);
      }
    }

    initTutorialPage();
  }, [token, setMusicTrack]); // 'token' is now a valid dependency that triggers updates

  const game = useLightbotGame(levels, tutorialLevelIndex);
  const level = game.currentLevel;

  // Curtain animation
  useEffect(() => {
    setClosing(false);
    setCurtainOpen(false);
    setTimeout(() => setCurtainOpen(true), 150);
  }, [tutorialLevelIndex]);

  // Goal completion check
  useEffect(() => {
    if (!game.isRunning && level && level.goals) {
      const litArr = Array.from(game.lit || []).map((key) => {
        const [x, y] = key.split(",").map(Number);
        return { x, y };
      });

      const done = level.goals.every((g) =>
        litArr.some((t) => t.x === g.x && t.y === g.y)
      );

      if (done) handleLevelComplete();
    }
  }, [game.lit, game.isRunning, level]);

  // --- SAVE PROGRESS LOGIC ---
  async function saveProgress(newProgress) {
    if (token) {
      try {
        await fetch(`${API_URL}/user/progress_tutorial`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          },
          body: JSON.stringify({ progress: newProgress })
        });
      } 
      catch (err) {
        console.error("Failed to save cloud progress", err);
      }
    } 
  }

  function handleLevelComplete() {
    setClosing(true);
    setCurtainOpen(false);
    setShowSuccess(true);

    const nextIndex = tutorialLevelIndex + 1;
    const nextLevel = levels[nextIndex];

    if (nextLevel) {
      const newProgValue = Math.max(progress, nextLevel.id);
      setProgress(newProgValue);
      saveProgress(newProgValue);
    }

    setTimeout(() => {
      setShowSuccess(false);
      if (nextIndex < levels.length) {
        setTutorialLevelIndex(nextIndex);
      }
      setTimeout(() => {
        setClosing(false);
        setCurtainOpen(true);
      }, 200);
    }, 1500);
  }

  function handleSelectLevel(i) {
    if (levels[i].id <= progress) {
      setTutorialLevelIndex(i);
    }
  }

  if (loading) return <div className="loading-screen">Loading Levels...</div>;
  if (!level) return <div className="error-screen">No levels found.</div>;

  return (
    <div className="app-root">
      <TopBar level={level} showCreate={false} />

      <div className="app-main">
        <LevelSidebar
          levels={levels}
          currentIndex={tutorialLevelIndex}
          onSelect={handleSelectLevel}
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          progress={progress}
        />

        <div className="visualizer-wrapper">
          {use3D ? (
            <Visualizer3D
              robot={game.robot}
              lit={game.lit}
              level={level}
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
              level={level}
              isEditable={false}
              isRunning={game.isRunning}
              showStartWhenIdle={true}
              lastTeleportKey={game.lastTeleportKey}
              pendingTpStart={game.pendingTpStart}
              teleportFX={game.teleportFX}
            />
          )}

          <div className={`curtain ${curtainOpen ? "open" : ""} ${closing ? "closing" : ""}`}>
            <div className="curtain-left"></div>
            <div className="curtain-right"></div>
            {showSuccess && (
              <div className="curtain-success-text">Level Complete!</div>
            )}
          </div>
        </div>

        <RightSidebar {...game} level={level} />
      </div>

      <BottomBar
        currentLevel={level}
        onRun={game.runProgram}
        onReset={game.resetGame}
        showSubmit={false}
        showSave={false}
        isRunning={game.isRunning}
        message={`Tutorial Level ${level.id}`}
        speed={game.speed}
        setSpeed={game.setSpeed}
        use3D={use3D}
        setUse3D={setUse3D}
        onOpenInstructions={() => setShowInstructions(true)}
      />

      {showInstructions && (
        <InstructionsPanel mode="tutorial" onClose={() => setShowInstructions(false)} />
      )}
    </div>
  );
}