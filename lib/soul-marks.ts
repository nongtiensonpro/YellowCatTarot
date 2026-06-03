export interface SoulMark {
  name: string;
  color: string;
  glow: string;
  icon: string;
  borderClass: string;
  textClass: string;
  bgClass: string;
}

export const SOUL_MARKS: SoulMark[] = [
  {
    name: 'Rừng Xanh',
    color: '#2d6a4f',
    glow: 'rgba(45,106,79,0.35)',
    icon: '🌿',
    borderClass: 'border-[#2d6a4f]',
    textClass: 'text-[#52b788]',
    bgClass: 'bg-[#2d6a4f]/10',
  },
  {
    name: 'Nắng Ấm',
    color: '#f4a261',
    glow: 'rgba(244,162,97,0.35)',
    icon: '☀️',
    borderClass: 'border-[#f4a261]',
    textClass: 'text-[#ffd166]',
    bgClass: 'bg-[#f4a261]/10',
  },
  {
    name: 'Bầu Trời',
    color: '#48cae4',
    glow: 'rgba(72,202,228,0.35)',
    icon: '🌤️',
    borderClass: 'border-[#48cae4]',
    textClass: 'text-[#48cae4]',
    bgClass: 'bg-[#48cae4]/10',
  },
  {
    name: 'Hoàng Hôn',
    color: '#e76f51',
    glow: 'rgba(231,111,81,0.35)',
    icon: '🌅',
    borderClass: 'border-[#e76f51]',
    textClass: 'text-[#f4a261]',
    bgClass: 'bg-[#e76f51]/10',
  },
  {
    name: 'Ánh Trăng',
    color: '#9b5de5',
    glow: 'rgba(155,93,229,0.35)',
    icon: '🌙',
    borderClass: 'border-[#9b5de5]',
    textClass: 'text-[#c77dff]',
    bgClass: 'bg-[#9b5de5]/10',
  },
  {
    name: 'Sương Mai',
    color: '#a7c957',
    glow: 'rgba(167,201,87,0.35)',
    icon: '💧',
    borderClass: 'border-[#a7c957]',
    textClass: 'text-[#a7c957]',
    bgClass: 'bg-[#a7c957]/10',
  },
  {
    name: 'Hoa Anh Đào',
    color: '#ff6b9d',
    glow: 'rgba(255,107,157,0.35)',
    icon: '🌸',
    borderClass: 'border-[#ff6b9d]',
    textClass: 'text-[#ffccd5]',
    bgClass: 'bg-[#ff6b9d]/10',
  },
  {
    name: 'Đất Mẹ',
    color: '#8b6914',
    glow: 'rgba(139,105,20,0.35)',
    icon: '🏔️',
    borderClass: 'border-[#8b6914]',
    textClass: 'text-[#c9b89a]',
    bgClass: 'bg-[#8b6914]/10',
  },
];
