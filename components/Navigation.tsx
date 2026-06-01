'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ApiKeyModal from './ApiKeyModal';
import { useApiKey } from './ApiKeyProvider';

export default function Navigation() {
  const pathname = usePathname();
  const { apiKey } = useApiKey();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Trang Chủ' },
    { href: '/cards', label: 'Tra Cứu 78 Lá' },
    { href: '/reading', label: 'Trải Bài Tarot' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-bg-deep/80 backdrop-blur-md border-b border-gold-primary/10 shadow-lg select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* BRAND LOGO */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
                {/* Micro Animated Cat Logo */}
                <div className="relative w-8 h-8 rounded-full border border-gold-light/40 bg-bg-surface flex items-center justify-center p-0.5 group-hover:border-gold-light/80 transition-all duration-300">
                  <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-[0_0_2px_rgba(244,162,97,0.5)]"
                  >
                    {/* Crescent Moon */}
                    <path
                      d="M60 25C52 25 44 30 40 38C36 46 38 55 44 61C50 67 59 69 66 65C58 70 48 68 40 62C32 55 30 45 34 36C38 27 48 22 60 25Z"
                      fill="#ffd166"
                    />
                    {/* Tiny sitting cat */}
                    <path
                      d="M54 48C51.5 48 49.5 50.5 49.5 53C49.5 55 51 57.5 48.5 60C47.2 61.5 44 61.5 42.5 63C41 64.5 42 66.5 42.5 67.5C43 68.5 44.5 69.5 47 69.5C51 69.5 53.5 67 55 65.5C56 66.5 57 67.5 58.5 67.5C60 67.5 61.5 67 62.5 66C63 67 64 67.5 65.5 67.5C67 67.5 69 64.5 68 62.5C67.5 61.5 64.5 60 64 58.5C63.5 57 63 54.5 63 52.5C63 49.5 61.5 48 59.5 48C58 48 57 49 56 49.5C55 49.5 54.5 48 54 48Z"
                      fill="#f4a261"
                      className="animate-tail"
                    />
                  </svg>
                </div>
                <span className="font-cinzel font-bold text-base md:text-lg tracking-wider text-gold-primary group-hover:text-gold-light transition-colors duration-200">
                  TAROT MÈO VÀNG
                </span>
              </Link>
            </div>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center gap-6 font-sans">
              <div className="flex gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 text-xs md:text-sm font-semibold tracking-wide rounded-lg transition-all duration-200 ${
                      isActive(link.href)
                        ? 'text-gold-light bg-gold-primary/10 border-b-2 border-gold-light rounded-b-none'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/40'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Settings button */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  apiKey
                    ? 'bg-[#2d6a4f]/20 text-green-400 border-green-500/30 hover:bg-[#2d6a4f]/35'
                    : 'bg-bg-elevated/60 text-text-secondary border-gold-primary/20 hover:border-gold-light hover:text-gold-light'
                }`}
              >
                <span>⚙️</span>
                <span>{apiKey ? 'Đã Kết Nối' : 'Cài Đặt'}</span>
              </button>
            </div>

            {/* MOBILE HAMBURGER BUTTON */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-text-secondary hover:text-text-primary focus:outline-none p-2 cursor-pointer"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE SLIDE-DOWN MENU */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-bg-mid border-t border-gold-primary/10 font-sans animate-[fadeIn_0.15s_ease-out]">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-semibold tracking-wide ${
                    isActive(link.href)
                      ? 'text-gold-light bg-gold-primary/10 border-l-4 border-gold-light'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/30'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Settings button */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSettingsOpen(true);
                }}
                className={`w-full flex items-center justify-center gap-2 mt-2 px-4 py-2.5 rounded-lg text-sm font-semibold border text-center transition-all cursor-pointer ${
                  apiKey
                    ? 'bg-[#2d6a4f]/25 text-green-400 border-green-500/30'
                    : 'bg-bg-elevated/80 text-text-secondary border-gold-primary/20'
                }`}
              >
                <span>⚙️ Cài Đặt Khóa Phép Thuật</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* SETTINGS API KEY MODAL */}
      <ApiKeyModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
