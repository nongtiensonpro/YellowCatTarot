'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { TarotCard as TarotCardType } from '@/lib/cards-data';
import TarotCard from '@/components/TarotCard';
import { readerAudio } from '@/lib/reader-audio';

export interface StudioDealtCard {
  id: string;
  card: TarotCardType;
  isReversed: boolean;
  pickOrder: number;
  positionName: string;
  x: number;
  y: number;
  rotation: number;
  isFlipped: boolean;
  notes: string;
}

interface ReaderGrimoireProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCard: StudioDealtCard | null;
  dealtCards: StudioDealtCard[];
  onUpdateNotes: (cardId: string, notes: string) => void;
  generalNotes: string;
  onUpdateGeneralNotes: (notes: string) => void;
  journalKey: string;
  onSelectCard: (cardId: string) => void;
}

interface DebouncedTextareaProps {
  initialValue: string;
  onCommit: (value: string) => void;
  placeholder: string;
  rows: number;
  className: string;
}

function DebouncedTextarea({
  initialValue,
  onCommit,
  placeholder,
  rows,
  className,
}: DebouncedTextareaProps) {
  const [draft, setDraft] = useState(initialValue);
  const latestDraft = useRef(initialValue);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCommitRef = useRef(onCommit);

  useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);

  useEffect(() => {
    return () => {
      if (commitTimer.current) {
        clearTimeout(commitTimer.current);
      }
      onCommitRef.current(latestDraft.current);
    };
  }, []);

  const handleChange = (value: string) => {
    latestDraft.current = value;
    setDraft(value);
    if (commitTimer.current) {
      clearTimeout(commitTimer.current);
    }
    commitTimer.current = setTimeout(() => {
      onCommitRef.current(value);
      commitTimer.current = null;
    }, 240);
  };

  return (
    <textarea
      value={draft}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={className}
    />
  );
}

