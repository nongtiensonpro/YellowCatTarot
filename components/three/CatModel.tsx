'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { CAT_COLORS, createToonGradientTexture } from './materials';
import { createNoise2D } from 'simplex-noise';
import { Spring, SpringVector3 } from './physics/springSystem';
import { VerletChain } from './physics/verletChain';
import { addHeadMorphTargets, addEyeMorphTargets } from './morphTargets';
import { patchCatToonMaterial } from './shaders/catToonShader';

// Helper function to align and scale a cylinder between two 3D points (procedural leg limbs)
function alignCylinder(cylinder: THREE.Mesh, pStart: THREE.Vector3, pEnd: THREE.Vector3, thickness: number = 0.065) {
  const direction = new THREE.Vector3().subVectors(pEnd, pStart);
  const length = direction.length();
  
  // Vị trí trung điểm
  const midpoint = new THREE.Vector3().addVectors(pStart, pEnd).multiplyScalar(0.5);
  cylinder.position.copy(midpoint);
  
  // Tỷ lệ: x, z là độ dày cẳng chân, y là chiều dài nối hai điểm
  cylinder.scale.set(thickness, length, thickness);
  
  // Định hướng trục Y của cylinder hướng theo vector chỉ phương
  direction.normalize();
  const alignAxis = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(alignAxis, direction);
  cylinder.quaternion.copy(quaternion);
}

