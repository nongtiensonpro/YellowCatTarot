'use client';

import React, { useState, useEffect } from 'react';
import { useApiKey } from './ApiKeyProvider';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Image from 'next/image';
import CardBack from './CardBack';

const CARD_BACKS = [
  { id: 'default', name: 'Ngẫu Nhiên Ghibli', filename: 'Backofthecard4.jpeg' },
  { id: 'Waite–Smith_Tarot_Roses_and_Lilies_cropped.jpg', name: 'Rider-Waite Gốc', filename: 'Waite–Smith_Tarot_Roses_and_Lilies_cropped.jpg' },
  { id: 'ghibli-svg', name: 'Ghibli Hoạt Họa', isSvg: true },
  { id: 'Backofthecard1.jpeg', name: 'Hoàng Hôn Ghibli', filename: 'Backofthecard1.jpeg' },
  { id: 'Backofthecard2.jpeg', name: 'Ban Mai Yên Bình', filename: 'Backofthecard2.jpeg' },
  { id: 'Backofthecard3.jpeg', name: 'Đêm Sao Lấp Lánh', filename: 'Backofthecard3.jpeg' },
  { id: 'Backofthecard4.jpeg', name: 'Mèo Con Du Hí', filename: 'Backofthecard4.jpeg' },
  { id: 'Backofthecard5.jpeg', name: 'Khu Vườn Bí Mật', filename: 'Backofthecard5.jpeg' },
  { id: 'Backofthecard7.jpeg', name: 'Hành Tinh Kỳ Ảo', filename: 'Backofthecard7.jpeg' },
  { id: 'Backofthecard8.jpeg', name: 'Bình Minh Đảo Hoang', filename: 'Backofthecard8.jpeg' },
  { id: 'Backofthecard9.jpeg', name: 'Dưới Bóng Anh Đào', filename: 'Backofthecard9.jpeg' },
];

