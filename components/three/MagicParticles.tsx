'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface MagicParticlesProps {
  state: 'idle' | 'reading' | 'sleeping' | 'surprised' | 'happy' | 'shuffle';
}

export function MagicParticles({ state }: MagicParticlesProps) {
  const zzzGroupRef = useRef<THREE.Group>(null);
  const heartsGroupRef = useRef<THREE.Group>(null);

  // Cập nhật hiệu ứng động bằng useFrame để tiết kiệm hiệu năng
  useFrame((threeState) => {
    const time = threeState.clock.getElapsedTime();

    // 1. Hiệu ứng bong bóng ZZZ bay lên khi ngủ
    if (state === 'sleeping' && zzzGroupRef.current) {
      zzzGroupRef.current.children.forEach((child, index) => {
        const mesh = child as THREE.Mesh;
        // Mỗi chữ Z có tốc độ và độ lệch pha khác nhau
        const speed = 0.5 + (index * 0.15) % 0.4;
        const phase = index * 2;
        
        // Bay lên cao dần và lượn sóng ngang
        mesh.position.y = ((time * speed + phase) % 3.0) - 0.5;
        mesh.position.x = Math.sin(time * 2 + phase) * 0.25;
        
        // Tỷ lệ scale nhỏ dần khi bay cao
        const life = (mesh.position.y + 0.5) / 3.0; // 0 to 1
        const scale = (1.0 - life) * 0.4;
        mesh.scale.set(scale, scale, scale);

        // Mờ dần khi lên cao
        if (mesh.material && 'opacity' in mesh.material) {
          (mesh.material as THREE.Material).opacity = (1.0 - life) * 0.8;
        }
      });
    }

    // 2. Hiệu ứng lơ lửng hình trái tim/ngôi sao nhỏ khi vui vẻ (happy)
    if (state === 'happy' && heartsGroupRef.current) {
      heartsGroupRef.current.children.forEach((child, index) => {
        const mesh = child as THREE.Mesh;
        const speed = 0.7 + (index * 0.2) % 0.5;
        const phase = index * 1.5;
        
        mesh.position.y = ((time * speed + phase) % 2.5) - 0.3;
        mesh.position.x = Math.sin(time * 3 + phase) * 0.35 + (index % 2 === 0 ? 0.3 : -0.3);
        mesh.position.z = Math.cos(time * 2 + phase) * 0.2;
        
        // Lắc lư
        mesh.rotation.y = time * 2 + phase;
        mesh.rotation.z = Math.sin(time * 2) * 0.3;

        const life = (mesh.position.y + 0.3) / 2.5;
        const scale = (1.0 - life) * 0.25;
        mesh.scale.set(scale, scale, scale);

        if (mesh.material && 'opacity' in mesh.material) {
          (mesh.material as THREE.Material).opacity = (1.0 - life) * 0.9;
        }
      });
    }
  });

  return (
    <group>
      {/* 1. Hào quang bụi vàng huyền ảo mặc định (Idle / Shuffle) */}
      {(state === 'idle' || state === 'shuffle') && (
        <Sparkles
          count={35}
          scale={3}
          size={2.5}
          speed={0.4}
          color="#ffd166"
          opacity={0.6}
        />
      )}

      {/* 2. Quả cầu ma thuật và hào quang tím-xanh khi bói bài (Reading) */}
      {state === 'reading' && (
        <group position={[0, -0.6, 0.8]}>
          {/* Quả cầu pha lê */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.22, 32, 32]} />
            <meshPhysicalMaterial
              color="#9b5de5"
              roughness={0.1}
              metalness={0.1}
              transmission={0.9} // Độ trong suốt truyền ánh sáng
              thickness={0.5}     // Độ dày khúc xạ
              ior={1.5}
              transparent
              opacity={0.8}
            />
          </mesh>
          
          {/* Điểm sáng phát sáng bên trong quả cầu */}
          <pointLight color="#9b5de5" intensity={1.5} distance={2.5} decay={2} />
          
          {/* Hào quang lấp lánh quanh quả cầu */}
          <Sparkles
            count={45}
            scale={1.2}
            size={3.5}
            speed={1.2}
            color="#9b5de5"
            opacity={0.8}
          />
          <Sparkles
            count={20}
            scale={0.8}
            size={2.0}
            speed={0.8}
            color="#ffd166"
            opacity={0.7}
          />
        </group>
      )}

      {/* 3. Bong bóng ngủ "Z Z Z" khi ngủ */}
      {state === 'sleeping' && (
        <group ref={zzzGroupRef} position={[0.4, 0.2, 0.2]}>
          {[...Array(3)].map((_, i) => (
            <mesh key={i}>
              <boxGeometry args={[0.2, 0.04, 0.04]} /> {/* Chữ Z đơn giản hoá từ các hình khối hoặc tấm phẳng */}
              <meshBasicMaterial
                color="#8ecae6"
                transparent
                opacity={0}
                depthWrite={false}
              />
            </mesh>
          ))}
          {/* Sparkles nhẹ nhàng khi ngủ */}
          <Sparkles
            count={10}
            scale={2.2}
            size={1.5}
            speed={0.15}
            color="#8ecae6"
            opacity={0.4}
          />
        </group>
      )}

      {/* 4. Tia sáng ngạc nhiên khi bị bất ngờ (Surprised) */}
      {state === 'surprised' && (
        <group>
          <Sparkles
            count={50}
            scale={2.5}
            size={5.0}
            speed={3.5}
            color="#ffd166"
            opacity={0.9}
          />
          <pointLight color="#ffd166" intensity={2.5} distance={3.0} />
        </group>
      )}

      {/* 5. Trái tim và ngôi sao lấp lánh khi vui vẻ (Happy) */}
      {state === 'happy' && (
        <>
          <group ref={heartsGroupRef}>
            {[...Array(4)].map((_, i) => (
              <mesh key={i}>
                {/* Trái tim 3D tạo bằng cách ghép các khối cầu và nón hoặc torus đơn giản */}
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshToonMaterial
                  color="#e76f51"
                  transparent
                  opacity={0}
                />
              </mesh>
            ))}
          </group>
          <Sparkles
            count={40}
            scale={2.5}
            size={4.0}
            speed={1.8}
            color="#ffd166"
            opacity={0.9}
          />
        </>
      )}
    </group>
  );
}
