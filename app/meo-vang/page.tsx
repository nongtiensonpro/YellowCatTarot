'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import YellowCat from '@/components/YellowCat';
import { useApiKey } from '@/components/ApiKeyProvider';

export default function MeoVangIntroPage() {
  const { setBackgroundTheme } = useApiKey();
  const [activeTab, setActiveTab] = useState<'personality' | 'healing' | 'guide' | 'attic'>('personality');

  useEffect(() => {
    setBackgroundTheme('celestial-dawn');
  }, [setBackgroundTheme]);

  const tabs = [
    { id: 'personality', label: '🐱 Tính Cách Độc Bản', icon: '🐾' },
    { id: 'healing', label: '🌱 Giao Thức Chữa Lành', icon: '🔮' },
    { id: 'guide', label: '📖 Cẩm Nang Đối Thoại', icon: '💬' },
    { id: 'attic', label: '🌿 Căn Gác Mái Ghibli', icon: '🏡' },
  ] as const;

  return (
    <div className="flex-1 w-full bg-transparent py-10 px-4 sm:px-6 lg:px-8 select-none flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col gap-8 items-stretch animate-[fadeIn_0.4s_ease-out]">
        
        {/* Navigation Breadcrumb */}
        <div className="text-xs font-sans border-b border-gold-primary/10 pb-4 text-text-secondary flex gap-1.5 items-center">
          <Link href="/" className="hover:text-gold-light transition-colors">Trang Chủ</Link>
          <span>/</span>
          <span className="text-gold-light font-medium">Hồ Sơ Mèo Vàng</span>
        </div>

        {/* HERO SECTION */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c1c3f]/50 to-[#12122b]/80 border border-gold-primary/20 p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center shadow-2xl backdrop-blur-md">
          {/* Decorative glowing background elements */}
          <div className="absolute w-[200px] h-[200px] rounded-full bg-gold-primary/5 blur-3xl -top-10 -left-10 pointer-events-none" />
          <div className="absolute w-[300px] h-[300px] rounded-full bg-mystic-purple/5 blur-3xl -bottom-20 -right-20 pointer-events-none" />
          
          {/* Interactive Mascot with controls */}
          <div className="flex-shrink-0">
            <YellowCat
              state="idle"
              size="lg"
              showControls={true}
              speechBubble="Em chào quý nhân! Quý nhân ghé thăm hồ sơ của em để xem các chỉ số và trang bị phụ kiện đúng không ạ? 🐱💖"
            />
          </div>

          {/* Hero text */}
          <div className="flex flex-col gap-3 text-center md:text-left flex-1">
            <span className="text-[10px] md:text-xs font-sans text-gold-light font-extrabold uppercase tracking-widest">
              🔮 Sứ Giả Tarot Chữa Lành
            </span>
            <h1 className="font-cinzel text-3xl md:text-4xl font-black text-gold-primary tracking-wide drop-shadow-[0_0_8px_var(--color-gold-glow)]">
              MÈO VÀNG
            </h1>
            <p className="font-lora text-xs md:text-sm text-text-secondary leading-relaxed italic">
              "Miêu miêu nhỏ bé xem bài dạo, bọc đường ngọt ngào nhưng đấm nhẹ cực đau, chuyên xoa dịu những tâm hồn mỏi mệt bên căn gác mái gỗ sồi rực nắng hoàng hôn."
            </p>
            
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-gold-primary/10 border border-gold-primary/20 text-gold-light text-[10px] font-sans font-bold uppercase tracking-wider">
                #ThảoMaiĐẳngCấp
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-mystic-purple/10 border border-mystic-purple/20 text-text-accent text-[10px] font-sans font-bold uppercase tracking-wider">
                #ChâmBiếmChữaLành
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-forest-green/10 border border-forest-green/20 text-green-400 text-[10px] font-sans font-bold uppercase tracking-wider">
                #CáThểĐộcBản
              </span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE TABS */}
        <div className="flex flex-col gap-6">
          {/* Tab selector */}
          <div className="flex border-b border-gold-primary/10 pb-1 gap-2 overflow-x-auto select-none no-scrollbar font-sans font-bold text-xs md:text-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-gold-light bg-gold-primary/10 border-b-2 border-gold-light rounded-b-none'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface/30'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-[#161633]/30 border border-gold-primary/15 rounded-2xl p-6 shadow-2xl backdrop-blur-md min-h-[300px] flex flex-col justify-start">
            
            {/* PERSONALITY TAB */}
            {activeTab === 'personality' && (
              <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out] font-lora">
                <h3 className="font-cinzel text-lg text-gold-light font-bold">
                  🎭 Nghệ Thuật Giao Tiếp: Thảo Mai Bọc Đường x Châm Biếm Chữa Lành
                </h3>
                
                <p className="text-sm text-text-primary leading-relaxed">
                  Mèo Vàng sở hữu một tính cách độc đáo bậc nhất vũ trụ Tarot. Em xưng hô ngọt xớt, gọi người đọc là <strong>"quý nhân"</strong> hoặc <strong>"quý nhân của lòng em"</strong>, tự xưng là <strong>"miêu miêu nhỏ bé"</strong>. Với phong cách <strong>"Thảo Mai Đẳng Cấp" (Happou-Bijin)</strong>, em nâng niu cảm xúc của quý nhân hết mức bằng những lời khen ngợi tinh tế và vô cùng hợp lý.
                </p>

                <div className="my-2 bg-[#e76f51]/10 border border-[#e76f51]/20 rounded-xl p-4">
                  <h4 className="text-xs font-sans font-bold text-gold-dark uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    ⚠️ CHẾ ĐỘ ĐẶC BIỆT: CHÂM BIẾM CHỮA LÀNH
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Khi quý nhân rơi vào trạng thái tiêu cực, bi quan cực đoan hay tự hoại bản thân, Mèo Vàng sẽ lập tức kích hoạt chế độ châm chọc sắc sảo. Em sẽ tâng bốc sự thảm hại hay nỗi buồn ấy lên thành một dạng "nghệ thuật bi kịch đầy phong cách" để giúp quý nhân giật mình tỉnh ngộ. Em sắc sảo chỉ ra rằng: <em>không ai được phí hoài sự tồn tại của mình vào những điều u tối!</em>
                  </p>
                </div>

                <h4 className="font-sans font-bold text-xs text-gold-light uppercase tracking-widest mt-2">
                  🌱 Triết lý Độc Bản (Unique Individuality)
                </h4>
                <p className="text-sm text-text-primary leading-relaxed">
                  Đối với Mèo Vàng, mỗi người là một cá thể hoàn toàn riêng biệt, độc lập và duy nhất. Kể cả khi sống chung môi trường, văn hóa hay quốc gia, trải nghiệm và năng lượng của mỗi quý nhân vẫn là <strong>"độc bản"</strong>. Do đó, nỗi buồn hay thử thách của quý nhân cũng là "độc bản", và sức mạnh để tự chữa lành, vươn lên của quý nhân cũng không ai có thể thay thế!
                </p>
                
                <p className="text-xs text-text-secondary leading-relaxed italic mt-1.5">
                  "Nếu bị quý nhân hờn dỗi, em sẽ lập tức nhõng nhẽo: 'Ôi chu choa, miêu miêu nhỏ bé này chỉ vì thương quý nhân quá nên mới dám bộc bạch lòng mình thôi mà...' 🐾🥺"
                </p>
              </div>
            )}

            {/* HEALING TAB */}
            {activeTab === 'healing' && (
              <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out] font-lora">
                <h3 className="font-cinzel text-lg text-gold-light font-bold">
                  🔮 Giao Thức Độc Quyền: Xoa — Đấm nhẹ — Nâng
                </h3>
                
                <p className="text-sm text-text-primary leading-relaxed">
                  Mèo Vàng không bao giờ phán xét tốt - xấu hay dọa dẫm quý nhân bằng những điềm gở. Mọi sự luận giải bài Tarot Rider-Waite-Smith đều được gói gọn trong giao thức chữa lành 3 bước nhịp nhàng:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="bg-gold-primary/5 border border-gold-primary/20 rounded-xl p-4 flex flex-col gap-2 shadow-md">
                    <span className="text-2xl">🌸</span>
                    <h4 className="font-sans font-bold text-xs text-gold-light uppercase tracking-widest">
                      Bước 1: XOA (Công nhận)
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Mèo Vàng lắng nghe và ôm ấp cảm xúc của quý nhân. Em công nhận dũng khí, sự nhạy cảm và mọi sự chịu đựng phi thường mà quý nhân đã gánh vác qua năm tháng.
                    </p>
                  </div>

                  <div className="bg-gold-dark/5 border border-gold-dark/20 rounded-xl p-4 flex flex-col gap-2 shadow-md">
                    <span className="text-2xl">🥊</span>
                    <h4 className="font-sans font-bold text-xs text-gold-dark uppercase tracking-widest">
                      Bước 2: ĐẤM NHẸ (Chỉ ra điểm mù)
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Dựa vào biểu tượng học RWS gốc (như nguyên tố, hành tinh, chi tiết tranh), em chỉ ra thói quen tự giới hạn, điểm mù hay rào cản nội tâm của quý nhân một cách cực kỳ nhẹ nhàng như lông hồng.
                    </p>
                  </div>

                  <div className="bg-forest-green/5 border border-forest-green/20 rounded-xl p-4 flex flex-col gap-2 shadow-md">
                    <span className="text-2xl">🚀</span>
                    <h4 className="font-sans font-bold text-xs text-green-400 uppercase tracking-widest">
                      Bước 3: NÂNG (Hướng tương lai)
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Khép lại buổi giải bài, em luôn đưa ra các lời khuyên thực tế, truyền đầy năng lượng hành động và thắp sáng ngọn lửa hy vọng, kéo quý nhân vững bước về phía ánh sáng tương lai rực rỡ.
                    </p>
                  </div>
                </div>

                <p className="text-sm text-text-primary leading-relaxed mt-2">
                  Em kết hợp linh hoạt kiến thức Tarot huyền học chuyên sâu với sự cá nhân hóa tối đa. Mỗi phiên giải bài là độc nhất vô nhị dành riêng cho bản thể của quý nhân ngày hôm đó.
                </p>
              </div>
            )}

            {/* GUIDE TAB */}
            {activeTab === 'guide' && (
              <div className="flex flex-col gap-5 animate-[fadeIn_0.3s_ease-out] font-lora">
                <h3 className="font-cinzel text-lg text-gold-light font-bold">
                  📖 Cẩm Nang Đối Thoại Chữa Lành Cùng Mèo Vàng
                </h3>
                
                <p className="text-sm text-text-primary leading-relaxed">
                  Để buổi trải bài mang lại giá trị chữa lành tốt nhất và tránh việc đoán mò mơ hồ, Mèo Vàng được thiết kế để <strong>tương tác qua lại liên tục</strong> với quý nhân. Dưới đây là những bí quyết giúp quý nhân trò chuyện hiệu quả nhất.
                </p>

                {/* 3 Steps */}
                <div className="border-l-2 border-gold-primary/30 pl-4 ml-2 space-y-4 my-2">
                  <div className="relative">
                    <span className="absolute -left-[25px] top-0 flex items-center justify-center w-5 h-5 rounded-full bg-gold-primary text-bg-deep font-sans text-[10px] font-bold">
                      1
                    </span>
                    <h4 className="font-sans font-bold text-xs text-gold-light uppercase tracking-widest pl-2">
                      Xem Phân Tích Ban Đầu
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed pl-2 mt-1">
                      Mèo Vàng sẽ bắt đầu bằng một lời luận giải ngắn gọn, cô đọng về ý nghĩa các lá bài và đặt câu hỏi gợi mở cho tình huống của bạn.
                    </p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[25px] top-0 flex items-center justify-center w-5 h-5 rounded-full bg-gold-primary text-bg-deep font-sans text-[10px] font-bold">
                      2
                    </span>
                    <h4 className="font-sans font-bold text-xs text-gold-light uppercase tracking-widest pl-2">
                      Chia Sẻ Thực Tế (Khuyên Dùng)
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed pl-2 mt-1">
                      Thay vì trả lời "Vâng" hoặc im lặng, hãy trả lời câu hỏi của Mèo Vàng bằng cách chia sẻ thêm về hoàn cảnh, cảm xúc hoặc suy nghĩ hiện tại của bạn.
                    </p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[25px] top-0 flex items-center justify-center w-5 h-5 rounded-full bg-gold-primary text-bg-deep font-sans text-[10px] font-bold">
                      3
                    </span>
                    <h4 className="font-sans font-bold text-xs text-gold-light uppercase tracking-widest pl-2">
                      Đưa Ra Câu Hỏi Đào Sâu
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed pl-2 mt-1">
                      Tiếp tục hỏi Mèo Vàng về những khía cạnh cụ thể bạn muốn làm rõ dựa trên các lá bài đã rút.
                    </p>
                  </div>
                </div>

                {/* Good vs Bad Examples */}
                <div className="my-2 bg-gold-primary/5 border border-gold-primary/10 rounded-xl p-4">
                  <h4 className="text-xs font-sans font-bold text-gold-light uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    💡 Bí Quyết Trò Chuyện Hiệu Quả
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-lg">
                      <span className="text-red-400 text-xs font-sans font-bold uppercase tracking-wider block mb-1">❌ Hạn Chế Hỏi Thế Này:</span>
                      <p className="text-xs text-text-secondary italic">"Khi nào em có người yêu?"</p>
                      <p className="text-[11px] text-text-secondary/70 mt-1">
                        (Mèo Vàng sẽ phải đoán mò và đưa ra lời khuyên chung chung vì thiếu dữ kiện thực tế).
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/5 border border-green-500/15 rounded-lg">
                      <span className="text-green-400 text-xs font-sans font-bold uppercase tracking-wider block mb-1">✅ Nên Trò Chuyện Thế Này:</span>
                      <p className="text-xs text-text-secondary italic">"Em đang độc thân 2 năm, ngại giao tiếp và hơi sợ tổn thương..."</p>
                      <p className="text-[11px] text-text-secondary/70 mt-1">
                        (Mèo Vàng sẽ bám sát tâm lý và đưa ra các bước gỡ rối cụ thể phù hợp nhất với bạn).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Formatting features */}
                <div className="my-1 bg-[#1a1a3a]/40 border border-gold-primary/10 rounded-xl p-4 flex flex-col gap-2.5">
                  <h4 className="text-xs font-sans font-bold text-gold-light uppercase tracking-widest flex items-center gap-1.5">
                    🎨 Yêu Cầu Định Dạng Đặc Biệt
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Mèo Vàng rất thích hỗ trợ quý nhân bằng các định dạng trực quan. Quý nhân có thể yêu cầu Mèo Vàng xuất kết quả dưới dạng đặc biệt:
                  </p>
                  <ul className="space-y-1.5 text-[11px] text-text-secondary list-disc list-inside">
                    <li><strong className="text-gold-light">Bảng so sánh Markdown:</strong> Đối chiếu các lựa chọn, hướng đi.</li>
                    <li><strong className="text-gold-light">Bản đồ HTML/CSS:</strong> Vẽ biểu đồ cột mốc, lộ trình phát triển.</li>
                    <li><strong className="text-gold-light">Danh sách nhiệm vụ (Checklist):</strong> Các hành động cụ thể cần thực hiện ngay.</li>
                  </ul>
                  <div className="mt-1 p-2.5 bg-bg-deep/50 rounded-lg border border-gold-primary/5">
                    <span className="text-[10px] font-sans font-bold text-gold-dark uppercase tracking-widest block mb-1">💡 Câu Lệnh Gợi Ý Cho Quý Nhân:</span>
                    <p className="text-xs text-text-secondary italic">"Hãy vẽ lộ trình 3 tháng tới của em bằng một bảng Markdown nhé miêu miêu."</p>
                  </div>
                </div>

                {/* Chế Độ Trải Bài Đối Thoại Động (Đặc Biệt - Nhặt Bài Rẽ Nhánh) */}
                <div className="my-2 border-t border-gold-primary/10 pt-5 flex flex-col gap-3">
                  <h4 className="font-cinzel text-sm text-gold-light font-bold uppercase tracking-wider flex items-center gap-1.5">
                    🔮 Chế Độ Đặc Biệt: Bàn Bài Đối Thoại Động & Nhặt Bài Rẽ Nhánh
                  </h4>
                  <p className="text-xs text-text-primary leading-relaxed">
                    Đây là không gian Tarot chuyên nghiệp tối tân tại <Link href="/reading/interactive" className="text-gold-light font-semibold hover:underline">Đối Thoại & Nhặt Bài Động cùng Mèo Vàng</Link>. Khác với trải bài tĩnh thông thường, chế độ đặc biệt này cho phép quý nhân <strong>trao đổi hai chiều liên tục</strong> và <strong>nhặt bài bổ trợ rẽ nhánh</strong> để tháo gỡ từng nút thắt vấn đề:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="p-3.5 bg-gold-primary/5 border border-gold-primary/15 rounded-xl flex flex-col gap-1.5">
                      <strong className="text-xs text-gold-light font-sans uppercase tracking-wider block">💬 Đối Thoại Hai Chiều Liên Tục</strong>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        Mèo Vàng sẽ không độc thoại đọc giải nghĩa dài dòng vô lý. Em đưa ra ấn tượng đầu tiên súc tích và luôn hỏi ngược quý nhân. Quý nhân hãy cởi mở tâm sự phản hồi liên tục để Mèo Vàng bám sát tâm sự thực tế và đưa ra chỉ dẫn chính xác nhất.
                      </p>
                    </div>

                    <div className="p-3.5 bg-gold-primary/5 border border-gold-primary/15 rounded-xl flex flex-col gap-1.5">
                      <strong className="text-xs text-gold-light font-sans uppercase tracking-wider block">🌿 Nhặt Lá Bài Bổ Trợ Mới Tùy Ý</strong>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        Khi gặp bế tắc hoặc phân vân, quý nhân chỉ cần click chọn một lá bài trên bàn làm <strong>Lá Bài Gốc (Parent)</strong>, sau đó nhấp các nút chức năng phía dưới khung chat để nhặt thêm lá bài mới làm rõ năng lượng:
                      </p>
                      <ul className="text-[10px] text-text-secondary list-disc list-inside space-y-0.5 pl-1 mt-1">
                        <li><span className="text-[#4cc9f0] font-bold">Lá bài làm rõ (Clarifier):</span> Giải mã năng lượng mập mờ.</li>
                        <li><span className="text-[#f4a261] font-bold">Nhánh lựa chọn A/B:</span> Phân tích so sánh 2 hướng đi đối nghịch.</li>
                        <li><span className="text-green-400 font-bold">Lời khuyên của Mèo (Advice):</span> Định hướng giải pháp chữa lành tích cực.</li>
                      </ul>
                    </div>

                    <div className="p-3.5 bg-gold-primary/5 border border-gold-primary/15 rounded-xl flex flex-col gap-1.5">
                      <strong className="text-xs text-gold-light font-sans uppercase tracking-wider block">🕹️ Kéo Thả, Xoay & Khóa Bài Tự Do</strong>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        Quý nhân hoàn toàn làm chủ bàn bài Tarot: tự do kéo thả sắp xếp các quân bài, xoay góc nghiêng tùy thích, hoặc bấm nút 🔒 để khóa vị trí lá bài nhằm giữ bố cục mạng lưới kết nối năng lượng sạch sẽ, trực quan.
                      </p>
                    </div>

                    <div className="p-3.5 bg-gold-primary/5 border border-gold-primary/15 rounded-xl flex flex-col gap-1.5">
                      <strong className="text-xs text-gold-light font-sans uppercase tracking-wider block">🧭 Thu Phóng 300% & Mắt Điều Hướng</strong>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        Thu phóng (zoom) bàn bài tự do lên tới 300% để ngắm tranh. Sử dụng bộ điều hướng D-PAD (▲, ▼, ◀, ▶) và nút Căn Giữa 🎯 để định vị tầm nhìn. Click đúp vào lá bài để mở trình ngắm tranh chi tiết toàn màn hình (thanh menu của web sẽ tự động ẩn đi để quý nhân chìm đắm hoàn toàn).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ATTIC TAB */}
            {activeTab === 'attic' && (
              <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out] font-lora">
                <h3 className="font-cinzel text-lg text-gold-light font-bold">
                  🌿 Căn Gác Mái Studio Ghibli: Trải Nghiệm Đánh Thức Mọi Giác Quan
                </h3>
                
                <p className="text-sm text-text-primary leading-relaxed">
                  Khi đến xem bài cùng Mèo Vàng, quý nhân sẽ được đặt chân vào một không gian đậm chất hội họa Studio Ghibli ấm cúng, thư giãn và ngập tràn cảm xúc chữa lành:
                </p>

                <div className="flex flex-col md:flex-row gap-5 items-center my-2">
                  <div className="flex-1 flex flex-col gap-3">
                    <ul className="space-y-2.5 text-xs text-text-secondary list-disc list-inside">
                      <li>🏡 **Bối cảnh cổ kính:** Căn gác mái bằng gỗ sồi cũ kỹ, treo những bó oải hương, bạc hà và xô thơm khô lủng lẳng trên xà nhà, tỏa ra hương thảo mộc nhè nhẹ dễ chịu.</li>
                      <li>☀️ **Ánh sáng Golden Hour:** Ánh hoàng hôn vàng óng chiếu xiên qua ô cửa sổ tròn cổ kính, vẽ nên những vệt sáng lung linh chứa các hạt bụi vàng bay lơ lửng trong không khí.</li>
                      <li>🍵 **ASMR Thư Giãn:** Tiếng tách trà hoa cúc mật ong bốc khói nhẹ, tiếng chú chim sẻ hót líu lo xa xa, tiếng lạt xạt ấm áp khi hai bàn chân mập mạp của Mèo Vàng xào bài lạo xạo trên mặt bàn gỗ mộc.</li>
                    </ul>
                  </div>
                </div>

                <p className="text-sm text-text-primary leading-relaxed">
                  Tất cả tạo nên một thế giới thiêng liêng và tĩnh lặng, giúp quý nhân trút bỏ mọi muộn phiền ngoài cánh cửa, thả lỏng tâm hồn để đón nhận những lời thì thầm quý báu từ vũ trụ huyền bí.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* FOOTER ACTION */}
        <div className="flex flex-col items-center gap-4 text-center border-t border-gold-primary/10 pt-8 pb-4 font-sans">
          <h4 className="font-cinzel text-base text-gold-light font-bold">
            🔮 Quý nhân đã sẵn sàng nhận thông điệp định mệnh chưa?
          </h4>
          <p className="font-lora text-xs text-text-secondary max-w-md leading-relaxed">
            Mèo Vàng đã chuẩn bị sẵn tách trà hoa cúc mật ong và xào bài sẵn sàng rồi. Hãy chọn một trải bài phù hợp để bắt đầu hành trình chữa lành ngay nhé!
          </p>
          <Link
            href="/reading"
            className="px-6 py-3 bg-gold-primary hover:bg-gold-light text-bg-deep font-bold text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_var(--color-gold-glow)] active:scale-98 cursor-pointer"
          >
            🎴 Đến Bàn Trải Bài Tarot
          </Link>
        </div>

      </div>
    </div>
  );
}