const MODELS = [
  { value: 'gemini-flash-latest', label: 'Gemini Flash Latest (Nhanh & Mặc Định)' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview' },
  { value: 'gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash Lite Preview' },
  { value: 'gemini-pro-latest', label: 'Gemini Pro Latest' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Luận Giải Sâu Sắc)' },
  { value: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview' },
];

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const {
    apiKey,
    setApiKey,
    preferredModel,
    setPreferredModel,
    isKeyValid,
    setIsKeyValid,
    preferredCardBack,
    setPreferredCardBack,
    shuffleTheme,
    setShuffleTheme,
    pickingTheme,
    setPickingTheme,
    enableSound,
    setEnableSound,
    reduceMotion,
    setReduceMotion,
  } = useApiKey();

  // Tab state
  const [activeTab, setActiveTab] = useState<'basic' | 'ghibli'>('basic');

  // Input states
  const [inputKey, setInputKey] = useState(apiKey);
  const [selectedModel, setSelectedModel] = useState(preferredModel);
  const [selectedCardBack, setSelectedCardBack] = useState(preferredCardBack);

  // Ghibli settings local states
  const [selectedShuffleTheme, setSelectedShuffleTheme] = useState(shuffleTheme);
  const [selectedPickingTheme, setSelectedPickingTheme] = useState(pickingTheme);
  const [selectedEnableSound, setSelectedEnableSound] = useState(enableSound);
  const [selectedReduceMotion, setSelectedReduceMotion] = useState(reduceMotion);

  const [testingStatus, setTestingStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputKey(apiKey);
      setSelectedModel(preferredModel);
      setSelectedCardBack(preferredCardBack);
      setSelectedShuffleTheme(shuffleTheme);
      setSelectedPickingTheme(pickingTheme);
      setSelectedEnableSound(enableSound);
      setSelectedReduceMotion(reduceMotion);
      setTestingStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen, apiKey, preferredModel, preferredCardBack, shuffleTheme, pickingTheme, enableSound, reduceMotion]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!inputKey) {
      setTestingStatus('error');
      setErrorMessage('Vui lòng nhập API Key trước khi kiểm tra!');
      return;
    }

    setTestingStatus('testing');
    setErrorMessage('');

    try {
      const genAI = new GoogleGenerativeAI(inputKey);
      const model = genAI.getGenerativeModel({ model: selectedModel });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
        generationConfig: { maxOutputTokens: 5 }
      });
      const text = result.response.text();
      
      if (text) {
        setTestingStatus('success');
        setIsKeyValid(true);
      } else {
        throw new Error('Không nhận được phản hồi từ Gemini API.');
      }
    } catch (err: any) {
      console.error(err);
      setTestingStatus('error');
      setIsKeyValid(false);
      setErrorMessage(err.message || 'Key không hợp lệ hoặc lỗi kết nối. Hãy kiểm tra lại!');
    }
  };

  const handleSave = () => {
    setApiKey(inputKey);
    setPreferredModel(selectedModel);
    setPreferredCardBack(selectedCardBack);
    setShuffleTheme(selectedShuffleTheme);
    setPickingTheme(selectedPickingTheme);
    setEnableSound(selectedEnableSound);
    setReduceMotion(selectedReduceMotion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="relative w-full max-w-lg bg-bg-surface border border-gold-primary/30 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
      >
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gold-primary/10 pb-3">
          <h3 className="font-cinzel text-lg text-gold-light font-bold tracking-wide flex items-center gap-2">
            ⚙️ Cấu Hình Không Gian Tarot
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/5 font-sans">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'basic'
                ? 'text-gold-light border-b-2 border-gold-primary'
                : 'text-text-secondary/60 hover:text-text-secondary'
            }`}
          >
            🔑 Cấu Hình Cơ Bản
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ghibli')}
            className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'ghibli'
                ? 'text-gold-light border-b-2 border-gold-primary'
                : 'text-text-secondary/60 hover:text-text-secondary'
            }`}
          >
            🎨 Giao Diện Ghibli
          </button>
        </div>

        {/* TAB CONTENT: BASIC */}
        {activeTab === 'basic' && (
          <div className="flex flex-col gap-4 font-sans text-sm animate-[fadeIn_0.15s_ease-out]">
            {/* Info Box */}
            <div className="bg-bg-elevated/40 border border-gold-primary/10 rounded-xl p-3.5 text-xs text-text-secondary leading-relaxed font-lora">
              <p className="mb-1">
                🔑 **API Key của bạn được bảo mật tuyệt đối:**
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Lưu trong trình duyệt (`sessionStorage`), tự xóa khi đóng tab.</li>
                <li>Gọi trực tiếp từ máy của bạn tới Google Gemini.</li>
              </ul>
              <p className="mt-2">
                Lấy khóa miễn phí tại:{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-primary hover:text-gold-light underline font-sans font-semibold transition-colors"
                >
                  Google AI Studio ↗
                </a>
              </p>
            </div>

            {/* Key Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-secondary tracking-wider font-semibold uppercase">
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Nhập API Key (ví dụ: AIzaSy...)"
                className="w-full bg-bg-elevated/50 border border-gold-primary/20 focus:border-gold-light focus:outline-none rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-secondary/30 transition-all font-mono"
              />
            </div>

            {/* Model Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-secondary tracking-wider font-semibold uppercase">
                Mô Hình Trí Tuệ Nhân Tạo (Model)
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-bg-elevated/50 border border-gold-primary/20 focus:border-gold-light focus:outline-none rounded-xl px-4 py-2 text-text-primary transition-all cursor-pointer font-sans"
              >
                {MODELS.map((model) => (
                  <option key={model.value} value={model.value} className="bg-bg-surface text-text-primary">
                    {model.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Card Back Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-secondary tracking-wider font-semibold uppercase">
                🎨 Thiết Kế Mặt Sau Lá Bài (Card Backs)
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-[145px] overflow-y-auto pr-1 select-none scrollbar-thin scrollbar-thumb-gold-primary/30">
                {CARD_BACKS.map((item) => {
                  const isSelected = selectedCardBack === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedCardBack(item.id)}
                      className={`group relative flex flex-col items-center bg-bg-elevated/35 rounded-xl p-1.5 border transition-all duration-300 ${
                        isSelected
                          ? 'border-gold-primary shadow-[0_0_10px_rgba(244,162,97,0.25)] bg-gold-primary/5'
                          : 'border-gold-primary/10 hover:border-gold-primary/40 hover:bg-bg-elevated/60'
                      }`}
                    >
                      <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden border border-gold-primary/15 flex items-center justify-center bg-bg-deep shadow-inner">
                        {item.isSvg ? (
                          <CardBack className="border-0 p-0.5 scale-[0.95]" />
                        ) : (
                          <Image
                            src={`/cards/Backofthecard/${item.filename}`}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 60px, 80px"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        )}

                        {item.id === 'default' && (
                          <div className="absolute inset-0 bg-black/50 z-10 flex flex-col items-center justify-center gap-0.5 text-[9px] text-gold-light font-bold font-sans pointer-events-none">
                            <span className="text-sm animate-bounce">🎲</span>
                            <span className="uppercase tracking-wider">Ngẫu Nhiên</span>
                          </div>
                        )}

                        {isSelected && (
                          <div className="absolute top-1 right-1 z-20 w-4 h-4 bg-gold-primary text-bg-deep rounded-full flex items-center justify-center shadow-md animate-[scaleIn_0.15s_ease-out]">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5">
                              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute inset-0.5 border border-gold-light/10 pointer-events-none rounded-[6px]" />
                      </div>
                      <span className="text-[10px] font-sans font-medium text-text-secondary mt-1 truncate w-full text-center group-hover:text-gold-light transition-colors">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: GHIBLI */}
        {activeTab === 'ghibli' && (
          <div className="flex flex-col gap-4 font-sans text-sm animate-[fadeIn_0.15s_ease-out]">
            {/* Shuffling Theme Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-secondary tracking-wider font-semibold uppercase">
                ⚙️ Kiểu Hoạt Ảnh Xáo Bài (Shuffling Theme)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'classic', label: 'Cổ Điển', desc: 'Rung lắc ngang' },
                  { id: 'wheel-of-fate', label: 'Bánh Răng', desc: 'Steampunk SVG' },
                  { id: 'soot-sprite', label: 'Bồ Hóng', desc: 'Bồ hóng mang bài' },
                ].map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedShuffleTheme(theme.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                      selectedShuffleTheme === theme.id
                        ? 'bg-gold-primary/10 border-gold-primary text-gold-light shadow-[0_0_8px_var(--color-gold-glow)]'
                        : 'bg-white/5 border-white/10 text-text-secondary hover:border-white/20'
                    }`}
                  >
                    <span>{theme.label}</span>
                    <span className="text-[9px] text-text-secondary/40 font-normal leading-none">{theme.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Picking Theme Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-secondary tracking-wider font-semibold uppercase">
                🌊 Kiểu Hoạt Ảnh Nhặt Bài (Picking Theme)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'classic', label: 'Cổ Điển', desc: 'Úp bài dạng lưới' },
                  { id: 'reflecting-pool', label: 'Hồ Nước', desc: 'Bài trôi gợn sóng' },
                  { id: 'falling-petals', label: 'Cánh Hoa', desc: 'Bài bay hoa rơi' },
                ].map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedPickingTheme(theme.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                      selectedPickingTheme === theme.id
                        ? 'bg-gold-primary/10 border-gold-primary text-gold-light shadow-[0_0_8px_var(--color-gold-glow)]'
                        : 'bg-white/5 border-white/10 text-text-secondary hover:border-white/20'
                    }`}
                  >
                    <span>{theme.label}</span>
                    <span className="text-[9px] text-text-secondary/40 font-normal leading-none">{theme.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Audio and Motion Toggles */}
            <div className="grid grid-cols-2 gap-4 mt-1.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-secondary tracking-wider font-semibold uppercase">
                  🔊 Âm Thanh Chữa Lành
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedEnableSound(!selectedEnableSound)}
                  className={`py-2 px-4 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                    selectedEnableSound
                      ? 'bg-gold-primary/10 border-gold-primary text-gold-light shadow-[0_0_8px_var(--color-gold-glow)]'
                      : 'bg-white/5 border-white/10 text-text-secondary hover:border-white/20'
                  }`}
                >
                  <span>{selectedEnableSound ? '🔊 Đang Bật' : '🔇 Đang Tắt'}</span>
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-secondary tracking-wider font-semibold uppercase">
                  💨 Giảm Chuyển Động
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedReduceMotion(!selectedReduceMotion)}
                  className={`py-2 px-4 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                    selectedReduceMotion
                      ? 'bg-gold-primary/10 border-gold-primary text-gold-light shadow-[0_0_8px_var(--color-gold-glow)]'
                      : 'bg-white/5 border-white/10 text-text-secondary hover:border-white/20'
                  }`}
                >
                  <span>{selectedReduceMotion ? '🏃 Đang Giảm' : '🚶 Bình Thường'}</span>
                </button>
              </div>
            </div>
            <p className="text-[10px] text-text-secondary/40 font-lora italic leading-tight text-center">
              * Âm thanh Ghibli được tổng hợp trực tiếp bằng Web Audio API để tránh lag và tiết kiệm dữ liệu mạng.
            </p>
          </div>
        )}

        {/* Testing status feedback */}
        {testingStatus !== 'idle' && (
          <div className="text-xs font-sans rounded-xl p-3 flex items-center gap-2 border">
            {testingStatus === 'testing' && (
              <div className="bg-[#b7d4e7]/10 text-ghibli-sky border-[#b7d4e7]/20 flex items-center gap-2 w-full">
                <span className="w-4 h-4 rounded-full border-2 border-ghibli-sky border-t-transparent animate-spin inline-block" />
                <span>Đang kết nối thử với vũ trụ Google Gemini...</span>
              </div>
            )}
            {testingStatus === 'success' && (
              <div className="bg-[#2d6a4f]/10 text-[#2d6a4f] border-[#2d6a4f]/20 font-semibold flex items-center gap-1.5 w-full dark:text-green-400">
                <span>✅ Kết nối thành công! Mèo Vàng đã sẵn sàng xem bài.</span>
              </div>
            )}
            {testingStatus === 'error' && (
              <div className="bg-[#e76f51]/10 text-gold-dark border-[#e76f51]/20 flex flex-col gap-1 w-full">
                <span className="font-semibold">❌ Lỗi kết nối:</span>
                <span className="opacity-90">{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 justify-end font-sans mt-2">
          {activeTab === 'basic' && (
            <button
              type="button"
              onClick={handleTestKey}
              disabled={testingStatus === 'testing'}
              className="px-4 py-2 text-xs md:text-sm font-semibold rounded-xl bg-bg-elevated hover:bg-bg-elevated/80 border border-gold-primary/30 text-text-primary hover:text-gold-light cursor-pointer transition-all disabled:opacity-50"
            >
              Thử Kết Nối
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2 text-xs md:text-sm font-semibold rounded-xl bg-gold-primary hover:bg-gold-light text-bg-deep cursor-pointer font-sans transition-all shadow-[0_0_12px_var(--color-gold-glow)]"
          >
            Lưu Cài Đặt
          </button>
        </div>
      </form>
    </div>
  );
}
