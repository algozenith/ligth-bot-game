import { useState, useEffect, useRef } from "react";

// Program sizes
export const PROGRAM_SIZES = {
  main: 12,
  m1: 8,
  m2: 8,
};

// Commands
export const CMD_FORWARD = "F";
export const CMD_LIGHT = "L";
export const CMD_TURN_LEFT = "TL";
export const CMD_TURN_RIGHT = "TR";
export const CMD_JUMP = "J";
export const CMD_CALL_M1 = "M1";
export const CMD_CALL_M2 = "M2";

// helper → empty program
const createProgram = (size) => Array(size).fill(null);

/**
 * @param {Array} levels - Array of level objects
 * @param {number|null} forcedLevelIndex - Force a specific level index
 * @param {Function} onLevelComplete - (Optional) Callback(stats) when level is beaten
 */
export default function useLightbotGame(levels, forcedLevelIndex = null, onLevelComplete = null) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [gridSize, setGridSize] = useState(6);

  // Sync forced index if provided
  useEffect(() => {
    if (forcedLevelIndex !== null && typeof forcedLevelIndex === "number") {
      setLevelIndex(forcedLevelIndex);
    }
  }, [forcedLevelIndex]);

  const [robot, setRobot] = useState({ x: 0, y: 0, dir: 0 });
  const [lit, setLit] = useState(new Set());

  const [programs, setPrograms] = useState({
    main: createProgram(PROGRAM_SIZES.main),
    m1: createProgram(PROGRAM_SIZES.m1),
    m2: createProgram(PROGRAM_SIZES.m2),
  });

  const [activeProgram, setActiveProgram] = useState("main");
  const [selectedTool, setSelectedTool] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [execPointer, setExecPointer] = useState(null);
  const [gameMessage, setGameMessage] = useState("");

  const [lastTeleportKey, setLastTeleportKey] = useState(null);
  const [teleportFX, setTeleportFX] = useState(null);

  const [speed, setSpeed] = useState(650);
  const runIdRef = useRef(0);

  const currentLevel = levels[levelIndex] || {};
  const totalLevels = levels.length;

  const heights = currentLevel.heights || [];
  const teleportLinks = currentLevel.teleportLinks || {};
  const elevatorMeta = currentLevel.elevatorMeta || {};

  const getHeight = (x, y) => {
    const raw = heights?.[y]?.[x];
    return typeof raw === "number" ? raw : Number(raw ?? 0);
  };

  const getElevatorVector = (x, y) => {
    const key = `${x},${y}`;
    const meta = elevatorMeta[key];
    if (!meta) return null;

    if (meta.dir) {
      if (meta.dir === "left") return { dx: -1, dy: 0 };
      if (meta.dir === "right") return { dx: 1, dy: 0 };
      if (meta.dir === "up") return { dx: 0, dy: -1 };
      if (meta.dir === "down") return { dx: 0, dy: 1 };
    }
    if (typeof meta.dx === "number" && typeof meta.dy === "number") {
      if (meta.dx === 0 && meta.dy === 0) return null;
      return { dx: meta.dx, dy: meta.dy };
    }
    if (meta.type === "row") return { dx: 1, dy: 0 };
    if (meta.type === "col") return { dx: 0, dy: 1 };
    return null;
  };

  // --- LIFECYCLE: Handle Level Change ---
  useEffect(() => {
    if (!currentLevel) return;
    
    // Calculate Grid Size
    const sizeFromLevel =
      currentLevel.gridSize ??
      (Array.isArray(currentLevel.heights)
        ? currentLevel.heights.length
        : 6);
    setGridSize(sizeFromLevel || 6);

    // Reset Robot & Game State (But NOT programs)
    if (currentLevel.start) {
      setRobot({ ...currentLevel.start });
      setLit(new Set());
      setExecPointer(null);
      setIsRunning(false);
      setGameMessage("");
      setLastTeleportKey(null);
      setTeleportFX(null);
    }
  }, [currentLevel]); // Only runs when the level object actually changes

  const updateGridSize = (newSize) => {
    setGridSize(newSize);
    resetGame();
  };

  const goToLevel = (idx) => {
    if (idx < 0 || idx >= totalLevels) return;
    if (forcedLevelIndex !== null) return;
    setLevelIndex(idx);
  };

  const resetGame = () => {
    runIdRef.current += 1;
    if (!currentLevel?.start) return;
    setRobot({ ...currentLevel.start });
    setLit(new Set());
    setExecPointer(null);
    setIsRunning(false);
    setGameMessage("");
    setLastTeleportKey(null);
    setTeleportFX(null);
  };

  const applyCommandToCell = (panel, index) => {
    setPrograms((prev) => {
      const updated = [...prev[panel]];
      if (selectedTool === "D") updated[index] = null;
      else updated[index] = selectedTool;
      return { ...prev, [panel]: updated };
    });
  };

  const handleCellClick = (panel, index) => {
    setActiveProgram(panel);
    if (selectedTool) applyCommandToCell(panel, index);
  };

  const clearActiveProgram = () => {
    setPrograms((prev) => ({
      ...prev,
      [activeProgram]: createProgram(PROGRAM_SIZES[activeProgram]),
    }));
  };

  const clearAllPrograms = () => {
    setPrograms({
      main: createProgram(PROGRAM_SIZES.main),
      m1: createProgram(PROGRAM_SIZES.m1),
      m2: createProgram(PROGRAM_SIZES.m2),
    });
  };

  const toggleLight = (robotPos, execLit) => {
    const { x, y } = robotPos;
    const isGoalTile = currentLevel.goals?.some(
      (g) => g.x === x && g.y === y
    );
    if (!isGoalTile) return execLit;

    const key = `${x},${y}`;
    const newSet = new Set(execLit);
    if (newSet.has(key)) newSet.delete(key);
    else newSet.add(key);

    return newSet;
  };

  // --- ENGINE: Run Program ---
  const runProgram = async () => {
    if (isRunning) return;

    if (!programs.main.some((c) => c !== null)) {
      setGameMessage("Add commands first!");
      return;
    }
    if (!currentLevel.goals || currentLevel.goals.length === 0) {
      setGameMessage("Add at least one goal tile ★ before running!");
      return;
    }
    if (!currentLevel?.start) {
      setGameMessage("No start position set!");
      return;
    }

    const thisRunId = ++runIdRef.current;
    setIsRunning(true);
    setExecPointer(null);
    setGameMessage("");
    setLastTeleportKey(null);
    setTeleportFX(null);

    let execRobot = { ...currentLevel.start };
    let execLit = new Set();

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    
    const dx = [0, 1, 0, -1];
    const dy = [-1, 0, 1, 0];

    const stack = [{ panel: "main", ip: 0 }];
    let steps = 0;
    const MAX_STEPS = 500;

    const iceSet = new Set();
    if (currentLevel.iceTiles && Array.isArray(currentLevel.iceTiles)) {
      currentLevel.iceTiles.forEach(t => iceSet.add(`${t.x},${t.y}`));
    }

    const allGoalsLit = () =>
      (currentLevel.goals || []).every((g) =>
        execLit.has(`${g.x},${g.y}`)
      );

    // PHYSICS: Landing Barrier (Handles Ice, Elevators, Teleporters)
    const landingBarrier = async (inDx, inDy) => {
      const visited = new Set();
      let safety = (gridSize || 6) * (gridSize || 6) * 4;
      let cutOffLoop = false;

      let momDx = inDx;
      let momDy = inDy;

      while (true) {
        if (runIdRef.current !== thisRunId) return { cutOffLoop: false };
        if (safety-- <= 0) {
          cutOffLoop = true;
          break;
        }

        const coordKey = `${execRobot.x},${execRobot.y}`;
        const stateKey = `${coordKey},${execRobot.dir},${momDx},${momDy}`;

        const isOnIce = iceSet.has(coordKey);
        const hasElevator = !!getElevatorVector(execRobot.x, execRobot.y);

        if ((isOnIce || hasElevator) && visited.has(stateKey)) {
          cutOffLoop = true;
          break;
        }
        visited.add(stateKey);

        let didMove = false;

        // 1. TELEPORT
        const destKey = teleportLinks[coordKey];
        if (destKey) {
          const [tx, ty] = destKey.split(",").map(Number);
          execRobot = { ...execRobot, x: tx, y: ty };
          setRobot({ ...execRobot });
          setLastTeleportKey(destKey);
          setTeleportFX({ from: coordKey, to: destKey });
          
          await sleep(Math.max(80, speed * 0.4));
          setTeleportFX(null);
          
          momDx = 0; 
          momDy = 0;
          didMove = true;
          visited.clear(); 
        }

        // 2. ELEVATOR
        if (!didMove) {
          const vec = getElevatorVector(execRobot.x, execRobot.y);
          if (vec) {
            const x = execRobot.x;
            const y = execRobot.y;
            const curH = getHeight(x, y);
            const nx = x + vec.dx;
            const ny = y + vec.dy;

            if (nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize) {
              const nextH = getHeight(nx, ny);
              if (nextH <= curH) {
                execRobot = { ...execRobot, x: nx, y: ny };
                setRobot({ ...execRobot });
                
                momDx = vec.dx;
                momDy = vec.dy;
                
                await sleep(Math.max(80, speed * 0.5));
                didMove = true;
              }
            }
          }
        }

        // 3. ICE SLIDE
        if (!didMove && iceSet.has(coordKey)) {
          if (momDx !== 0 || momDy !== 0) {
            const nx = execRobot.x + momDx;
            const ny = execRobot.y + momDy;

            if (nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize) {
              const curH = getHeight(execRobot.x, execRobot.y);
              const nextH = getHeight(nx, ny);

              if (nextH <= curH) {
                execRobot = { ...execRobot, x: nx, y: ny };
                setRobot({ ...execRobot });
                await sleep(Math.max(80, speed * 0.4));
                didMove = true;
              } else {
                momDx = 0;
                momDy = 0;
              }
            } else {
              momDx = 0;
              momDy = 0;
            }
          }
        }

        if (!didMove) break;
      }

      return { cutOffLoop };
    };

    const runPhysics = async (dx, dy) => {
      const { cutOffLoop } = await landingBarrier(dx, dy);
      setRobot({ ...execRobot });
      setLit(new Set(execLit));

      if (cutOffLoop && !allGoalsLit()) {
        setIsRunning(false);
        setExecPointer(null);
        setGameMessage("Infinite loop detected ❌");
        return false;
      }
      return true;
    };

    const move = async (jump = false) => {
      const dir = execRobot.dir;
      const moveDx = dx[dir];
      const moveDy = dy[dir];

      const nx = execRobot.x + moveDx;
      const ny = execRobot.y + moveDy;

      if (nx < 0 || ny < 0 || nx >= gridSize || ny >= gridSize) return true;

      const h0 = getHeight(execRobot.x, execRobot.y);
      const h1 = getHeight(nx, ny);
      const dh = h1 - h0;

      if (!jump) {
        if (dh !== 0) return true; // Blocked
      } else {
        if (dh === 0) return true; // Blocked
        if (dh > 1) return true;   // Blocked
      }

      // Execute Step
      execRobot = { ...execRobot, x: nx, y: ny };
      setRobot({ ...execRobot });
      await sleep(Math.max(80, speed * 0.4));

      return await runPhysics(moveDx, moveDy);
    };

    // EXECUTION LOOP
    if (!(await runPhysics(0, 0))) return;

    while (stack.length > 0 && steps < MAX_STEPS) {
      steps += 1;
      if (runIdRef.current !== thisRunId) {
        setIsRunning(false);
        setExecPointer(null);
        return;
      }

      const frame = stack[stack.length - 1];
      const prog = programs[frame.panel];
      if (!prog || frame.ip >= prog.length) {
        stack.pop();
        continue;
      }

      const index = frame.ip++;
      const cmd = prog[index];
      if (!cmd) continue;

      setExecPointer({ panel: frame.panel, index });

      switch (cmd) {
        case CMD_FORWARD:
          if (!(await move(false))) return; 
          break;

        case CMD_JUMP:
          if (!(await move(true))) return;
          break;

        case CMD_TURN_LEFT:
          execRobot = { ...execRobot, dir: (execRobot.dir + 3) % 4 };
          setRobot({ ...execRobot });
          await sleep(Math.max(80, speed * 0.5));
          break;

        case CMD_TURN_RIGHT:
          execRobot = { ...execRobot, dir: (execRobot.dir + 1) % 4 };
          setRobot({ ...execRobot });
          await sleep(Math.max(80, speed * 0.5));
          break;

        case CMD_LIGHT:
          execLit = toggleLight(execRobot, execLit);
          setLit(new Set(execLit));
          if (allGoalsLit()) {
            setGameMessage("Level Complete 🎉");
            setIsRunning(false);
            setExecPointer(null);
            
            if (onLevelComplete) {
                onLevelComplete({ steps, levelIndex });
            }
            return;
          }
          await sleep(Math.max(80, speed * 0.5));
          break;

        case CMD_CALL_M1:
          if (programs.m1.some((c) => c !== null)) {
            stack.push({ panel: "m1", ip: 0 });
          } else {
            await sleep(Math.max(50, speed * 0.3));
          }
          break;

        case CMD_CALL_M2:
          if (programs.m2.some((c) => c !== null)) {
            stack.push({ panel: "m2", ip: 0 });
          } else {
            await sleep(Math.max(50, speed * 0.3));
          }
          break;
      }

      if (allGoalsLit()) {
        setGameMessage("Level Complete 🎉");
        setIsRunning(false);
        setExecPointer(null);
        
        if (onLevelComplete) {
            onLevelComplete({ steps, levelIndex });
        }
        return;
      }
    }

    setExecPointer(null);
    setIsRunning(false);

    if (!allGoalsLit()) {
      if (steps >= MAX_STEPS) {
        setGameMessage("Infinite loop or too many steps ❌");
      } else {
        setGameMessage("Execution finished.");
      }
    } else {
      setGameMessage("Execution finished.");
    }
  };

  const submitProgram = () => runProgram();

  return {
    robot,
    lit,
    programs,
    
    // ✅ CRITICAL FIX: EXPOSE SETTER FOR BASE PAGE
    setPrograms, 

    // Legacy support for Replay Page
    functions: programs,
    setFunctions: setPrograms, 

    activeProgram,
    selectedTool,
    isRunning,
    execPointer,
    currentLevel,
    levelIndex,
    totalLevels,
    gameMessage,
    gridSize,
    updateGridSize,
    lastTeleportKey,
    teleportFX,
    speed,
    setSpeed,
    setActiveProgram,
    setSelectedTool,
    handleCellClick,
    clearActiveProgram,
    clearAllPrograms,
    resetGame,
    runProgram,
    submitProgram,
    goToLevel,
  };
}