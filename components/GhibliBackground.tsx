'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useApiKey } from './ApiKeyProvider';

export default function GhibliBackground() {
  const { preferredCardBack } = useApiKey();
  const [bgImage, setBgImage] = useState<string>('');

  useEffect(() => {
    const files = [
      'Waite–Smith_Tarot_Roses_and_Lilies_cropped.jpg',
      'Backofthecard1.jpeg',
      'Backofthecard2.jpeg',
      'Backofthecard3.jpeg',
      'Backofthecard4.jpeg',
      'Backofthecard5.jpeg',
      'Backofthecard7.jpeg',
      'Backofthecard8.jpeg',
      'Backofthecard9.jpeg'
    ];

    if (preferredCardBack === 'default') {
      // Chọn ngẫu nhiên một trong 9 ảnh để làm hình nền mặc định
      const randomIndex = Math.floor(Math.random() * files.length);
      setBgImage(files[randomIndex]);
    } else if (preferredCardBack === 'ghibli-svg') {
      // Dùng mẫu bầu trời đêm sao tuyệt đẹp làm nền mặc định khi dùng SVG
      setBgImage('Backofthecard3.jpeg');
    } else {
      // Dùng chính ảnh mặt sau mà người dùng đã chọn
      setBgImage(preferredCardBack);
    }
  }, [preferredCardBack]);

  if (!bgImage) return null;

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none select-none">
      {/* Lớp phủ làm tối nền tối ưu, đảm bảo độ tương phản chữ đọc 100% */}
      <div className="absolute inset-0 bg-[#0d0d1a]/85 z-10" />
      
      {/* Vùng hào quang huyền ảo dịu nhẹ phong cách Ghibli */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gold-primary/5 blur-[120px] z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#52b788]/5 blur-[120px] z-10 pointer-events-none" />

      {/* Ảnh mặt sau Ghibli được làm mờ diện rộng làm hình nền nghệ thuật */}
      <Image
        src={`/cards/Backofthecard/${bgImage}`}
        alt="Ghibli Background Scenery"
        fill
        priority
        className="object-cover opacity-20 filter blur-[90px] scale-110 transition-all duration-1000 ease-in-out"
      />
    </div>
  );
}
