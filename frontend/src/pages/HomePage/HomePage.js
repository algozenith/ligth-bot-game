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
          <span style={{ marginRight: "20px" }}>BOT RAIDER</span>

          {/* --- UPDATED: Stylish Stats Display (Same as Arena) --- */}
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

          <div className="header-actions">
            <button className="btn-header btn-header-logout" onClick={logout}>
              LOGOUT
            </button>
          </div>
        </div>

        <div className="left-content preview-box">
          <Visualizer3D
            robot={robot}
            lit={lit}
            level={demoLevel}
            isEditable={false}
            isRunning={true}
            showStartWhenIdle={false}
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