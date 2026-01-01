import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Visualizer3D from "../../components/MainGame/Visualizer3d/Visualizer3d";
import "./HomePage.css";
import { useAuth } from "../../context/AuthContext";

export default function HomePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // --- 1. STATE FOR USER STATS ---
  const [userStats, setUserStats] = useState({
    lives: 5,
    max_lives: 5,
    coins: 0, 
  });

  // --- 2. FETCH USER DATA ON MOUNT ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${process.env.REACT_APP_API_URL}/me`, {          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserStats({
            lives: data.lives,
            max_lives: data.max_lives || 5,
            coins: data.coins,
          });
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    fetchUserData();
  }, []);

  /* --------------------------------
      DEMO LEVEL CONFIG (ROBOT PREVIEW)
   --------------------------------- */
  const demoLevel = {
    id: 71,
    name: "Custom Level 8",
    description: "Design your own Lightbot puzzle!",
    gridSize: 6,
    start: { x: 5, y: 4, dir: 0 },
    goals: [{ x: 5, y: 3 }],
    heights: [
      [0, 0, 2, 2, 2, 2],
      [0, 0, 0, 0, 0, 0],
      [0, 3, 0, 0, 0, 0],
      [0, 2, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ],
    teleportLinks: { "1,2": "2,0", "3,2": "4,5" },
    elevatorMeta: {
      "4,0": { dx: 0, dy: 1, dir: "down", type: "col" },
      "4,1": { dx: 0, dy: 1, dir: "down", type: "col" },
      "4,2": { dx: 0, dy: 1, dir: "down", type: "col" },
      "4,3": { dx: -1, dy: 0, dir: "left", type: "row" },
      "3,3": { dx: 0, dy: -1, dir: "up", type: "col" },
      "4,5": { dx: -1, dy: 0, dir: "left", type: "row" },
    },
    iceTiles: [{ x: 3, y: 5 }, { x: 2, y: 5 }],
  };

  const [robot, setRobot] = useState({ x: 3, y: 5, dir: 3 });
  const [lit] = useState(new Set());
  const [lastTeleportKey, setLastTeleportKey] = useState(null);
  const [teleportFX, setTeleportFX] = useState(null);

  /* --------------------------------
      ANIMATION LOOP
   --------------------------------- */
  useEffect(() => {
    const loop = [
      { x: 4, y: 5, dir: 1 }, { x: 3, y: 5, dir: 1 }, { x: 2, y: 5, dir: 1 }, { x: 1, y: 5, dir: 1 },
      { x: 1, y: 5, dir: 0 }, { x: 1, y: 4, dir: 0 }, { x: 1, y: 3, dir: 0 }, { x: 1, y: 2, dir: 0 },
      { x: 1, y: 2, dir: 0, tpFrom: "1,2", tpTo: "2,0" },
      { x: 2, y: 0, dir: 0 }, { x: 2, y: 0, dir: 1 }, { x: 3, y: 0, dir: 1 }, { x: 4, y: 0, dir: 1 },
      { x: 4, y: 1, dir: 1 }, { x: 4, y: 2, dir: 1 }, { x: 4, y: 3, dir: 1 }, { x: 3, y: 3, dir: 1 },
      { x: 3, y: 2, dir: 1 },
      { x: 3, y: 2, dir: 1, tpFrom: "3,2", tpTo: "4,5" },
      { x: 4, y: 5, dir: 1 },
    ];

    let i = 0;
    const interval = setInterval(() => {
      const step = loop[i];
      setRobot({ x: step.x, y: step.y, dir: step.dir });

      if (step.tpFrom && step.tpTo) {
        setLastTeleportKey(step.tpFrom);
        setTeleportFX({ from: step.tpFrom, to: step.tpTo });
        setTimeout(() => {
          setLastTeleportKey(null);
          setTeleportFX(null);
        }, 250);
      }
      i = (i + 1) % loop.length;
    }, 480);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <div className="left-section">
        <div className="title-bar">
          <span className="game-logo">BOT RAIDER</span>
          <div className="header-actions">
            <div className="lives-display-badge" title="Daily Energy">
              <svg className="tech-heart" viewBox="0 0 24 24" fill="none">
                <path className="heart-outer" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                <path className="heart-inner" d="M12 18l-1-1c-3.5-3-6-5.5-6-8.5 0-2 1.5-3.5 3.5-3.5 1.2 0 2.3.6 3 1.5.7-.9 1.8-1.5 3-1.5 2 0 3.5 1.5 3.5 3.5 0 3-2.5 5.5-6 8.5l-1 1z" />
              </svg>
              <span className="lives-count">{userStats.lives}</span>
            </div>
            <button className="logout-btn" onClick={logout}>LOGOUT</button>
          </div>
        </div>

        <div className="preview-box">
          <Visualizer3D
            robot={robot}
            lit={lit}
            level={demoLevel}
            isRunning={true}
            lastTeleportKey={lastTeleportKey}
            teleportFX={teleportFX}
          />
        </div>
      </div>

      <div className="right-section">
        <div className="right-box tutorial-box" onClick={() => navigate("/tutorial")}>
          <div className="box-title">Tutorial</div>
          <div className="box-sub">Learn the basics</div>
        </div>
        <div className="right-box tutorial-box" onClick={() => navigate("/base")}>
          <div className="box-title">Your Base</div>
          <div className="box-sub">Customize & upgrade</div>
        </div>
        <div className="right-box tutorial-box" onClick={() => navigate("/arena")}>
          <div className="box-title">Arena</div>
          <div className="box-sub">Explore puzzles</div>
        </div>
        <div className="right-box tutorial-box" onClick={() => navigate("/tournament")}>
          <div className="box-title">Tournament</div>
          <div className="box-sub">Coming Soon !!</div>
        </div>
      </div>
    </div>
  );
}