'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApiKey } from './ApiKeyProvider';
import { continueTarotChat, ChatMessage, createUserPrompt } from '@/lib/gemini';

interface AIInterpretationProps {
  interpretation: string;
  loading: boolean;
  error?: string;
  onRetry?: () => void;
  spreadInfo?: string; // Ví dụ: "Trải bài 3 lá: Quá Khứ - Hiện Tại - Tương Lai"
  userPrompt?: string; // Prompt ban đầu chứa toàn bộ ngữ cảnh lá bài
}

export default function AIInterpretation({
  interpretation,
  loading,
  error,
  onRetry,
  spreadInfo,
  userPrompt,
}: AIInterpretationProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // States cho trò chuyện tiếp nối (Follow-up chat)
  const { apiKey, preferredModel } = useApiKey();
  const [followUps, setFollowUps] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');

  const SUGGESTION_CHIPS = [
    { text: '💡 Mèo Vàng lý giải thêm giúp em về lời khuyên hành động lúc này với ạ?' },
    { text: '🌱 Có bài học ẩn giấu nào trong bối cảnh này mà em chưa thấy không miêu miêu?' },
    { text: '🔮 Có cách nào giúp em giải tỏa năng lượng ách tắc, áp lực hiện tại không?' },
    { text: '🐱 Em đang cảm thấy hơi lo lắng về tương lai, Mèo Vàng an ủi em được không...' }
  ];

  // Reset typewriter & chat history when new interpretation arrives (i.e. user draws another spread)
  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
    setCopySuccess(false);
    setFollowUps([]);
    setInputValue('');
    setChatLoading(false);
    setChatError('');
  }, [interpretation]);

  // Typewriter effect interval
  useEffect(() => {
    if (!interpretation || loading || error) return;

    if (currentIndex < interpretation.length) {
      const timeoutId = setTimeout(() => {
        // Tốc độ đánh chữ: 25ms mỗi ký tự
        setDisplayText((prev) => prev + interpretation[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
        
        // Tự động cuộn xuống khi đang in chữ
        if (containerRef.current) {
          containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 25);

      return () => clearTimeout(timeoutId);
    }
  }, [interpretation, currentIndex, loading, error]);

  // Scroll to bottom of chat when new messages arrive or loading starts
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [followUps, chatLoading]);

  // Copy results to clipboard
  const handleCopy = () => {
    if (!interpretation) return;

    const formattedText = `━━━━━━━━━━━━━━━━━━━━
🐱 TAROT MÈO VÀNG LUẬN GIẢI
━━━━━━━━━━━━━━━━━━━━
${spreadInfo ? `🃏 Trải bài: ${spreadInfo}\n` : ''}📅 Ngày: ${new Date().toLocaleDateString('vi-VN')}

✨ Lời luận giải từ Mèo Vàng:
${interpretation}
━━━━━━━━━━━━━━━━━━━━`;

    navigator.clipboard.writeText(formattedText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Hàm gửi tin nhắn hội thoại đến Gemini API
  const handleSendChatMessage = async (messageText: string) => {
    if (!messageText.trim() || chatLoading || !apiKey) return;

    setChatError('');
    setChatLoading(true);

    // Xây dựng hội thoại cho Gemini
    const history: ChatMessage[] = [];
    if (userPrompt) {
      history.push({ role: 'user', content: userPrompt });
      history.push({ role: 'model', content: interpretation });
    } else {
      // Fallback nếu không truyền userPrompt
      history.push({ role: 'user', content: 'Xin chào Mèo Vàng, hãy luận giải trải bài này cho tôi.' });
      history.push({ role: 'model', content: interpretation });
    }

    history.push(...followUps);

    // Cập nhật UI tạm thời
    setFollowUps((prev) => [...prev, { role: 'user', content: messageText }]);

    try {
      const response = await continueTarotChat(
        apiKey,
        history, // CHỈ truyền history previous, không có newMessage! (Đã sửa lỗi duplication)
        messageText,
        preferredModel
      );

      setFollowUps((prev) => [...prev, { role: 'model', content: response.reply }]);
    } catch (err: any) {
      console.error(err);
      setChatError(err.message || 'Lỗi kết nối vũ trụ khi trò chuyện. Xin thử lại!');
    } finally {
      setChatLoading(false);
    }
  };

  // Parser Markdown đơn giản để hiển thị in đậm và xuống dòng đẹp mắt
  const renderParsedMarkdown = (text: string) => {
    if (!text) return null;

    // Tách dòng
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      // Xử lý tiêu đề phụ dạng markdown (ví dụ: ### Tiêu đề)
      if (line.trim().startsWith('###')) {
        const cleanTitle = line.replace(/###/g, '').trim();
        return (
          <h4 key={idx} className="font-cinzel text-base text-gold-light font-bold mt-4 mb-2 tracking-wide">
            {cleanTitle}
          </h4>
        );
      }

      // Xử lý tiêu đề phụ khác (ví dụ: **Tiêu đề**)
      if (line.trim().startsWith('**') && line.trim().endsWith('**') && line.length < 50) {
        const cleanTitle = line.replace(/\*\*/g, '').trim();
        return (
          <h4 key={idx} className="font-sans font-extrabold text-sm text-gold-light uppercase tracking-widest mt-4 mb-1.5">
            {cleanTitle}
          </h4>
        );
      }

      // Xử lý in đậm xen kẽ (ví dụ: **chữ in đậm** thường)
      const boldRegex = /\*\*([^*]+)\*\*/g;
      let parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        // Thêm phần chữ thường trước in đậm
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        // Thêm phần in đậm
        parts.push(
          <strong key={match.index} className="text-gold-light font-bold">
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return (
        <p key={idx} className="text-text-primary text-sm leading-relaxed mb-3 font-lora">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className="w-full bg-[#161633]/40 border border-gold-primary/20 rounded-2xl p-5 shadow-2xl flex flex-col gap-4"
    >
      {/* LOADING STATE */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-10 gap-5 text-center">
          {/* orbital magical crystal ball spinner */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Outer magic ring */}
            <div className="absolute w-20 h-20 rounded-full border-2 border-dashed border-gold-light/20 animate-[spin_10s_linear_infinite]" />
            <div className="absolute w-16 h-16 rounded-full border border-mystic-purple/35 animate-[spin_5s_linear_infinite_reverse]" />

            {/* Glowing crystal ball */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ghibli-sky/80 via-mystic-purple/50 to-[#0d0d1a] border border-gold-light/40 animate-crystal shadow-[0_0_20px_rgba(183,212,231,0.5)] flex items-center justify-center">
              {/* Inner light sparkles */}
              <div className="w-2 h-2 rounded-full bg-white animate-ping" />
            </div>

            {/* Orbital tiny stars */}
            <div className="absolute w-2 h-2 rounded-full bg-gold-light top-0 left-10 animate-pulse" />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-mystic-purple bottom-1 right-3 animate-ping" />
          </div>

          <div className="flex flex-col gap-1.5 max-w-sm">
            <h4 className="font-cinzel text-sm text-gold-light font-semibold tracking-wider">
              Mèo Vàng Đang Chiêm Nghiệm...
            </h4>
            <p className="font-lora text-xs text-text-secondary italic">
              Chú mèo vàng đang nhìn thấu quả cầu pha lê để đọc thông điệp vũ trụ gửi tới bạn. Đợi chút nhé! 🐱🔮
            </p>
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {error && !loading && (
        <div className="flex flex-col items-center py-6 gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-gold-dark/10 border border-gold-dark/30 flex items-center justify-center text-gold-dark text-xl font-bold">
            !
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <h4 className="font-sans font-bold text-sm text-gold-dark uppercase tracking-widest">
              Lỗi Kết Nối Vũ Trụ
            </h4>
            <p className="font-lora text-xs text-text-secondary leading-relaxed px-4">
              {error}
            </p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-1.5 font-sans font-semibold text-xs rounded-xl bg-gold-dark hover:bg-gold-dark/80 text-white cursor-pointer transition-all shadow-[0_0_10px_rgba(231,111,81,0.2)]"
            >
              Thử Lại Kết Nối
            </button>
          )}
        </div>
      )}

      {/* INTERPRETATION OUTPUT (Typewriter effect) */}
      {!loading && !error && displayText && (
        <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
          {/* Header toolbar */}
          <div className="flex justify-between items-center border-b border-gold-primary/10 pb-2">
            <span className="text-[10px] md:text-xs font-sans text-gold-light font-semibold uppercase tracking-widest flex items-center gap-1.5">
              🔮 Lời Luận Giải Từ Mèo Vàng
            </span>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 text-[10px] md:text-xs font-sans font-semibold rounded-lg bg-bg-surface hover:bg-bg-elevated border border-gold-primary/20 text-text-secondary hover:text-gold-light transition-all cursor-pointer flex items-center gap-1"
              >
                <span>{copySuccess ? '✓ Đã Sao Chép' : '📋 Copy Kết Quả'}</span>
              </button>
            </div>
          </div>

          {/* Text block */}
          <div className="font-lora text-sm text-text-primary whitespace-pre-wrap leading-relaxed pr-1">
            {renderParsedMarkdown(displayText)}
            {/* Blinking cursor at the end of typewriter */}
            {currentIndex < (interpretation || '').length && (
              <span className="inline-block w-1.5 h-4 bg-gold-light ml-0.5 animate-[pulse_1s_infinite] align-middle" />
            )}
          </div>
          
          {/* Complete Ghibli signature */}
          {currentIndex >= (interpretation || '').length && (
            <div className="mt-2 text-right text-[11px] font-lora italic text-gold-light/60 border-t border-gold-primary/5 pt-3">
              Chúc bạn vạn dặm bình yên, thương mến từ Mèo Vàng. 🐱🍂
            </div>
          )}

          {/* ════════════════ Trò chuyện tiếp nối với Mèo Vàng ════════════════ */}
          {currentIndex >= (interpretation || '').length && apiKey && (
            <div className="flex flex-col gap-5 border-t border-gold-primary/10 mt-6 pt-6 animate-[fadeIn_0.4s_ease-out]">
              <div className="flex items-center gap-2 text-xs font-sans text-gold-light/75 uppercase tracking-widest font-bold">
                <span>💬 Trò Chuyện Tiếp Nối Cùng Mèo Vàng</span>
              </div>

              {/* Lịch sử tin nhắn phụ */}
              <div className="flex flex-col gap-4">
                {followUps.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col gap-1.5 ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    } animate-[fadeIn_0.3s_ease-out]`}
                  >
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-gold-light/50 flex items-center gap-1 px-1">
                      {msg.role === 'user' ? (
                        <>
                          <span>👤</span>
                          <span>Quý Nhân</span>
                        </>
                      ) : (
                        <>
                          <span className="text-gold-light">🐱🐾</span>
                          <span className="text-gold-light">Mèo Vàng</span>
                        </>
                      )}
                    </span>
                    <div
                      className={`p-3.5 rounded-2xl max-w-[85%] font-lora text-xs md:text-sm leading-relaxed shadow-lg backdrop-blur-sm transition-all ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-gold-primary/15 to-gold-primary/5 border border-gold-primary/30 text-[#ffd166] rounded-tr-none'
                          : 'bg-gradient-to-br from-[#1c1c3f]/80 to-[#12122b]/95 border border-white/5 text-text-primary rounded-tl-none'
                      }`}
                    >
                      {msg.role === 'user' ? msg.content : renderParsedMarkdown(msg.content)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Lỗi trò chuyện nếu có */}
              {chatError && (
                <div className="text-xs font-sans text-gold-dark bg-gold-dark/10 border border-gold-dark/20 rounded-xl p-3">
                  ⚠️ {chatError}
                </div>
              )}

              {/* Đang gõ phản hồi */}
              {chatLoading && (
                <div className="flex items-center gap-2 text-xs font-sans text-gold-light/60 pl-1 py-1 animate-pulse">
                  <div className="flex items-center gap-1 bg-[#1b1b3d]/60 border border-white/5 rounded-2xl rounded-tl-none p-3.5 max-w-[85%] font-lora">
                    <span className="inline-block mr-1">Mèo Vàng đang gõ kiến giải bộc bạch...</span>
                    <div className="flex gap-1 items-center h-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-light animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-light animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-light animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll Anchor */}
              <div ref={chatEndRef} />

              {/* Gợi ý câu hỏi nhanh (Smart Suggestion Chips) */}
              {!chatLoading && (
                <div className="flex flex-col gap-2 mt-1">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-gold-light/40 pl-1">
                    ✨ Gợi ý câu hỏi nhanh cho quý nhân:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTION_CHIPS.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendChatMessage(chip.text)}
                        className="text-left px-3 py-2 text-[11px] md:text-xs font-sans font-semibold rounded-xl bg-gold-primary/5 hover:bg-gold-primary/10 border border-gold-primary/20 hover:border-gold-primary/45 text-gold-light/95 hover:text-gold-light transition-all cursor-pointer select-none active:scale-95 shadow-sm max-w-full truncate"
                      >
                        {chip.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ô nhập tin nhắn */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!inputValue.trim() || chatLoading || !apiKey) return;

                  const userMessage = inputValue.trim();
                  setInputValue('');
                  handleSendChatMessage(userMessage);
                }}
                className="flex gap-2 mt-1"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={chatLoading}
                  placeholder="Hỏi thêm Mèo Vàng về trải bài này... (ví dụ: Lời khuyên này có nghĩa gì với công việc mới?)"
                  className="flex-1 bg-[#1b1b3d]/50 border border-gold-primary/20 focus:border-gold-light focus:outline-none rounded-xl px-4 py-2.5 text-xs md:text-sm text-[#ffd166] placeholder:text-text-secondary/35 transition-all font-sans"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !inputValue.trim()}
                  className="px-5 py-2.5 bg-gold-primary hover:bg-gold-light disabled:opacity-30 disabled:pointer-events-none text-bg-deep font-sans font-bold text-xs md:text-sm uppercase tracking-widest rounded-xl cursor-pointer transition-all shadow-[0_0_10px_var(--color-gold-glow)]"
                >
                  Gửi
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Empty default state */}
      {!loading && !error && !displayText && (
        <div className="flex items-center justify-center py-8 text-center text-xs text-text-secondary italic font-lora">
          Nhấn nút để Mèo Vàng bắt đầu luận bài nhé... 🐱💤
        </div>
      )}
    </div>
  );
}
