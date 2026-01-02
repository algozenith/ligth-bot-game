import { useState, useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, OrbitControls, Billboard, Text } from "@react-three/drei";
import * as THREE from "three";
import "./Visualizer3d.css";
import TileMenu from "../TileMenu/TileMenu";
import Robot3D from "../../Robot3D/Robot3D";

// --- Constants ---
const COLOR_TILE_TOP = "#eceff4";      // Light grey (Keep top bright)
const COLOR_TILE_SIDE = "#94a3b8";     // Medium Slate Grey (Softens contrast)
const COLOR_GOAL = "#ffe88a";          // Yellow goal
const COLOR_GOAL_LIT = "#8df07a";      // Green goal
const COLOR_ICE = "#a0e6ff";           // Icy blue

const BASE_TILE_HEIGHT = 0.4;
const HEIGHT_STEP = 0.35;
const TOP_THICKNESS = 0.06;
const GOAL_INLAY_OFFSET = 0.02;
const TP_MARKER_OFFSET = 0.04;
const THINK_RING_OFFSET = 0.03;
const TP_BADGE_OFFSET = 0.12;
const ICE_OVERLAY_OFFSET = 0.025; 

// --- Ice Component ---
function Ice3D({ y, tileSize }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    
    // Slight opacity pulse
    if (ref.current.material) {
        const shimmer = 0.6 + 0.15 * Math.sin(t * 2);
        ref.current.material.opacity = shimmer;
    }
    
    // Very subtle vertical bob
    ref.current.position.y = y + 0.005 * Math.sin(t * 1.5);
  });

  return (
    <mesh 
      ref={ref} 
      position={[0, y, 0]} 
      rotation={[-Math.PI / 2, 0, 0]} 
      onPointerDown={(e) => e.stopPropagation()}
    >
      <planeGeometry args={[tileSize * 0.85, tileSize * 0.85]} />
      <meshStandardMaterial
        color={COLOR_ICE}
        emissive="#b0f0ff"
        emissiveIntensity={0.3}
        transparent
        opacity={0.6}
        roughness={0.1}
        metalness={0.1}
        depthWrite={false}
      />
    </mesh>
  );
}

// --- Camera ---
function AutoFitIsoCamera({ gridSize, tileSize }) {
  const { camera, size } = useThree();

  useEffect(() => {
    const boardSize = gridSize * tileSize;
    const margin = 1.25;
    const zoomX = size.width / (boardSize * margin);
    const zoomY = size.height / (boardSize * margin);
    const zoom = Math.min(zoomX, zoomY);

    const mid = (gridSize - 1) * tileSize * 0.5;
    const dist = Math.max(4, boardSize * 0.95);

    camera.zoom = zoom;
    camera.position.set(dist, dist * 0.55, dist);
    camera.lookAt(mid, 0, mid);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height, gridSize, tileSize]);

  return null;
}

