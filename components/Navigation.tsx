'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ApiKeyModal from './ApiKeyModal';
import { useApiKey } from './ApiKeyProvider';

export default function Navigation() {
  const pathname = usePathname();
  const { apiKey } = useApiKey();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hide top navigation header bar in Reader Studio mode for maximum workspace height
  if (pathname === '/reading/reader-studio') {
    return null;
  }

  const navLinks = [
    { href: '/', label: 'Trang Chủ' },
    { href: '/cards', label: 'Tra Cứu 78 Lá' },
    { href: '/reading', label: 'Trải Bài Tarot' },
    { href: '/meo-vang', label: 'Hồ Sơ Mèo Vàng' },
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
                <div className="relative w-9 h-9 rounded-full border border-gold-light/40 bg-bg-surface overflow-hidden flex items-center justify-center group-hover:border-gold-light/80 transition-all duration-300 shadow-md">
                  <img
                    src="/meo-vang-logo.png"
                    alt="Tarot Mèo Vàng Logo"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <span className="font-cinzel font-bold text-base md:text-lg tracking-wider text-gold-primary group-hover:text-gold-light transition-colors duration-200">
                  TAROT MÈO VÀNG
                </span>
              </Link>
            </div>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center gap-6 font-sans">
              <div className="flex gap-2">
                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`relative px-3.5 py-2 text-xs md:text-sm font-semibold tracking-wide rounded-lg transition-colors duration-200 ${
                        active
                          ? 'text-gold-light font-bold'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/40'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="activeNavPill"
                          className="absolute inset-0 bg-gold-primary/15 border-b-2 border-gold-light rounded-lg -z-10 shadow-[0_0_12px_rgba(244,162,97,0.15)]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      {link.label}
                    </Link>
                  );
                })}
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
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="md:hidden bg-bg-mid border-t border-gold-primary/10 font-sans overflow-hidden"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* SETTINGS API KEY MODAL */}
      <ApiKeyModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
