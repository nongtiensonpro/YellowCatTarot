'use client';

import React from 'react';
import { EffectComposer, DepthOfField, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';

interface PostProcessingProps {
  state: 'idle' | 'reading' | 'sleeping' | 'surprised' | 'happy' | 'shuffle';
}

export function PostProcessing({ state }: PostProcessingProps) {
  // Tính toán độ lệch quang sai Chromatic Aberration theo trạng thái cảm xúc
  let caOffset = 0;
  if (state === 'surprised') {
    caOffset = 0.004;
  } else if (state === 'shuffle') {
    caOffset = 0.002;
  }

  // Tải các hiệu ứng hậu kỳ bằng cách truyền mảng đã lọc và cast sang 'any' để tránh lỗi kiểm tra kiểu nghiêm ngặt của React 19
  return (
    <EffectComposer>
      {[
        <DepthOfField
          key="dof"
          focusDistance={1.8}
          focalLength={0.06}
          bokehScale={2.5}
        />,
        <Bloom
          key="bloom"
          luminanceThreshold={0.8}
          intensity={1.3}
          mipmapBlur
        />,
        caOffset > 0 ? (
          <ChromaticAberration
            key="ca"
            offset={new THREE.Vector2(caOffset, caOffset)}
          />
        ) : null
      ].filter(Boolean) as any}
    </EffectComposer>
  );
}
