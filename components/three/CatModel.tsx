'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { CAT_COLORS, createToonGradientTexture } from './materials';

interface CatModelProps {
  state: 'idle' | 'reading' | 'sleeping' | 'surprised' | 'happy' | 'shuffle';
  drawnCardsCount?: number;
}

export function CatModel({ state: propState, drawnCardsCount = 0 }: CatModelProps) {
  const { size } = useThree();
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

  // Vòng cổ & chuông
  const collarRef = useRef<THREE.Mesh>(null);
  const bellRef = useRef<THREE.Mesh>(null);

  // Râu mèo (Whiskers)
  const whiskersRef = useRef<THREE.Group>(null);

  // Toon shading gradient texture
  const [toonTexture, setToonTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const tex = createToonGradientTexture(3);
    if (tex) setToonTexture(tex);
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

    // 1. Quản lý đồng hồ phản ứng (Reaction Timer)
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

    // 2. Tính toán mục tiêu (Targets) dựa trên activeState hiện tại
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

        // Nhìn theo con trỏ chuột của người dùng (Eye/Head tracking)
        // threeState.pointer.x và y chạy từ -1 đến 1 thể hiện vị trí chuột trong khung Canvas
        const mouseX = threeState.pointer.x;
        const mouseY = threeState.pointer.y;

        target.headX = 0;
        target.headY = 0.4;
        target.headZ = 0;
        target.headRotX = THREE.MathUtils.clamp(-mouseY * 0.25, -0.2, 0.2); // Nghiêng đầu lên/xuống
        target.headRotY = THREE.MathUtils.clamp(mouseX * 0.35, -0.4, 0.4); // Xoay đầu qua lại theo chuột
        target.headRotZ = THREE.MathUtils.clamp(mouseX * 0.1, -0.15, 0.15); // Nghiêng nhẹ đầu cute

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

      // B. Rung tai ngẫu nhiên (Ear twitches)
      earTwitchTimer.current -= dt;
      if (earTwitchTimer.current <= 0 && !leftEarTwitchActive.current && !rightEarTwitchActive.current) {
        if (Math.random() > 0.5) {
          leftEarTwitchActive.current = true;
        } else {
          rightEarTwitchActive.current = true;
        }
        earTwitchTimer.current = earTwitchDuration.current;
      }

      if (leftEarTwitchActive.current) {
        earTwitchTimer.current -= dt;
        target.leftEarRotZ = -0.35; // Rung tai trái
        if (earTwitchTimer.current <= 0) {
          leftEarTwitchActive.current = false;
          earTwitchTimer.current = Math.random() * 5 + 4; // Lên lịch rung tai tiếp theo
        }
      }

      if (rightEarTwitchActive.current) {
        earTwitchTimer.current -= dt;
        target.rightEarRotZ = 0.35; // Rung tai phải
        if (earTwitchTimer.current <= 0) {
          rightEarTwitchActive.current = false;
          earTwitchTimer.current = Math.random() * 5 + 4;
        }
      }
    }

    // C. Nhịp thở tự nhiên (Natural breathing scale oscillation)
    // Sẽ nhân bản nhịp thở nhẹ vào xương/body scale
    const breathRate = activeState === 'sleeping' ? 1.4 : 2.6;
    const breathAmp = activeState === 'sleeping' ? 0.022 : 0.012;
    const breathScale = 1.0 + Math.sin(time * breathRate) * breathAmp;

    // 4. Áp dụng LERP (Linear Interpolation) để chuyển đổi mượt mà các biến số
    const lerpSpeed = activeState === 'surprised' ? 18 * dt : 5.8 * dt; // Bất ngờ thì giật mình rất nhanh, các trạng thái khác mượt mà
    const fastLerpSpeed = 15 * dt;

    if (bodyRef.current) {
      bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, target.posY, lerpSpeed);
      bodyRef.current.position.z = THREE.MathUtils.lerp(bodyRef.current.position.z, target.posZ, lerpSpeed);
      bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, target.rotX, lerpSpeed);
      bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, target.rotY, lerpSpeed);
      bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, target.rotZ, lerpSpeed);
      
      // Co giãn nhẹ theo nhịp thở
      bodyRef.current.scale.set(1, breathScale, 1);
    }

    if (headRef.current) {
      headRef.current.position.y = THREE.MathUtils.lerp(headRef.current.position.y, target.headY, lerpSpeed);
      headRef.current.position.z = THREE.MathUtils.lerp(headRef.current.position.z, target.headZ, lerpSpeed);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, target.headRotX, lerpSpeed);
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, target.headRotY, lerpSpeed);
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, target.headRotZ, lerpSpeed);
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

    // 5. Uốn lượn khớp đuôi (Multi-segment Tail wave propagation)
    if (tailBaseRef.current && tailSeg1Ref.current && tailSeg2Ref.current && tailSeg3Ref.current) {
      // Hướng quay mục tiêu của khớp gốc đuôi
      tailBaseRef.current.rotation.y = THREE.MathUtils.lerp(tailBaseRef.current.rotation.y, target.tailBaseRotY, lerpSpeed);
      tailBaseRef.current.rotation.x = THREE.MathUtils.lerp(tailBaseRef.current.rotation.x, target.tailBaseRotX, lerpSpeed);
      tailBaseRef.current.rotation.z = THREE.MathUtils.lerp(tailBaseRef.current.rotation.z, target.tailBaseRotZ, lerpSpeed);

      // Tạo hiệu ứng sóng lan truyền chạy dần từ gốc đến ngọn đuôi
      const tailWaveSpeed = activeState === 'happy' ? 14 : (activeState === 'shuffle' ? 8 : 2.5);
      const tailWaveAmp = activeState === 'happy' ? 0.35 : (activeState === 'sleeping' ? 0.05 : 0.12);
      
      // Xoay nhẹ các khớp nối tiếp nhau theo hàm lượng giác có độ lệch pha (lag)
      tailSeg1Ref.current.rotation.y = Math.sin(time * tailWaveSpeed - 0.7) * tailWaveAmp;
      tailSeg1Ref.current.rotation.z = Math.cos(time * tailWaveSpeed * 0.5 - 0.7) * 0.04;

      tailSeg2Ref.current.rotation.y = Math.sin(time * tailWaveSpeed - 1.4) * tailWaveAmp * 1.1;
      tailSeg2Ref.current.rotation.z = Math.cos(time * tailWaveSpeed * 0.5 - 1.4) * 0.05;

      tailSeg3Ref.current.rotation.y = Math.sin(time * tailWaveSpeed - 2.1) * tailWaveAmp * 1.3;
      tailSeg3Ref.current.rotation.z = Math.cos(time * tailWaveSpeed * 0.5 - 2.1) * 0.06;
    }
  });

  return (
    <group ref={catGroupRef} position={[0, -0.15, 0]}>
      {/* Khối Đáy xoay mèo hướng về trước camera nhẹ nhàng */}
      
      {/* -------------------- THÂN MÈO VÀNG -------------------- */}
      <group ref={bodyRef}>
        {/* Thân chính (Mập mạp đáng yêu) */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} />
        </mesh>

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
        </mesh>

        {/* -------------------- ĐẦU MÈO VÀNG -------------------- */}
        <group ref={headRef} position={[0, 0.4, 0]}>
          {/* Hộp sọ đầu tròn trịa */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.46, 32, 32]} />
            <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} />
          </mesh>

          {/* MŨI MÀU HỒNG ĐÀO */}
          <mesh ref={noseRef} position={[0, 0.04, 0.43]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshToonMaterial color={CAT_COLORS.nose} gradientMap={toonTexture || undefined} />
          </mesh>

          {/* MẮT TRÁI */}
          <group ref={leftEyeRef} position={[-0.2, 0.12, 0.37]}>
            {/* Nhãn cầu trắng to */}
            <mesh>
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshToonMaterial color="#ffffff" />
            </mesh>
            {/* Tròng mắt màu đen đặc biệt của Mèo Vàng */}
            <mesh ref={leftPupilRef} position={[0, 0, 0.065]} scale={[1, 1, 0.2]}>
              <sphereGeometry args={[0.065, 16, 16]} />
              <meshToonMaterial color={CAT_COLORS.eyes} map={textures.eye} />
            </mesh>
            {/* Highlight lấp lánh màu trắng trên mắt */}
            <mesh position={[-0.025, 0.025, 0.095]}>
              <sphereGeometry args={[0.022, 8, 8]} />
              <meshBasicMaterial color={CAT_COLORS.eyesHighlight} />
            </mesh>
            {/* Điểm highlight phụ bé xíu ở dưới tạo chiều sâu linh hồn */}
            <mesh position={[0.02, -0.02, 0.095]}>
              <sphereGeometry args={[0.01, 8, 8]} />
              <meshBasicMaterial color={CAT_COLORS.eyesHighlight} />
            </mesh>
          </group>

          {/* MẮT PHẢI */}
          <group ref={rightEyeRef} position={[0.2, 0.12, 0.37]}>
            <mesh>
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshToonMaterial color="#ffffff" />
            </mesh>
            <mesh ref={rightPupilRef} position={[0, 0, 0.065]} scale={[1, 1, 0.2]}>
              <sphereGeometry args={[0.065, 16, 16]} />
              <meshToonMaterial color={CAT_COLORS.eyes} map={textures.eye} />
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
            {/* Vành tai ngoài màu vàng */}
            <mesh castShadow>
              <coneGeometry args={[0.15, 0.35, 4]} />
              <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} />
            </mesh>
            {/* Lòng trong tai màu hồng đào dễ thương */}
            <mesh position={[0, -0.02, 0.035]} rotation={[0.08, 0, 0]} scale={[0.75, 0.8, 0.3]}>
              <coneGeometry args={[0.12, 0.28, 4]} />
              <meshToonMaterial color={CAT_COLORS.innerEar} gradientMap={toonTexture || undefined} map={textures.fur} />
            </mesh>
          </group>

          {/* TAI PHẢI */}
          <group ref={rightEarRef} position={[0.32, 0.32, 0.05]} rotation={[0, -0.1, -0.15]}>
            <mesh castShadow>
              <coneGeometry args={[0.15, 0.35, 4]} />
              <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} />
            </mesh>
            {/* Lòng trong tai màu hồng đào dễ thương */}
            <mesh position={[0, -0.02, 0.035]} rotation={[0.08, 0, 0]} scale={[0.75, 0.8, 0.3]}>
              <coneGeometry args={[0.12, 0.28, 4]} />
              <meshToonMaterial color={CAT_COLORS.innerEar} gradientMap={toonTexture || undefined} map={textures.fur} />
            </mesh>
          </group>

          {/* RIA MÈO (Whiskers - 6 râu mỏng siêu mảnh) */}
          <group ref={whiskersRef} position={[0, -0.02, 0.35]}>
            {/* Ria bên trái */}
            <mesh position={[-0.35, 0.04, 0]} rotation={[0, 0.15, 0.1]} scale={[0.25, 0.012, 0.012]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color={CAT_COLORS.eyes} />
            </mesh>
            <mesh position={[-0.37, 0.0, 0]} rotation={[0, 0.15, 0.0]} scale={[0.27, 0.012, 0.012]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color={CAT_COLORS.eyes} />
            </mesh>
            <mesh position={[-0.35, -0.04, 0]} rotation={[0, 0.15, -0.1]} scale={[0.25, 0.012, 0.012]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color={CAT_COLORS.eyes} />
            </mesh>

            {/* Ria bên phải */}
            <mesh position={[0.35, 0.04, 0]} rotation={[0, -0.15, -0.1]} scale={[0.25, 0.012, 0.012]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color={CAT_COLORS.eyes} />
            </mesh>
            <mesh position={[0.37, 0.0, 0]} rotation={[0, -0.15, 0.0]} scale={[0.27, 0.012, 0.012]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color={CAT_COLORS.eyes} />
            </mesh>
            <mesh position={[0.35, -0.04, 0]} rotation={[0, -0.15, 0.1]} scale={[0.25, 0.012, 0.012]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color={CAT_COLORS.eyes} />
            </mesh>
          </group>

          {/* KHÓE MIỆNG W-shape cực cưng */}
          <group position={[0, -0.03, 0.425]}>
            <mesh position={[-0.038, 0, 0]} rotation={[0, 0, -0.3]} scale={[0.07, 0.015, 0.01]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color={CAT_COLORS.eyes} />
            </mesh>
            <mesh position={[0.038, 0, 0]} rotation={[0, 0, 0.3]} scale={[0.07, 0.015, 0.01]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color={CAT_COLORS.eyes} />
            </mesh>
          </group>
        </group>

        {/* -------------------- BỐN CHÂN XINH XẮN -------------------- */}
        {/* Chân trước Trái */}
        <mesh ref={leftPawRef} position={[-0.2, -0.5, 0.45]} castShadow>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} />
        </mesh>
        
        {/* Chân trước Phải */}
        <mesh ref={rightPawRef} position={[0.2, -0.5, 0.45]} castShadow>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} />
        </mesh>

        {/* Chân sau Trái */}
        <mesh ref={backLeftPawRef} position={[-0.32, -0.5, -0.22]} castShadow>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} />
        </mesh>

        {/* Chân sau Phải */}
        <mesh ref={backRightPawRef} position={[0.32, -0.5, -0.22]} castShadow>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} />
        </mesh>

        {/* -------------------- ĐUÔI UỐN LƯỢN (4 khớp) -------------------- */}
        {/* Gốc đuôi nối sau mông */}
        <group ref={tailBaseRef} position={[0, -0.3, -0.45]} rotation={[-0.2, 0, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.065, 12, 12]} />
            <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} />
          </mesh>

          {/* Đuôi phân đoạn 1 */}
          <group ref={tailSeg1Ref} position={[0, 0.1, -0.05]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.055, 0.065, 0.2, 8]} />
              <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} />
            </mesh>

            {/* Đuôi phân đoạn 2 */}
            <group ref={tailSeg2Ref} position={[0, 0.18, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.045, 0.055, 0.22, 8]} />
                <meshToonMaterial color={CAT_COLORS.body} gradientMap={toonTexture || undefined} map={textures.fur} />
              </mesh>

              {/* Đuôi phân đoạn 3 (Đầu đuôi nhọn có chỏm màu đậm hoặc nhạt) */}
              <group ref={tailSeg3Ref} position={[0, 0.2, 0]}>
                <mesh castShadow>
                  <sphereGeometry args={[0.048, 12, 12]} />
                  {/* Sử dụng màu belly ở chỏm đuôi cho dễ thương */}
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
