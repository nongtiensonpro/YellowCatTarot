import * as THREE from 'three';

/**
 * Thêm morph targets cho hình học hộp sọ đầu (Head skull)
 * - Target 0: cheekPuff (Phồng gò má thở)
 * - Target 1: browFurrow (Nhíu lông mày bói toán)
 */
export function addHeadMorphTargets(geometry: THREE.BufferGeometry) {
  const positionAttr = geometry.attributes.position;
  const count = positionAttr.count;
  
  const cheekPuffPositions = new Float32Array(count * 3);
  const browFurrowPositions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const x = positionAttr.getX(i);
    const y = positionAttr.getY(i);
    const z = positionAttr.getZ(i);
    
    // Cheek puff: Làm phồng má ra hai bên ở khu vực mặt trước bên dưới (y < 0, |x| > 0.2, mặt trước z > 0)
    if (y < 0.0 && Math.abs(x) > 0.15 && z > 0.1) {
      cheekPuffPositions[i * 3] = x * 1.15;
      cheekPuffPositions[i * 3 + 1] = y * 1.05;
      cheekPuffPositions[i * 3 + 2] = z * 1.15;
    } else {
      cheekPuffPositions[i * 3] = x;
      cheekPuffPositions[i * 3 + 1] = y;
      cheekPuffPositions[i * 3 + 2] = z;
    }

    // Brow furrow: Kéo sát lông mày vào tâm và hơi hạ xuống (y > 0.15, trán trước z > 0.2)
    if (y > 0.15 && z > 0.2) {
      browFurrowPositions[i * 3] = x * 0.82;      // Co vào giữa
      browFurrowPositions[i * 3 + 1] = y - 0.035; // Hơi hạ xuống
      browFurrowPositions[i * 3 + 2] = z;
    } else {
      browFurrowPositions[i * 3] = x;
      browFurrowPositions[i * 3 + 1] = y;
      browFurrowPositions[i * 3 + 2] = z;
    }
  }
  
  geometry.morphAttributes.position = [];
  geometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute(cheekPuffPositions, 3);
  geometry.morphAttributes.position[1] = new THREE.Float32BufferAttribute(browFurrowPositions, 3);
  
  geometry.morphTargetsRelative = false;
}

/**
 * Thêm morph targets cho hình học mắt (Eye ball)
 * - Target 0: eyeSmile (Mắt híp cười hình trăng khuyết)
 * - Target 1: eyeWide (Mắt mở to kinh ngạc)
 */
export function addEyeMorphTargets(geometry: THREE.BufferGeometry) {
  const positionAttr = geometry.attributes.position;
  const count = positionAttr.count;
  
  const eyeSmilePositions = new Float32Array(count * 3);
  const eyeWidePositions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const x = positionAttr.getX(i);
    const y = positionAttr.getY(i);
    const z = positionAttr.getZ(i);
    
    // eyeSmile: Nén nửa dưới của mắt dẹt lại để tạo hình mắt híp ⌒
    if (y < 0.0) {
      eyeSmilePositions[i * 3] = x;
      eyeSmilePositions[i * 3 + 1] = y * 0.15; // Nén phẳng đáy
      eyeSmilePositions[i * 3 + 2] = z;
    } else {
      eyeSmilePositions[i * 3] = x;
      eyeSmilePositions[i * 3 + 1] = y * 1.1;  // Nhô đỉnh lên một tí
      eyeSmilePositions[i * 3 + 2] = z;
    }
    
    // eyeWide: Giãn nở nhãn cầu to ra
    eyeWidePositions[i * 3] = x * 1.25;
    eyeWidePositions[i * 3 + 1] = y * 1.25;
    eyeWidePositions[i * 3 + 2] = z;
  }
  
  geometry.morphAttributes.position = [];
  geometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute(eyeSmilePositions, 3);
  geometry.morphAttributes.position[1] = new THREE.Float32BufferAttribute(eyeWidePositions, 3);
  
  geometry.morphTargetsRelative = false;
}