// --- Teleport FX ---
function TeleportMarker({ y, variant = "idle" }) {
  const ringRef = useRef();
  const coreRef = useRef();
  const beamRef = useRef();

  const colorMap = {
    idle: { color: "#46bdf0", emissive: "#40bdf0" },
    pendingSource: { color: "#22c55e", emissive: "#16a34a" },
    pendingTarget: { color: "#facc15", emissive: "#eab308" },
    from: { color: "#38bdf8", emissive: "#0ea5e9" },
    to: { color: "#f97316", emissive: "#ea580c" },
  };

  const { color, emissive } = colorMap[variant] || colorMap.idle;
  const hasBeam = variant === "from" || variant === "to";

  useFrame((state) => {
    if (ringRef.current && !ringRef.current.visible) return;
    const t = state.clock.getElapsedTime();

    if (ringRef.current) {
      const pulse = 1 + 0.12 * Math.sin(t * 4);
      ringRef.current.scale.set(pulse, pulse, pulse);
      const wobble = Math.sin(t * 1.4) * 0.05;
      ringRef.current.position.y = y + wobble;
      ringRef.current.rotation.y += 0.04;
    }

    if (coreRef.current) {
      const s = 0.65 + 0.15 * Math.sin(t * 3);
      coreRef.current.scale.set(s, s, s);
    }

    if (beamRef.current && hasBeam) {
      const rise = 0.05 * Math.sin(t * 5);
      beamRef.current.position.y = y + 0.55 + rise;
    }
  });

  return (
    <group>
      <mesh ref={ringRef} position={[0, y, 0]} onPointerDown={(e) => e.stopPropagation()}>
        <torusGeometry args={[0.28, 0.035, 14, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.45}
          roughness={0.25}
          metalness={0.2}
        />
      </mesh>

      <mesh
        ref={coreRef}
        position={[0, y + 0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <circleGeometry args={[0.18, 24]} />
        <meshStandardMaterial
          color="#e0f2fe"
          emissive={emissive}
          emissiveIntensity={0.4}
          transparent
          opacity={0.8}
        />
      </mesh>

      {hasBeam && (
        <mesh ref={beamRef} position={[0, y + 0.55, 0]} onPointerDown={(e) => e.stopPropagation()}>
          <cylinderGeometry args={[0.07, 0.07, 0.9, 16]} />
          <meshStandardMaterial
            color={variant === "from" ? "#38bdf8" : "#fb923c"}
            emissive={variant === "from" ? "#0ea5e9" : "#f97316"}
            emissiveIntensity={0.8}
            transparent
            opacity={0.65}
          />
        </mesh>
      )}
    </group>
  );
}

// --- Teleport Badges ---
function TeleportBadge({ y, kind, label, offsetX = 0, offsetZ = 0 }) {
  const groupRef = useRef();

  const colorMap = {
    entry: { color: "#38bdf8", emissive: "#0ea5e9" },
    exit: { color: "#22c55e", emissive: "#16a34a" },
  };

  const { color, emissive } = colorMap[kind] || colorMap.entry;

  useFrame((state) => {
    if (!groupRef.current || !groupRef.current.visible) return;
    const t = state.clock.getElapsedTime();
    const bob = Math.sin(t * 3 + Number(label) * 0.6) * 0.02 + 0.02;
    const scalePulse = 1 + 0.05 * Math.sin(t * 4.3 + Number(label));
    groupRef.current.position.y = y + bob;
    groupRef.current.scale.set(scalePulse, scalePulse, scalePulse);
  });

  return (
    <group ref={groupRef} position={[offsetX, y, offsetZ]} onPointerDown={(e) => e.stopPropagation()}>
      <Billboard follow={true}>
        <mesh onPointerDown={(e) => e.stopPropagation()}>
          <circleGeometry args={[0.16, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={0.9}
            roughness={0.3}
          />
        </mesh>
        <Text
          fontSize={0.13}
          color="#0f172a"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#f9fafb"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {String(label)}
        </Text>
      </Billboard>
    </group>
  );
}

function TeleportExitBadges({ y, indices, tileSize }) {
  if (!indices || indices.length === 0) return null;
  const r = tileSize * 0.28;
  const n = indices.length;

  return (
    <>
      {indices.map((idx, i) => {
        const angle = (i / n) * Math.PI * 2;
        const offsetX = r * Math.cos(angle);
        const offsetZ = r * Math.sin(angle);
        return (
          <TeleportBadge
            key={idx}
            y={y}
            kind="exit"
            label={idx}
            offsetX={offsetX}
            offsetZ={offsetZ}
          />
        );
      })}
    </>
  );
}

// --- Elevator Animations ---
const ARROWS_PER_LANE = 2;

function getArrowRotation(axisDir) {
  switch (axisDir) {
    case "right": return [0, 0, -Math.PI / 2];
    case "left": return [0, 0, Math.PI / 2];
    case "down": return [Math.PI / 2, 0, 0];
    case "up": return [-Math.PI / 2, 0, 0];
    default: return [0, 0, 0];
  }
}

function SlideArrow({ axisDir, laneIndex, arrowIndex, tileSize }) {
  const ref = useRef();
  const rotation = useMemo(() => getArrowRotation(axisDir), [axisDir]);

  const horizontal = axisDir === "right" || axisDir === "left";
  const dir = axisDir === "right" || axisDir === "down" ? 1 : -1;

  const laneSpacing = tileSize * 0.22;
  const laneOffset = laneIndex * laneSpacing;
  const halfSpan = tileSize * 0.36;
  const arrowHeight = tileSize * 0.24;
  const arrowRadius = tileSize * 0.1;

  useFrame((state) => {
    if (!ref.current || !ref.current.visible) return;
    const t = state.clock.getElapsedTime() * 0.35;
    const phase = arrowIndex / ARROWS_PER_LANE;
    const cycle = (t + phase) % 1;
    const travel = (cycle * 2 - 1) * halfSpan * dir;

    if (horizontal) {
      ref.current.position.set(travel, 0.045, laneOffset);
    } else {
      ref.current.position.set(laneOffset, 0.045, travel);
    }

    const fade = 0.6 + 0.4 * Math.sin(cycle * Math.PI * 2);
    if (ref.current.material) {
      ref.current.material.opacity = fade;
      ref.current.material.emissiveIntensity = fade * 1.2;
    }
  });

  return (
    <mesh ref={ref} rotation={rotation} onPointerDown={(e) => e.stopPropagation()}>
      <coneGeometry args={[arrowRadius, arrowHeight, 3]} />
      <meshStandardMaterial
        color="#60a5fa"
        emissive="#3b82f6"
        emissiveIntensity={0.6}
        transparent
        opacity={0.65}
        depthWrite={false}
      />
    </mesh>
  );
}

function ElevatorWind({ y, axisDir, tileSize }) {
  if (!axisDir) return null;
  const lanes = [-1, 0, 1];

  return (
    <group position={[0, y + 0.04, 0]}>
      {lanes.map((lane) =>
        Array.from({ length: ARROWS_PER_LANE }).map((_, i) => (
          <SlideArrow
            key={`${lane}-${i}`}
            axisDir={axisDir}
            laneIndex={lane}
            arrowIndex={i}
            tileSize={tileSize}
          />
        ))
      )}
    </group>
  );
}

// --- NEW: Distinct Arrow Shape ---
const arrowShape = new THREE.Shape();
// Define a clear arrowhead shape pointing "up" (which becomes forward)
arrowShape.moveTo(0, 0.25);   // Tip
arrowShape.lineTo(0.2, -0.15); // Right Wingback
arrowShape.lineTo(0.06, -0.08); // Right Notch
arrowShape.lineTo(0.06, -0.25); // Right Tail
arrowShape.lineTo(-0.06, -0.25);// Left Tail
arrowShape.lineTo(-0.06, -0.08);// Left Notch
arrowShape.lineTo(-0.2, -0.15); // Left Wingback
arrowShape.closePath();

function RobotDirectionArrow({ dir, y }) {
  // Convert logical direction to visual rotation. 
  // Shape points towards +Y in 2D, which is -Z in 3D after rotation.
  // dir 0 (N) -> rot 0 (points -Z)
  // dir 1 (E) -> rot -PI/2 (points +X)
  const rotationY = -dir * (Math.PI / 2);
  const matRef = useRef();

  useFrame(({ clock }) => {
     if (matRef.current) {
       // Subtle glow pulse for visibility
       const t = clock.getElapsedTime();
       matRef.current.emissiveIntensity = 0.6 + 0.2 * Math.sin(t * 3);
     }
  });

  return (
    // Lift slightly (y+0.015) to avoid z-fighting with the tile top
    <group position={[0, y + 0.015, 0]} rotation={[-Math.PI / 2, 0, rotationY]}>
       <mesh>
         <shapeGeometry args={[arrowShape]} />
         <meshStandardMaterial
           ref={matRef}
           color="#00e5ff"    // Bright Cyan/Electric Blue
           emissive="#00e5ff" // Glowing with same color
           emissiveIntensity={0.8}
           roughness={0.2}
           metalness={0.3}
           transparent={true}
           opacity={0.9}
           depthTest={false} // Ensure it renders on top of tile geometry
           side={THREE.DoubleSide}
         />
       </mesh>
    </group>
  );
}

// --- Tile3D ---
function Tile3D({
  x,
  y,
  h,
  tileSize,
  isGoal,
  isGoalLit,
  isRobot,
  isTeleportAnim,
  isElevator,
  axisDir,
  isTeleportEntry,
  teleportEntryIndex,
  teleportExitIndices,
  isTpFrom,
  isTpTo,
  isPendingTpSource,
  isPendingTpTarget,
  isThinkMode,
  drawRobotDir,
  onTileClick,
  isIce,
}) {
  if (h < 0) return null;

  const worldX = x * tileSize;
  const worldZ = y * tileSize;

  // Calculate total height to position top items
  const heightAbs = BASE_TILE_HEIGHT + HEIGHT_STEP * Math.max(0, h);
  
  // The top is where the robot/items sit
  const topY = heightAbs;
  const overlayY = topY + TOP_THICKNESS + ICE_OVERLAY_OFFSET;

  const topColor = isGoal ? (isGoalLit ? COLOR_GOAL_LIT : COLOR_GOAL) : COLOR_TILE_TOP;
  const sideColor = isGoal ? (isGoalLit ? "#7ed957" : "#e5c76b") : COLOR_TILE_SIDE;
  
  // CHANGE: Made edge color significantly darker for standard tiles (#1a202c is near black)
  const edgeColor = isGoal ? "#333333" : "#1a202c";

  const hasEntryBadge = isTeleportEntry && teleportEntryIndex !== undefined;
  const exitIndices = teleportExitIndices || [];
  const hasExitBadges = exitIndices.length > 0;

  const showTeleportFX = isTpFrom || isTpTo || isPendingTpSource || isPendingTpTarget;
  let tpVariant = "idle";
  if (isTpFrom) tpVariant = "from";
  else if (isTpTo) tpVariant = "to";
  else if (isPendingTpSource) tpVariant = "pendingSource";
  else if (isPendingTpTarget) tpVariant = "pendingTarget";

  const entryY = topY + TOP_THICKNESS + TP_BADGE_OFFSET + (hasExitBadges ? 0.06 : 0);

  const handleClick = (e) => {
    e.stopPropagation();
    if (onTileClick) onTileClick(x, y, e.nativeEvent);
  };

  return (
    <group
      position={[worldX, 0, worldZ]}
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* 1. BASE BLOCK (Height 0) */}
      <mesh position={[0, BASE_TILE_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[tileSize, BASE_TILE_HEIGHT, tileSize]} />
        <meshStandardMaterial color={sideColor} roughness={0.7} />
        {/* Outline for the base */}
        <Edges color={edgeColor} threshold={15} />
      </mesh>

      {/* 2. STACK BLOCKS (Height > 0) */}
      {/* This loop creates 1 block per height unit, creating the "lines" */}
      {Array.from({ length: Math.max(0, h) }).map((_, i) => (
        <mesh 
          key={i} 
          position={[0, BASE_TILE_HEIGHT + (i * HEIGHT_STEP) + (HEIGHT_STEP / 2), 0]}
          castShadow 
          receiveShadow
        >
          <boxGeometry args={[tileSize, HEIGHT_STEP, tileSize]} />
          <meshStandardMaterial color={sideColor} roughness={0.7} />
          {/* Outline for each stack level */}
          <Edges color={edgeColor} threshold={15} />
        </mesh>
      ))}

      {/* 3. Top Plate (The Cap) */}
      <mesh position={[0, topY + TOP_THICKNESS / 2, 0]} receiveShadow>
        <boxGeometry args={[tileSize * 0.98, TOP_THICKNESS, tileSize * 0.98]} />
        <meshStandardMaterial color={topColor} roughness={0.9} />
        <Edges color={edgeColor} threshold={15} />
      </mesh>

      {/* Goal Inlay */}
      {isGoal && (
        <mesh
          position={[0, topY + TOP_THICKNESS + GOAL_INLAY_OFFSET, 0]}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <boxGeometry args={[tileSize * 0.7, 0.015, tileSize * 0.7]} />
          <meshStandardMaterial
            color={isGoalLit ? "#8df07a" : "#ffe88a"}
            emissive={isGoalLit ? "#64d96a" : "#d6b64d"}
            emissiveIntensity={isGoalLit ? 0.7 : 0.25}
          />
        </mesh>
      )}

      {/* ICE OVERLAY */}
      {isIce && (
        <Ice3D y={overlayY} tileSize={tileSize} />
      )}

      {/* Elevator Arrows */}
      {isElevator && (
        <ElevatorWind
          y={topY + TOP_THICKNESS}
          axisDir={axisDir}
          tileSize={tileSize}
        />
      )}

      {/* Teleport FX */}
      {showTeleportFX && (
        <TeleportMarker
          y={topY + TOP_THICKNESS + TP_MARKER_OFFSET}
          variant={tpVariant}
        />
      )}

      {/* Badges */}
      {hasEntryBadge && (
        <TeleportBadge
          y={entryY}
          kind="entry"
          label={teleportEntryIndex}
        />
      )}

      {/* Think Mode Highlight */}
      {isThinkMode && isRobot && (
        <mesh
          position={[0, topY + TOP_THICKNESS + THINK_RING_OFFSET, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <ringGeometry args={[tileSize * 0.45, tileSize * 0.6, 32]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#16a34a"
            emissiveIntensity={0.5}
            transparent
            opacity={0.65}
          />
        </mesh>
      )}
      
      {/* UPDATED ROBOT DIRECTION ARROW */}
      {isRobot && (
         <RobotDirectionArrow 
           dir={drawRobotDir} 
           y={topY + TOP_THICKNESS} 
         />
      )}

      {/* Robot */}
      {isRobot && (
        <Robot3D
          tileHeight={topY + TOP_THICKNESS}
          dir={drawRobotDir}
          isTeleportAnim={isTeleportAnim}
        />
      )}
      
      {hasExitBadges && (
        <TeleportExitBadges
          y={topY + TOP_THICKNESS + TP_BADGE_OFFSET}
          indices={exitIndices}
          tileSize={tileSize}
        />
      )}
    </group>
  );
}

// --- Main Visualizer ---
export default function Visualizer3D({
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
  userLevel = 1,
}) {
  const goals = level?.goals ?? [];
  const heights = level?.heights ?? [];
  
  // Safely extract Ice Tiles
  const rawIce = level?.iceTiles;
  const iceTiles = Array.isArray(rawIce) ? rawIce : [];

  const gridSize = level?.gridSize || heights.length || 6;

  // Normalize links
  const rawTeleportLinks = level?.teleportLinks || {};
  const teleportLinks = useMemo(() => 
    Object.fromEntries(
      Object.entries(rawTeleportLinks).map(([from, val]) => {
        if (typeof val === "string") return [from, val];
        if (val && typeof val === "object" && typeof val.to === "string") {
          return [from, val.to];
        }
        return [from, ""];
      })
    ), 
  [rawTeleportLinks]);

  const elevatorMeta = level?.elevatorMeta || {};

  // Indices mapping
  const { entryIndexByKey, exitIndicesByKey } = useMemo(() => {
    const fromKeys = Object.keys(teleportLinks).filter((k) => teleportLinks[k]);
    fromKeys.sort();
    const entryInner = {};
    fromKeys.forEach((key, idx) => { entryInner[key] = idx + 1; });

    const exitInner = {};
    fromKeys.forEach((fromKey) => {
      const toKey = teleportLinks[fromKey];
      if (!toKey) return;
      const idx = entryInner[fromKey];
      if (!exitInner[toKey]) exitInner[toKey] = [];
      exitInner[toKey].push(idx);
    });
    return { entryIndexByKey: entryInner, exitIndicesByKey: exitInner };
  }, [teleportLinks]);

  const [menu, setMenu] = useState(null);
  const panelRef = useRef(null);

  const isGoalAt = (x, y) => goals.some((g) => g.x === x && g.y === y);
  const getHeight = (x, y) => heights?.[y]?.[x] ?? 0;
  const isIceAt = (x, y) => iceTiles.some((t) => t.x === x && t.y === y);

  const start = level?.start || { x: 0, y: 0, dir: 0 };
  const useStartPose = isEditable && !isRunning && showStartWhenIdle && robot.x === start.x && robot.y === start.y;

  const drawRobotX = useStartPose ? start.x : robot.x;
  const drawRobotY = useStartPose ? start.y : robot.y;
  const drawRobotDir = useStartPose ? start.dir : robot.dir;

  const tpFromKey = teleportFX?.from;
  const tpToKey = teleportFX?.to;

  function openTileMenu(x, y, nativeEvent) {
    if (!isEditable || !onTileAction) return;
    const key = `${x},${y}`;
    const meta = elevatorMeta[key];
    const hasElevator = !!meta;
    const hasTp = teleportLinks.hasOwnProperty(key);
    const isIce = isIceAt(x, y);

    const rect = panelRef.current?.getBoundingClientRect();
    const left = (nativeEvent?.clientX ?? 0) - (rect?.left ?? 0) + 10;
    const top = (nativeEvent?.clientY ?? 0) - (rect?.top ?? 0) - 10;

    setMenu({
      x,
      y,
      left,
      top,
      showTpStart: !pendingTpStart,
      showTpEnd: pendingTpStart && pendingTpStart !== key,
      showTpDelete: hasTp,
      showSetElevRow: !hasElevator,
      showUnsetElevRow: hasElevator && meta?.type === "row",
      showSetElevCol: !hasElevator,
      showUnsetElevCol: hasElevator && meta?.type === "col",
      showToggleIce: true,
      isIce: isIce,
    });
  }

  const tileSize = 1;
  const midX = (gridSize - 1) * tileSize * 0.5;
  const midZ = (gridSize - 1) * tileSize * 0.5;
  const isThinkMode = isEditable && !isRunning;
  
  // Calculate a shadow camera size based on grid to prevent clipping
  const shadowCamSize = gridSize * tileSize * 1.2; 

  return (
    <div className="visualizer-3d-panel" ref={panelRef}>
      {pendingTpStart && <div className="tp-banner">Teleport: click a tile to set destination</div>}

      <div className="visualizer-3d-canvas-wrapper">
        <Canvas orthographic shadows>
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[6, 10, 4]} 
            intensity={0.55} 
            castShadow
            shadow-mapSize={[2048, 2048]} 
            shadow-bias={-0.0005}
          >
             <orthographicCamera 
              attach="shadow-camera" 
              args={[-shadowCamSize, shadowCamSize, shadowCamSize, -shadowCamSize]} 
            />
          </directionalLight>
          
          <AutoFitIsoCamera gridSize={gridSize} tileSize={tileSize} />
          
          <OrbitControls
            enableRotate={true}
            enablePan={false}
            enableZoom={false}
            rotateSpeed={0.7}
            enableDamping={true}
            dampingFactor={0.12}
            target={[midX, 0, midZ]}
            minPolarAngle={0.6}
            maxPolarAngle={1.2}
          />

          {/* Board Base */}
          <mesh position={[midX, -0.35, midZ]} receiveShadow>
            <boxGeometry args={[gridSize * tileSize + 3, 0.5, gridSize * tileSize + 3]} />
            <meshStandardMaterial color="#d8dee9" roughness={0.95} />
          </mesh>
          <gridHelper args={[gridSize + 4, gridSize + 4, "#cbd5f5", "#e0e7ff"]} position={[midX, -0.34, midZ]} />

          {/* Tiles Loop */}
          {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
            const x = idx % gridSize;
            const y = Math.floor(idx / gridSize);
            const key = `${x},${y}`;

            const h = getHeight(x, y);
            const isGoal = isGoalAt(x, y);
            const isGoalLit = lit?.has?.(key);
            const isRobot = drawRobotX === x && drawRobotY === y;
            const isIce = isIceAt(x, y);
            const isTeleportAnim = !useStartPose && isRobot && lastTeleportKey === key;

            const meta = elevatorMeta[key];
            const isElevator = !!meta;
            const axisDir = meta?.dir || (meta?.type === "row" ? "right" : meta?.type === "col" ? "down" : null);

            const isTpFrom = tpFromKey === key;
            const isTpTo = tpToKey === key;
            const isPendingTpSource = pendingTpStart === key;
            const isPendingTpTarget = !!pendingTpStart && pendingTpStart !== key && !teleportLinks.hasOwnProperty(key);

            const teleportEntryIndex = entryIndexByKey[key];
            const isTeleportEntry = teleportEntryIndex !== undefined;
            const teleportExitIndices = exitIndicesByKey[key] || [];

            return (
              <Tile3D
                key={idx}
                x={x}
                y={y}
                h={h}
                tileSize={tileSize}
                isGoal={isGoal}
                isGoalLit={isGoalLit}
                isRobot={isRobot}
                isTeleportAnim={isTeleportAnim}
                isElevator={isElevator}
                axisDir={axisDir}
                isTeleportEntry={isTeleportEntry}
                teleportEntryIndex={teleportEntryIndex}
                teleportExitIndices={teleportExitIndices}
                isTpFrom={isTpFrom}
                isTpTo={isTpTo}
                isPendingTpSource={isPendingTpSource}
                isPendingTpTarget={isPendingTpTarget}
                isThinkMode={isThinkMode}
                drawRobotDir={drawRobotDir}
                onTileClick={openTileMenu}
                isIce={isIce}
              />
            );
          })}
        </Canvas>
      </div>

      {menu && (
        <TileMenu
          {...menu}
          onSelect={(action) => {
            onTileAction(menu.x, menu.y, action);
          }}
          onClose={() => setMenu(null)}
          userLevel={userLevel} 
        />
      )}
    </div>
  );
}