interface CatModelProps {
  state: 'idle' | 'reading' | 'sleeping' | 'surprised' | 'happy' | 'shuffle';
  drawnCardsCount?: number;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export function CatModel({ state: propState, drawnCardsCount = 0, size = 'md' }: CatModelProps) {
  const { size: canvasSize } = useThree();
  const [activeState, setActiveState] = useState(propState);
  
  // Load high-quality textures generated for the mascot parts
  const textures = useTexture({
    fur: '/textures/cat_fur.png',
    eye: '/textures/cat_eye.png',
    bell: '/textures/magic_bell.png',
  });
  const [reactionTimer, setReactionTimer] = useState<number>(0);
  const prevCardsCount = useRef(drawnCardsCount);

  // Lưu trữ các tham chiếu mesh để hiệu chỉnh bằng useFrame (tiết kiệm hiệu năng)
  const catGroupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const bellyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Group>(null);
  const noseRef = useRef<THREE.Mesh>(null);
  
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const leftEyelidClosedRef = useRef<THREE.Mesh>(null);
  const rightEyelidClosedRef = useRef<THREE.Mesh>(null);

  const leftEarRef = useRef<THREE.Group>(null);
  const rightEarRef = useRef<THREE.Group>(null);

  // Đuôi gồm nhiều khớp (Multi-joint tail) để uốn lượn mượt mà
  const tailBaseRef = useRef<THREE.Group>(null);
  const tailSeg1Ref = useRef<THREE.Group>(null);
  const tailSeg2Ref = useRef<THREE.Group>(null);
  const tailSeg3Ref = useRef<THREE.Group>(null);

  // Chân (Paws)
  const leftPawRef = useRef<THREE.Mesh>(null);
  const rightPawRef = useRef<THREE.Mesh>(null);
  const backLeftPawRef = useRef<THREE.Mesh>(null);
  const backRightPawRef = useRef<THREE.Mesh>(null);

  // Cẳng chân (Leg Limbs)
  const leftLegLimbRef = useRef<THREE.Mesh>(null);
  const rightLegLimbRef = useRef<THREE.Mesh>(null);
  const backLeftLegLimbRef = useRef<THREE.Mesh>(null);
  const backRightLegLimbRef = useRef<THREE.Mesh>(null);

  // Gò má (Cheeks)
  const leftCheekRef = useRef<THREE.Mesh>(null);
  const rightCheekRef = useRef<THREE.Mesh>(null);

  // Lông mày (Eyebrows)
  const leftEyebrowRef = useRef<THREE.Group>(null);
  const rightEyebrowRef = useRef<THREE.Group>(null);

  // Miệng mở (Open Mouth)
  const mouthOpenRef = useRef<THREE.Mesh>(null);

  // Vòng cổ & chuông
  const collarRef = useRef<THREE.Mesh>(null);
  const bellRef = useRef<THREE.Mesh>(null);

  // Râu mèo (Whiskers)
  const whiskersRef = useRef<THREE.Group>(null);

  // Refs cho các mesh biểu cảm Morph Targets
  const headMeshRef = useRef<THREE.Mesh>(null);
  const leftEyeMeshRef = useRef<THREE.Mesh>(null);
  const rightEyeMeshRef = useRef<THREE.Mesh>(null);

  // Refs cho chất liệu con ngươi (để làm phát quang mắt)
  const leftPupilMatRef = useRef<THREE.MeshToonMaterial>(null);
  const rightPupilMatRef = useRef<THREE.MeshToonMaterial>(null);

  // Lò xo đàn hồi cho chuyển động quay đầu (Spring damped LookAt)
  const lookAtSpring = React.useMemo(() => new SpringVector3(0, 0, 2.0, 120, 12), []);

  // Lò xo đàn hồi cho biến dạng nén nhả soft body (Squash & Stretch)
  const squashSpring = React.useMemo(() => new Spring(1.0, 110, 10), []);

  // Sợi dây vật lý Verlet Chain cho đuôi mèo
  const verletTail = React.useMemo(() => {
    return new VerletChain(5, 0.18, new THREE.Vector3(0, -0.3, -0.45));
  }, []);

  // Uniforms tham chiếu để thay đổi động trong useFrame (không cần recompile shader)
  const toonUniformsRef = useRef<{
    uRimColor: { value: THREE.Color };
    uRimPower: { value: number };
    uSssColor: { value: THREE.Color };
    uSssStrength: { value: number };
  } | null>(null);

  const handleToonBeforeCompile = React.useCallback((shader: any) => {
    shader.uniforms.uRimColor = { value: new THREE.Color('#ffe8b5') };
    shader.uniforms.uRimPower = { value: 2.5 };
    shader.uniforms.uSssColor = { value: new THREE.Color('#ff9e7a') };
    shader.uniforms.uSssStrength = { value: 0.6 };

    toonUniformsRef.current = {
      uRimColor: shader.uniforms.uRimColor,
      uRimPower: shader.uniforms.uRimPower,
      uSssColor: shader.uniforms.uSssColor,
      uSssStrength: shader.uniforms.uSssStrength,
    };

    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
       varying vec3 vNormalWorld;
       varying vec3 vViewPositionWorld;`
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <beginnormal_vertex>',
      `#include <beginnormal_vertex>
       vNormalWorld = normalize(normalMatrix * normal);`
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>',
      `#include <project_vertex>
       vViewPositionWorld = -mvPosition.xyz;`
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
       varying vec3 vNormalWorld;
       varying vec3 vViewPositionWorld;
       uniform vec3 uRimColor;
       uniform float uRimPower;
       uniform vec3 uSssColor;
       uniform float uSssStrength;`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
       vec3 normalVec = normalize(vNormalWorld);
       vec3 viewVec = normalize(vViewPositionWorld);
       float rim = 1.0 - max(0.0, dot(viewVec, normalVec));
       float rimFactor = pow(rim, uRimPower);
       vec3 finalRimGlow = uRimColor * rimFactor;
       
       vec3 backlightDir = normalize(vec3(0.0, 1.0, -1.0));
       float sssAmount = max(0.0, dot(-backlightDir, viewVec)) * uSssStrength;
       vec3 finalSssGlow = uSssColor * sssAmount;
       
       gl_FragColor.rgb += finalRimGlow + finalSssGlow;`
    );
  }, []);

  // Khởi tạo bộ tạo nhiễu hạt Simplex Noise để giật tai tự nhiên
  const noise2D = React.useMemo(() => createNoise2D(), []);

  // Toon shading gradient texture
  const [toonTexture, setToonTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const tex = createToonGradientTexture(3);
    if (tex) setToonTexture(tex);
  }, []);

  // Định nghĩa các đường cong để dựng hình bằng TubeGeometry (Giao diện 3D mượt mà)
  const leftMouthCurve = React.useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.065, 0.015, 0),
      new THREE.Vector3(-0.03, -0.015, 0.005),
      new THREE.Vector3(0, 0.0, 0.01)
    ]);
  }, []);

  const rightMouthCurve = React.useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.0, 0.01),
      new THREE.Vector3(0.03, -0.015, 0.005),
      new THREE.Vector3(0.065, 0.015, 0)
    ]);
  }, []);

  const leftWhiskerCurves = React.useMemo(() => [
    new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.2, 0.02, 0.05),
      new THREE.Vector3(-0.32, 0.06, 0.03),
      new THREE.Vector3(-0.45, 0.07, 0.0)
    ),
    new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.2, 0.0, 0.05),
      new THREE.Vector3(-0.33, 0.01, 0.03),
      new THREE.Vector3(-0.47, 0.0, 0.0)
    ),
    new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.2, -0.02, 0.05),
      new THREE.Vector3(-0.32, -0.05, 0.03),
      new THREE.Vector3(-0.45, -0.07, 0.0)
    )
  ], []);

  const rightWhiskerCurves = React.useMemo(() => [
    new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0.2, 0.02, 0.05),
      new THREE.Vector3(0.32, 0.06, 0.03),
      new THREE.Vector3(0.45, 0.07, 0.0)
    ),
    new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0.2, 0.0, 0.05),
      new THREE.Vector3(0.33, 0.01, 0.03),
      new THREE.Vector3(0.47, 0.0, 0.0)
    ),
    new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0.2, -0.02, 0.05),
      new THREE.Vector3(0.32, -0.05, 0.03),
      new THREE.Vector3(0.45, -0.07, 0.0)
    )
  ], []);

  const eyebrowCurve = React.useMemo(() => {
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.05, -0.01, 0),
      new THREE.Vector3(0, 0.012, 0),
      new THREE.Vector3(0.05, -0.01, 0)
    );
  }, []);

  const foreheadMCurve = React.useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, 0.28, 0.36),
      new THREE.Vector3(-0.04, 0.32, 0.33),
      new THREE.Vector3(0, 0.28, 0.37),
      new THREE.Vector3(0.04, 0.32, 0.33),
      new THREE.Vector3(0.08, 0.28, 0.36)
    ]);
  }, []);

  const bodyStripeCurves = React.useMemo(() => [
    // Left stripe 1 (upper)
    new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.43, 0.1, -0.15),
      new THREE.Vector3(-0.38, 0.1, -0.32),
      new THREE.Vector3(-0.18, 0.1, -0.42)
    ),
    // Left stripe 2 (lower)
    new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.45, -0.1, -0.15),
      new THREE.Vector3(-0.4, -0.1, -0.32),
      new THREE.Vector3(-0.18, -0.1, -0.44)
    ),
    // Right stripe 1 (upper)
    new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0.43, 0.1, -0.15),
      new THREE.Vector3(0.38, 0.1, -0.32),
      new THREE.Vector3(0.18, 0.1, -0.42)
    ),
    // Right stripe 2 (lower)
    new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0.45, -0.1, -0.15),
      new THREE.Vector3(0.4, -0.1, -0.32),
      new THREE.Vector3(0.18, -0.1, -0.44)
    )
  ], []);

  // Tạo hình học (Geometries) dùng chung có Morph Targets (Blendshapes) tích hợp sẵn
  const headGeometry = React.useMemo(() => {
    const geo = new THREE.SphereGeometry(0.46, 32, 32);
    addHeadMorphTargets(geo);
    return geo;
  }, []);

  const eyeGeometry = React.useMemo(() => {
    const geo = new THREE.SphereGeometry(0.09, 16, 16);
    addEyeMorphTargets(geo);
    return geo;
  }, []);

  // Kích hoạt phản ứng tương tác đặc biệt khi số lượng lá bài rút thay đổi (Rút bài mới)
  useEffect(() => {
    if (drawnCardsCount > prevCardsCount.current) {
      // Rút bài mới! Cho mèo giật mình (surprised) -> rồi mừng rỡ (happy)
      setActiveState('surprised');
      setReactionTimer(2.5); // Phản ứng kéo dài 2.5 giây
    }
    prevCardsCount.current = drawnCardsCount;
  }, [drawnCardsCount]);

  // Đồng bộ propState khi không trong chế độ phản ứng tự động
  useEffect(() => {
    if (reactionTimer <= 0) {
      setActiveState(propState);
    }
  }, [propState, reactionTimer]);

  // Bộ biến trạng thái nội bộ cho nháy mắt và rung tai ngẫu nhiên
  const blinkTimer = useRef<number>(Math.random() * 3 + 2);
  const blinkActive = useRef<boolean>(false);
  const blinkDuration = useRef<number>(0.12);
  
  const earTwitchTimer = useRef<number>(Math.random() * 4 + 3);
  const leftEarTwitchActive = useRef<boolean>(false);
  const rightEarTwitchActive = useRef<boolean>(false);
  const earTwitchDuration = useRef<number>(0.2);

  // Thiết lập góc quay và vị trí mục tiêu cho LERP transition mượt mà
  const targets = useRef({
    // Vị trí mèo
    posY: 0,
    posZ: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    // Đầu
    headX: 0,
    headY: 0,
    headZ: 0,
    headRotX: 0,
    headRotY: 0,
    headRotZ: 0,
    // Mắt
    eyeScaleY: 1,
    eyeScaleX: 1,
    pupilScale: 1,
    eyeOpenVisible: true,
    eyeClosedVisible: false,
    // Tai
    leftEarRotZ: 0,
    rightEarRotZ: 0,
    leftEarRotX: 0,
    rightEarRotX: 0,
    // Đuôi
    tailBaseRotX: 0,
    tailBaseRotY: 0,
    tailBaseRotZ: 0,
    // Chân trước
    leftPawY: -0.5,
    leftPawZ: 0.5,
    leftPawRotX: 0,
    rightPawY: -0.5,
    rightPawZ: 0.5,
    rightPawRotX: 0,
  });

  useFrame((threeState, delta) => {
    const time = threeState.clock.getElapsedTime();

    // Giới hạn delta tối đa để tránh giật lag khi chuyển tab
    const dt = Math.min(delta, 0.1);

    // 1. Lò xo xoay đầu quay cổ (Spring damped LookAt)
    const mouseX = threeState.pointer.x;
    const mouseY = threeState.pointer.y;
    if (activeState === 'idle') {
      lookAtSpring.target.x = THREE.MathUtils.clamp(mouseX * 0.7, -0.7, 0.7); // yaw (±40 deg)
      lookAtSpring.target.y = THREE.MathUtils.clamp(mouseY * 0.43, -0.43, 0.43); // pitch (±25 deg)
      lookAtSpring.target.z = THREE.MathUtils.clamp(mouseX * 0.26, -0.26, 0.26); // roll (±15 deg)
    } else {
      lookAtSpring.target.x = 0;
      lookAtSpring.target.y = 0;
      lookAtSpring.target.z = 0;
    }
    lookAtSpring.update(dt);

    const neckYaw = lookAtSpring.current.x;
    const neckPitch = lookAtSpring.current.y;
    const neckRoll = lookAtSpring.current.z;

    // 2. Lò xo nén nhả soft body (Squash & Stretch)
    let targetSquash = 1.0;
    if (activeState === 'surprised') {
      targetSquash = reactionTimer > 1.8 ? 0.85 : (reactionTimer > 1.0 ? 1.15 : 1.0);
    } else if (activeState === 'happy') {
      const bounce = Math.sin(time * 6.5);
      targetSquash = bounce < -0.8 ? 0.88 : (bounce > 0.8 ? 1.08 : 1.0);
    } else if (activeState === 'shuffle') {
      targetSquash = 1.0 + Math.sin(time * 20) * 0.04;
    }
    squashSpring.target = targetSquash;
    squashSpring.update(dt);

    const squashFactor = squashSpring.current;
    const invSquash = 1.0 / Math.sqrt(squashFactor);

    // 3. Quản lý đồng hồ phản ứng (Reaction Timer)
    if (reactionTimer > 0) {
      const nextTimer = reactionTimer - dt;
      setReactionTimer(nextTimer);
      if (nextTimer <= 0) {
        // Hết thời gian phản ứng, quay lại trạng thái trang yêu cầu
        setActiveState(propState);
      } else if (nextTimer < 1.5 && activeState === 'surprised') {
        // Sau 1 giây giật mình, chuyển sang trạng thái vui vẻ mừng rỡ
        setActiveState('happy');
      }
    }

    // 4. Tính toán mục tiêu (Targets) dựa trên activeState hiện tại
    const target = targets.current;

    switch (activeState) {
      case 'sleeping':
        // Mèo ngủ co tròn dưới đất
        target.posY = -0.25;
        target.posZ = 0.1;
        target.rotX = 0.1;
        target.rotY = -0.5; // Nằm hơi nghiêng mình
        target.rotZ = 0;

        target.headX = 0;
        target.headY = 0.2;
        target.headZ = 0.1;
        target.headRotX = 0.25; // Cúi đầu xuống chân ngủ
        target.headRotY = -0.3;
        target.headRotZ = -0.1;

        target.eyeScaleY = 0.05; // Nhắm mắt
        target.eyeScaleX = 1.0;
        target.pupilScale = 0.01;
        target.eyeOpenVisible = false;
        target.eyeClosedVisible = true;

        target.leftEarRotZ = 0.15; // Xụ tai xuống mềm mại
        target.rightEarRotZ = -0.15;
        target.leftEarRotX = 0.1;
        target.rightEarRotX = 0.1;

        // Đuôi cuộn tròn quanh thân
        target.tailBaseRotX = 0.2;
        target.tailBaseRotY = -1.2;
        target.tailBaseRotZ = 0.3;
        
        target.leftPawY = -0.55;
        target.leftPawZ = 0.3;
        target.rightPawY = -0.55;
        target.rightPawZ = 0.3;
        break;

      case 'reading':
        // Mèo tập trung bói toán, nhìn xuống quả cầu
        target.posY = -0.05;
        target.posZ = 0.1;
        target.rotX = 0.15; // Hơi cúi người
        target.rotY = 0;
        target.rotZ = 0;

        target.headX = 0;
        target.headY = 0.38;
        target.headZ = 0.05;
        target.headRotX = 0.3; // Nhìn xuống
        target.headRotY = 0;
        target.headRotZ = 0;

        target.eyeScaleY = 0.85; // Mắt lim dim tập trung
        target.eyeScaleX = 0.9;
        target.pupilScale = 0.8;
        target.eyeOpenVisible = true;
        target.eyeClosedVisible = false;

        target.leftEarRotZ = -0.05; // Hơi chú ý về trước
        target.rightEarRotZ = 0.05;
        target.leftEarRotX = -0.15;
        target.rightEarRotX = -0.15;

        // Đuôi vẫy nhẹ sang bên
        target.tailBaseRotX = -0.1;
        target.tailBaseRotY = 0.5;
        target.tailBaseRotZ = -0.1;

        target.leftPawY = -0.4;
        target.leftPawZ = 0.45;
        target.rightPawY = -0.4;
        target.rightPawZ = 0.45;
        break;

      case 'surprised':
        // Mèo bất ngờ nhảy nhổm lên
        target.posY = 0.35 + Math.sin(time * 25) * 0.03; // Run rẩy nhẹ vì ngạc nhiên
        target.posZ = -0.1;
        target.rotX = -0.15; // Hơi ngửa người ra sau
        target.rotY = 0;
        target.rotZ = 0;

        target.headX = 0;
        target.headY = 0.45;
        target.headZ = -0.05;
        target.headRotX = -0.2; // Ngước lên
        target.headRotY = 0;
        target.headRotZ = 0;

        target.eyeScaleY = 1.35; // Mắt mở to tròn xoe
        target.eyeScaleX = 1.3;
        target.pupilScale = 0.5; // Đồng tử thu nhỏ lại ngơ ngác
        target.eyeOpenVisible = true;
        target.eyeClosedVisible = false;

        target.leftEarRotZ = -0.2; // Dựng thẳng tai lên đứng
        target.rightEarRotZ = 0.2;
        target.leftEarRotX = -0.2;
        target.rightEarRotX = -0.2;

        // Đuôi dựng đứng như cột điện
        target.tailBaseRotX = -1.2;
        target.tailBaseRotY = 0;
        target.tailBaseRotZ = 0;

        target.leftPawY = -0.2; // Co chân trước lên vì sợ hãi/ngạc nhiên
        target.leftPawZ = 0.35;
        target.rightPawY = -0.2;
        target.rightPawZ = 0.35;
        break;

      case 'happy':
        // Mèo vui vẻ, nhún nhảy liên tục
        target.posY = Math.abs(Math.sin(time * 6.5)) * 0.15; // Nhảy tưng tưng cute
        target.posZ = 0;
        target.rotX = 0;
        target.rotY = 0;
        target.rotZ = Math.sin(time * 6.5) * 0.05; // Lắc lư thân mình

        target.headX = 0;
        target.headY = 0.4;
        target.headZ = 0;
        target.headRotX = -0.05;
        target.headRotY = Math.sin(time * 6.5) * 0.06;
        target.headRotZ = Math.sin(time * 6.5) * 0.05; // Lắc đầu vui vẻ

        target.eyeScaleY = 0.12; // Mắt híp cười đáng yêu
        target.eyeScaleX = 1.15;
        target.pupilScale = 0.1;
        target.eyeOpenVisible = true;
        target.eyeClosedVisible = false;

        target.leftEarRotZ = -0.15;
        target.rightEarRotZ = 0.15;
        target.leftEarRotX = 0;
        target.rightEarRotX = 0;

        // Đuôi vẫy cực nhanh
        target.tailBaseRotX = 0.1;
        target.tailBaseRotY = Math.sin(time * 15) * 0.8;
        target.tailBaseRotZ = 0;

        target.leftPawY = -0.45 + Math.sin(time * 6.5) * 0.05;
        target.leftPawZ = 0.45;
        target.rightPawY = -0.45 - Math.sin(time * 6.5) * 0.05;
        target.rightPawZ = 0.45;
        break;

      case 'shuffle':
        // Mèo tráo bài, chân múa liên tục
        target.posY = 0;
        target.posZ = 0.1;
        target.rotX = 0.1;
        target.rotY = 0;
        target.rotZ = 0;

        target.headX = 0;
        target.headY = 0.4;
        target.headZ = 0.05;
        target.headRotX = 0.18; // Hơi cúi nhìn đống bài
        target.headRotY = Math.sin(time * 4) * 0.12; // Nhìn qua nhìn lại
        target.headRotZ = 0;

        target.eyeScaleY = 0.95;
        target.eyeScaleX = 1.0;
        target.pupilScale = 0.9;
        target.eyeOpenVisible = true;
        target.eyeClosedVisible = false;

        target.leftEarRotZ = -0.05;
        target.rightEarRotZ = 0.05;
        target.leftEarRotX = -0.1;
        target.rightEarRotX = -0.1;

        // Đuôi ngoáy nhịp nhàng phấn khích
        target.tailBaseRotX = 0.1;
        target.tailBaseRotY = Math.sin(time * 6) * 0.4;
        target.tailBaseRotZ = 0;

        // Chân trước múa liên hồi (Tráo bài cực ngầu)
        target.leftPawY = -0.3 + Math.sin(time * 20) * 0.08;
        target.leftPawZ = 0.6 + Math.cos(time * 20) * 0.05;
        target.leftPawRotX = Math.sin(time * 20) * 0.4;

        target.rightPawY = -0.3 - Math.sin(time * 20) * 0.08;
        target.rightPawZ = 0.6 - Math.cos(time * 20) * 0.05;
        target.rightPawRotX = -Math.sin(time * 20) * 0.4;
        break;

      case 'idle':
      default:
        // Trạng thái đứng yên bình thường (Idle)
        target.posY = 0;
        target.posZ = 0;
        target.rotX = 0;
        target.rotY = 0;
        target.rotZ = 0;

        target.headX = 0;
        target.headY = 0.4;
        target.headZ = 0;
        target.headRotX = -neckPitch; // pitch lấy từ lò xo
        target.headRotY = neckYaw;   // yaw lấy từ lò xo
        target.headRotZ = neckRoll;  // roll lấy từ lò xo

        // Mắt liếc thêm 15 độ (0.26 rad) so với đầu
        const eyeExtraYaw = THREE.MathUtils.clamp(mouseX * 0.26, -0.26, 0.26);
        const eyeExtraPitch = THREE.MathUtils.clamp(mouseY * 0.2, -0.2, 0.2);
        
        if (leftPupilRef.current && rightPupilRef.current) {
          leftPupilRef.current.position.x = eyeExtraYaw * 0.15;
          leftPupilRef.current.position.y = eyeExtraPitch * 0.15;
          rightPupilRef.current.position.x = eyeExtraYaw * 0.15;
          rightPupilRef.current.position.y = eyeExtraPitch * 0.15;
        }

        target.eyeScaleY = 1.0;
        target.eyeScaleX = 1.0;
        target.pupilScale = 1.0;
        target.eyeOpenVisible = true;
        target.eyeClosedVisible = false;

        target.leftEarRotZ = -0.05;
        target.rightEarRotZ = 0.05;
        target.leftEarRotX = 0;
        target.rightEarRotX = 0;

        // Đuôi vẫy uốn lượn chậm rãi
        target.tailBaseRotX = 0;
        target.tailBaseRotY = Math.sin(time * 2.2) * 0.25;
        target.tailBaseRotZ = 0;

        target.leftPawY = -0.5;
        target.leftPawZ = 0.45;
        target.leftPawRotX = 0;
        target.rightPawY = -0.5;
        target.rightPawZ = 0.45;
        target.rightPawRotX = 0;
        break;
    }

    // 3. Xử lý hoạt ảnh vi mô tự động (Micro-animations): Nháy mắt & Rung tai
    if (activeState !== 'sleeping' && activeState !== 'happy') {
      // A. Nháy mắt ngẫu nhiên (Blink)
      blinkTimer.current -= dt;
      if (blinkTimer.current <= 0 && !blinkActive.current) {
        blinkActive.current = true;
        blinkTimer.current = blinkDuration.current;
      }
      
      if (blinkActive.current) {
        blinkTimer.current -= dt;
        target.eyeScaleY = 0.02; // Nhắm mắt rất nhanh
        if (blinkTimer.current <= 0) {
          blinkActive.current = false;
          blinkTimer.current = Math.random() * 4 + 3; // Lên lịch nháy mắt tiếp theo (3-7s)
        }
      }

      // B. Rung tai ngẫu nhiên bằng Simplex Noise (Ear twitches)
      if (!leftEarTwitchActive.current && !rightEarTwitchActive.current) {
        const earNoise = noise2D(time * 0.8, 12.34);
        if (earNoise > 0.92) { // Ngưỡng cao tạo ra nhịp giật không đều tự nhiên
          if (Math.random() > 0.5) {
            leftEarTwitchActive.current = true;
          } else {
            rightEarTwitchActive.current = true;
          }
          earTwitchTimer.current = earTwitchDuration.current;
        }
      }

      if (leftEarTwitchActive.current) {
        earTwitchTimer.current -= dt;
        target.leftEarRotZ = -0.35; // Rung tai trái
        if (earTwitchTimer.current <= 0) {
          leftEarTwitchActive.current = false;
        }
      }

      if (rightEarTwitchActive.current) {
        earTwitchTimer.current -= dt;
        target.rightEarRotZ = 0.35; // Rung tai phải
        if (earTwitchTimer.current <= 0) {
          rightEarTwitchActive.current = false;
        }
      }
    }

    // C. Nhịp thở tự nhiên (Natural breathing scale oscillation)
    // Sẽ nhân bản nhịp thở nhẹ vào xương/body scale
    const breathRate = activeState === 'sleeping' ? 1.4 : 2.6;
    const breathAmp = activeState === 'sleeping' ? 0.022 : 0.012;
    const breathScale = 1.0 + Math.sin(time * breathRate) * breathAmp;

    // Má phồng thở: Scale nhẹ 2 gò má theo nhịp thở
    const cheekBreathScale = 1.0 + Math.sin(time * breathRate) * (breathAmp * 1.6);
    if (leftCheekRef.current) {
      leftCheekRef.current.scale.set(cheekBreathScale, cheekBreathScale, cheekBreathScale);
    }
    if (rightCheekRef.current) {
      rightCheekRef.current.scale.set(cheekBreathScale, cheekBreathScale, cheekBreathScale);
    }

    // 4. Áp dụng LERP (Linear Interpolation) để chuyển đổi mượt mà các biến số
    const lerpSpeed = activeState === 'surprised' ? 18 * dt : 5.8 * dt; // Bất ngờ thì giật mình rất nhanh, các trạng thái khác mượt mà
    const fastLerpSpeed = 15 * dt;

    if (bodyRef.current) {
      bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, target.posY, lerpSpeed);
      bodyRef.current.position.z = THREE.MathUtils.lerp(bodyRef.current.position.z, target.posZ, lerpSpeed);
      bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, target.rotX, lerpSpeed);
      bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, target.rotY, lerpSpeed);
      bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, target.rotZ, lerpSpeed);
      
      // Co giãn nén nhả soft body (Squash & Stretch) kết hợp nhịp thở
      bodyRef.current.scale.set(invSquash, squashFactor * breathScale, invSquash);
    }

    if (headRef.current) {
      headRef.current.position.y = THREE.MathUtils.lerp(headRef.current.position.y, target.headY, lerpSpeed);
      headRef.current.position.z = THREE.MathUtils.lerp(headRef.current.position.z, target.headZ, lerpSpeed);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, target.headRotX, lerpSpeed);
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, target.headRotY, lerpSpeed);
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, target.headRotZ, lerpSpeed);
    }

    // Cập nhật Morph Targets cho hình học đầu (cheekPuff và browFurrow)
    if (headMeshRef.current && headMeshRef.current.morphTargetInfluences) {
      let targetCheekPuff = activeState === 'idle' ? (0.3 + Math.sin(time * breathRate) * 0.2) : 0.1;
      let targetBrowFurrow = activeState === 'reading' ? 1.0 : 0.0;
      
      headMeshRef.current.morphTargetInfluences[0] = THREE.MathUtils.lerp(
        headMeshRef.current.morphTargetInfluences[0],
        targetCheekPuff,
        lerpSpeed
      );
      headMeshRef.current.morphTargetInfluences[1] = THREE.MathUtils.lerp(
        headMeshRef.current.morphTargetInfluences[1],
        targetBrowFurrow,
        lerpSpeed
      );
    }

    // Điều khiển mắt nhắm/mở và co giãn
    const eyeScaleY = THREE.MathUtils.lerp(leftEyeRef.current?.scale.y || 1, target.eyeScaleY, fastLerpSpeed);
    const eyeScaleX = THREE.MathUtils.lerp(leftEyeRef.current?.scale.x || 1, target.eyeScaleX, fastLerpSpeed);
    
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.set(eyeScaleX, eyeScaleY, 1);
      rightEyeRef.current.scale.set(eyeScaleX, eyeScaleY, 1);
    }

    // Co giãn con ngươi
    if (leftPupilRef.current && rightPupilRef.current) {
      const pupilS = THREE.MathUtils.lerp(leftPupilRef.current.scale.x, target.pupilScale, fastLerpSpeed);
      leftPupilRef.current.scale.set(pupilS, pupilS, pupilS);
      rightPupilRef.current.scale.set(pupilS, pupilS, pupilS);
    }

    // Hiển thị mi mắt nhắm
    if (leftEyelidClosedRef.current && rightEyelidClosedRef.current) {
      leftEyelidClosedRef.current.visible = target.eyeClosedVisible;
      rightEyelidClosedRef.current.visible = target.eyeClosedVisible;
      // Nháy mắt nhanh thì không hiện eyelid nhắm tĩnh
    }

    // Cập nhật Morph Targets cho hình học mắt (eyeSmile và eyeWide)
    if (leftEyeMeshRef.current && rightEyeMeshRef.current && leftEyeMeshRef.current.morphTargetInfluences && rightEyeMeshRef.current.morphTargetInfluences) {
      let targetEyeSmile = activeState === 'happy' ? 1.0 : 0.0;
      let targetEyeWide = activeState === 'surprised' ? 1.0 : 0.0;
      
      leftEyeMeshRef.current.morphTargetInfluences[0] = THREE.MathUtils.lerp(leftEyeMeshRef.current.morphTargetInfluences[0], targetEyeSmile, fastLerpSpeed);
      leftEyeMeshRef.current.morphTargetInfluences[1] = THREE.MathUtils.lerp(leftEyeMeshRef.current.morphTargetInfluences[1], targetEyeWide, fastLerpSpeed);
      
      rightEyeMeshRef.current.morphTargetInfluences[0] = THREE.MathUtils.lerp(rightEyeMeshRef.current.morphTargetInfluences[0], targetEyeSmile, fastLerpSpeed);
      rightEyeMeshRef.current.morphTargetInfluences[1] = THREE.MathUtils.lerp(rightEyeMeshRef.current.morphTargetInfluences[1], targetEyeWide, fastLerpSpeed);
    }

    // Reset vị trí con ngươi nếu không phải trạng thái idle
    if (activeState !== 'idle') {
      if (leftPupilRef.current && rightPupilRef.current) {
        leftPupilRef.current.position.x = THREE.MathUtils.lerp(leftPupilRef.current.position.x, 0, fastLerpSpeed);
        leftPupilRef.current.position.y = THREE.MathUtils.lerp(leftPupilRef.current.position.y, 0, fastLerpSpeed);
        rightPupilRef.current.position.x = THREE.MathUtils.lerp(rightPupilRef.current.position.x, 0, fastLerpSpeed);
        rightPupilRef.current.position.y = THREE.MathUtils.lerp(rightPupilRef.current.position.y, 0, fastLerpSpeed);
      }
    }

    // Phát quang tròng mắt (Eye Glow) màu tím khi tiên tri (reading state)
    if (leftPupilMatRef.current && rightPupilMatRef.current) {
      if (activeState === 'reading') {
        const glowIntensity = 1.0 + Math.sin(time * 3.5) * 0.4;
        leftPupilMatRef.current.emissive.set('#9b5de5');
        leftPupilMatRef.current.emissiveIntensity = glowIntensity;
        rightPupilMatRef.current.emissive.set('#9b5de5');
        rightPupilMatRef.current.emissiveIntensity = glowIntensity;
      } else {
        leftPupilMatRef.current.emissive.set('#000000');
        leftPupilMatRef.current.emissiveIntensity = 0;
        rightPupilMatRef.current.emissive.set('#000000');
        rightPupilMatRef.current.emissiveIntensity = 0;
      }
    }

    // Cập nhật màu viền sáng Rim Light và tán xạ SSS theo trạng thái cảm xúc
    if (toonUniformsRef.current) {
      const targetColor = activeState === 'reading' ? new THREE.Color('#b388ff') : new THREE.Color('#ffe8b5');
      toonUniformsRef.current.uRimColor.value.lerp(targetColor, 0.08);
      toonUniformsRef.current.uSssStrength.value = THREE.MathUtils.lerp(
        toonUniformsRef.current.uSssStrength.value,
        activeState === 'reading' ? 1.0 : 0.6,
        0.05
      );
    }

    // Điều khiển tai
    if (leftEarRef.current && rightEarRef.current) {
      leftEarRef.current.rotation.z = THREE.MathUtils.lerp(leftEarRef.current.rotation.z, target.leftEarRotZ, lerpSpeed);
      rightEarRef.current.rotation.z = THREE.MathUtils.lerp(rightEarRef.current.rotation.z, target.rightEarRotZ, lerpSpeed);
      leftEarRef.current.rotation.x = THREE.MathUtils.lerp(leftEarRef.current.rotation.x, target.leftEarRotX, lerpSpeed);
      rightEarRef.current.rotation.x = THREE.MathUtils.lerp(rightEarRef.current.rotation.x, target.rightEarRotX, lerpSpeed);
    }

    // Điều khiển chân trước
    if (leftPawRef.current && rightPawRef.current) {
      leftPawRef.current.position.y = THREE.MathUtils.lerp(leftPawRef.current.position.y, target.leftPawY, lerpSpeed);
      leftPawRef.current.position.z = THREE.MathUtils.lerp(leftPawRef.current.position.z, target.leftPawZ, lerpSpeed);
      leftPawRef.current.rotation.x = THREE.MathUtils.lerp(leftPawRef.current.rotation.x, target.leftPawRotX, lerpSpeed);
      
      rightPawRef.current.position.y = THREE.MathUtils.lerp(rightPawRef.current.position.y, target.rightPawY, lerpSpeed);
      rightPawRef.current.position.z = THREE.MathUtils.lerp(rightPawRef.current.position.z, target.rightPawZ, lerpSpeed);
      rightPawRef.current.rotation.x = THREE.MathUtils.lerp(rightPawRef.current.rotation.x, target.rightPawRotX, lerpSpeed);
    }

    // 4.1. Căn chỉnh cẳng chân với bàn chân (Leg Limbs alignment IK)
    const pStartFL = new THREE.Vector3(-0.18, -0.18, 0.2);
    const pEndFL = leftPawRef.current ? leftPawRef.current.position.clone() : new THREE.Vector3(-0.2, -0.5, 0.45);
    if (leftLegLimbRef.current) {
      alignCylinder(leftLegLimbRef.current, pStartFL, pEndFL, 0.065);
    }

    const pStartFR = new THREE.Vector3(0.18, -0.18, 0.2);
    const pEndFR = rightPawRef.current ? rightPawRef.current.position.clone() : new THREE.Vector3(0.2, -0.5, 0.45);
    if (rightLegLimbRef.current) {
      alignCylinder(rightLegLimbRef.current, pStartFR, pEndFR, 0.065);
    }

    const pStartBL = new THREE.Vector3(-0.26, -0.22, -0.15);
    const pEndBL = backLeftPawRef.current ? backLeftPawRef.current.position.clone() : new THREE.Vector3(-0.32, -0.5, -0.22);
    if (backLeftLegLimbRef.current) {
      alignCylinder(backLeftLegLimbRef.current, pStartBL, pEndBL, 0.085);
    }

    const pStartBR = new THREE.Vector3(0.26, -0.22, -0.15);
    const pEndBR = backRightPawRef.current ? backRightPawRef.current.position.clone() : new THREE.Vector3(0.32, -0.5, -0.22);
    if (backRightLegLimbRef.current) {
      alignCylinder(backRightLegLimbRef.current, pStartBR, pEndBR, 0.085);
    }

    // 4.2. Xoay/Nghiêng lông mày biểu cảm
    if (leftEyebrowRef.current && rightEyebrowRef.current) {
      let targetEyebrowY = 0.25;
      let targetLeftEyebrowRotZ = 0;
      let targetRightEyebrowRotZ = 0;

      if (activeState === 'sleeping') {
        targetEyebrowY = 0.22;
        targetLeftEyebrowRotZ = 0.12;
        targetRightEyebrowRotZ = -0.12;
      } else if (activeState === 'surprised') {
        targetEyebrowY = 0.28;
        targetLeftEyebrowRotZ = -0.15;
        targetRightEyebrowRotZ = 0.15;
      } else if (activeState === 'reading') {
        targetEyebrowY = 0.24;
        targetLeftEyebrowRotZ = 0.08;
        targetRightEyebrowRotZ = -0.08;
      } else if (activeState === 'happy') {
        targetEyebrowY = 0.26;
        targetLeftEyebrowRotZ = -0.1;
        targetRightEyebrowRotZ = 0.1;
      }

      leftEyebrowRef.current.position.y = THREE.MathUtils.lerp(leftEyebrowRef.current.position.y, targetEyebrowY, lerpSpeed);
      rightEyebrowRef.current.position.y = THREE.MathUtils.lerp(rightEyebrowRef.current.position.y, targetEyebrowY, lerpSpeed);

      leftEyebrowRef.current.rotation.z = THREE.MathUtils.lerp(leftEyebrowRef.current.rotation.z, targetLeftEyebrowRotZ, lerpSpeed);
      rightEyebrowRef.current.rotation.z = THREE.MathUtils.lerp(rightEyebrowRef.current.rotation.z, targetRightEyebrowRotZ, lerpSpeed);
    }

    // 4.3. Điều khiển miệng mở
    if (mouthOpenRef.current) {
      let targetMouthScale: [number, number, number] = [0, 0, 0];
      if (activeState === 'surprised') {
        targetMouthScale = [1.1, 1.3, 0.7];
      } else if (activeState === 'happy') {
        targetMouthScale = [1.2, 0.7, 0.7];
      }
      mouthOpenRef.current.scale.x = THREE.MathUtils.lerp(mouthOpenRef.current.scale.x, targetMouthScale[0], fastLerpSpeed);
      mouthOpenRef.current.scale.y = THREE.MathUtils.lerp(mouthOpenRef.current.scale.y, targetMouthScale[1], fastLerpSpeed);
      mouthOpenRef.current.scale.z = THREE.MathUtils.lerp(mouthOpenRef.current.scale.z, targetMouthScale[2], fastLerpSpeed);
    }

    // 4.4. Rung chuông lắc
    if (bellRef.current) {
      const bellOscSpeed = activeState === 'happy' ? 20 : (activeState === 'shuffle' ? 12 : 3);
      const bellOscAmp = activeState === 'happy' ? 0.2 : (activeState === 'shuffle' ? 0.1 : 0.03);
      bellRef.current.rotation.z = Math.sin(time * bellOscSpeed) * bellOscAmp;
    }

    // 4.5. Rung râu mèo theo nhịp thở & cảm xúc
    if (whiskersRef.current) {
      const vibFreq = activeState === 'surprised' ? 45 : 12;
      const vibAmp = activeState === 'surprised' ? 0.06 : 0.015;
      whiskersRef.current.rotation.z = Math.sin(time * vibFreq) * vibAmp;
      whiskersRef.current.rotation.y = Math.cos(time * vibFreq * 0.8) * (vibAmp * 0.5);
    }

    // 5. Cập nhật và định hướng đuôi theo vật lý Verlet Chain tự nhiên
    const anchorWorldPos = new THREE.Vector3();
    if (bodyRef.current) {
      bodyRef.current.getWorldPosition(anchorWorldPos);
      const offset = new THREE.Vector3(0, -0.3, -0.45).applyQuaternion(bodyRef.current.quaternion);
      anchorWorldPos.add(offset);
    }
    
    // Trọng lực thay đổi theo cảm xúc: ngủ rũ -> nặng, vui vẻ nhảy nhót -> nhẹ hơn + vẫy mạnh
    const gravityY = activeState === 'sleeping' ? -12.0 : (activeState === 'happy' ? -2.0 : -6.5);
    
    // Thêm xung lực ngẫu nhiên làm đuôi vẫy tung tẩy khi vui mừng
    if (activeState === 'happy' && Math.random() < 0.15) {
      const impulse = new THREE.Vector3(
        (Math.random() - 0.5) * 6.0,
        (Math.random() - 0.5) * 3.0,
        (Math.random() - 0.5) * 6.0
      );
      verletTail.points[4].position.add(impulse);
    }
    
    // Cập nhật chuỗi Verlet
    verletTail.update(dt, anchorWorldPos, gravityY);
    
    // Định hướng các khớp đuôi bằng lookAt
    if (tailBaseRef.current && tailSeg1Ref.current && tailSeg2Ref.current && tailSeg3Ref.current) {
      tailBaseRef.current.lookAt(verletTail.points[1].position);
      tailSeg1Ref.current.lookAt(verletTail.points[2].position);
      tailSeg2Ref.current.lookAt(verletTail.points[3].position);
      tailSeg3Ref.current.lookAt(verletTail.points[4].position);
    }
  });

  const showPawPads = (activeState === 'surprised' || activeState === 'shuffle' || activeState === 'happy') && size !== 'sm';

  return (
    <group ref={catGroupRef} position={[0, -0.15, 0]}>
      {/* Khối Đáy xoay mèo hướng về trước camera nhẹ nhàng */}
      
      {/* -------------------- THÂN MÈO VÀNG -------------------- */}
      <group ref={bodyRef}>
        {/* Thân trên (Upper torso) */}
        <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
          <sphereGeometry args={[0.48, 32, 32]} />
          <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
        </mesh>

        {/* Thân dưới (Lower body) */}
        <mesh castShadow receiveShadow position={[0, -0.15, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
        </mesh>

        {/* Lông ngực fluffy (Chest fluff) */}
        {size !== 'sm' && (
          <group>
            <mesh position={[0, 0.1, 0.35]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshToonMaterial color={CAT_COLORS.chestFluff} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
            </mesh>
            <mesh position={[-0.08, 0.05, 0.33]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshToonMaterial color={CAT_COLORS.chestFluff} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
            </mesh>
            <mesh position={[0.08, 0.05, 0.33]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshToonMaterial color={CAT_COLORS.chestFluff} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
            </mesh>
            <mesh position={[0, 0.0, 0.36]}>
              <sphereGeometry args={[0.13, 16, 16]} />
              <meshToonMaterial color={CAT_COLORS.chestFluff} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
            </mesh>
          </group>
        )}

        {/* Sọc vằn trên lưng (Body stripes) */}
        {size !== 'sm' && (
          <group>
            {bodyStripeCurves.map((curve, idx) => (
              <mesh key={idx}>
                <tubeGeometry args={[curve, 16, 0.012, 8, false]} />
                <meshBasicMaterial color={CAT_COLORS.stripe} />
              </mesh>
            ))}
          </group>
        )}

        {/* Lông Bụng vàng nhạt sáng ấm áp */}
        <mesh ref={bellyRef} position={[0, -0.05, 0.22]} rotation={[-0.1, 0, 0]}>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshToonMaterial color={CAT_COLORS.belly} gradientMap={toonTexture || undefined} map={textures.fur} />
        </mesh>

        {/* Vòng Cổ màu hồng cam */}
        <mesh ref={collarRef} position={[0, 0.32, 0.08]} rotation={[0.2, 0, 0]}>
          <torusGeometry args={[0.35, 0.04, 16, 32]} />
          <meshToonMaterial color={CAT_COLORS.collar} gradientMap={toonTexture || undefined} map={textures.fur} />
        </mesh>

        {/* Chuông vàng lục lạc hình tròn treo trước ngực */}
        <mesh ref={bellRef} position={[0, 0.22, 0.38]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshToonMaterial color={CAT_COLORS.bell} gradientMap={toonTexture || undefined} map={textures.bell} />
          {/* Khe sáng phát quang nhẹ bên trong chuông */}
          <pointLight color="#ffe8b5" intensity={1.5} distance={0.3} decay={2} />
        </mesh>

        {/* Cẳng chân trước Trái */}
        <mesh ref={leftLegLimbRef} castShadow>
          <cylinderGeometry args={[1, 1, 1, 12]} />
          <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
        </mesh>

        {/* Cẳng chân trước Phải */}
        <mesh ref={rightLegLimbRef} castShadow>
          <cylinderGeometry args={[1, 1, 1, 12]} />
          <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
        </mesh>

        {/* Cẳng chân sau Trái */}
        <mesh ref={backLeftLegLimbRef} castShadow>
          <cylinderGeometry args={[1, 1, 1, 12]} />
          <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
        </mesh>

        {/* Cẳng chân sau Phải */}
        <mesh ref={backRightLegLimbRef} castShadow>
          <cylinderGeometry args={[1, 1, 1, 12]} />
          <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
        </mesh>

        {/* -------------------- ĐẦU MÈO VÀNG -------------------- */}
        <group ref={headRef} position={[0, 0.4, 0]}>
          {/* Hộp sọ đầu tròn trịa tích hợp morph targets */}
          <mesh ref={headMeshRef} castShadow receiveShadow>
            <primitive object={headGeometry} />
            <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
          </mesh>

          {/* Gò má phúng phính (Cheeks) */}
          <mesh ref={leftCheekRef} position={[-0.22, -0.06, 0.32]}>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
          </mesh>
          <mesh ref={rightCheekRef} position={[0.22, -0.06, 0.32]}>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
          </mesh>

          {/* Cằm (Chin) */}
          <mesh position={[0, -0.15, 0.34]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} />
          </mesh>

          {/* Sọc trán chữ M (Tabby forehead marking) */}
          {size !== 'sm' && (
            <mesh>
              <tubeGeometry args={[foreheadMCurve, 20, 0.008, 8, false]} />
              <meshBasicMaterial color={CAT_COLORS.stripe} />
            </mesh>
          )}

          {/* LÔNG MÀY TRÁI */}
          {size !== 'sm' && (
            <group ref={leftEyebrowRef} position={[-0.2, 0.25, 0.36]}>
              <mesh>
                <tubeGeometry args={[eyebrowCurve, 8, 0.007, 8, false]} />
                <meshBasicMaterial color={CAT_COLORS.eyebrow} />
              </mesh>
            </group>
          )}

          {/* LÔNG MÀY PHẢI */}
          {size !== 'sm' && (
            <group ref={rightEyebrowRef} position={[0.2, 0.25, 0.36]}>
              <mesh>
                <tubeGeometry args={[eyebrowCurve, 8, 0.007, 8, false]} />
                <meshBasicMaterial color={CAT_COLORS.eyebrow} />
              </mesh>
            </group>
          )}

          {/* MŨI MÀU HỒNG ĐÀO */}
          <mesh ref={noseRef} position={[0, 0.04, 0.43]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshToonMaterial color={CAT_COLORS.nose} gradientMap={toonTexture || undefined} onBeforeCompile={handleToonBeforeCompile} />
          </mesh>

          {/* MẮT TRÁI */}
          <group ref={leftEyeRef} position={[-0.2, 0.12, 0.37]}>
            <mesh ref={leftEyeMeshRef}>
              <primitive object={eyeGeometry} />
              <meshToonMaterial color="#ffffff" />
            </mesh>
            {/* Tròng mắt màu đen đặc biệt của Mèo Vàng */}
            <mesh ref={leftPupilRef} position={[0, 0, 0.065]} scale={[1, 1, 0.2]}>
              <sphereGeometry args={[0.065, 16, 16]} />
              <meshToonMaterial ref={leftPupilMatRef} color={CAT_COLORS.eyes} map={textures.eye} />
            </mesh>
            <mesh position={[-0.025, 0.025, 0.095]}>
              <sphereGeometry args={[0.022, 8, 8]} />
              <meshBasicMaterial color={CAT_COLORS.eyesHighlight} />
            </mesh>
            <mesh position={[0.02, -0.02, 0.095]}>
              <sphereGeometry args={[0.01, 8, 8]} />
              <meshBasicMaterial color={CAT_COLORS.eyesHighlight} />
            </mesh>
          </group>

          {/* MẮT PHẢI */}
          <group ref={rightEyeRef} position={[0.2, 0.12, 0.37]}>
            <mesh ref={rightEyeMeshRef}>
              <primitive object={eyeGeometry} />
              <meshToonMaterial color="#ffffff" />
            </mesh>
            <mesh ref={rightPupilRef} position={[0, 0, 0.065]} scale={[1, 1, 0.2]}>
              <sphereGeometry args={[0.065, 16, 16]} />
              <meshToonMaterial ref={rightPupilMatRef} color={CAT_COLORS.eyes} map={textures.eye} />
            </mesh>
            <mesh position={[-0.025, 0.025, 0.095]}>
              <sphereGeometry args={[0.022, 8, 8]} />
              <meshBasicMaterial color={CAT_COLORS.eyesHighlight} />
            </mesh>
            <mesh position={[0.02, -0.02, 0.095]}>
              <sphereGeometry args={[0.01, 8, 8]} />
              <meshBasicMaterial color={CAT_COLORS.eyesHighlight} />
            </mesh>
          </group>

          {/* Mí mắt nhắm cong cong đáng yêu (Chỉ hiện khi ngủ) */}
          <mesh ref={leftEyelidClosedRef} position={[-0.2, 0.1, 0.43]} rotation={[0, 0, -0.1]} scale={[0.15, 0.03, 0.02]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={CAT_COLORS.eyes} />
          </mesh>
          <mesh ref={rightEyelidClosedRef} position={[0.2, 0.1, 0.43]} rotation={[0, 0, 0.1]} scale={[0.15, 0.03, 0.02]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={CAT_COLORS.eyes} />
          </mesh>

          {/* TAI TRÁI */}
          <group ref={leftEarRef} position={[-0.32, 0.32, 0.05]} rotation={[0, 0.1, 0.15]}>
            <mesh>
              <sphereGeometry args={[0.12, 16, 8]} />
              <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
            </mesh>
            <mesh castShadow position={[0, 0.05, 0]}>
              <coneGeometry args={[0.15, 0.35, 16]} />
              <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
            </mesh>
            <mesh position={[0, 0.03, 0.035]} rotation={[0.08, 0, 0]} scale={[0.75, 0.8, 0.3]}>
              <coneGeometry args={[0.12, 0.28, 16]} />
              <meshToonMaterial color={CAT_COLORS.innerEar} gradientMap={toonTexture || undefined} map={textures.fur} />
            </mesh>
          </group>

          {/* TAI PHẢI */}
          <group ref={rightEarRef} position={[0.32, 0.32, 0.05]} rotation={[0, -0.1, -0.15]}>
            <mesh>
              <sphereGeometry args={[0.12, 16, 8]} />
              <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
            </mesh>
            <mesh castShadow position={[0, 0.05, 0]}>
              <coneGeometry args={[0.15, 0.35, 16]} />
              <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
            </mesh>
            <mesh position={[0, 0.03, 0.035]} rotation={[0.08, 0, 0]} scale={[0.75, 0.8, 0.3]}>
              <coneGeometry args={[0.12, 0.28, 16]} />
              <meshToonMaterial color={CAT_COLORS.innerEar} gradientMap={toonTexture || undefined} map={textures.fur} />
            </mesh>
          </group>

          {/* RIA MÈO (Whiskers - 6 râu uốn cong) */}
          <group ref={whiskersRef} position={[0, -0.02, 0.35]}>
            {leftWhiskerCurves.map((curve, idx) => (
              <mesh key={`l-${idx}`}>
                <tubeGeometry args={[curve, 10, 0.008, 8, false]} />
                <meshBasicMaterial color={CAT_COLORS.eyes} />
              </mesh>
            ))}
            {rightWhiskerCurves.map((curve, idx) => (
              <mesh key={`r-${idx}`}>
                <tubeGeometry args={[curve, 10, 0.008, 8, false]} />
                <meshBasicMaterial color={CAT_COLORS.eyes} />
              </mesh>
            ))}
          </group>

          {/* KHÓE MIỆNG W-shape mượt mà */}
          <group position={[0, -0.03, 0.425]}>
            <mesh>
              <tubeGeometry args={[leftMouthCurve, 12, 0.008, 8, false]} />
              <meshBasicMaterial color={CAT_COLORS.eyes} />
            </mesh>
            <mesh>
              <tubeGeometry args={[rightMouthCurve, 12, 0.008, 8, false]} />
              <meshBasicMaterial color={CAT_COLORS.eyes} />
            </mesh>
          </group>

          {/* Miệng mở khi happy / surprised */}
          <mesh ref={mouthOpenRef} position={[0, -0.04, 0.422]} scale={[0, 0, 0]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshToonMaterial color={CAT_COLORS.mouthInner} gradientMap={toonTexture || undefined} />
          </mesh>

          {/* MŨ PHÙ THỦY MINI ĐÁNG YÊU */}
          {size !== 'sm' && (
            <group position={[0, 0.42, -0.05]} rotation={[0.12, 0, -0.15]}>
              <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.18, 0.02, 12, 24]} />
                <meshToonMaterial color={CAT_COLORS.mysticPurple} gradientMap={toonTexture || undefined} onBeforeCompile={handleToonBeforeCompile} />
              </mesh>
              <mesh castShadow position={[0, 0.12, -0.02]} rotation={[-0.15, 0, 0]}>
                <coneGeometry args={[0.14, 0.3, 16]} />
                <meshToonMaterial color={CAT_COLORS.mysticPurple} gradientMap={toonTexture || undefined} onBeforeCompile={handleToonBeforeCompile} />
              </mesh>
              <mesh position={[0, 0.03, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.145, 0.015, 8, 24]} />
                <meshToonMaterial color={CAT_COLORS.stripe} gradientMap={toonTexture || undefined} />
              </mesh>
              <mesh position={[0, 0.03, 0.14]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshBasicMaterial color={CAT_COLORS.bell} />
              </mesh>
            </group>
          )}
        </group>

        {/* -------------------- BỐN CHÂN XINH XẮN -------------------- */}
        <mesh ref={leftPawRef} position={[-0.2, -0.5, 0.45]} castShadow>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
          {showPawPads && (
            <group position={[0, -0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh position={[0, 0, 0.001]}>
                <circleGeometry args={[0.045, 8]} />
                <meshBasicMaterial color={CAT_COLORS.pawPad} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[-0.03, 0.03, 0.001]}>
                <circleGeometry args={[0.015, 8]} />
                <meshBasicMaterial color={CAT_COLORS.pawPad} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, 0.042, 0.001]}>
                <circleGeometry args={[0.015, 8]} />
                <meshBasicMaterial color={CAT_COLORS.pawPad} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0.03, 0.03, 0.001]}>
                <circleGeometry args={[0.015, 8]} />
                <meshBasicMaterial color={CAT_COLORS.pawPad} side={THREE.DoubleSide} />
              </mesh>
            </group>
          )}
        </mesh>
        
        <mesh ref={rightPawRef} position={[0.2, -0.5, 0.45]} castShadow>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
          {showPawPads && (
            <group position={[0, -0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh position={[0, 0, 0.001]}>
                <circleGeometry args={[0.045, 8]} />
                <meshBasicMaterial color={CAT_COLORS.pawPad} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[-0.03, 0.03, 0.001]}>
                <circleGeometry args={[0.015, 8]} />
                <meshBasicMaterial color={CAT_COLORS.pawPad} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, 0.042, 0.001]}>
                <circleGeometry args={[0.015, 8]} />
                <meshBasicMaterial color={CAT_COLORS.pawPad} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0.03, 0.03, 0.001]}>
                <circleGeometry args={[0.015, 8]} />
                <meshBasicMaterial color={CAT_COLORS.pawPad} side={THREE.DoubleSide} />
              </mesh>
            </group>
          )}
        </mesh>

        <mesh ref={backLeftPawRef} position={[-0.32, -0.5, -0.22]} castShadow>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
          {showPawPads && (
            <group position={[0, -0.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh position={[0, 0, 0.001]}>
                <circleGeometry args={[0.055, 8]} />
                <meshBasicMaterial color={CAT_COLORS.pawPad} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[-0.035, 0.035, 0.001]}>
                <circleGeometry args={[0.018, 8]} />
                <meshBasicMaterial color={CAT_COLORS.pawPad} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, 0.05, 0.001]}>
                <circleGeometry args={[0.018, 8]} />
                <meshBasicMaterial color={CAT_COLORS.pawPad} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0.035, 0.035, 0.001]}>
                <circleGeometry args={[0.018, 8]} />
                <meshBasicMaterial color={CAT_COLORS.pawPad} side={THREE.DoubleSide} />
              </mesh>
            </group>
          )}
        </mesh>

        <mesh ref={backRightPawRef} position={[0.32, -0.5, -0.22]} castShadow>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
          {showPawPads && (
            <group position={[0, -0.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh position={[0, 0, 0.001]}>
                <circleGeometry args={[0.055, 8]} />
                <meshBasicMaterial color={CAT_COLORS.pawPad} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[-0.035, 0.035, 0.001]}>
                <circleGeometry args={[0.018, 8]} />
                <meshBasicMaterial color={CAT_COLORS.pawPad} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, 0.05, 0.001]}>
                <circleGeometry args={[0.018, 8]} />
                <meshBasicMaterial color={CAT_COLORS.pawPad} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0.035, 0.035, 0.001]}>
                <circleGeometry args={[0.018, 8]} />
                <meshBasicMaterial color={CAT_COLORS.pawPad} side={THREE.DoubleSide} />
              </mesh>
            </group>
          )}
        </mesh>

        {/* -------------------- ĐUÔI VẬT LÝ VERLET (4 khớp) -------------------- */}
        <group ref={tailBaseRef} position={[0, -0.3, -0.45]}>
          <mesh castShadow>
            <sphereGeometry args={[0.065, 12, 12]} />
            <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
          </mesh>

          {/* Đuôi phân đoạn 1 */}
          <group ref={tailSeg1Ref} position={[0, 0, 0.18]}>
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.055, 0.065, 0.2, 8]} />
              <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
            </mesh>

            {/* Đuôi phân đoạn 2 */}
            <group ref={tailSeg2Ref} position={[0, 0, 0.18]}>
              <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.045, 0.055, 0.22, 8]} />
                <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} onBeforeCompile={handleToonBeforeCompile} />
              </mesh>

              {/* Đuôi phân đoạn 3 */}
              <group ref={tailSeg3Ref} position={[0, 0, 0.18]}>
                <mesh castShadow>
                  <sphereGeometry args={[0.048, 12, 12]} />
                  <meshToonMaterial color={CAT_COLORS.belly} gradientMap={toonTexture || undefined} map={textures.fur} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
