'use client';

import React, { useState, useEffect } from 'react';
import { useApiKey } from './ApiKeyProvider';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  const { apiKey, setApiKey, preferredModel, setPreferredModel, isKeyValid, setIsKeyValid } = useApiKey();
  const [inputKey, setInputKey] = useState(apiKey);
  const [selectedModel, setSelectedModel] = useState(preferredModel);
  const [testingStatus, setTestingStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputKey(apiKey);
      setSelectedModel(preferredModel);
      setTestingStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen, apiKey, preferredModel]);

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
      // Gửi test request rất nhỏ
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="relative w-full max-w-lg bg-bg-surface border border-gold-primary/30 rounded-2xl p-6 shadow-2xl flex flex-col gap-5"
      >
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gold-primary/10 pb-3">
          <h3 className="font-cinzel text-lg text-gold-light font-bold tracking-wide flex items-center gap-2">
            ⚙️ Cài Đặt Khóa Phép Thuật
          </h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-bg-elevated/40 border border-gold-primary/10 rounded-xl p-3.5 text-xs text-text-secondary leading-relaxed font-lora">
          <p className="mb-1.5">
            🔑 **API Key của bạn được bảo mật tuyệt đối:**
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Lưu trực tiếp trong trình duyệt của bạn (`sessionStorage`).</li>
            <li>Tự động xóa sạch khi bạn đóng tab trình duyệt.</li>
            <li>Gọi trực tiếp từ máy của bạn tới Google Gemini, không đi qua bất cứ máy chủ trung gian nào.</li>
          </ul>
          <p className="mt-2.5">
            Để lấy khóa miễn phí, hãy truy cập vào{' '}
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

        {/* Input fields */}
        <div className="flex flex-col gap-4 font-sans text-sm">
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
              className="w-full bg-bg-elevated/50 border border-gold-primary/20 focus:border-gold-light focus:outline-none rounded-xl px-4 py-2.5 text-text-primary transition-all cursor-pointer font-sans"
            >
              {MODELS.map((model) => (
                <option key={model.value} value={model.value} className="bg-bg-surface text-text-primary">
                  {model.label}
                </option>
              ))}
            </select>
          </div>
        </div>

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
        <div className="flex gap-3 justify-end font-sans">
          <button
            onClick={handleTestKey}
            disabled={testingStatus === 'testing'}
            className="px-4 py-2 text-xs md:text-sm font-semibold rounded-xl bg-bg-elevated hover:bg-bg-elevated/80 border border-gold-primary/30 text-text-primary hover:text-gold-light cursor-pointer transition-all disabled:opacity-50"
          >
            Thử Kết Nối
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs md:text-sm font-semibold rounded-xl bg-gold-primary hover:bg-gold-light text-bg-deep cursor-pointer font-sans transition-all shadow-[0_0_12px_var(--color-gold-glow)]"
          >
            Lưu Cài Đặt
          </button>
        </div>
      </form>
    </div>
  );
}
