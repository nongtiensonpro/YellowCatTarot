'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useApiKey } from '@/components/ApiKeyProvider';
import { useEntropyCollector } from '@/hooks/useEntropyCollector';
import { TarotCard as TarotCardType, tarotCards, getCardById } from '@/lib/cards-data';
import { continueTarotChat, ChatMessage, InteractiveCard } from '@/lib/gemini';
import {
  createNewDeck,
  prepareFaceDownCards,
  userPicksFromFaceDown,
  hyperShuffle,
  DeckState,
  FaceDownPosition
} from '@/lib/tarot-deck';
import CardDeck from '@/components/CardDeck';
import InteractiveTarotBoard from '@/components/InteractiveTarotBoard';
import { YellowCatState } from '@/components/YellowCat';

const YellowCat3D = dynamic(() => import('@/components/YellowCat3D'), {
  ssr: false,
  loading: () => (
    <div className="w-[180px] h-[180px] flex items-center justify-center">
      <div className="animate-pulse text-gold-light/60 font-cinzel text-xs">Đang gọi Mèo Vàng...</div>
    </div>
  ),
});

type FlowStep = 'INPUT' | 'INITIAL_SHUFFLE' | 'INITIAL_PICK' | 'CHAT_ACTIVE' | 'CHAT_SHUFFLING' | 'CHAT_PICKING';

