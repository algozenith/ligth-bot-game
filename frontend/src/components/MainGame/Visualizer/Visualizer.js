import { useState, useRef, useMemo } from "react";
import "./Visualizer.css";
import TileMenu from "../TileMenu/TileMenu";

export default function Visualizer({
  robot,
  lit,
  level,
  onTileAction,
  isEditable = false,
  isRunning = false,
  showStartWhenIdle = true,
  lastTeleportKey = null,
  pendingTpStart = null,
  teleportFX = null,
  userLevel = 1 // ⬅ 1. ADD THIS PROP (Default to 1)
}) {
  const goals = level?.goals ?? [];
  const heights = level?.heights ?? [];
  
  // Strictly ensure iceTiles is an array
  const rawIce = level?.iceTiles;
  const iceTiles = Array.isArray(rawIce) ? rawIce : [];
  
  const gridSize = level?.gridSize || heights.length || 6;

  // Normalize teleport links logic
  const rawTeleportLinks = level?.teleportLinks || {};
  const teleportLinks = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(rawTeleportLinks).map(([from, val]) => {
          if (typeof val === "string") return [from, val];
          if (val && typeof val === "object" && typeof val.to === "string") {
            return [from, val.to];
          }
          return [from, ""];
        })
      ),
    [rawTeleportLinks]
  );

  const elevatorMeta = level?.elevatorMeta || {};

  const [menu, setMenu] = useState(null);
  const gridRef = useRef(null);

  const getHeight = (x, y) => heights?.[y]?.[x] ?? 0;
  const isGoalAt = (x, y) => goals.some((g) => g.x === x && g.y === y);
  
  const isIceAt = (x, y) => iceTiles.some((t) => t.x === x && t.y === y);

  const start = level?.start || { x: 0, y: 0, dir: 0 };

  const useStartPose =
    isEditable &&
    !isRunning &&
    showStartWhenIdle &&
    robot.x === start.x &&
    robot.y === start.y;

  const drawRobotX = useStartPose ? start.x : robot.x;
  const drawRobotY = useStartPose ? start.y : robot.y;
  const drawRobotDir = useStartPose ? start.dir : robot.dir;

  // -----------------------------------------------------------
  // Teleport Logic
  // -----------------------------------------------------------

  const { entryIndexByKey, exitIndicesByKey } = useMemo(() => {
    const fromKeys = Object.keys(teleportLinks).filter((k) => teleportLinks[k]);
    fromKeys.sort(); // stable numbering

    const entryIndexByKeyInner = {};
    fromKeys.forEach((key, idx) => {
      entryIndexByKeyInner[key] = idx + 1; // 1-based
    });

    const exitIndicesByKeyInner = {};
    fromKeys.forEach((fromKey) => {
      const toKey = teleportLinks[fromKey];
      if (!toKey) return;

      const idx = entryIndexByKeyInner[fromKey];
      if (!exitIndicesByKeyInner[toKey]) exitIndicesByKeyInner[toKey] = [];
      exitIndicesByKeyInner[toKey].push(idx);
    });

    return {
      entryIndexByKey: entryIndexByKeyInner,
      exitIndicesByKey: exitIndicesByKeyInner,
    };
  }, [teleportLinks]);

  const tpFromKey = teleportFX?.from;
  const tpToKey = teleportFX?.to;

  // -----------------------------------------------------------

  function handleTileClick(x, y, e) {
    if (!isEditable || !onTileAction) return;

    const key = `${x},${y}`;
    const meta = elevatorMeta[key];
    const hasElevator = !!meta;
    const hasTp = teleportLinks.hasOwnProperty(key);

    const rect = gridRef.current?.getBoundingClientRect();
    const cellRect = e.currentTarget.getBoundingClientRect();

    setMenu({
      x,
      y,
      left: (rect ? cellRect.right - rect.left : cellRect.right) + 10,
      top: (rect ? cellRect.top - rect.top : cellRect.top) - 10,
      showTpStart: !pendingTpStart && !hasTp,
      showTpEnd: pendingTpStart && pendingTpStart !== key,
      showTpDelete: hasTp,
      showSetElevRow: !hasElevator,
      showUnsetElevRow: hasElevator && meta?.type === "row",
      showSetElevCol: !hasElevator,
      showUnsetElevCol: hasElevator && meta?.type === "col",
      showToggleIce: true, 
      isIce: isIceAt(x, y),
    });
  }

  return (
    <div className="visualizer-panel">
      {pendingTpStart && (
        <div className="tp-banner">Teleport: click a tile to set destination</div>
      )}

      <div
        ref={gridRef}
        className="visualizer-grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
          const x = idx % gridSize;
          const y = Math.floor(idx / gridSize);
          const key = `${x},${y}`;

          const h = getHeight(x, y);
          const isGoal = isGoalAt(x, y);
          const isGoalLit = lit?.has?.(key);
          const isRobot = drawRobotX === x && drawRobotY === y;
          const isIce = isIceAt(x, y);

          const isTeleportAnim =
            !useStartPose && isRobot && lastTeleportKey === key;

          const isStartTp = entryIndexByKey[key] !== undefined;
          const isEndTp = exitIndicesByKey[key]?.length > 0;

          const meta = elevatorMeta[key];
          const isElevator = !!meta;
          const axisDir =
            meta?.dir ||
            (meta?.type === "row"
              ? "right"
              : meta?.type === "col"
              ? "down"
              : null);

          // build classes:
          let cls = "vis-cell";
          if (h > 0) cls += ` vis-h${Math.min(h, 3)}`;
          else if (h < 0) cls += " vis-h-neg";
          if (isGoal) cls += " vis-goal";
          if (isGoalLit) cls += " vis-goal-lit";
          if (isEditable) cls += " vis-editable";
          if (isStartTp || isEndTp) cls += " vis-teleport";
          if (isIce) cls += " vis-ice";

          if (isElevator) cls += " vis-elevator";
          if (axisDir) cls += ` elevator-${axisDir}`;

          return (
            <div key={idx} className={cls} onClick={(e) => handleTileClick(x, y, e)}>
              {/* Teleport FX */}
              {tpFromKey === key && <div className="teleport-start" />}
              {tpToKey === key && <div className="teleport-end" />}

              {/* Elevator */}
              {isElevator && <div className="elevator-overlay" />}
              {isElevator && axisDir && (
                <div
                  className="elevator-dir-arrow"
                  style={{
                    transform: `rotate(${
                      axisDir === "right"
                        ? 0
                        : axisDir === "down"
                        ? 90
                        : axisDir === "left"
                        ? 180
                        : -90
                    }deg)`,
                  }}
                >
                  ➜
                </div>
              )}

              {/* Ice Overlay */}
              {isIce && !isRobot && (
                <div className="ice-overlay">❄️</div>
              )}

              {h !== 0 && <div className="vis-height-badge">{h}</div>}

              {/* Robot */}
              {isRobot && (
                <div
                  className={"vis-robot" + (isTeleportAnim ? " vis-robot-teleport" : "")}
                  style={{ transform: `rotate(${drawRobotDir * 90}deg)` }}
                >
                  🤖
                </div>
              )}

              {/* Goal markers */}
              {!isRobot && isGoal && !isGoalLit && (
                <span className="vis-goal-icon">★</span>
              )}
              {!isRobot && isGoalLit && (
                <span className="vis-goal-icon lit">💡</span>
              )}

              {/* Teleport ENTRY badge */}
              {isStartTp && (
                <span className="tp-start-icon">
                  🌀{entryIndexByKey[key]}
                </span>
              )}

              {/* Teleport EXIT badges */}
              {isEndTp && (
                <span className="tp-end-icon">
                  🎯{exitIndicesByKey[key].join(",")}
                </span>
              )}
            </div>
          );
        })}

        {menu && (
          <TileMenu
            {...menu}
            onSelect={(action) => onTileAction(menu.x, menu.y, action)}
            onClose={() => setMenu(null)}
            userLevel={userLevel} // ⬅ 2. PASS IT DOWN TO TILE MENU
          />
        )}
      </div>
    </div>
  );
}