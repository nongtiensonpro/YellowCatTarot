import * as THREE from 'three';

// Tạo texture gradient cho MeshToonMaterial để có hiệu ứng Cel-shading hoạt hình
export function createToonGradientTexture(steps: number = 5) {
  if (typeof window === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = steps;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Tạo mảng màu xám phân bậc để tạo bóng sắc nét kiểu toon shading
    for (let i = 0; i < steps; i++) {
      const val = Math.floor((i / (steps - 1)) * 255);
      ctx.fillStyle = `rgb(${val},${val},${val})`;
      ctx.fillRect(i, 0, 1, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

// Bảng màu Mèo Vàng (phong cách Ghibli ấm áp)
export const CAT_COLORS = {
  body: '#f4a261',      // Vàng cam ấm
  belly: '#ffd166',     // Vàng nhạt ấm
  innerEar: '#e76f51',  // Hồng cam đào
  nose: '#e76f51',       // Hồng đào
  eyes: '#090916',      // Xanh đen thẫm gần đen
  eyesHighlight: '#ffffff', // Trắng tinh khôi
  collar: '#e76f51',    // Vòng cổ đỏ cam
  bell: '#ffd166',      // Chuông vàng sáng
  mysticPurple: '#9b5de5', // Màu tím huyền thuật
  mysticGold: '#f7c59f', // Màu hào quang lấp lánh
  stripe: '#c47832',     // Sọc vằn cam đậm
  pawPad: '#e8a4a4',     // Đệm chân hồng nhạt
  mouthInner: '#c44040', // Miệng bên trong đỏ sẫm
  eyebrow: '#8a5a2e',    // Lông mày nâu nhạt
  chestFluff: '#ffe0a0', // Lông ngực kem sáng
};
