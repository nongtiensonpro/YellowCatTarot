'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ShockwaveRingProps {
  drawnCardsCount: number;
}

export function ShockwaveRing({ drawnCardsCount }: ShockwaveRingProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const [active, setActive] = useState(false);
  const [scale, setScale] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const prevCount = useRef(drawnCardsCount);

  useEffect(() => {
    if (drawnCardsCount > prevCount.current) {
      setActive(true);
      setScale(0.01);
      setOpacity(1.0);
    }
    prevCount.current = drawnCardsCount;
  }, [drawnCardsCount]);

  useFrame((state, delta) => {
    if (!active) return;
    
    // Tăng kích thước vòng và làm mờ dần theo thời gian
    setScale((prev) => {
      const next = prev + delta * 3.5;
      if (next > 3.0) {
        setActive(false);
        return 0;
      }
      return next;
    });
    
    setOpacity((prev) => Math.max(0, prev - delta * 1.3));
  });

  if (!active || scale === 0) return null;

  return (
    <mesh
      ref={ringRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.48, 0]}
      scale={[scale, scale, 1]}
    >
      <ringGeometry args={[0.2, 0.25, 32]} />
      <meshBasicMaterial
        color="#9b5de5"
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
