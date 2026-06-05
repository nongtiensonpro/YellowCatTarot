import { Variants } from 'framer-motion';

// Cấu hình các hiệu ứng chuyển động của Mèo Vàng
export const bodyVariants: Variants = {
  idle: {
    scaleY: [1, 1.03, 1],
    scaleX: [1, 0.98, 1],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  reading: {
    scaleY: [1, 1.01, 1],
    scaleX: [1, 0.99, 1],
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
    rotate: 2, // Hơi nghiêng đầu ngẫm nghĩ
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
    rotate: -12, // Tai cụp xuống khi ngủ
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
    rotate: 12, // Tai cụp xuống khi ngủ
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
    rotate: 45, // Đuôi dựng đứng khi giật mình
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
  }
};

// Các chuyển động chân (paws) đặc trưng
export const pawLeftVariants: Variants = {
  idle: {
    y: 0,
    rotate: 0
  },
  reading: {
    y: 0
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
  }
};

export const pawRightVariants: Variants = {
  idle: {
    y: 0,
    rotate: 0
  },
  reading: {
    y: 0
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
    transition: { duration: 0.6, repeat: Infinity, repeatDelay: 0.1 } // Lệch pha một chút cho tự nhiên
  },
  shuffle: {
    y: [-15, 0, -15],
    x: [0, 5, 0],
    rotate: [0, 25, 0],
    transition: { duration: 0.4, repeat: Infinity }
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
