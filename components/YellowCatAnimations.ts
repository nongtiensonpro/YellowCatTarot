import { Variants } from 'framer-motion';

// Cấu hình các hiệu ứng chuyển động của Mèo Vàng
export const bodyVariants: Variants = {
  idle: {
    scaleY: [1, 1.03, 1],
    scaleX: [1, 0.98, 1],
    y: 0,
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  reading: {
    scaleY: [1, 1.01, 1],
    scaleX: [1, 0.99, 1],
    y: 0,
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  sleeping: {
    scaleY: [1, 0.95, 1],
    scaleX: [1, 1.03, 1],
    y: 8,
    transition: {
      duration: 4.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  surprised: {
    scaleY: [1, 0.8, 1.15, 0.95, 1],
    scaleX: [1, 1.15, 0.9, 1.03, 1],
    y: [0, 5, -25, 2, 0],
    transition: {
      duration: 0.8,
      times: [0, 0.15, 0.45, 0.75, 1],
      ease: "easeOut"
    }
  },
  happy: {
    scaleY: [1, 1.08, 0.95, 1.05, 1],
    scaleX: [1, 0.93, 1.05, 0.97, 1],
    y: [0, -10, 2, -5, 0],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      repeatDelay: 0.2,
      ease: "easeInOut"
    }
  },
  shuffle: {
    scaleY: [1, 1.02, 1],
    scaleX: [1, 0.98, 1],
    y: [0, -3, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  // ── 6 TRẠNG THÁI CẢM XÚC MỚI (HOÀNG KIM) ──
  curious: {
    scaleY: 1.02,
    scaleX: 0.98,
    y: -2,
    transition: { duration: 0.5 }
  },
  mischievous: {
    scaleY: [1, 0.97, 1],
    scaleX: [1, 1.03, 1],
    y: 0,
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  solemn: {
    scaleY: 0.96,
    scaleX: 1.02,
    y: 5,
    transition: { duration: 0.6 }
  },
  contemplative: {
    scaleY: 0.98,
    scaleX: 1.01,
    y: 3,
    transition: { duration: 0.5 }
  },
  drowsy: {
    scaleY: [1, 0.94, 1],
    scaleX: [1, 1.04, 1],
    y: [0, 6, 0],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
  },
  focused: {
    scaleY: 1.01,
    scaleX: 0.99,
    y: 0,
    transition: { duration: 0.5 }
  },
  stroked: {
    scaleY: [1, 1.04, 1],
    scaleX: [1, 0.96, 1],
    y: 0,
    transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
  },
  poked: {
    scaleY: [1, 0.72, 1.06, 0.98, 1],
    scaleX: [1, 1.28, 0.94, 1.02, 1],
    y: [0, 16, -4, 1, 0],
    transition: { duration: 0.8, ease: "easeInOut" }
  },
  'hat-dropped': {
    scaleY: [1, 0.9, 1.1, 0.98, 1],
    scaleX: [1, 1.1, 0.9, 1.02, 1],
    y: [0, 6, -10, 2, 0],
    transition: { duration: 0.8, ease: "easeInOut" }
  }
};

export const headVariants: Variants = {
  idle: {
    y: [0, -2, 0],
    rotate: [0, 0.5, -0.5, 0],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  reading: {
    y: [0, -1, 0],
    rotate: 2,
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  sleeping: {
    y: [8, 11, 8],
    rotate: [-1, -2, -1],
    transition: {
      duration: 4.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  surprised: {
    y: [0, 3, -15, 1, 0],
    rotate: [0, -5, 8, -2, 0],
    transition: {
      duration: 0.8,
      times: [0, 0.15, 0.45, 0.75, 1],
      ease: "easeOut"
    }
  },
  happy: {
    y: [0, -6, 1, -3, 0],
    rotate: [0, 3, -3, 2, 0],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      repeatDelay: 0.2,
      ease: "easeInOut"
    }
  },
  shuffle: {
    y: [0, -2, 0],
    rotate: [0, 1.5, -1.5, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  // ── 6 TRẠNG THÁI CẢM XÚC MỚI (HOÀNG KIM) ──
  curious: {
    y: -2,
    rotate: 12, // Nghiêng đầu tò mò rất Ghibli
    transition: { type: "spring", stiffness: 120, damping: 12 }
  },
  mischievous: {
    y: -1,
    rotate: -6,
    transition: { duration: 0.5 }
  },
  solemn: {
    y: 6,
    rotate: 0,
    transition: { duration: 0.6 }
  },
  contemplative: {
    y: 4,
    rotate: -4,
    transition: { duration: 0.5 }
  },
  drowsy: {
    y: [3, 7, 3],
    rotate: [-1, -2.5, -1],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
  },
  focused: {
    y: 1,
    rotate: -3,
    transition: { duration: 0.5 }
  },
  stroked: {
    y: 4,
    rotate: 2,
    transition: { duration: 0.5 }
  },
  poked: {
    y: [0, 10, -2, 0],
    rotate: [0, -6, 2, 0],
    transition: { duration: 0.8 }
  },
  'hat-dropped': {
    y: [0, 4, -8, 0],
    rotate: [0, -4, 4, 0],
    transition: { duration: 0.8 }
  }
};

export const hatVariants: Variants = {
  idle: {
    rotate: [0, 1, -1, 0],
    y: [0, -0.5, 0],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  reading: {
    rotate: [1, 2, 1],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  },
  sleeping: {
    rotate: -4,
    y: 2,
    transition: { duration: 0.5 }
  },
  surprised: {
    rotate: [0, -15, 20, -5, 0],
    y: [0, 2, -8, 0, 0],
    transition: { duration: 0.8 }
  },
  happy: {
    rotate: [0, 5, -5, 5, 0],
    y: [0, -2, 0, -1, 0],
    transition: { duration: 1.2, repeat: Infinity }
  },
  shuffle: {
    rotate: [0, 3, -3, 0],
    transition: { duration: 0.6, repeat: Infinity }
  },
  // ── 6 TRẠNG THÁI CẢM XÚC MỚI (HOÀNG KIM) ──
  curious: {
    rotate: 8,
    y: -0.5,
    transition: { duration: 0.5 }
  },
  mischievous: {
    rotate: -8,
    y: -0.5,
    transition: { duration: 0.5 }
  },
  solemn: {
    rotate: 0,
    y: 2,
    transition: { duration: 0.6 }
  },
  contemplative: {
    rotate: -3,
    y: 1,
    transition: { duration: 0.5 }
  },
  drowsy: {
    rotate: -3,
    y: [1, 2.5, 1],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
  },
  focused: {
    rotate: -2,
    y: 0.5,
    transition: { duration: 0.5 }
  },
  stroked: {
    y: 4,
    rotate: 2,
    transition: { duration: 0.5 }
  },
  poked: {
    y: [0, 10, -2, 0],
    rotate: [0, -6, 2, 0],
    transition: { duration: 0.8 }
  },
  'hat-dropped': {
    y: [0, 15, 34, 34],
    x: [0, 5, 20, 20],
    rotate: [0, -10, 24, 24],
    transition: { duration: 1.2, times: [0, 0.3, 0.7, 1], ease: "easeOut" }
  }
};

export const earLeftVariants: Variants = {
  idle: {
    rotate: [0, -3, 0, 0, 2, 0, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      times: [0, 0.1, 0.2, 0.6, 0.7, 0.8, 1],
      ease: "easeInOut"
    }
  },
  reading: {
    rotate: -2,
    transition: { duration: 0.5 }
  },
  sleeping: {
    rotate: -12,
    y: 3,
    x: -1,
    transition: { duration: 0.8 }
  },
  surprised: {
    rotate: [0, -15, 10, 0],
    y: [0, -3, 0],
    transition: { duration: 0.4 }
  },
  happy: {
    rotate: [0, 5, -5, 0],
    transition: { duration: 0.6, repeat: Infinity, repeatDelay: 0.4 }
  },
  shuffle: {
    rotate: [0, -4, 4, 0],
    transition: { duration: 0.6, repeat: Infinity }
  },
  // ── 6 TRẠNG THÁI CẢM XÚC MỚI (HOÀNG KIM) ──
  curious: {
    rotate: 16, // Vểnh tai trái lên cao tò mò
    transition: { type: "spring", stiffness: 150, damping: 10 }
  },
  mischievous: {
    rotate: -10,
    transition: { duration: 0.5 }
  },
  solemn: {
    rotate: -8,
    y: 2,
    transition: { duration: 0.6 }
  },
  contemplative: {
    rotate: -4,
    y: 1,
    transition: { duration: 0.5 }
  },
  drowsy: {
    rotate: -10,
    y: 2,
    transition: { duration: 0.8 }
  },
  focused: {
    rotate: 12,
    transition: { duration: 0.5 }
  },
  stroked: {
    rotate: -22,
    y: 3,
    transition: { duration: 0.5 }
  },
  poked: {
    rotate: [-8, -25, -6, -8],
    y: [0, 4, 0, 0],
    transition: { duration: 0.8 }
  },
  'hat-dropped': {
    rotate: [-8, -20, 10, -8],
    y: [0, 3, -2, 0],
    transition: { duration: 0.8 }
  }
};

export const earRightVariants: Variants = {
  idle: {
    rotate: [0, 0, 3, 0, 0, -2, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      times: [0, 0.3, 0.4, 0.5, 0.8, 0.9, 1],
      ease: "easeInOut"
    }
  },
  reading: {
    rotate: 2,
    transition: { duration: 0.5 }
  },
  sleeping: {
    rotate: 12,
    y: 3,
    x: 1,
    transition: { duration: 0.8 }
  },
  surprised: {
    rotate: [0, 15, -10, 0],
    y: [0, -3, 0],
    transition: { duration: 0.4 }
  },
  happy: {
    rotate: [0, -5, 5, 0],
    transition: { duration: 0.6, repeat: Infinity, repeatDelay: 0.3 }
  },
  shuffle: {
    rotate: [0, 4, -4, 0],
    transition: { duration: 0.6, repeat: Infinity }
  },
  // ── 6 TRẠNG THÁI CẢM XÚC MỚI (HOÀNG KIM) ──
  curious: {
    rotate: -6,
    transition: { duration: 0.5 }
  },
  mischievous: {
    rotate: 14,
    transition: { duration: 0.5 }
  },
  solemn: {
    rotate: 8,
    y: 2,
    transition: { duration: 0.6 }
  },
  contemplative: {
    rotate: 4,
    y: 1,
    transition: { duration: 0.5 }
  },
  drowsy: {
    rotate: 10,
    y: 2,
    transition: { duration: 0.8 }
  },
  focused: {
    rotate: -8, // Hơi cụp tai phải lại
    transition: { duration: 0.5 }
  },
  stroked: {
    rotate: 22,
    y: 3,
    transition: { duration: 0.5 }
  },
  poked: {
    rotate: [8, 25, 6, 8],
    y: [0, 4, 0, 0],
    transition: { duration: 0.8 }
  },
  'hat-dropped': {
    rotate: [8, 20, -10, 8],
    y: [0, 3, -2, 0],
    transition: { duration: 0.8 }
  }
};

export const tailVariants: Variants = {
  idle: {
    rotate: [0, 12, -8, 15, -5, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  reading: {
    rotate: [0, 4, -2, 4, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  sleeping: {
    rotate: [-5, -7, -5],
    scale: 0.98,
    transition: {
      duration: 4.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  surprised: {
    rotate: 45,
    scaleY: 1.2,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  happy: {
    rotate: [0, 25, -25, 25, -25, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  shuffle: {
    rotate: [0, 15, -15, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  // ── 6 TRẠNG THÁI CẢM XÚC MỚI (HOÀNG KIM) ──
  curious: {
    rotate: [0, 8, -4, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  },
  mischievous: {
    rotate: [0, -18, 0], // Đuôi cuộn tinh nghịch
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  solemn: {
    rotate: -15,
    scale: 0.94,
    transition: { duration: 0.6 }
  },
  contemplative: {
    rotate: -6,
    transition: { duration: 0.5 }
  },
  drowsy: {
    rotate: [-6, -10, -6],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
  },
  focused: {
    rotate: 0,
    transition: { duration: 0.5 }
  },
  stroked: {
    rotate: [0, 15, -15, 15, -15, 0],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  poked: {
    rotate: [0, -35, 15, -5, 0],
    transition: { duration: 0.8 }
  },
  'hat-dropped': {
    rotate: [0, 25, -25, 0],
    transition: { duration: 1.2 }
  }
};

export const bellVariants: Variants = {
  idle: {
    rotate: [0, 2, -2, 0],
    transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
  },
  reading: {
    rotate: 0
  },
  sleeping: {
    rotate: 0,
    y: 4
  },
  surprised: {
    rotate: [0, -25, 25, -15, 0],
    y: [0, 2, -5, 0],
    transition: { duration: 0.8 }
  },
  happy: {
    rotate: [0, 15, -15, 15, -15, 0],
    y: [0, -2, 0],
    transition: { duration: 0.6, repeat: Infinity }
  },
  shuffle: {
    rotate: [0, 8, -8, 0],
    transition: { duration: 0.4, repeat: Infinity }
  },
  // ── 6 TRẠNG THÁI CẢM XÚC MỚI (HOÀNG KIM) ──
  curious: {
    rotate: 4,
    transition: { duration: 0.5 }
  },
  mischievous: {
    rotate: -6,
    transition: { duration: 0.5 }
  },
  solemn: {
    rotate: 0,
    y: 3,
    transition: { duration: 0.6 }
  },
  contemplative: {
    rotate: -2,
    y: 1.5,
    transition: { duration: 0.5 }
  },
  drowsy: {
    rotate: 0,
    y: [1.5, 3, 1.5],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
  },
  focused: {
    rotate: -2,
    transition: { duration: 0.5 }
  },
  stroked: {
    rotate: 2,
    y: 2
  },
  poked: {
    rotate: [0, -18, 18, 0],
    y: [0, 4, 0],
    transition: { duration: 0.8 }
  },
  'hat-dropped': {
    rotate: [0, -15, 15, 0],
    y: [0, 2, 0],
    transition: { duration: 0.8 }
  }
};

export const whiskerLeftVariants: Variants = {
  idle: {
    rotate: [0, 2, -1, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  },
  reading: {
    rotate: -1
  },
  sleeping: {
    rotate: -4,
    y: 3
  },
  surprised: {
    rotate: -10,
    transition: { duration: 0.2 }
  },
  happy: {
    rotate: [0, 4, -4, 0],
    transition: { duration: 0.8, repeat: Infinity }
  },
  shuffle: {
    rotate: [0, 2, -2, 0],
    transition: { duration: 0.6, repeat: Infinity }
  },
  // ── 6 TRẠNG THÁI CẢM XÚC MỚI (HOÀNG KIM) ──
  curious: {
    rotate: 3,
    transition: { duration: 0.5 }
  },
  mischievous: {
    rotate: -3,
    transition: { duration: 0.5 }
  },
  solemn: {
    rotate: -6,
    y: 2,
    transition: { duration: 0.6 }
  },
  contemplative: {
    rotate: -2,
    transition: { duration: 0.5 }
  },
  drowsy: {
    rotate: -5,
    y: 1.5,
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
  },
  focused: {
    rotate: 0,
    transition: { duration: 0.5 }
  },
  stroked: {
    rotate: -4,
    y: 1.5
  },
  poked: {
    rotate: [-4, -10, -2, -4],
    transition: { duration: 0.8 }
  },
  'hat-dropped': {
    rotate: [-2, -6, 0, -2],
    transition: { duration: 0.8 }
  }
};

export const whiskerRightVariants: Variants = {
  idle: {
    rotate: [0, -2, 1, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  },
  reading: {
    rotate: 1
  },
  sleeping: {
    rotate: 4,
    y: 3
  },
  surprised: {
    rotate: 10,
    transition: { duration: 0.2 }
  },
  happy: {
    rotate: [0, -4, 4, 0],
    transition: { duration: 0.8, repeat: Infinity }
  },
  shuffle: {
    rotate: [0, -2, 2, 0],
    transition: { duration: 0.6, repeat: Infinity }
  },
  // ── 6 TRẠNG THÁI CẢM XÚC MỚI (HOÀNG KIM) ──
  curious: {
    rotate: -3,
    transition: { duration: 0.5 }
  },
  mischievous: {
    rotate: 3,
    transition: { duration: 0.5 }
  },
  solemn: {
    rotate: 6,
    y: 2,
    transition: { duration: 0.6 }
  },
  contemplative: {
    rotate: 2,
    transition: { duration: 0.5 }
  },
  drowsy: {
    rotate: 5,
    y: 1.5,
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
  },
  focused: {
    rotate: 0,
    transition: { duration: 0.5 }
  },
  stroked: {
    rotate: 4,
    y: 1.5
  },
  poked: {
    rotate: [4, 10, 2, 4],
    transition: { duration: 0.8 }
  },
  'hat-dropped': {
    rotate: [2, 6, 0, 2],
    transition: { duration: 0.8 }
  }
};

// Các chuyển động chân (paws) đặc trưng
export const pawLeftVariants: Variants = {
  idle: {
    y: 0,
    x: 0,
    rotate: 0
  },
  reading: {
    y: 0,
    x: 0,
    rotate: 0
  },
  sleeping: {
    y: 4,
    x: 2,
    rotate: -15
  },
  surprised: {
    y: [0, 4, -12, 0],
    rotate: [0, 10, -15, 0],
    transition: { duration: 0.8 }
  },
  happy: {
    y: [0, -12, 0],
    rotate: [0, -15, 0],
    transition: { duration: 0.6, repeat: Infinity, repeatDelay: 0.2 }
  },
  shuffle: {
    y: [0, -15, 0],
    x: [0, -5, 0],
    rotate: [0, -25, 0],
    transition: { duration: 0.4, repeat: Infinity }
  },
  // ── 6 TRẠNG THÁI CẢM XÚC MỚI (HOÀNG KIM) ──
  curious: {
    y: 0,
    x: 0,
    rotate: 0
  },
  mischievous: {
    y: 0,
    x: 0,
    rotate: 0
  },
  solemn: {
    y: 2.5,
    transition: { duration: 0.6 }
  },
  contemplative: {
    // Chân trái chống cằm cực kỳ cute!
    y: -18,
    x: 12,
    rotate: 26,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  },
  drowsy: {
    y: 2,
    transition: { duration: 0.5 }
  },
  focused: {
    y: 0,
    x: 0,
    rotate: 0
  },
  stroked: {
    y: 0,
    x: 0,
    rotate: 0
  },
  poked: {
    y: [0, 8, -2, 0],
    x: [0, -4, 0, 0],
    rotate: [0, -15, 0, 0],
    transition: { duration: 0.8 }
  },
  'hat-dropped': {
    // Chân trái giơ lên giữ mũ lệch
    y: [0, -40, -84, -84],
    x: [0, 10, 28, 28],
    rotate: [0, 45, 95, 95],
    transition: { duration: 1.2, times: [0, 0.3, 0.7, 1], ease: "easeOut" }
  }
};

export const pawRightVariants: Variants = {
  idle: {
    y: 0,
    x: 0,
    rotate: 0
  },
  reading: {
    y: 0,
    x: 0,
    rotate: 0
  },
  sleeping: {
    y: 4,
    x: -2,
    rotate: 15
  },
  surprised: {
    y: [0, 4, -12, 0],
    rotate: [0, -10, 15, 0],
    transition: { duration: 0.8 }
  },
  happy: {
    y: [0, -12, 0],
    rotate: [0, 15, 0],
    transition: { duration: 0.6, repeat: Infinity, repeatDelay: 0.1 }
  },
  shuffle: {
    y: [-15, 0, -15],
    x: [0, 5, 0],
    rotate: [0, 25, 0],
    transition: { duration: 0.4, repeat: Infinity }
  },
  // ── 6 TRẠNG THÁI CẢM XÚC MỚI (HOÀNG KIM) ──
  curious: {
    y: 0,
    x: 0,
    rotate: 0
  },
  mischievous: {
    y: 0,
    x: 0,
    rotate: 0
  },
  solemn: {
    y: 2.5,
    transition: { duration: 0.6 }
  },
  contemplative: {
    y: 0,
    x: 0,
    rotate: 0,
    transition: { duration: 0.5 }
  },
  drowsy: {
    y: 2,
    transition: { duration: 0.5 }
  },
  focused: {
    y: 0,
    x: 0,
    rotate: 0
  },
  stroked: {
    y: 0,
    x: 0,
    rotate: 0
  },
  poked: {
    y: [0, 8, -2, 0],
    x: [0, 4, 0, 0],
    rotate: [0, 15, 0, 0],
    transition: { duration: 0.8 }
  },
  'hat-dropped': {
    // Chân phải giơ lên giữ mũ lệch
    y: [0, -35, -72, -72],
    x: [0, -5, -12, -12],
    rotate: [0, -40, -80, -80],
    transition: { duration: 1.2, times: [0, 0.3, 0.7, 1], ease: "easeOut" }
  }
};

// Quả cầu pha lê của chế độ reading
export const crystalBallVariants: Variants = {
  animate: {
    y: [0, -4, 0],
    scale: [1, 1.03, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Hiệu ứng hạt lấp lánh (sparkles) khi happy/shuffle
export const sparkleVariants: Variants = {
  animate: {
    scale: [0, 1.2, 0],
    opacity: [0, 1, 0],
    rotate: [0, 90, 180],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};
