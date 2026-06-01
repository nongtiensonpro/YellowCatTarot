'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function MeoVangIntroPage() {
  const [activeTab, setActiveTab] = useState<'personality' | 'healing' | 'attic'>('personality');

  const tabs = [
    { id: 'personality', label: '🐱 Tính Cách Độc Bản', icon: '🐾' },
    { id: 'healing', label: '🌱 Giao Thức Chữa Lành', icon: '🔮' },
    { id: 'attic', label: '🌿 Căn Gác Mái Ghibli', icon: '🏡' },
  ] as const;

  return (
    <div className="flex-1 w-full bg-gradient-to-b from-[#0d0d1a] to-[#12122a] py-10 px-4 sm:px-6 lg:px-8 select-none flex flex-col items-center">
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
          
          {/* Logo container */}
          <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full border-2 border-gold-light/40 overflow-hidden flex-shrink-0 shadow-[0_0_20px_rgba(244,162,97,0.2)] animate-crystal">
            <img 
              src="/meo-vang-logo.png" 
              alt="Mèo Vàng Chân Dung" 
              className="w-full h-full object-cover"
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
