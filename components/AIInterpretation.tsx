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
  const [showChat, setShowChat] = useState(true); // Tự động mở chat vì Mèo Vàng luôn hỏi ngược

  // Gợi ý giúp người dùng TRẢ LỜI câu hỏi của Mèo Vàng — thay vì hỏi ngược
  const SUGGESTION_CHIPS = [
    { text: '💕 Em đang độc thân và muốn tìm hiểu về tình yêu', emoji: '💕' },
    { text: '💼 Em đang lo lắng về công việc hiện tại', emoji: '💼' },
    { text: '😔 Dạo này em cảm thấy khá mệt mỏi và chán nản...', emoji: '😔' },
    { text: '🤔 Em đang phân vân giữa hai lựa chọn quan trọng', emoji: '🤔' },
    { text: '✨ Mèo Vàng phân tích sâu hơn giúp em nhé!', emoji: '✨' },
    { text: '🌱 Em muốn biết mình nên làm gì tiếp theo', emoji: '🌱' },
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
    setShowChat(true);
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

    // Tự động mở chat khi gửi tin nhắn
    if (!showChat) setShowChat(true);

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

  // ═══════════════════════════════════════════════════════════════
  // RICH MARKDOWN PARSER — Hỗ trợ bảng, italic, list, hr, bold
  // ═══════════════════════════════════════════════════════════════

  /** Parse inline markdown: **bold**, *italic*, `code` */
  const renderInlineMarkdown = (text: string, keyPrefix: string = '') => {
    // Combined regex: **bold**, *italic*, `code`
    const inlineRegex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = inlineRegex.exec(text)) !== null) {
      // Text before match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      if (match[2]) {
        // **bold**
        parts.push(
          <strong key={`${keyPrefix}-b-${match.index}`} className="text-gold-light font-bold">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // *italic*
        parts.push(
          <em key={`${keyPrefix}-i-${match.index}`} className="italic text-text-primary/85">
            {match[3]}
          </em>
        );
      } else if (match[4]) {
        // `code`
        parts.push(
          <code key={`${keyPrefix}-c-${match.index}`} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gold-light text-xs font-mono">
            {match[4]}
          </code>
        );
      }

      lastIndex = inlineRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  /** Detect and parse a markdown table block */
  const tryParseTable = (lines: string[], startIdx: number): { element: React.ReactElement; consumed: number } | null => {
    // A table needs at least 3 lines: header, separator, row
    if (startIdx + 2 >= lines.length) return null;

    const headerLine = lines[startIdx].trim();
    const separatorLine = lines[startIdx + 1].trim();

    // Check if this looks like a table header + separator
    if (!headerLine.includes('|') || !separatorLine.match(/^\|?[\s\-:|]+\|/)) return null;

    const parseRow = (line: string) => {
      return line.split('|').map(cell => cell.trim()).filter((cell, idx, arr) => {
        // Remove empty leading/trailing cells from | ... |
        if (idx === 0 && cell === '') return false;
        if (idx === arr.length - 1 && cell === '') return false;
        return true;
      });
    };

    const headers = parseRow(headerLine);
    if (headers.length === 0) return null;

    // Parse alignment from separator
    const sepCells = parseRow(separatorLine);
    const alignments = sepCells.map(cell => {
      if (cell.startsWith(':') && cell.endsWith(':')) return 'center' as const;
      if (cell.endsWith(':')) return 'right' as const;
      return 'left' as const;
    });

    // Parse body rows
    const bodyRows: string[][] = [];
    let rowIdx = startIdx + 2;
    while (rowIdx < lines.length && lines[rowIdx].trim().includes('|') && lines[rowIdx].trim() !== '') {
      bodyRows.push(parseRow(lines[rowIdx].trim()));
      rowIdx++;
    }

    if (bodyRows.length === 0) return null;

    const element = (
      <div key={`table-${startIdx}`} className="overflow-x-auto my-3 rounded-xl border border-gold-primary/15">
        <table className="w-full text-xs md:text-sm font-lora border-collapse">
          <thead>
            <tr className="bg-gold-primary/8 border-b border-gold-primary/20">
              {headers.map((header, hIdx) => (
                <th
                  key={hIdx}
                  className="px-3 py-2.5 text-gold-light font-bold text-left tracking-wide"
                  style={{ textAlign: alignments[hIdx] || 'left' }}
                >
                  {renderInlineMarkdown(header, `th-${startIdx}-${hIdx}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                {headers.map((_, cIdx) => (
                  <td
                    key={cIdx}
                    className="px-3 py-2 text-text-primary"
                    style={{ textAlign: alignments[cIdx] || 'left' }}
                  >
                    {renderInlineMarkdown(row[cIdx] || '', `td-${startIdx}-${rIdx}-${cIdx}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    return { element, consumed: rowIdx - startIdx };
  };

  /** Main markdown parser */
  const renderParsedMarkdown = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // ─── Horizontal Rule ───
      if (trimmed.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
        elements.push(
          <hr key={`hr-${i}`} className="border-0 h-px bg-gradient-to-r from-transparent via-gold-primary/25 to-transparent my-4" />
        );
        i++;
        continue;
      }

      // ─── Table ───
      const tableResult = tryParseTable(lines, i);
      if (tableResult) {
        elements.push(tableResult.element);
        i += tableResult.consumed;
        continue;
      }

      // ─── Heading ### ───
      if (trimmed.startsWith('###')) {
        const cleanTitle = trimmed.replace(/^###\s*/, '');
        elements.push(
          <h4 key={`h3-${i}`} className="font-cinzel text-base text-gold-light font-bold mt-4 mb-2 tracking-wide">
            {renderInlineMarkdown(cleanTitle, `h3-${i}`)}
          </h4>
        );
        i++;
        continue;
      }

      // ─── Standalone Bold Title (e.g. **Title**) ───
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 80 && !trimmed.slice(2, -2).includes('**')) {
        const cleanTitle = trimmed.slice(2, -2);
        elements.push(
          <h4 key={`bt-${i}`} className="font-sans font-extrabold text-sm text-gold-light uppercase tracking-widest mt-4 mb-1.5">
            {cleanTitle}
          </h4>
        );
        i++;
        continue;
      }

      // ─── Unordered List ───
      if (trimmed.match(/^[-*]\s+/)) {
        const listItems: { content: string; indent: number }[] = [];
        while (i < lines.length && lines[i].trim().match(/^[-*]\s+/)) {
          const indent = lines[i].search(/\S/);
          const content = lines[i].trim().replace(/^[-*]\s+/, '');
          listItems.push({ content, indent });
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} className="my-2 space-y-1.5 pl-1">
            {listItems.map((item, lIdx) => (
              <li key={lIdx} className="flex items-start gap-2 text-sm text-text-primary font-lora leading-relaxed" style={{ paddingLeft: `${Math.min(item.indent, 4) * 8}px` }}>
                <span className="text-gold-primary/60 mt-1.5 text-[6px] flex-shrink-0">●</span>
                <span>{renderInlineMarkdown(item.content, `li-${i}-${lIdx}`)}</span>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // ─── Ordered List ───
      if (trimmed.match(/^\d+\.\s+/)) {
        const listItems: string[] = [];
        while (i < lines.length && lines[i].trim().match(/^\d+\.\s+/)) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
          i++;
        }
        elements.push(
          <ol key={`ol-${i}`} className="my-2 space-y-1.5 pl-1">
            {listItems.map((item, lIdx) => (
              <li key={lIdx} className="flex items-start gap-2.5 text-sm text-text-primary font-lora leading-relaxed">
                <span className="text-gold-light/70 font-bold text-xs mt-0.5 flex-shrink-0 w-5 text-right">{lIdx + 1}.</span>
                <span>{renderInlineMarkdown(item, `ol-${i}-${lIdx}`)}</span>
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // ─── Empty line ───
      if (trimmed === '') {
        i++;
        continue;
      }

      // ─── Regular paragraph ───
      elements.push(
        <p key={`p-${i}`} className="text-text-primary text-sm leading-relaxed mb-3 font-lora">
          {renderInlineMarkdown(trimmed, `p-${i}`)}
        </p>
      );
      i++;
    }

    return elements;
  };

  const isTypewriterDone = currentIndex >= (interpretation || '').length;

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

          {/* Text block with rich markdown */}
          <div className="text-sm text-text-primary leading-relaxed pr-1">
            {renderParsedMarkdown(displayText)}
            {/* Blinking cursor at the end of typewriter */}
            {!isTypewriterDone && (
              <span className="inline-block w-1.5 h-4 bg-gold-light ml-0.5 animate-[pulse_1s_infinite] align-middle" />
            )}
          </div>
          
          {/* Complete Ghibli signature */}
          {isTypewriterDone && (
            <div className="mt-2 text-right text-[11px] font-lora italic text-gold-light/60 border-t border-gold-primary/5 pt-3">
              Chúc bạn vạn dặm bình yên, thương mến từ Mèo Vàng. 🐱🍂
            </div>
          )}

          {/* ════════════════ Toggle nút mở Chat ════════════════ */}
          {isTypewriterDone && apiKey && !showChat && (
            <div className="flex flex-col items-center gap-3 mt-2 animate-[fadeIn_0.5s_ease-out]">
              <button
                onClick={() => setShowChat(true)}
                className="group relative flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-gold-primary/10 to-gold-primary/5 hover:from-gold-primary/20 hover:to-gold-primary/10 border border-gold-primary/25 hover:border-gold-light/50 text-gold-light cursor-pointer transition-all duration-300 shadow-[0_0_20px_rgba(244,162,97,0.08)] hover:shadow-[0_0_30px_rgba(244,162,97,0.18)] active:scale-[0.97]"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">🐱</span>
                <div className="flex flex-col items-start">
                  <span className="text-xs md:text-sm font-sans font-bold tracking-wide">
                    Trò chuyện tiếp với Mèo Vàng
                  </span>
                  <span className="text-[10px] font-lora text-gold-light/55 italic">
                    Trả lời Mèo Vàng, chia sẻ tâm sự, hoặc yêu cầu phân tích sâu hơn...
                  </span>
                </div>
                <span className="text-sm opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">💬</span>
              </button>
            </div>
          )}

          {/* ════════════════ Khu vực Chat (ẩn mặc định) ════════════════ */}
          {isTypewriterDone && apiKey && showChat && (
            <div className="flex flex-col gap-5 border-t border-gold-primary/10 mt-4 pt-5 animate-[fadeIn_0.4s_ease-out]">
              {/* Header chat + nút ẩn */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-sans text-gold-light/75 uppercase tracking-widest font-bold">
                  <span>💬 Trò Chuyện Cùng Mèo Vàng</span>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="px-2.5 py-1 text-[10px] font-sans font-semibold rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold-primary/30 text-text-secondary hover:text-gold-light transition-all cursor-pointer"
                  title="Thu gọn khu vực trò chuyện"
                >
                  ▲ Thu gọn
                </button>
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

              {/* Gợi ý câu hỏi nhanh (Smart Suggestion Chips) — chỉ hiện khi chưa có follow-up */}
              {!chatLoading && followUps.length === 0 && (
                <div className="flex flex-col gap-2.5 mt-1">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-gold-light/45 pl-1">
                    🐱 Mèo Vàng đang muốn hiểu bạn hơn! Chia sẻ bằng cách chọn hoặc gõ:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SUGGESTION_CHIPS.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendChatMessage(chip.text)}
                        className="text-left px-3.5 py-2.5 text-[11px] md:text-xs font-sans font-semibold rounded-xl bg-gold-primary/5 hover:bg-gold-primary/12 border border-gold-primary/15 hover:border-gold-primary/40 text-gold-light/90 hover:text-gold-light transition-all cursor-pointer select-none active:scale-[0.97] shadow-sm"
                      >
                        {chip.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Gợi ý tiếp tục sau khi đã chat — chỉ 2 gợi ý phổ biến */}
              {!chatLoading && followUps.length > 0 && followUps.length % 2 === 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handleSendChatMessage('✨ Mèo Vàng giải thích thêm giúp em nhé!')}
                    className="text-left px-3 py-2 text-[11px] font-sans font-semibold rounded-xl bg-gold-primary/5 hover:bg-gold-primary/10 border border-gold-primary/15 hover:border-gold-primary/35 text-gold-light/80 hover:text-gold-light transition-all cursor-pointer select-none active:scale-[0.97]"
                  >
                    ✨ Giải thích thêm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendChatMessage('🌱 Em nên hành động cụ thể thế nào?')}
                    className="text-left px-3 py-2 text-[11px] font-sans font-semibold rounded-xl bg-gold-primary/5 hover:bg-gold-primary/10 border border-gold-primary/15 hover:border-gold-primary/35 text-gold-light/80 hover:text-gold-light transition-all cursor-pointer select-none active:scale-[0.97]"
                  >
                    🌱 Lời khuyên hành động
                  </button>
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
                  placeholder="Chia sẻ cảm xúc hoặc hỏi thêm Mèo Vàng..."
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