function ReaderGrimoire({
  isOpen,
  onClose,
  selectedCard,
  dealtCards,
  onUpdateNotes,
  generalNotes,
  onUpdateGeneralNotes,
  journalKey,
  onSelectCard,
}: ReaderGrimoireProps) {
  const [activeTab, setActiveTab] = useState<'CARD' | 'JOURNAL' | 'ALL_CARDS'>('CARD');
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={shouldReduceMotion ? false : { x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={shouldReduceMotion ? undefined : { x: '100%', opacity: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 220 }}
          className="fixed top-0 right-0 bottom-0 w-full sm:w-[480px] z-50 bg-[#1c140d]/95 text-[#fdf0d5] border-l-2 border-[#d4af37]/40 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md flex flex-col font-serif select-none"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#d4af37]/20 flex items-center justify-between bg-[#281b12]">
            <div className="flex items-center gap-2">
              <span className="text-xl">📜</span>
              <div>
                <h3 className="text-lg font-bold text-[#e6c594] tracking-wide font-cinzel">
                  Sổ Ghi Chép Grimoire
                </h3>
                <p className="text-[10px] text-[#b89f80] font-sans">
                  Nhật Ký & Cẩm Nang Diễn Giải Cho Người Đọc Bài
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                readerAudio.playPageTurn();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#e6c594] flex items-center justify-center transition-all cursor-pointer"
              title="Đóng Sổ Ghi Chép"
            >
              ✕
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#d4af37]/20 bg-[#17100a] text-xs font-sans font-bold uppercase tracking-wider">
            <button
              onClick={() => {
                readerAudio.playPageTurn();
                setActiveTab('CARD');
              }}
              className={`flex-1 py-3 px-2 text-center border-b-2 transition-all cursor-pointer ${
                activeTab === 'CARD'
                  ? 'border-[#d4af37] text-[#e6c594] bg-[#281b12]/60'
                  : 'border-transparent text-[#a38a6d] hover:text-[#e6c594]'
              }`}
            >
              🔍 Lá Bài Đang Chọn
            </button>
            <button
              onClick={() => {
                readerAudio.playPageTurn();
                setActiveTab('ALL_CARDS');
              }}
              className={`flex-1 py-3 px-2 text-center border-b-2 transition-all cursor-pointer ${
                activeTab === 'ALL_CARDS'
                  ? 'border-[#d4af37] text-[#e6c594] bg-[#281b12]/60'
                  : 'border-transparent text-[#a38a6d] hover:text-[#e6c594]'
              }`}
            >
              🎴 Tất Cả Lá Bài ({dealtCards.length})
            </button>
            <button
              onClick={() => {
                readerAudio.playPageTurn();
                setActiveTab('JOURNAL');
              }}
              className={`flex-1 py-3 px-2 text-center border-b-2 transition-all cursor-pointer ${
                activeTab === 'JOURNAL'
                  ? 'border-[#d4af37] text-[#e6c594] bg-[#281b12]/60'
                  : 'border-transparent text-[#a38a6d] hover:text-[#e6c594]'
              }`}
            >
              ✍️ Nhật Ký Tổng Quan
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin space-y-5 text-sm">
            {/* TAB: ACTIVE CARD DETAILS */}
            {activeTab === 'CARD' && (
              <>
                {selectedCard ? (
                  <div className="space-y-4">
                    {/* Card Title & Badge */}
                    <div className="flex items-center gap-3 bg-[#281b12] p-3 rounded-xl border border-[#d4af37]/30">
                      <div className="w-16 h-28 flex-shrink-0 relative">
                        <TarotCard
                          card={selectedCard.card}
                          isFlipped={selectedCard.isFlipped}
                          isReversed={selectedCard.isReversed}
                          size="sm"
                          interactive={false}
                          imageQuality={78}
                          imageSizes="80px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="inline-block px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#e6c594] text-[10px] font-sans font-bold uppercase tracking-wider mb-1">
                          #{selectedCard.pickOrder} · {selectedCard.positionName}
                        </div>
                        <h4 className="text-base font-bold text-[#e6c594] truncate">
                          {selectedCard.card.nameVi} ({selectedCard.card.nameEn})
                        </h4>
                        <p className="text-xs text-[#c4aa8a] font-sans">
                          Trạng thái: <span className="font-bold text-[#e6c594]">{selectedCard.isReversed ? '↩ Ngược (Reversed)' : '✦ Xuôi (Upright)'}</span>
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedCard.card.keywordsVi.map((kw, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] text-[#d4af37] border border-[#d4af37]/20">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Meaning Guide */}
                    <div className="bg-[#24170e] p-4 rounded-xl border border-[#d4af37]/20 space-y-3 font-sans">
                      <h5 className="text-xs font-bold text-[#e6c594] uppercase tracking-wider flex items-center gap-1.5">
                        <span>📖</span> Ý Nghĩa Biểu Tượng Lá Bài
                      </h5>
                      <div className="p-3 rounded-lg bg-black/30 text-xs text-[#e8d5be] leading-relaxed">
                        <span className="font-bold text-[#d4af37] block mb-1">
                          {selectedCard.isReversed ? '↩ Ý nghĩa chiều ngược:' : '✦ Ý nghĩa chiều xuôi:'}
                        </span>
                        {selectedCard.isReversed ? selectedCard.card.meaningReversed : selectedCard.card.meaningUpright}
                      </div>
                    </div>

                    {/* Reader Notes */}
                    <div className="space-y-2 font-sans">
                      <label className="text-xs font-bold text-[#e6c594] uppercase tracking-wider flex items-center gap-1.5">
                        <span>✍️</span> Diễn Giải Riêng Của Người Đọc Bài (Reader Notes)
                      </label>
                      <DebouncedTextarea
                        key={selectedCard.id}
                        initialValue={selectedCard.notes || ''}
                        onCommit={(notes) => onUpdateNotes(selectedCard.id, notes)}
                        placeholder="Nhập cảm nhận, trực giác và phân tích chi tiết của bạn cho lá bài này..."
                        rows={5}
                        className="w-full p-3 rounded-xl bg-[#140d08] border border-[#d4af37]/30 text-[#fdf0d5] text-xs leading-relaxed focus:border-[#d4af37] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#a38a6d] font-sans space-y-3">
                    <span className="text-4xl block">🎴</span>
                    <p className="text-sm">Chưa có lá bài nào được chọn.</p>
                    <p className="text-xs text-[#8a7258]">
                      Hãy nhấp vào một lá bài đã trải trên bàn để xem chi tiết biểu tượng và viết nhật ký diễn giải.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* TAB: ALL CARDS LIST */}
            {activeTab === 'ALL_CARDS' && (
              <div className="space-y-3 font-sans">
                {dealtCards.length > 0 ? (
                  dealtCards.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-[#281b12] border border-[#d4af37]/25 flex items-center gap-3 hover:border-[#d4af37]/60 transition-all cursor-pointer"
                      onClick={() => {
                        readerAudio.playHover();
                        onSelectCard(c.id);
                        setActiveTab('CARD');
                      }}
                    >
                      <div className="w-10 h-16 relative flex-shrink-0">
                        <TarotCard
                          card={c.card}
                          isFlipped={c.isFlipped}
                          isReversed={c.isReversed}
                          size="sm"
                          interactive={false}
                          imageQuality={78}
                          imageSizes="80px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-[#d4af37] font-bold uppercase">
                          #{c.pickOrder} · {c.positionName}
                        </div>
                        <div className="text-sm font-bold text-[#e6c594] truncate">
                          {c.card.nameVi} {c.isReversed ? '↩' : '✦'}
                        </div>
                        <div className="text-xs text-[#b89f80] truncate mt-0.5">
                          {c.notes ? `Ghi chú: ${c.notes}` : 'Chưa có ghi chú'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-[#a38a6d]">
                    Chưa có lá bài nào được rút lên bàn.
                  </div>
                )}
              </div>
            )}

            {/* TAB: GENERAL READING JOURNAL */}
            {activeTab === 'JOURNAL' && (
              <div className="space-y-4 font-sans">
                <div className="p-3 rounded-xl bg-[#281b12] border border-[#d4af37]/30">
                  <h4 className="text-xs font-bold text-[#e6c594] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span>🔮</span> Tổng Kết Quẻ Bài (Overall Interpretation)
                  </h4>
                  <p className="text-xs text-[#b89f80] leading-relaxed">
                    Dành cho Người Đọc Bài tổng hợp toàn bộ năng lượng quẻ bài, liên kết giữa các lá và đưa ra lời khuyên cho Querent.
                  </p>
                </div>

                <DebouncedTextarea
                  key={journalKey}
                  initialValue={generalNotes}
                  onCommit={onUpdateGeneralNotes}
                  placeholder="Viết tổng quan bức tranh quẻ bài, thông điệp chung và hướng dẫn hành động..."
                  rows={12}
                  className="w-full p-4 rounded-xl bg-[#140d08] border border-[#d4af37]/30 text-[#fdf0d5] text-xs leading-relaxed focus:border-[#d4af37] focus:outline-none transition-colors"
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default React.memo(ReaderGrimoire);
