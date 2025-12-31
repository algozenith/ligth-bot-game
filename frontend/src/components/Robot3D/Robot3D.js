import { useRef, useMemo, useLayoutEffect, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Robot3D({
  tileHeight = 0,
  dir = 0,                 // Robot direction (0–3)
  isTeleportAnim = false,
  scale = 0.7
}) {
  const root = useRef();
  const rotator = useRef();

  const prevDir = useRef(dir);
  const rotating = useRef(false);

  // Load GLB robot model
  const { scene: originalScene } = useGLTF("/robot_riding_on_wheel_scifi.glb");

  const model = useMemo(() => originalScene.clone(true), [originalScene]);

  // Normalize robot size
  const normalScale = useRef(1);

useLayoutEffect(() => {
  if (!model) return;

  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();

  box.getSize(size);
  box.getCenter(center);

  model.position.x = -center.x;
  model.position.z = -center.z;
  model.position.y = -box.min.y;

  // Normalize height
  const desired = 1.0;
  const s = desired / size.y;
  normalScale.current = s;
  model.scale.set(s, s, s);

  // ✔ FIX 1: Correct facing direction
  model.rotation.y = Math.PI;

  // ✔ FIX 2: Lower robot to touch the ground
  model.position.y -= 0.4;
}, [model]);


  // Apply external scale once
  useEffect(() => {
    if (!root.current) return;
    root.current.scale.set(scale, scale, scale);
  }, [scale]);

  // Animation loop
  useFrame((state) => {
    if (!root.current || !rotator.current) return;

    const t = state.clock.getElapsedTime();

    // Smooth idle bobbing
    root.current.position.y =
      tileHeight + Math.sin(t * 2) * 0.02;

    // Detect direction change
    if (prevDir.current !== dir) {
      rotating.current = true;
      prevDir.current = dir;
    }

    const targetRot = -dir * (Math.PI / 2);
    const r = rotator.current.rotation.y;

    if (rotating.current) {
      // smooth turning
      const newR = r + (targetRot - r) * 0.25;
      rotator.current.rotation.y = newR;

      if (Math.abs(newR - targetRot) < 0.01) {
        rotator.current.rotation.y = targetRot;
        rotating.current = false;
      }
    } else {
      // walking straight → no wobble
      rotator.current.rotation.y = targetRot;
    }
  });

  return (
    <group ref={root}>
      <group ref={rotator}>
        <primitive object={model} />
      </group>
    </group>
  );
}