export default function InteractiveReadingPage() {
  const { apiKey, shuffleTheme, pickingTheme, reduceMotion } = useApiKey();
  const { startCollecting, stopCollecting, onMouseMove, onTouchMove } = useEntropyCollector();
  const [weatherEffect, setWeatherEffect] = useState<'wind' | 'sun' | 'fog' | null>(null);

  // Step state
  const [step, setStep] = useState<FlowStep>('INPUT');
  const [initialMode, setInitialMode] = useState<'single' | 'three-card'>('single');
  const [userQuestion, setUserQuestion] = useState('');

  // Tarot Deck States
  const [deckState, setDeckState] = useState<DeckState | null>(null);
  const [faceDownPositions, setFaceDownPositions] = useState<FaceDownPosition[]>([]);
  const [drawnCards, setDrawnCards] = useState<InteractiveCard[]>([]);
  const [currentPickCount, setCurrentPickCount] = useState(0);

  // Chat & AI States
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typedReply, setTypedReply] = useState('');

  // Support Card Mid-chat State
  const [selectedParentSlug, setSelectedParentSlug] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'clarifier' | 'branch-a' | 'branch-b' | 'directional' | 'advice'>('clarifier');
  const [customPositionName, setCustomPositionName] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, typedReply, isTyping]);

  // Handle Mèo Vàng voice & state bubbles
  const getCatProps = (): { state: YellowCatState; speech: string } => {
    const totalCards = drawnCards.length;

    // Sweet/thảo mai overload limit (20 cards)
    if (totalCards >= 20) {
      return {
        state: 'sleeping',
        speech: 'Ngáp... Ôi chu choa, miêu miêu nhỏ bé này đã xáo bài và giải nghĩa mỏi cả mắt rồi ạ... Bàn gỗ Tarot của chúng ta đã chất tới 20 lá bài rồi, năng lượng bắt đầu đè lên nhau lộn xộn hết cả lên, và Mèo Vàng buồn ngủ dí cả hai mắt lại rồi đây này. Mèo Vàng không thể ghi nhớ nổi gì thêm nữa đâu ạ... Hay quý nhân thương em thì chúng ta tạm nghỉ ngơi, cùng ngẫm nghĩ lại những thông điệp trộm vía siêu đẹp siêu sâu sắc nãy giờ nha! Zzz... 🐱💤'
      };
    }

    switch (step) {
      case 'INPUT':
        return {
          state: 'idle',
          speech: 'Chào quý nhân của lòng em! Hôm nay quý nhân có điều gì băn khoăn muốn mở lòng đối thoại cùng Mèo Vàng không ạ? Hãy chọn hình thức khởi đầu và gửi câu hỏi nhé! 🐱✨'
        };
      case 'INITIAL_SHUFFLE':
        return {
          state: 'shuffle',
          speech: 'Miêu miêu đang xáo bài cẩn thận, dồn hết linh khí hoàng hôn gác mái để trộn năng lượng cho quý nhân đây... 🌌🐾'
        };
      case 'INITIAL_PICK':
        const remaining = (initialMode === 'single' ? 1 : 3) - currentPickCount;
        return {
          state: 'idle',
          speech: `Xong rồi trộm vía bài siêu mướt! Quý nhân hãy hít một hơi thật sâu và chọn ${remaining} lá bài cốt lõi để chúng ta làm nền móng nhé! ✨🃏`
        };
      case 'CHAT_SHUFFLING':
        return {
          state: 'shuffle',
          speech: 'Mèo Vàng đang xào bài thật kỹ để quý nhân nhặt lá bài bổ trợ mới đây ạ... ✨🐾'
        };
      case 'CHAT_PICKING':
        return {
          state: 'idle',
          speech: 'Linh khí đang hội tụ! Xin mời quý nhân chạm nhẹ chọn lá bài bổ trợ tiếp theo trên bàn cờ Tarot đối thoại này nhé! 🐱🔮'
        };
      case 'CHAT_ACTIVE':
        if (aiLoading) {
          return {
            state: 'reading',
            speech: 'Mèo Vàng đang nhìn sâu vào mắt nhân vật trên lá bài, lắng nghe tiếng thì thầm của vũ trụ để giải nghĩa cho quý nhân đây... 🐱🔮'
          };
        }
        return {
          state: 'happy',
          speech: 'Mèo Vàng vẫn đang ngồi ngay ngắn trên tấm nhung ấm cúng. Quý nhân muốn hỏi sâu hơn về lá bài nào, hay muốn rút thêm bài bổ trợ/rẽ nhánh thì bảo miêu miêu nhé! 🐱🍂'
        };
      default:
        return { state: 'idle', speech: 'Mèo Vàng luôn sẵn sàng lắng nghe quý nhân!' };
    }
  };

  const catProps = getCatProps();

  // START SHUFFLE
  const handleStartShuffle = async () => {
    if (!apiKey) {
      alert('Vui lòng cài đặt API Key trong menu ⚙️ góc trên bên phải trước khi bắt đầu nhé! Khóa này hoàn toàn miễn phí.');
      return;
    }

    setStep('INITIAL_SHUFFLE');
    setDrawnCards([]);
    setCurrentPickCount(0);
    startCollecting();

    if (shuffleTheme === 'wheel-of-fate') {
      const weathers = ['wind', 'sun', 'fog'] as const;
      const rw = weathers[Math.floor(Math.random() * weathers.length)];
      setWeatherEffect(rw);
    } else {
      setWeatherEffect(null);
    }

    const finishShuffle = async () => {
      const entropy = stopCollecting();
      const shuffledOrder = await hyperShuffle(entropy.events, entropy.timings);
      const newDeck = createNewDeck(shuffledOrder);
      const faceDowns = prepareFaceDownCards(newDeck, 78);

      setDeckState(newDeck);
      setFaceDownPositions(faceDowns);
      setStep('INITIAL_PICK');
    };

    if (shuffleTheme !== 'soot-sprite') {
      setTimeout(finishShuffle, reduceMotion ? 100 : 1800);
    } else {
      (window as any).finishInteractiveInitialShuffle = finishShuffle;
    }
  };

  // INITIAL PICK CARDS (1 or 3)
  const handleSelectInitialCard = (displayIdx: number) => {
    if (step !== 'INITIAL_PICK' || !deckState) return;

    try {
      const drawn = userPicksFromFaceDown(deckState, faceDownPositions, displayIdx);
      const cardType = getCardById(drawn.cardId);

      if (!cardType) return;

      const newPickCount = currentPickCount + 1;
      setCurrentPickCount(newPickCount);

      const targetPicks = initialMode === 'single' ? 1 : 3;

      let positionName = 'Lá Bài Cốt Lõi';
      if (initialMode === 'three-card') {
        const positions = ['Quá Khứ', 'Hiện Tại', 'Tương Lai'];
        positionName = positions[newPickCount - 1];
      }

      const newInteractiveCard: InteractiveCard = {
        id: `card-${Date.now()}-${drawn.cardId}`,
        card: cardType,
        isReversed: drawn.isReversed,
        role: 'core',
        customPositionName: positionName
      };

      const updatedDrawn = [...drawnCards, newInteractiveCard];
      setDrawnCards(updatedDrawn);

      if (newPickCount >= targetPicks) {
        // Complete initial picks -> Trigger initial AI interpretation
        handleInitialInterpretation(updatedDrawn);
      } else {
        // Prepare next round of face down cards
        const faceDowns = prepareFaceDownCards(deckState, 78 - updatedDrawn.length);
        setFaceDownPositions(faceDowns);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // INITIAL INTERPRETATION CALL
  const handleInitialInterpretation = async (currentCards: InteractiveCard[]) => {
    setStep('CHAT_ACTIVE');
    setAiLoading(true);
    setAiError('');

    // Prepopulate starting messages
    const questionText = userQuestion.trim()
      ? `Quý nhân đã gửi trực giác vào câu hỏi: "${userQuestion}"\n`
      : 'Quý nhân xin thông điệp chữa lành chung từ vũ trụ.\n';

    const cardDetails = currentCards
      .map(
        (c, idx) =>
          `${idx + 1}. Lá **${c.card.nameVi} (${c.card.nameEn})** (${c.isReversed ? 'Ngược ↩' : 'Xuôi ✦'}) - Vai trò: **${c.customPositionName}**`
      )
      .join('\n');

    const welcomeMsg: ChatMessage = {
      role: 'model',
      content: `*Mèo Vàng nhẹ nhàng nâng tách trà hoa cúc tỏa khói nghi ngút, chậm rãi chùi kính gọng tròn rồi hướng đôi mắt to lấp lánh về phía quý nhân...*\n\nChào quý nhân thương yêu! Mèo Vàng đã bày biện bộ bài Rider-Waite-Smith lên mặt bàn gỗ sồi cổ kính. \n\n${questionText}Sơ đồ bài cốt lõi đầu tiên trộm vía đã lên đầy đủ:\n${cardDetails}\n\nHãy đợi em một chút để em ngẫm nghĩ và luận giải sâu sắc tiến trình năng lượng này gửi tới quý nhân nhé! ✨`
    };

    setChatHistory([welcomeMsg]);

    try {
      // Build first prompt content
      let promptText = '';
      if (initialMode === 'single') {
        promptText = `Chào Mèo Vàng, đây là bắt đầu Chế độ Đối thoại Nâng cao. Quý nhân đã rút ra lá bài cốt lõi đầu tiên:\n- Lá bài: ${currentCards[0].card.nameVi} (${currentCards[0].isReversed ? 'Ngược' : 'Xuôi'}). Câu hỏi: "${userQuestion}"`;
      } else {
        promptText = `Chào Mèo Vàng, đây là bắt đầu Chế độ Đối thoại Nâng cao. Quý nhân đã trải 3 lá bài cốt lõi (Quá khứ, Hiện tại, Tương lai):\n${currentCards.map((c) => `- Vị trí ${c.customPositionName}: ${c.card.nameVi} (${c.isReversed ? 'Ngược' : 'Xuôi'})`).join('\n')}. Câu hỏi: "${userQuestion}"`;
      }

      const response = await continueTarotChat(apiKey, [], promptText, undefined, currentCards);

      // Typewriter Effect
      animateTypewriter(response.reply);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Lỗi kết nối vũ trụ. Xin quý nhân vui lòng nhấp gửi lại tin nhắn nhé!');
      setAiLoading(false);
    }
  };

  // SEND CHAT MESSAGE IN DIALOGUE
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || aiLoading || isTyping) return;
    if (drawnCards.length >= 20) {
      alert('Mèo Vàng đang buồn ngủ và quá tải vì bàn bài quá nhiều lá. Quý nhân thương em thì tạm dừng rút/hỏi thêm nhé! 🐱💤');
      return;
    }

    const userText = chatInput.trim();
    setChatInput('');

    const userMsg: ChatMessage = { role: 'user', content: userText };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);

    setAiLoading(true);
    setAiError('');

    try {
      const response = await continueTarotChat(apiKey, updatedHistory, userText, undefined, drawnCards);
      animateTypewriter(response.reply);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Lỗi kết nối vũ trụ. Vui lòng gửi lại câu hỏi nha quý nhân!');
      setAiLoading(false);
    }
  };

  // TYPEWRITER SIMULATION
  const animateTypewriter = (text: string) => {
    setIsTyping(true);
    setTypedReply('');
    let i = 0;
    const speed = 15; // ms per character

    const timer = setInterval(() => {
      if (i < text.length) {
        setTypedReply((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        setAiLoading(false);
        setChatHistory((prev) => [...prev, { role: 'model', content: text }]);
        setTypedReply('');
      }
    }, speed);
  };

  // TRIGGER SUPPORT CARD PICKING
  const handleTriggerSupportCard = (
    role: 'clarifier' | 'branch-a' | 'branch-b' | 'directional' | 'advice',
    customName?: string
  ) => {
    if (!deckState) return;
    if (drawnCards.length >= 20) {
      alert('Bàn trải bài của chúng ta đã đạt giới hạn 20 lá. Mèo Vàng đã quá tải năng lượng rồi quý nhân ơi! 🐱💤');
      return;
    }

    // Default to the last drawn card as parent if not set
    const lastCard = drawnCards[drawnCards.length - 1];
    setSelectedParentSlug(lastCard?.card.slug || '');
    setSelectedRole(role);
    setCustomPositionName(customName || '');

    setStep('CHAT_SHUFFLING');
    startCollecting();

    if (shuffleTheme === 'wheel-of-fate') {
      const weathers = ['wind', 'sun', 'fog'] as const;
      const rw = weathers[Math.floor(Math.random() * weathers.length)];
      setWeatherEffect(rw);
    } else {
      setWeatherEffect(null);
    }

    const finishShuffle = () => {
      const entropy = stopCollecting();
      const faceDowns = prepareFaceDownCards(deckState, 78 - drawnCards.length);
      setFaceDownPositions(faceDowns);
      setStep('CHAT_PICKING');
    };

    if (shuffleTheme !== 'soot-sprite') {
      setTimeout(finishShuffle, reduceMotion ? 100 : 1500);
    } else {
      (window as any).finishInteractiveSupportShuffle = finishShuffle;
    }
  };

  // PICK MID-CHAT SUPPORT CARD
  const handleSelectSupportCard = async (displayIdx: number) => {
    if (step !== 'CHAT_PICKING' || !deckState) return;

    try {
      const drawn = userPicksFromFaceDown(deckState, faceDownPositions, displayIdx);
      const cardType = getCardById(drawn.cardId);

      if (!cardType) return;

      const parentCard = drawnCards.find((c) => c.card.slug === selectedParentSlug);

      const newInteractiveCard: InteractiveCard = {
        id: `card-${Date.now()}-${drawn.cardId}`,
        card: cardType,
        isReversed: drawn.isReversed,
        role: selectedRole,
        parentSlug: selectedParentSlug || undefined,
        parentNameVi: parentCard?.card.nameVi || undefined,
        customPositionName: customPositionName || undefined
      };

      const updatedDrawn = [...drawnCards, newInteractiveCard];
      setDrawnCards(updatedDrawn);
      setStep('CHAT_ACTIVE');
      setAiLoading(true);

      // Construct a system message explaining the new drawn card
      const parentNameText = parentCard ? `lá bài gốc "${parentCard.card.nameVi}"` : 'sơ đồ bài';
      const roleText = customPositionName || (
        selectedRole === 'clarifier' ? 'Lá bài làm rõ (Clarifier)' :
        selectedRole === 'branch-a' ? 'Nhánh lựa chọn A' :
        selectedRole === 'branch-b' ? 'Nhánh lựa chọn B' :
        selectedRole === 'directional' ? 'Lá bài theo hướng nhìn nhân vật' : 'Lời khuyên'
      );

      const systemNotificationText = `[Hệ thống]: Quý nhân đã rút thêm lá bài **${cardType.nameVi} (${cardType.nameEn})** - Chiều **${drawn.isReversed ? 'Ngược ↩' : 'Xuôi ✦'}** làm vai trò **${roleText}** cho ${parentNameText}.`;

      // Display in chat visual
      const systemVisualMsg: ChatMessage = {
        role: 'model',
        content: `*Mèo Vàng tròn xoe mắt, rút thêm một quân bài bổ trợ từ bộ bài phẳng đặt nhẹ nhàng cạnh bên...*\n\n${systemNotificationText}\n\nHãy chờ miêu miêu liên kết lá bài bổ trợ mới này vào câu chuyện và giải thích tường tận cho quý nhân nhé! ✨`
      };

      setChatHistory((prev) => [...prev, systemVisualMsg]);

      // Call Gemini for interactive updates
      const aiQuery = `Hệ thống cập nhật: Tôi vừa rút thêm lá bài bổ trợ ${cardType.nameVi} (${drawn.isReversed ? 'Ngược' : 'Xuôi'}) làm vai trò ${roleText} cho lá ${selectedParentSlug || 'gốc'}. Hãy giải thích cặn kẽ mối liên hệ và ý nghĩa chữa lành của lá bổ trợ này trong câu chuyện Tarot đối thoại của tôi nhé!`;
      
      const response = await continueTarotChat(apiKey, chatHistory, aiQuery, undefined, updatedDrawn);
      animateTypewriter(response.reply);

    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Lỗi kết nối vũ trụ khi phân tích lá bài bổ trợ. Quý nhân vui lòng thử lại nhé!');
      setAiLoading(false);
      setStep('CHAT_ACTIVE');
    }
  };

  const handleReset = () => {
    setStep('INPUT');
    setUserQuestion('');
    setDrawnCards([]);
    setChatHistory([]);
    setChatInput('');
    setCurrentPickCount(0);
    setDeckState(null);
  };

  return (
    <div className="flex-1 w-full bg-gradient-to-b from-[#0d0d1a] to-[#12122a] py-6 px-4 sm:px-6 lg:px-8 select-none flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col gap-6 items-stretch">
        
        {/* Page Title */}
        <div className="text-center border-b border-gold-primary/10 pb-4 flex flex-col items-center gap-1.5">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <h1 className="font-cinzel text-xl md:text-2xl font-extrabold text-gold-primary tracking-wider drop-shadow-[0_0_8px_var(--color-gold-glow)]">
              Đối Thoại & Nhặt Bài Động cùng Mèo Vàng
            </h1>
            <span className="px-2 py-0.5 text-[8px] font-sans font-bold tracking-widest rounded bg-white/5 border border-white/10 text-text-secondary uppercase select-none">
              BETA · THỬ NGHIỆM 🧪
            </span>
          </div>
          <p className="font-lora text-[11px] md:text-xs text-text-secondary italic">
            Không gian Tarot chuyên nghiệp — Vừa trò chuyện, vừa nhặt bài bổ trợ rẽ nhánh tháo gỡ mọi ngóc ngách bế tắc.
          </p>
        </div>

        {/* TOP: Yellow Cat character box */}
        <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center p-3 bg-bg-surface/10 border border-gold-primary/5 rounded-2xl z-20">
          <YellowCat3D
            state={catProps.state}
            size="lg"
            speechBubble={catProps.speech}
            drawnCardsCount={drawnCards.length}
          />
        </div>

        {/* CORE INTERACTION AREA */}
        <div className="w-full flex flex-col gap-6 mt-2 relative z-10">

          {/* STEP 1: INITIAL CHOOSE AND QUESTION INPUT */}
          {step === 'INPUT' && (
            <div className="bg-bg-surface/40 border border-gold-primary/15 rounded-2xl p-6 shadow-xl flex flex-col gap-5 max-w-2xl mx-auto w-full animate-[fadeIn_0.3s_ease-out]">
              <h3 className="font-cinzel text-sm md:text-base text-gold-light font-bold tracking-wide">
                💬 Khởi Tạo Cuộc Đối Thoại Tarot Nâng Cao
              </h3>

              {/* Mode Select */}
              <div className="flex flex-col gap-2 font-lora">
                <label className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold font-sans">
                  Chọn sơ đồ bài nền móng ban đầu:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setInitialMode('single')}
                    className={`py-3.5 px-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      initialMode === 'single'
                        ? 'bg-gold-primary/15 border-gold-primary text-gold-light shadow-[0_0_12px_rgba(244,162,97,0.15)] font-bold'
                        : 'bg-bg-elevated/20 border-gold-primary/10 text-text-secondary hover:border-gold-primary/30'
                    }`}
                  >
                    <span className="text-lg">🃏</span>
                    <span className="text-xs">Rút 1 Lá Cốt Lõi</span>
                  </button>
                  <button
                    onClick={() => setInitialMode('three-card')}
                    className={`py-3.5 px-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      initialMode === 'three-card'
                        ? 'bg-gold-primary/15 border-gold-primary text-gold-light shadow-[0_0_12px_rgba(244,162,97,0.15)] font-bold'
                        : 'bg-bg-elevated/20 border-gold-primary/10 text-text-secondary hover:border-gold-primary/30'
                    }`}
                  >
                    <span className="text-lg">🕰️</span>
                    <span className="text-xs">Trải 3 Lá Khởi Đầu</span>
                  </button>
                </div>
              </div>

              {/* Question Textarea */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold font-sans">
                  Trực giác quý nhân muốn hỏi điều gì? (Không bắt buộc)
                </label>
                <textarea
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="Ví dụ: Tôi nên tiếp tục công việc hiện tại hay rẽ hướng kinh doanh riêng?..."
                  className="w-full h-24 bg-bg-elevated/40 border border-gold-primary/10 focus:border-gold-light focus:outline-none rounded-xl p-4 text-xs font-lora text-text-primary placeholder:text-text-secondary/40 focus:shadow-[0_0_12px_var(--color-gold-glow)] transition-all resize-none"
                />
              </div>

              <button
                onClick={handleStartShuffle}
                className="w-full py-3.5 font-sans font-bold text-xs uppercase tracking-widest rounded-xl bg-gold-primary hover:bg-gold-light text-bg-deep cursor-pointer transition-all shadow-[0_0_15px_var(--color-gold-glow)] flex items-center justify-center gap-2"
              >
                <span>🃏 Bắt Đầu Xáo Bài & Trải Nghiệm</span>
              </button>
            </div>
          )}

          {/* STEP 2 & 3: SHUFFLING OR INITIAL PICKING TABLE */}
          {(step === 'INITIAL_SHUFFLE' || step === 'INITIAL_PICK') && (
            <div className="bg-[#12122b]/50 border border-gold-primary/15 rounded-2xl p-4 shadow-2xl flex flex-col items-center relative overflow-visible animate-[fadeIn_0.3s_ease-out] min-h-[380px] md:min-h-[440px] max-w-4xl mx-auto w-full">
              {/* Mystic circle bg */}
              <div className="absolute w-[300px] h-[300px] rounded-full border border-gold-primary/5 -z-10 animate-[spin_60s_linear_infinite] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              
              {step === 'INITIAL_PICK' && (
                <span className="text-[10px] md:text-xs font-sans text-gold-light/75 uppercase tracking-widest font-semibold text-center mt-2 animate-pulse">
                  ✨ Quý nhân hãy rút lần lượt {(initialMode === 'single' ? 1 : 3) - currentPickCount} lá bài cốt lõi nhé ✨
                </span>
              )}

              <CardDeck
                cardsCount={78 - drawnCards.length}
                onSelectCard={handleSelectInitialCard}
                isShuffling={step === 'INITIAL_SHUFFLE'}
                isDeckSpread={step === 'INITIAL_PICK'}
                shuffleTheme={shuffleTheme}
                pickingTheme={pickingTheme}
                weatherEffect={weatherEffect}
                reduceMotion={reduceMotion}
                onStopShuffle={() => {
                  if ((window as any).finishInteractiveInitialShuffle) {
                    (window as any).finishInteractiveInitialShuffle();
                  }
                }}
              />
            </div>
          )}

          {/* MID-CHAT SHUFFLING & PICKING ACTION CARD */}
          {(step === 'CHAT_SHUFFLING' || step === 'CHAT_PICKING') && (
            <div className="bg-[#12122b]/50 border border-gold-primary/15 rounded-2xl p-4 shadow-2xl flex flex-col items-center relative overflow-visible animate-[fadeIn_0.3s_ease-out] min-h-[380px] md:min-h-[440px] max-w-4xl mx-auto w-full z-30">
              <div className="absolute w-[200px] h-[200px] rounded-full border border-gold-primary/5 -z-10 animate-[spin_40s_linear_infinite] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              
              <div className="text-center mt-2 flex flex-col gap-1 z-10">
                <span className="text-[9px] font-sans text-text-secondary uppercase tracking-widest leading-none font-bold">
                  Đang Nhặt Lá Bài Bổ Trợ:
                </span>
                <span className="text-xs font-cinzel text-gold-light font-bold uppercase tracking-wider animate-pulse">
                  {customPositionName || (
                    selectedRole === 'clarifier' ? 'Làm rõ lá bài' :
                    selectedRole === 'branch-a' ? 'Nhánh lựa chọn A' :
                    selectedRole === 'branch-b' ? 'Nhánh lựa chọn B' :
                    selectedRole === 'directional' ? 'Theo hướng nhìn nhân vật' : 'Lời khuyên từ Mèo'
                  )}
                </span>
              </div>

              <CardDeck
                cardsCount={78 - drawnCards.length}
                onSelectCard={handleSelectSupportCard}
                isShuffling={step === 'CHAT_SHUFFLING'}
                isDeckSpread={step === 'CHAT_PICKING'}
                shuffleTheme={shuffleTheme}
                pickingTheme={pickingTheme}
                weatherEffect={weatherEffect}
                reduceMotion={reduceMotion}
                onStopShuffle={() => {
                  if ((window as any).finishInteractiveSupportShuffle) {
                    (window as any).finishInteractiveSupportShuffle();
                  }
                }}
              />
            </div>
          )}

          {/* STEP 4: MAIN INTERACTIVE DIALOGUE SCREEN */}
          {(step === 'CHAT_ACTIVE' || step === 'CHAT_SHUFFLING' || step === 'CHAT_PICKING') && drawnCards.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-[fadeIn_0.3s_ease-out] w-full max-w-6xl">
              
              {/* LEFT: Dynamic Tarot Board Canvas (7/12 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-3 min-h-[500px]">
                <h3 className="font-cinzel text-xs font-bold text-gold-light uppercase tracking-wider pl-1.5 flex items-center gap-1.5">
                  🔮 Bàn Bài Đối Thoại Động ({drawnCards.length}/20 lá)
                </h3>
                <InteractiveTarotBoard cards={drawnCards} />
              </div>

              {/* RIGHT: Converse Chat Frame (5/12 cols) */}
              <div className="lg:col-span-5 flex flex-col bg-bg-surface/30 border border-gold-primary/15 rounded-3xl p-4 md:p-5 shadow-2xl h-[650px] overflow-hidden relative backdrop-blur-xl">
                
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-gold-primary/10 pb-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    <div>
                      <h4 className="font-cinzel text-xs font-bold text-gold-light tracking-wider">
                        Đối thoại cùng Mèo Vàng
                      </h4>
                      <p className="text-[9px] text-text-secondary/60 font-sans italic">
                        Đang sử dụng trí tuệ Gemini
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 text-[9px] font-sans font-bold uppercase tracking-wider rounded-lg bg-white/5 border border-white/10 hover:border-gold-primary/40 hover:bg-white/10 text-text-secondary hover:text-gold-light cursor-pointer transition-all"
                  >
                    🔄 Bắt đầu lại
                  </button>
                </div>

                {/* Chat Messages Log */}
                <div className="flex-1 overflow-y-auto py-4 px-2 space-y-4 scrollbar-thin flex flex-col">
                  {chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[85%] ${
                        msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'
                      }`}
                    >
                      {/* Message Bubble */}
                      <div
                        className={`rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed font-lora border ${
                          msg.role === 'user'
                            ? 'bg-gold-primary/10 border-gold-primary/20 text-gold-light rounded-tr-none'
                            : 'bg-white/[0.02] border-white/[0.04] text-text-primary rounded-tl-none'
                        }`}
                      >
                        {/* Markdown styling helper */}
                        <div className="whitespace-pre-line font-lora">
                          {msg.content}
                        </div>
                      </div>

                      {/* Msg footer timestamp */}
                      <span className="text-[9px] text-text-secondary/40 font-sans mt-1 px-1">
                        {msg.role === 'user' ? 'Bạn' : 'Mèo Vàng'}
                      </span>
                    </div>
                  ))}

                  {/* Render simulated live typewriter reply */}
                  {isTyping && typedReply && (
                    <div className="flex flex-col max-w-[85%] self-start items-start">
                      <div className="rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed font-lora border bg-white/[0.02] border-white/[0.04] text-text-primary rounded-tl-none">
                        <div className="whitespace-pre-line">
                          {typedReply}
                          <span className="inline-block w-1.5 h-3.5 ml-1 bg-gold-primary animate-pulse" />
                        </div>
                      </div>
                      <span className="text-[9px] text-text-secondary/40 font-sans mt-1 px-1">
                        Mèo Vàng đang viết...
                      </span>
                    </div>
                  )}

                  {/* Loading placeholder */}
                  {aiLoading && !isTyping && (
                    <div className="flex flex-col self-start items-start gap-1">
                      <div className="rounded-2xl px-4 py-3 text-xs md:text-sm border bg-white/[0.01] border-white/[0.03] text-text-secondary/60 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-gold-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-gold-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}

                  {/* Error Box */}
                  {aiError && (
                    <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-3 text-xs text-red-400 font-lora self-stretch">
                      ⚠️ {aiError}
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Interactive Supporting Card Drawing Drawer (Dynamic Chips) */}
                {drawnCards.length < 20 && !aiLoading && !isTyping && (
                  <div className="border-t border-gold-primary/10 pt-3 pb-2 flex-shrink-0 flex flex-wrap gap-2 justify-start items-center">
                    <span className="text-[9px] font-sans font-bold text-gold-light uppercase tracking-wider mr-1">
                      Nhặt bài bổ trợ:
                    </span>
                    
                    {/* Advice Card */}
                    <button
                      onClick={() => handleTriggerSupportCard('advice', 'Lời Khuyên của Mèo')}
                      className="px-2.5 py-1 text-[9px] font-sans font-bold tracking-wide rounded-lg bg-[#2d6a4f]/15 border border-[#2d6a4f]/30 hover:border-green-400 hover:bg-[#2d6a4f]/30 text-green-400 cursor-pointer transition-all active:scale-95"
                    >
                      🌿 Nhận Lời Khuyên
                    </button>

                    {/* Clarifier Card */}
                    <button
                      onClick={() => handleTriggerSupportCard('clarifier', 'Lá Bài Làm Rõ')}
                      className="px-2.5 py-1 text-[9px] font-sans font-bold tracking-wide rounded-lg bg-[#4361ee]/15 border border-[#4361ee]/30 hover:border-[#4cc9f0] hover:bg-[#4361ee]/30 text-[#4cc9f0] cursor-pointer transition-all active:scale-95"
                    >
                      🔍 Rút Lá Làm Rõ
                    </button>

                    {/* Branch A Card */}
                    <button
                      onClick={() => handleTriggerSupportCard('branch-a', 'Lựa Chọn A')}
                      className="px-2.5 py-1 text-[9px] font-sans font-bold tracking-wide rounded-lg bg-[#2a9d8f]/15 border border-[#2a9d8f]/30 hover:border-[#48cae4] hover:bg-[#2a9d8f]/30 text-[#48cae4] cursor-pointer transition-all active:scale-95"
                    >
                      🛣️ Rẽ Nhánh Lựa Chọn A
                    </button>

                    {/* Branch B Card */}
                    <button
                      onClick={() => handleTriggerSupportCard('branch-b', 'Lựa Chọn B')}
                      className="px-2.5 py-1 text-[9px] font-sans font-bold tracking-wide rounded-lg bg-[#e76f51]/15 border border-[#e76f51]/30 hover:border-[#f4a261] hover:bg-[#e76f51]/30 text-[#f4a261] cursor-pointer transition-all active:scale-95"
                    >
                      🛣️ Rẽ Nhánh Lựa Chọn B
                    </button>
                  </div>
                )}

                {/* Dialog Chat Input Field */}
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-2 border-t border-gold-primary/10 pt-3 flex-shrink-0"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={aiLoading || isTyping || drawnCards.length >= 20}
                    placeholder={
                      drawnCards.length >= 20
                        ? "Mèo Vàng đã đi ngủ Zzz..."
                        : "Gửi phản hồi của bạn đến Mèo Vàng..."
                    }
                    className="flex-1 bg-bg-elevated/40 border border-gold-primary/10 focus:border-gold-light focus:outline-none rounded-xl px-4 py-2.5 text-xs font-lora text-text-primary placeholder:text-text-secondary/30 disabled:opacity-40"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || aiLoading || isTyping || drawnCards.length >= 20}
                    className="p-2.5 rounded-xl bg-gold-primary disabled:bg-gold-primary/30 hover:bg-gold-light text-bg-deep cursor-pointer transition-all disabled:opacity-45 disabled:pointer-events-none active:scale-95"
                  >
                    ➔
                  </button>
                </form>

              </div>
              
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
