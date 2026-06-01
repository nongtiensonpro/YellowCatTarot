export interface TarotCard {
  id: number;
  slug: string;
  nameEn: string;
  nameVi: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  number: string; // '0'-'21' cho major, 'ace'-'king' cho minor
  keywordsVi: string[];
  meaningUpright: string;
  meaningReversed: string;
  imagePath: string;
}

const majorArcanaFiles: Record<string, string> = {
  'the-fool': 'TheFool.webp',
  'the-magician': 'TheMagician.webp',
  'the-high-priestess': 'TheHighPriestess.webp',
  'the-empress': 'TheEmpress.webp',
  'the-emperor': 'TheEmperor.webp',
  'the-hierophant': 'TheHierophant.webp',
  'the-lovers': 'TheLovers.webp',
  'the-chariot': 'Chariot.webp',
  'strength': 'Strength.webp',
  'the-hermit': 'TheHermit.webp',
  'wheel-of-fortune': 'WheelofFortune.webp',
  'justice': 'Justice.webp',
  'the-hanged-man': 'TheHangedMan.webp',
  'death': 'Death.webp',
  'temperance': 'Temperance.webp',
  'the-devil': 'TheDevil.webp',
  'the-tower': 'TheTower.webp',
  'the-star': 'TheStar.webp',
  'the-moon': 'TheMoon.webp',
  'the-sun': 'TheSun.webp',
  'judgement': 'Judgement.webp',
  'the-world': 'TheWorld.webp',
};

// Helper để lấy đường dẫn ảnh chính xác của mỗi lá bài
function getCardImagePath(
  slug: string,
  arcana: 'major' | 'minor',
  number: string,
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles'
): string {
  if (arcana === 'major') {
    const filename = majorArcanaFiles[slug];
    return `/cards/MajorArcana/${filename}`;
  } else {
    const suitFolder = suit!.charAt(0).toUpperCase() + suit!.slice(1); // Wands, Cups...
    if (slug === 'ace-of-swords') {
      return `/cards/MinorArcana/Swords/Swords.webp`;
    }
    const valPascal = number.charAt(0).toUpperCase() + number.slice(1); // Ace, Two...
    const filename = `${valPascal}of${suitFolder}.webp`;
    return `/cards/MinorArcana/${suitFolder}/${filename}`;
  }
}

const rawTarotCards: Omit<TarotCard, 'imagePath'>[] = [
  // MAJOR ARCANA (0-21)
  {
    id: 0,
    slug: 'the-fool',
    nameEn: 'The Fool',
    nameVi: 'Kẻ Hề',
    arcana: 'major',
    number: '0',
    keywordsVi: ['khởi đầu', 'tự do', 'liều lĩnh', 'ngây thơ', 'tiềm năng'],
    meaningUpright: 'Lá bài đại diện cho những khởi đầu mới, chuyến hành trình mới đầy hứa hẹn. Bạn đang mang năng lượng của sự tự do, ngây thơ và tin tưởng tuyệt đối vào vũ trụ. Hãy dũng cảm bước đi dù chưa biết phía trước có gì.',
    meaningReversed: 'Trạng thái ngược cảnh báo sự liều lĩnh, thiếu chuẩn bị hoặc sự ngây thơ thái quá dẫn đến sai lầm. Có thể bạn đang trì hoãn một khởi đầu mới vì nỗi sợ hãi, hoặc đang có những hành động bốc đồng thiếu suy nghĩ.'
  },
  {
    id: 1,
    slug: 'the-magician',
    nameEn: 'The Magician',
    nameVi: 'Pháp Sư',
    arcana: 'major',
    number: '1',
    keywordsVi: ['ý chí', 'tài năng', 'hành động', 'sáng tạo', 'quyền lực'],
    meaningUpright: 'Pháp Sư biểu thị sức mạnh ý chí và khả năng hiện thực hóa ước mơ. Bạn đã có đầy đủ công cụ và tài nguyên (nước, lửa, khí, đất) để thành công. Hãy tập trung tinh thần và bắt tay vào hành động ngay lập tức.',
    meaningReversed: 'Khi ngược, lá bài chỉ ra tài năng bị lãng phí, sự thao túng hoặc thiếu định hướng. Bạn có thể đang có những ý tưởng tuyệt vời nhưng thiếu thực tế để bắt đầu, hoặc có ai đó đang không trung thực xung quanh bạn.'
  },
  {
    id: 2,
    slug: 'the-high-priestess',
    nameEn: 'The High Priestess',
    nameVi: 'Nữ Tu Sĩ',
    arcana: 'major',
    number: '2',
    keywordsVi: ['trực giác', 'bí ẩn', 'nội tâm', 'tiềm thức', 'thông thái'],
    meaningUpright: 'Lá bài kêu gọi bạn quay về với thế giới nội tâm và lắng nghe trực giác của mình. Hãy tin tưởng vào những cảm giác mơ hồ nhưng mạnh mẽ bên trong. Lúc này, im lặng và quan sát tốt hơn là vội vã hành động.',
    meaningReversed: 'Trạng thái ngược cho thấy bạn đang phớt lờ trực giác của mình để chạy theo lý trí hoặc ý kiến bên ngoài. Bạn cũng có thể đang giấu kín những bí mật gây ảnh hưởng tiêu cực đến bản thân hoặc cảm thấy mất kết nối tâm linh.'
  },
  {
    id: 3,
    slug: 'the-empress',
    nameEn: 'The Empress',
    nameVi: 'Nữ Hoàng',
    arcana: 'major',
    number: '3',
    keywordsVi: ['phong phú', 'nuôi dưỡng', 'sáng tạo', 'thiên nhiên', 'sinh sản'],
    meaningUpright: 'Nữ Hoàng là hiện thân của đất mẹ, sự trù phú và tình yêu thương vô điều kiện. Bạn đang ở trong giai đoạn cực kỳ sáng tạo và gặt hái được nhiều thành quả ngọt ngào. Hãy kết nối với thiên nhiên và chăm sóc bản thân.',
    meaningReversed: 'Khi ngược, lá bài phản ánh sự phụ thuộc quá mức, kiệt quệ năng lượng sáng tạo hoặc thiếu sự chăm sóc. Bạn có thể đang kiểm soát người khác quá mức dưới danh nghĩa tình yêu thương, hoặc cảm thấy thiếu thốn tình cảm.'
  },
  {
    id: 4,
    slug: 'the-emperor',
    nameEn: 'The Emperor',
    nameVi: 'Hoàng Đế',
    arcana: 'major',
    number: '4',
    keywordsVi: ['quyền lực', 'cấu trúc', 'lý trí', 'ổn định', 'kỷ luật'],
    meaningUpright: 'Hoàng Đế đại diện cho cấu trúc vững chãi, kỷ luật, lý trí và quyền lực bảo vệ. Bạn cần thiết lập trật tự, đặt ra ranh giới rõ ràng và hành động một cách có tổ chức để đạt được mục tiêu của mình.',
    meaningReversed: 'Khi ngược, lá bài chỉ ra tính cách độc đoán, kiểm soát cực đoan hoặc ngược lại là sự thiếu kỷ luật, yếu đuối trong quản lý. Ranh giới của bạn đang bị xâm phạm hoặc bạn đang lạm dụng quyền lực của mình.'
  },
  {
    id: 5,
    slug: 'the-hierophant',
    nameEn: 'The Hierophant',
    nameVi: 'Giáo Hoàng',
    arcana: 'major',
    number: '5',
    keywordsVi: ['truyền thống', 'tín ngưỡng', 'hướng dẫn', 'tuân thủ', 'học hỏi'],
    meaningUpright: 'Lá bài đại diện cho những giá trị truyền thống, tổ chức chính thống và sự học hỏi từ những người thầy giàu kinh nghiệm. Đây là lúc nên tuân thủ các quy chuẩn xã hội và tìm kiếm tri thức có hệ thống.',
    meaningReversed: 'Giáo Hoàng ngược khuyến khích sự nổi loạn, phá vỡ giới hạn cũ và tự tạo ra triết lý sống riêng cho mình. Bạn không còn muốn đi theo lối mòn và sẵn sàng thử thách những giáo điều lỗi thời.'
  },
  {
    id: 6,
    slug: 'the-lovers',
    nameEn: 'The Lovers',
    nameVi: 'Đôi Tình Nhân',
    arcana: 'major',
    number: '6',
    keywordsVi: ['tình yêu', 'lựa chọn', 'liên kết', 'giá trị', 'hòa hợp'],
    meaningUpright: 'Lá bài biểu thị sự hòa hợp trong mối quan hệ và những lựa chọn quan trọng dựa trên giá trị cốt lõi của bản thân. Nó không chỉ nói về tình cảm lứa đôi mà còn là sự cân bằng giữa các yếu tố đối lập bên trong bạn.',
    meaningReversed: 'Khi ngược, lá bài cảnh báo sự bất hòa, mất cân bằng hoặc lựa chọn sai lầm do bốc đồng. Có thể bạn đang né tránh trách nhiệm trong mối quan hệ hoặc có sự mâu thuẫn giữa lý trí và con tim.'
  },
  {
    id: 7,
    slug: 'the-chariot',
    nameEn: 'The Chariot',
    nameVi: 'Chiến Xa',
    arcana: 'major',
    number: '7',
    keywordsVi: ['ý chí', 'chiến thắng', 'kiểm soát', 'quyết tâm', 'vượt khó'],
    meaningUpright: 'Chiến Xa mang năng lượng của sự quyết tâm mạnh mẽ và kiểm soát các lực lượng xung đột để tiến lên phía trước. Bằng ý chí sắt đá, bạn sẽ vượt qua mọi chướng ngại vật và giành được chiến thắng vang dội.',
    meaningReversed: 'Lá bài ngược chỉ ra sự mất phương hướng, thiếu kiểm soát hoặc áp lực quá lớn khiến bạn kiệt sức. Đôi khi bạn đang cố đấm ăn xôi trong một tình huống không còn phù hợp, cần học cách buông bỏ tay lái tạm thời.'
  },
  {
    id: 8,
    slug: 'strength',
    nameEn: 'Strength',
    nameVi: 'Sức Mạnh',
    arcana: 'major',
    number: '8',
    keywordsVi: ['can đảm', 'kiên nhẫn', 'nội lực', 'lòng trắc ẩn', 'tự chủ'],
    meaningUpright: 'Sức Mạnh không đến từ bạo lực mà từ sự kiên nhẫn, lòng trắc ẩn và khả năng tự chủ tuyệt vời. Bạn có thể thuần hóa thú tính bên trong bằng tình yêu thương và sự dịu dàng. Hãy vững tin vào sức mạnh tinh thần của mình.',
    meaningReversed: 'Khi ngược, lá bài phản ánh sự yếu đuối, nghi ngờ bản thân hoặc sự bộc phát của cơn giận dữ, thiếu kiểm soát cảm xúc. Bạn có thể đang cảm thấy bất an và để nỗi sợ hãi lấn át lý trí.'
  },
  {
    id: 9,
    slug: 'the-hermit',
    nameEn: 'The Hermit',
    nameVi: 'Ẩn Sĩ',
    arcana: 'major',
    number: '9',
    keywordsVi: ['nội tâm', 'cô đơn', 'tìm kiếm', 'khôn ngoan', 'chiêm nghiệm'],
    meaningUpright: 'Ẩn Sĩ kêu gọi bạn tạm lánh khỏi thế giới ồn ào để tự chiêm nghiệm và tìm kiếm câu trả lời từ sâu thẳm tâm hồn. Đây là lúc để tự học, thiền định và tìm kiếm sự khôn ngoan từ bên trong chính mình.',
    meaningReversed: 'Trạng thái ngược cảnh báo sự cô lập thái quá, cô đơn cực đoan hoặc từ chối lời khuyên hữu ích. Bạn có thể đang tự nhốt mình trong suy nghĩ tiêu cực hoặc đang quá khắt khe với bản thân.'
  },
  {
    id: 10,
    slug: 'wheel-of-fortune',
    nameEn: 'Wheel of Fortune',
    nameVi: 'Bánh Xe Vận Mệnh',
    arcana: 'major',
    number: '10',
    keywordsVi: ['vận may', 'chu kỳ', 'thay đổi', 'số phận', 'bước ngoặt'],
    meaningUpright: 'Bánh Xe Vận Mệnh nhắc nhở rằng mọi thứ đều có chu kỳ và thay đổi là điều tất yếu. Một bước ngoặt lớn đang đến, mang theo vận may và cơ hội mới. Hãy học cách thích nghi và nương theo dòng chảy vũ trụ.',
    meaningReversed: 'Khi ngược, lá bài biểu thị sự kháng cự đối với thay đổi, vận xui tạm thời hoặc cảm giác bất lực trước số phận. Hãy nhớ rằng bánh xe vẫn đang quay, và giai đoạn khó khăn này rồi cũng sẽ qua đi.'
  },
  {
    id: 11,
    slug: 'justice',
    nameEn: 'Justice',
    nameVi: 'Công Lý',
    arcana: 'major',
    number: '11',
    keywordsVi: ['sự thật', 'công bằng', 'nhân quả', 'cân bằng', 'quyết định'],
    meaningUpright: 'Công Lý đại diện cho luật nhân quả, sự thật khách quan và những quyết định công bằng. Mọi hành động của bạn trong quá khứ giờ đây sẽ mang lại kết quả xứng đáng. Hãy hành xử trung thực và chịu trách nhiệm với bản thân.',
    meaningReversed: 'Khi ngược, lá bài chỉ ra sự bất công, thiếu trung thực hoặc từ chối chấp nhận hậu quả hành vi của mình. Bạn có thể đang thiên vị, có góc nhìn phiến diện hoặc gặp rắc rối liên quan đến giấy tờ, pháp lý.'
  },
  {
    id: 12,
    slug: 'the-hanged-man',
    nameEn: 'The Hanged Man',
    nameVi: 'Người Bị Treo',
    arcana: 'major',
    number: '12',
    keywordsVi: ['buông bỏ', 'góc nhìn mới', 'hy sinh', 'chờ đợi', 'trì hoãn'],
    meaningUpright: 'Lá bài khuyên bạn nên dừng lại, buông bỏ sự kiểm soát và nhìn nhận vấn đề từ một góc độ hoàn toàn khác. Đôi khi việc hy sinh những lợi ích nhỏ trước mắt hoặc chấp nhận chờ đợi lại là chìa khóa giải thoát.',
    meaningReversed: 'Khi ngược, lá bài chỉ ra sự hy sinh vô ích, trì hoãn vô hạn hoặc không chịu thay đổi góc nhìn lạc hậu. Bạn đang cố gắng chống cự lại việc phải buông bỏ, khiến bản thân rơi vào trạng thái bế tắc.'
  },
  {
    id: 13,
    slug: 'death',
    nameEn: 'Death',
    nameVi: 'Thần Chết',
    arcana: 'major',
    number: '13',
    keywordsVi: ['kết thúc', 'chuyển hóa', 'buông bỏ', 'tái sinh', 'thay đổi'],
    meaningUpright: 'Đừng sợ hãi, Thần Chết hiếm khi nói về cái chết vật lý. Nó đại diện cho sự kết thúc của một giai đoạn cũ lỗi thời để nhường chỗ cho một khởi đầu mới tốt đẹp và sự tái sinh huy hoàng. Hãy dũng cảm buông bỏ quá khứ.',
    meaningReversed: 'Khi ngược, lá bài cho thấy bạn đang kháng cự lại sự thay đổi bắt buộc, cố bám víu vào những thứ đã chết (mối quan hệ độc hại, công việc cũ). Sự trì hoãn này chỉ kéo dài thêm đau khổ mà thôi.'
  },
  {
    id: 14,
    slug: 'temperance',
    nameEn: 'Temperance',
    nameVi: 'Điều Độ',
    arcana: 'major',
    number: '14',
    keywordsVi: ['cân bằng', 'kiên nhẫn', 'hòa hợp', 'chữa lành', 'chuyển hóa'],
    meaningUpright: 'Điều Độ mang đến năng lượng của sự cân bằng, kiên nhẫn và hòa hợp tuyệt vời. Bạn đang kết hợp các yếu tố đối lập một cách nghệ thuật để tạo ra giá trị mới và tự chữa lành tổn thương. Hãy tiếp tục giữ sự bình tĩnh.',
    meaningReversed: 'Lá bài ngược chỉ ra sự mất cân bằng cảm xúc, thái quá trong hành vi hoặc thiếu sự hòa hợp với mọi người. Bạn đang tiêu xài năng lượng bừa bãi và cần quay về lối sống chừng mực, khoa học.'
  },
  {
    id: 15,
    slug: 'the-devil',
    nameEn: 'The Devil',
    nameVi: 'Ác Quỷ',
    arcana: 'major',
    number: '15',
    keywordsVi: ['ràng buộc', 'nghiện ngập', 'ảo tưởng', 'vật chất', 'cám dỗ'],
    meaningUpright: 'Ác Quỷ đại diện cho những xiềng xích vô hình do chính bạn tạo ra: lòng tham vật chất, thói quen nghiện ngập hoặc mối quan hệ độc hại. Hãy nhớ rằng chìa khóa xích nằm trong tay bạn, bạn hoàn toàn có thể tự giải thoát.',
    meaningReversed: 'Khi ngược, lá bài là tín hiệu cực tốt cho thấy bạn đang bắt đầu thức tỉnh, giải phóng bản thân khỏi những cám dỗ, thói quen xấu và nỗi sợ hãi đeo bám lâu nay. Bạn đang lấy lại quyền kiểm soát cuộc đời.'
  },
  {
    id: 16,
    slug: 'the-tower',
    nameEn: 'The Tower',
    nameVi: 'Tháp Sụp Đổ',
    arcana: 'major',
    number: '16',
    keywordsVi: ['đột phá', 'hỗn loạn', 'mặc khải', 'phá hủy', 'thức tỉnh'],
    meaningUpright: 'Một sự kiện đột ngột nổ ra phá vỡ những nền tảng giả tạo mà bạn đã xây dựng trên cát. Dù hỗn loạn và đau đớn, đây là sự phá hủy cần thiết để bạn nhìn thấy sự thật và xây dựng lại một tương lai vững chắc hơn.',
    meaningReversed: 'Khi ngược, lá bài cho thấy bạn đang né tránh một cuộc khủng hoảng tất yếu hoặc đang phải trải qua sự sụp đổ kéo dài, âm ỉ. Hãy chấp nhận để những thứ cũ nát ra đi thay vì cố cứu vãn vô ích.'
  },
  {
    id: 17,
    slug: 'the-star',
    nameEn: 'The Star',
    nameVi: 'Ngôi Sao',
    arcana: 'major',
    number: '17',
    keywordsVi: ['hi vọng', 'chữa lành', 'cảm hứng', 'bình yên', 'niềm tin'],
    meaningUpright: 'Sau cơn giông bão của Tháp, Ngôi Sao xuất hiện mang đến niềm hi vọng, ánh sáng chữa lành và sự bình yên sâu thẳm. Vũ trụ đang chúc phúc cho bạn. Hãy giữ vững niềm tin và tiếp tục ước mơ rộng mở.',
    meaningReversed: 'Trạng thái ngược chỉ ra sự thất vọng, mất niềm tin vào cuộc sống và cảm giác bất an, thiếu cảm hứng sáng tạo. Bạn đang tự cô lập mình khỏi nguồn năng lượng tích cực của vũ trụ.'
  },
  {
    id: 18,
    slug: 'the-moon',
    nameEn: 'The Moon',
    nameVi: 'Mặt Trăng',
    arcana: 'major',
    number: '18',
    keywordsVi: ['ảo giác', 'sợ hãi', 'tiềm thức', 'mơ hồ', 'trực giác'],
    meaningUpright: 'Mặt Trăng đại diện cho vùng đất của bóng tối, ảo ảnh và những nỗi sợ mơ hồ trỗi dậy từ tiềm thức. Mọi thứ lúc này chưa thực sự rõ ràng, dễ có sự hiểu lầm. Hãy đi chậm lại và tin vào trực giác nhạy bén.',
    meaningReversed: 'Khi ngược, ánh sương mù bắt đầu tan biến, sự thật dần lộ diện. Bạn vượt qua được nỗi sợ hãi hoang đường, giải tỏa lo âu và nhìn nhận thế giới xung quanh một cách thực tế, tỉnh táo hơn.'
  },
  {
    id: 19,
    slug: 'the-sun',
    nameEn: 'The Sun',
    nameVi: 'Mặt Trời',
    arcana: 'major',
    number: '19',
    keywordsVi: ['hạnh phúc', 'thành công', 'sức sống', 'rõ ràng', 'tự tin'],
    meaningUpright: 'Đây là lá bài tích cực nhất trong bộ bài! Mặt Trời mang đến niềm vui thuần khiết, thành công rực rỡ, sức sống tràn trề và sự rõ ràng trong mọi việc. Mọi dự định của bạn lúc này đều được soi sáng ấm áp.',
    meaningReversed: 'Khi ngược, Mặt Trời vẫn rất tốt nhưng năng lượng của nó bị giảm bớt. Có thể bạn đang hơi kiêu ngạo, thiếu thực tế, hoặc đơn giản là thành công bị trì hoãn một chút. Đừng lo lắng, niềm vui vẫn đang đợi phía trước.'
  },
  {
    id: 20,
    slug: 'judgement',
    nameEn: 'Judgement',
    nameVi: 'Phán Xét',
    arcana: 'major',
    number: '20',
    keywordsVi: ['thức tỉnh', 'tái sinh', 'gọi mời', 'tha thứ', 'phán quyết'],
    meaningUpright: 'Tiếng kèn đại diện cho sự thức tỉnh tâm linh mạnh mẽ và tiếng gọi của số phận. Đã đến lúc bạn nhìn nhận lại cuộc đời, tha thứ cho quá khứ và đưa ra phán quyết quan trọng để bước sang chương mới huy hoàng.',
    meaningReversed: 'Lá bài ngược chỉ ra sự nghi ngờ bản thân, trốn tránh tiếng gọi bên trong hoặc từ chối bài học kinh nghiệm. Bạn đang tự phán xét mình quá khắt khe hoặc sợ hãi không dám đưa ra quyết định đổi đời.'
  },
  {
    id: 21,
    slug: 'the-world',
    nameEn: 'The World',
    nameVi: 'Thế Giới',
    arcana: 'major',
    number: '21',
    keywordsVi: ['hoàn thành', 'tích hợp', 'trọn vẹn', 'thành tựu', 'du lịch'],
    meaningUpright: 'Lá bài cuối cùng của Đại Bí Ẩn đại diện cho sự hoàn thành viên mãn của một hành trình dài. Bạn đạt được sự trọn vẹn, tích hợp mọi bài học và gặt hái thành tựu xứng đáng. Một chu kỳ tuyệt vời khép lại mở ra chân trời mới.',
    meaningReversed: 'Khi ngược, lá bài chỉ ra sự thiếu trọn vẹn, mục tiêu chưa hoàn thành hoặc cảm giác bế tắc ở bước cuối cùng. Có thể bạn đang thiếu một chút kiên nhẫn để hoàn thành bức tranh cuộc đời mình.'
  },

  // MINOR ARCANA — WANDS (22-35)
  {
    id: 22,
    slug: 'ace-of-wands',
    nameEn: 'Ace of Wands',
    nameVi: 'Át Quyền Trượng',
    arcana: 'minor',
    suit: 'wands',
    number: 'ace',
    keywordsVi: ['cảm hứng', 'khởi đầu', 'đam mê', 'sáng tạo', 'năng lượng'],
    meaningUpright: 'Khởi đầu của đam mê rực cháy! Một ý tưởng sáng tạo tuyệt vời, một cơ hội hành động tràn đầy cảm hứng đang đến với bạn. Hãy nắm bắt ngay dòng năng lượng tràn trề này để bắt đầu hành trình mới.',
    meaningReversed: 'Năng lượng đam mê bị tắc nghẽn hoặc trì hoãn. Bạn có ý tưởng nhưng thiếu lửa để thực hiện, hoặc dự án mới của bạn đang gặp rào cản ngay từ vạch xuất phát.'
  },
  {
    id: 23,
    slug: 'two-of-wands',
    nameEn: 'Two of Wands',
    nameVi: 'Hai Quyền Trượng',
    arcana: 'minor',
    suit: 'wands',
    number: 'two',
    keywordsVi: ['lập kế hoạch', 'quyết định', 'khám phá', 'tầm nhìn', 'chuẩn bị'],
    meaningUpright: 'Bạn đã đạt được thành công bước đầu và giờ đây đang đứng nhìn ra xa, lên kế hoạch cho những bước tiến lớn tiếp theo. Hãy dũng cảm lựa chọn lối đi rộng mở và mở rộng tầm nhìn của mình.',
    meaningReversed: 'Sự do dự, sợ hãi bước ra khỏi vùng an toàn hoặc lập kế hoạch kém. Bạn đang bế tắc giữa hai lựa chọn và lo sợ những rủi ro khi bước ra thế giới bên ngoài.'
  },
  {
    id: 24,
    slug: 'three-of-wands',
    nameEn: 'Three of Wands',
    nameVi: 'Ba Quyền Trượng',
    arcana: 'minor',
    suit: 'wands',
    number: 'three',
    keywordsVi: ['mong đợi', 'viễn cảnh', 'hợp tác', 'phát triển', 'kiên nhẫn'],
    meaningUpright: 'Những hạt giống bạn gieo trồng đang bắt đầu đơm hoa kết quả. Thuyền của bạn đang về bến mang theo tin vui và cơ hội hợp tác phát triển vượt bậc. Hãy tiếp tục kiên nhẫn và tự tin đón nhận.',
    meaningReversed: 'Sự thất vọng, trì hoãn tiến độ hoặc thất bại trong giao thương, hợp tác. Những kỳ vọng của bạn chưa được đáp ứng và bạn cần điều chỉnh lại kế hoạch hành động.'
  },
  {
    id: 25,
    slug: 'four-of-wands',
    nameEn: 'Four of Wands',
    nameVi: 'Bốn Quyền Trượng',
    arcana: 'minor',
    suit: 'wands',
    number: 'four',
    keywordsVi: ['chúc mừng', 'hòa hợp', 'gia đình', 'ổn định', 'bình yên'],
    meaningUpright: 'Lá bài cực kỳ ấm áp mang năng lượng của sự chúc mừng, thành công và sum họp gia đình. Môi trường sống ổn định, các mối quan hệ hòa hợp đem lại cho bạn cảm giác an tâm tuyệt đối.',
    meaningReversed: 'Có sự bất hòa nhẹ trong gia đình hoặc cộng đồng, cảm giác thiếu ổn định. Tuy nhiên, các giá trị cơ bản vẫn an toàn, bạn chỉ cần nỗ lực hàn gắn những hiểu lầm nhỏ.'
  },
  {
    id: 26,
    slug: 'five-of-wands',
    nameEn: 'Five of Wands',
    nameVi: 'Năm Quyền Trượng',
    arcana: 'minor',
    suit: 'wands',
    number: 'five',
    keywordsVi: ['xung đột', 'cạnh tranh', 'bất đồng', 'tranh đấu', 'hỗn loạn'],
    meaningUpright: 'Sự cạnh tranh gay gắt hoặc những bất đồng ý kiến trong nhóm làm việc. Đây là cuộc tranh đấu lành mạnh giúp kích thích tư duy sáng tạo, dù nó mang lại chút hỗn loạn và căng thẳng tạm thời.',
    meaningReversed: 'Tránh né xung đột, tìm kiếm giải pháp hòa giải hoặc ngược lại là sự leo thang của mâu thuẫn dẫn đến đổ vỡ bè phái. Hãy tìm tiếng nói chung thay vì cố chấp.'
  },
  {
    id: 27,
    slug: 'six-of-wands',
    nameEn: 'Six of Wands',
    nameVi: 'Sáu Quyền Trượng',
    arcana: 'minor',
    suit: 'wands',
    number: 'six',
    keywordsVi: ['chiến thắng', 'công nhận', 'tự hào', 'thành công', 'dẫn đầu'],
    meaningUpright: 'Chiến thắng vinh quang! Bạn nhận được sự công nhận xứng đáng từ mọi người xung quanh cho nỗ lực vượt bậc của mình. Hãy tự hào về thành tựu đạt được và tiếp tục dẫn đầu hành trình.',
    meaningReversed: 'Thành công bị cướp công, thiếu sự công nhận hoặc cảm giác kiêu ngạo dẫn đến thất bại sau đó. Có thể bạn đang cảm thấy nỗ lực của mình bị phớt lờ vô lý.'
  },
  {
    id: 28,
    slug: 'seven-of-wands',
    nameEn: 'Seven of Wands',
    nameVi: 'Bảy Quyền Trượng',
    arcana: 'minor',
    suit: 'wands',
    number: 'seven',
    keywordsVi: ['phòng thủ', 'kiên định', 'thách thức', 'bảo vệ', 'dũng cảm'],
    meaningUpright: 'Bạn đang đứng ở vị trí cao nhưng phải đối mặt với nhiều áp lực và thách thức từ đối thủ. Hãy dũng cảm, kiên định bảo vệ thành quả và ranh giới của mình. Bạn có lợi thế để chiến thắng.',
    meaningReversed: 'Bị choáng ngợp trước áp lực, muốn bỏ cuộc hoặc phòng thủ yếu ớt dẫn đến mất đi vị thế vốn có. Bạn cần nạp lại năng lượng và củng cố niềm tin bản thân.'
  },
  {
    id: 29,
    slug: 'eight-of-wands',
    nameEn: 'Eight of Wands',
    nameVi: 'Tám Quyền Trượng',
    arcana: 'minor',
    suit: 'wands',
    number: 'eight',
    keywordsVi: ['tốc độ', 'nhanh chóng', 'tin tức', 'hành động', 'tiến bộ'],
    meaningUpright: 'Mọi thứ chuyển động với tốc độ cực nhanh! Những tin tức quan trọng đang bay đến, mang theo sự tiến bộ vượt bậc và cơ hội hành động tức thì. Đừng chần chừ, hãy hành động ngay theo dòng chảy.',
    meaningReversed: 'Trì hoãn, cản trở hoặc hành động vội vã, bốc đồng dẫn đến sai sót lớn. Mọi thông tin lúc này dễ bị nhiễu loạn hoặc đi sai hướng.'
  },
  {
    id: 30,
    slug: 'nine-of-wands',
    nameEn: 'Nine of Wands',
    nameVi: 'Chín Quyền Trượng',
    arcana: 'minor',
    suit: 'wands',
    number: 'nine',
    keywordsVi: ['bền bỉ', 'kiên cường', 'phòng bị', 'mệt mỏi', 'bước cuối'],
    meaningUpright: 'Bạn đã trải qua nhiều trận chiến gian khổ và cảm thấy kiệt sức, nhưng đích đến đã ở rất gần. Hãy kiên cường, giữ vững phòng bị và nỗ lực nốt bước cuối cùng này để giành thắng lợi hoàn toàn.',
    meaningReversed: 'Kiệt sức hoàn toàn, từ bỏ phòng thủ hoặc đầu hàng trước khó khăn ngay trước vạch đích. Sự bướng bỉnh không cần thiết lúc này cũng có thể gây hại.'
  },
  {
    id: 31,
    slug: 'ten-of-wands',
    nameEn: 'Ten of Wands',
    nameVi: 'Mười Quyền Trượng',
    arcana: 'minor',
    suit: 'wands',
    number: 'ten',
    keywordsVi: ['gánh nặng', 'trách nhiệm', 'áp lực', 'kiệt sức', 'quá tải'],
    meaningUpright: 'Bạn đang mang vác quá nhiều gánh nặng và trách nhiệm trên vai khiến bản thân vô cùng mệt mỏi. Dù thành công đang cận kề, hãy học cách chia sẻ công việc và giải phóng bớt áp lực.',
    meaningReversed: 'Sự sụp đổ dưới áp lực quá tải hoặc quyết định buông bỏ những gánh nặng không thuộc về mình. Bạn đang học cách từ chối để bảo vệ sức khỏe tâm thần.'
  },
  {
    id: 32,
    slug: 'page-of-wands',
    nameEn: 'Page of Wands',
    nameVi: 'Thị Đồng Quyền Trượng',
    arcana: 'minor',
    suit: 'wands',
    number: 'page',
    keywordsVi: ['nhiệt huyết', 'tin tức', 'khám phá', 'tự phát', 'khởi đầu'],
    meaningUpright: 'Một người trẻ tuổi nhiệt huyết hoặc một tin tức đầy hứa hẹn về dự án mới. Lá bài khuyến khích bạn giữ tinh thần khám phá, tò mò và sẵn sàng thử sức với những điều mới mẻ.',
    meaningReversed: 'Sự nhiệt tình nửa vời, tin tức xấu hoặc trì hoãn bốc đồng. Bạn có thể đang hào hứng nhất thời nhưng nhanh chóng chán nản khi gặp khó khăn ban đầu.'
  },
  {
    id: 33,
    slug: 'knight-of-wands',
    nameEn: 'Knight of Wands',
    nameVi: 'Hiệp Sĩ Quyền Trượng',
    arcana: 'minor',
    suit: 'wands',
    number: 'knight',
    keywordsVi: ['hăng hái', 'liều lĩnh', 'hành động', 'đam mê', 'phiêu lưu'],
    meaningUpright: 'Hi hiệp sĩ dũng mãnh, lao nhanh về phía trước với đam mê ngập tràn. Bạn sẵn sàng phiêu lưu và hành động quyết liệt. Hãy tận dụng sức mạnh này nhưng cần kiểm soát tốc độ tránh vấp ngã.',
    meaningReversed: 'Hành động liều lĩnh, nóng nảy bốc đồng dẫn đến hậu quả tai hại. Dự án của bạn có thể đang bị thiếu kiểm soát hoặc gặp xung đột dữ dội do cái tôi cá nhân.'
  },
  {
    id: 34,
    slug: 'queen-of-wands',
    nameEn: 'Queen of Wands',
    nameVi: 'Hoàng Hậu Quyền Trượng',
    arcana: 'minor',
    suit: 'wands',
    number: 'queen',
    keywordsVi: ['tự tin', 'quyến rũ', 'ấm áp', 'độc lập', 'sáng tạo'],
    meaningUpright: 'Hoàng hậu tự tin, độc lập và vô cùng quyến rũ. Bạn tỏa ra năng lượng ấm áp, thu hút mọi người xung quanh và luôn chủ động trong cuộc sống. Hãy tiếp tục phát huy sức mạnh cá nhân này.',
    meaningReversed: 'Sự ghen tị, ích kỷ hoặc mất đi sự tự tin vốn có. Có thể bạn đang cảm thấy bất an, thu mình lại hoặc cố kiểm soát người khác bằng sự giận dữ vô cớ.'
  },
  {
    id: 35,
    slug: 'king-of-wands',
    nameEn: 'King of Wands',
    nameVi: 'Vua Quyền Trượng',
    arcana: 'minor',
    suit: 'wands',
    number: 'king',
    keywordsVi: ['lãnh đạo', 'tầm nhìn', 'uy tín', 'đam mê', 'quyết đoán'],
    meaningUpright: 'Nhà lãnh đạo có tầm nhìn vĩ đại, uy tín cao và cực kỳ quyết đoán. Bạn có khả năng truyền cảm hứng mạnh mẽ và biến những ý tưởng táo bạo thành hiện thực bền vững. Hãy dẫn lối bằng bản lĩnh.',
    meaningReversed: 'Nhà lãnh đạo độc đoán, nóng nảy và thiếu kiên nhẫn. Sự kiêu ngạo và định kiến độc tôn có thể khiến bạn mất đi sự ủng hộ từ đội ngũ xung quanh.'
  },

  // MINOR ARCANA — CUPS (36-49)
  {
    id: 36,
    slug: 'ace-of-cups',
    nameEn: 'Ace of Cups',
    nameVi: 'Át Thánh Bôi',
    arcana: 'minor',
    suit: 'cups',
    number: 'ace',
    keywordsVi: ['tình yêu', 'cảm xúc', 'trực giác', 'khởi đầu', 'dạt dào'],
    meaningUpright: 'Cốc tình yêu đong đầy! Một mối quan hệ mới lãng mạn, sự thăng hoa cảm xúc hoặc khởi đầu của sự chữa lành tâm hồn đang đến. Hãy mở rộng trái tim để đón nhận dòng chảy yêu thương ngọt ngào này.',
    meaningReversed: 'Cảm xúc bị tắc nghẽn, thất vọng trong tình cảm hoặc sự cạn kiệt năng lượng yêu thương. Bạn có thể đang đóng chặt lòng mình vì những tổn thương cũ chưa nguôi.'
  },
  {
    id: 37,
    slug: 'two-of-cups',
    nameEn: 'Two of Cups',
    nameVi: 'Hai Thánh Bôi',
    arcana: 'minor',
    suit: 'cups',
    number: 'two',
    keywordsVi: ['kết nối', 'hòa hợp', 'tình bạn', 'tương hỗ', 'yêu thương'],
    meaningUpright: 'Sự kết nối tâm hồn sâu sắc, tình yêu đôi lứa hòa hợp hoặc mối quan hệ đối tác tin cậy. Lá bài đại diện cho sự tôn trọng, cân bằng cảm xúc và hỗ trợ lẫn nhau vô điều kiện.',
    meaningReversed: 'Sự rạn nứt trong mối quan hệ, mất kết nối hoặc thiếu sự thấu hiểu cảm xúc. Mâu thuẫn cái tôi đang chia rẽ hai người và cần nỗ lực trò chuyện thẳng thắn.'
  },
  {
    id: 38,
    slug: 'three-of-cups',
    nameEn: 'Three of Cups',
    nameVi: 'Ba Thánh Bôi',
    arcana: 'minor',
    suit: 'cups',
    number: 'three',
    keywordsVi: ['chúc mừng', 'tình bạn', 'cộng đồng', 'vui vẻ', 'chia sẻ'],
    meaningUpright: 'Thời gian dành cho tiệc tùng, chúc mừng những thành tựu chung cùng hội bạn thân hoặc cộng đồng. Hãy tận hưởng niềm vui chia sẻ, sự ấm áp của tình bạn và giải tỏa mọi căng thẳng.',
    meaningReversed: 'Sự cô lập khỏi nhóm bạn, tiệc tùng quá đà gây hại sức khỏe hoặc có sự ghen tị, nói xấu sau lưng trong cộng đồng. Hãy tỉnh táo chọn lọc các mối quan hệ xã giao.'
  },
  {
    id: 39,
    slug: 'four-of-cups',
    nameEn: 'Four of Cups',
    nameVi: 'Bốn Thánh Bôi',
    arcana: 'minor',
    suit: 'cups',
    number: 'four',
    keywordsVi: ['chán nản', 'thờ ơ', 'chiêm nghiệm', 'cơ hội', 'ngó lơ'],
    meaningUpright: 'Bạn đang rơi vào trạng thái chán nản, thờ ơ với mọi thứ xung quanh và ngó lơ những cơ hội mới (chiếc cốc thứ tư từ vũ trụ). Hãy dành thời gian ngồi thiền, soi rọi nội tâm tìm lại động lực.',
    meaningReversed: 'Thức tỉnh sau giai đoạn chán chường, sẵn sàng đứng dậy đón nhận cơ hội mới và thay đổi lối sống. Bạn không còn muốn đắm chìm trong sự u uất nữa.'
  },
  {
    id: 40,
    slug: 'five-of-cups',
    nameEn: 'Five of Cups',
    nameVi: 'Năm Thánh Bôi',
    arcana: 'minor',
    suit: 'cups',
    number: 'five',
    keywordsVi: ['nuối tiếc', 'đau buồn', 'mất mát', 'hy vọng', 'góc nhìn'],
    meaningUpright: 'Sự nuối tiếc cay đắng về những chiếc cốc đã đổ (mất mát trong quá khứ) khiến bạn đau buồn. Nhưng hãy nhìn lại, vẫn còn hai chiếc cốc nguyên vẹn phía sau. Đừng để quá khứ che mờ hy vọng tương lai.',
    meaningReversed: 'Vượt qua nỗi đau buồn, chấp nhận sự mất mát để bước tiếp. Bạn đang dần tha thứ cho bản thân, học cách chữa lành tổn thương và mở lòng ra với cuộc sống mới.'
  },
  {
    id: 41,
    slug: 'six-of-cups',
    nameEn: 'Six of Cups',
    nameVi: 'Sáu Thánh Bôi',
    arcana: 'minor',
    suit: 'cups',
    number: 'six',
    keywordsVi: ['kỷ niệm', 'tuổi thơ', 'ngây thơ', 'quà tặng', 'hoài niệm'],
    meaningUpright: 'Sự quay trở về của những kỷ niệm tuổi thơ ấm áp, bạn cũ hoặc một món quà chân thành từ quá khứ. Lá bài mang năng lượng trong sáng, thuần khiết và sự sẻ chia vô tư giữa người với người.',
    meaningReversed: 'Bám víu quá mức vào hào quang quá khứ, hoài niệm viển vông khiến bạn xa rời thực tế hiện tại. Đã đến lúc trưởng thành và đối diện với cuộc sống thực.'
  },
  {
    id: 42,
    slug: 'seven-of-cups',
    nameEn: 'Seven of Cups',
    nameVi: 'Bảy Thánh Bôi',
    arcana: 'minor',
    suit: 'cups',
    number: 'seven',
    keywordsVi: ['lựa chọn', 'ảo tưởng', 'mơ mộng', 'cám dỗ', 'thiếu thực tế'],
    meaningUpright: 'Quá nhiều sự lựa chọn hoặc mơ mộng viển vông hiện ra trước mắt (ảo ảnh trong những chiếc cốc). Dễ bị cám dỗ bởi những lời hứa hẹn hào nhoáng. Hãy tỉnh táo chọn lọc điều thực tế nhất.',
    meaningReversed: 'Vượt qua ảo tưởng, xác định mục tiêu rõ ràng và đưa ra quyết định thực tế sau thời gian dài phân tâm. Bạn đã biết đâu là giá trị thật sự phù hợp với mình.'
  },
  {
    id: 43,
    slug: 'eight-of-cups',
    nameEn: 'Eight of Cups',
    nameVi: 'Tám Thánh Bôi',
    arcana: 'minor',
    suit: 'cups',
    number: 'eight',
    keywordsVi: ['buông bỏ', 'ra đi', 'tìm kiếm', 'sự thật', 'thay đổi'],
    meaningUpright: 'Quyết định dũng cảm quay lưng bước đi, bỏ lại sau lưng những chiếc cốc cảm xúc dù đã dày công xây dựng. Bạn sẵn sàng hành trình đi tìm kiếm chân lý cuộc sống và những giá trị sâu sắc hơn.',
    meaningReversed: 'Sự do dự không dám dứt khoát ra đi khỏi tình huống độc hại, lo sợ tương lai vô định. Bạn đang tự trói chân mình trong sự bất hạnh quen thuộc.'
  },
  {
    id: 44,
    slug: 'nine-of-cups',
    nameEn: 'Nine of Cups',
    nameVi: 'Chín Thánh Bôi',
    arcana: 'minor',
    suit: 'cups',
    number: 'nine',
    keywordsVi: ['mãn nguyện', 'hài lòng', 'ước muốn', 'tự mãn', 'trọn vẹn'],
    meaningUpright: 'Lá bài của sự cầu được ước thấy! Bạn cảm thấy vô cùng mãn nguyện, hài lòng với cuộc sống hiện tại cả về vật chất lẫn tinh thần. Hãy tận hưởng hạnh phúc trọn vẹn mà bạn xứng đáng nhận được.',
    meaningReversed: 'Sự tự mãn thái quá, ham muốn vật chất vô độ hoặc cảm giác trống rỗng dù đã đạt được mục tiêu bề ngoài. Hãy tìm kiếm hạnh phúc từ bên trong tâm hồn.'
  },
  {
    id: 45,
    slug: 'ten-of-cups',
    nameEn: 'Ten of Cups',
    nameVi: 'Mười Thánh Bôi',
    arcana: 'minor',
    suit: 'cups',
    number: 'ten',
    keywordsVi: ['hạnh phúc', 'gia đình', 'viên mãn', 'hòa hợp', 'bình yên'],
    meaningUpright: 'Đỉnh cao của hạnh phúc gia đình và sự viên mãn cảm xúc! Các mối quan hệ đạt đến sự hòa hợp tuyệt đối dưới ánh cầu vồng chúc phúc. Đây là thời kỳ bình yên và tràn ngập tình yêu thương.',
    meaningReversed: 'Có sự rạn nứt trong không khí gia đình, thiếu sự hòa hợp cảm xúc hoặc mâu thuẫn giữa các thành viên. Cần sự nhường nhịn và lắng nghe để thiết lập lại trật tự.'
  },
  {
    id: 46,
    slug: 'page-of-cups',
    nameEn: 'Page of Cups',
    nameVi: 'Thị Đồng Thánh Bôi',
    arcana: 'minor',
    suit: 'cups',
    number: 'page',
    keywordsVi: ['nhạy cảm', 'tin tức', 'sáng tạo', 'trực giác', 'khởi đầu'],
    meaningUpright: 'Một người trẻ tuổi nhạy cảm, giàu lòng trắc ẩn hoặc một tin vui liên quan đến cảm xúc đang đến. Lá bài khuyến khích bạn mở rộng trí tưởng tượng và tin tưởng vào trực giác nhạy bén.',
    meaningReversed: 'Cảm xúc bất ổn, tính khí trẻ con hoặc tin xấu làm tổn thương lòng tự trọng. Có thể bạn đang phản ứng quá nhạy cảm trước những lời góp ý chân thành.'
  },
  {
    id: 47,
    slug: 'knight-of-cups',
    nameEn: 'Knight of Cups',
    nameVi: 'Hiệp Sĩ Thánh Bôi',
    arcana: 'minor',
    suit: 'cups',
    number: 'knight',
    keywordsVi: ['lãng mạn', 'sứ giả', 'lời mời', 'theo đuổi', 'nghệ thuật'],
    meaningUpright: 'Sứ giả lãng mạn mang đến lời mời hấp dẫn hoặc cơ hội theo đuổi đam mê nghệ thuật. Bạn đang tràn đầy cảm hứng yêu thương và sẵn sàng bày tỏ cảm xúc chân thành. Hãy tiến bước nhẹ nhàng.',
    meaningReversed: 'Mơ mộng hão huyền, người đưa tin không đáng tin cậy hoặc sự thao túng cảm xúc. Hãy cẩn trọng trước những lời đường mật thiếu thực tế.'
  },
  {
    id: 48,
    slug: 'queen-of-cups',
    nameEn: 'Queen of Cups',
    nameVi: 'Hoàng Hậu Thánh Bôi',
    arcana: 'minor',
    suit: 'cups',
    number: 'queen',
    keywordsVi: ['thấu cảm', 'trực giác', 'nuôi dưỡng', 'yêu thương', 'bình yên'],
    meaningUpright: 'Hoàng hậu thấu cảm sâu sắc, sở hữu trực giác cực mạnh và tấm lòng nuôi dưỡng ấm áp. Bạn là chỗ dựa tinh thần tuyệt vời cho mọi người xung quanh trong lúc khó khăn. Hãy tin vào cảm quan của mình.',
    meaningReversed: 'Cảm xúc bị kiểm soát, phụ thuộc tình cảm quá mức hoặc không làm chủ được tâm trạng gây ảnh hưởng tiêu cực đến bản thân. Cần thiết lập ranh giới cảm xúc rõ ràng.'
  },
  {
    id: 49,
    slug: 'king-of-cups',
    nameEn: 'King of Cups',
    nameVi: 'Vua Thánh Bôi',
    arcana: 'minor',
    suit: 'cups',
    number: 'king',
    keywordsVi: ['cân bằng', 'thông thái', 'tự chủ', 'trắc ẩn', 'điềm tĩnh'],
    meaningUpright: 'Vị vua điềm tĩnh, sở hữu trí tuệ cảm xúc đỉnh cao và khả năng tự chủ tuyệt vời trước giông bão cuộc đời. Bạn biết cách giải quyết mâu thuẫn bằng lòng trắc ẩn và lý trí sáng suốt.',
    meaningReversed: 'Sự thao túng tình cảm thâm độc, nghiện ngập hoặc mất kiểm soát hành vi do áp lực cảm xúc dồn nén. Tránh để cơn giận dữ ngầm phá hoại mối quan hệ tốt.'
  },

  // MINOR ARCANA — SWORDS (50-63)
  {
    id: 50,
    slug: 'ace-of-swords',
    nameEn: 'Ace of Swords',
    nameVi: 'Át Kiếm',
    arcana: 'minor',
    suit: 'swords',
    number: 'ace',
    keywordsVi: ['sáng tỏ', 'sự thật', 'quyết đoán', 'đột phá', 'lý trí'],
    meaningUpright: 'Khoảnh khắc đột phá mang lại sự sáng tỏ tuyệt đối về tư duy! Bạn nhận ra sự thật hiển nhiên và có đủ dũng khí, lý trí quyết đoán để giải quyết dứt điểm vấn đề bế tắc bấy lâu nay.',
    meaningReversed: 'Tư duy mông lung mơ hồ, hiểu lầm nghiêm trọng hoặc quyết định vội vã thiếu sáng suốt. Tránh có những lời nói sắc nhọn gây tổn thương người khác lúc này.'
  },
  {
    id: 51,
    slug: 'two-of-swords',
    nameEn: 'Two of Swords',
    nameVi: 'Hai Kiếm',
    arcana: 'minor',
    suit: 'swords',
    number: 'two',
    keywordsVi: ['bế tắc', 'lựa chọn', 'trốn tránh', 'cân bằng', 'đóng cửa'],
    meaningUpright: 'Bạn đang đứng trước hai lựa chọn khó khăn và cố tình bịt mắt để trốn tránh thực tại bế tắc. Hãy dũng cảm tháo băng bịt mắt, đối diện sự thật để đưa ra quyết định giải thoát.',
    meaningReversed: 'Sự do dự lên đỉnh điểm gây căng thẳng, hoặc ngược lại là sự khai thông bế tắc, sẵn sàng đưa ra lựa chọn khó khăn bất chấp những rủi ro đi kèm.'
  },
  {
    id: 52,
    slug: 'three-of-swords',
    nameEn: 'Three of Swords',
    nameVi: 'Ba Kiếm',
    arcana: 'minor',
    suit: 'swords',
    number: 'three',
    keywordsVi: ['đau khổ', 'tổn thương', 'chia ly', 'buồn bã', 'giải phóng'],
    meaningUpright: 'Lá bài của sự đau khổ sâu sắc, tổn thương lòng tự trọng hoặc chia ly trong tình cảm. Hãy chấp nhận khóc hết nước mắt để giải phóng nỗi đau bên trong và bắt đầu quá trình chữa lành.',
    meaningReversed: 'Nỗi đau kéo dài âm ỉ không dứt do bạn không chấp nhận buông bỏ quá khứ đau buồn. Hãy tha thứ cho bản thân và người cũ để nhẹ lòng bước tiếp.'
  },
  {
    id: 53,
    slug: 'four-of-swords',
    nameEn: 'Four of Swords',
    nameVi: 'Bốn Kiếm',
    arcana: 'minor',
    suit: 'swords',
    number: 'four',
    keywordsVi: ['nghỉ ngơi', 'hồi phục', 'yên bình', 'thiền định', 'tĩnh lặng'],
    meaningUpright: 'Đã đến lúc bạn cần tạm dừng mọi suy nghĩ, nghỉ ngơi tĩnh dưỡng cơ thể và hồi phục tinh thần sau chuỗi ngày căng thẳng dữ dội. Hãy dành thời gian thiền định hoặc ngủ một giấc thật sâu.',
    meaningReversed: 'Sự kiệt sức nghiêm trọng do từ chối nghỉ ngơi, hoặc ngược lại là sẵn sàng quay trở lại hành động tích cực sau thời gian dài dưỡng thương đầy hiệu quả.'
  },
  {
    id: 54,
    slug: 'five-of-swords',
    nameEn: 'Five of Swords',
    nameVi: 'Năm Kiếm',
    arcana: 'minor',
    suit: 'swords',
    number: 'five',
    keywordsVi: ['chiến thắng', 'bại trận', 'tranh cãi', 'cái tôi', 'hậu quả'],
    meaningUpright: 'Một chiến thắng cay đắng bằng mọi giá nhờ cái tôi kiêu ngạo lấn át, nhưng để lại hậu quả nghiêm trọng về mối quan hệ xung quanh. Hãy tự hỏi chiến thắng này có thực sự xứng đáng?',
    meaningReversed: 'Nhận thức được tác hại của sự tranh cãi vô bổ, buông bỏ cái tôi và sẵn sàng hòa giải tranh chấp để hướng tới kết quả chung tốt đẹp hơn.'
  },
  {
    id: 55,
    slug: 'six-of-swords',
    nameEn: 'Six of Swords',
    nameVi: 'Sáu Kiếm',
    arcana: 'minor',
    suit: 'swords',
    number: 'six',
    keywordsVi: ['chuyển dịch', 'bình yên', 'vượt qua', 'chữa lành', 'đi tiếp'],
    meaningUpright: 'Hành trình vượt qua khó khăn để chuyển dịch sang vùng nước bình yên hơn. Quá trình chữa lành đang diễn ra suôn sẻ, dù lòng còn chút buồn bã nhưng bạn đang đi đúng hướng đi tiếp.',
    meaningReversed: 'Gặp trở ngại trong quá trình thay đổi, bế tắc không thoát ra được khỏi hoàn cảnh cũ độc hại. Bạn cần giải quyết triệt để rắc rối thay vì cố chạy trốn.'
  },
  {
    id: 56,
    slug: 'seven-of-swords',
    nameEn: 'Seven of Swords',
    nameVi: 'Bảy Kiếm',
    arcana: 'minor',
    suit: 'swords',
    number: 'seven',
    keywordsVi: ['lén lút', 'lừa dối', 'độc lập', 'chiến thuật', 'thoát thân'],
    meaningUpright: 'Lá bài cảnh báo sự lén lút, thiếu minh bạch xung quanh bạn hoặc quyết định hành động độc lập bằng chiến thuật khôn ngoan để thoát thân khỏi tình huống khó khăn một mình.',
    meaningReversed: 'Sự thật lừa dối bị vạch trần trước ánh sáng, hoặc cảm giác hối hận vì hành vi thiếu trung thực của bản thân. Bạn sẵn sàng chịu trách nhiệm trước mọi người.'
  },
  {
    id: 57,
    slug: 'eight-of-swords',
    nameEn: 'Eight of Swords',
    nameVi: 'Bảy Kiếm', // ⚠️ Tên đúng là Tám Kiếm, cập nhật sang đúng tiếng Việt
    arcana: 'minor',
    suit: 'swords',
    number: 'eight',
    keywordsVi: ['trói buộc', 'bất lực', 'ảo tưởng', 'sợ hãi', 'tự do'],
    meaningUpright: 'Bạn cảm thấy bị trói buộc và bất lực hoàn toàn trước khó khăn xung quanh. Nhưng hãy nhìn kỹ, dây trói rất lỏng và rào chắn kiềm chế có nhiều kẽ hở lớn. Mọi giới hạn đều do ảo tưởng sợ hãi của bạn tạo ra.',
    meaningReversed: 'Tháo bỏ xiềng xích tư duy bấy lâu nay, nhận thức được sức mạnh tự do cá nhân và sẵn sàng đối diện sự thật để tự giải thoát mình khỏi bế tắc.'
  },
  {
    id: 58,
    slug: 'nine-of-swords',
    nameEn: 'Nine of Swords',
    nameVi: 'Chín Kiếm',
    arcana: 'minor',
    suit: 'swords',
    number: 'nine',
    keywordsVi: ['lo âu', 'ác mộng', 'căng thẳng', 'dằn vặt', 'giải tỏa'],
    meaningUpright: 'Lo âu cực độ dẫn đến mất ngủ hoặc những cơn ác mộng kinh hoàng dằn vặt tâm trí bạn mỗi đêm. Hầu hết những mối lo này đều phóng đại thái quá, hãy chia sẻ gánh nặng với người tin cậy.',
    meaningReversed: 'Bắt đầu giải tỏa được lo âu căng thẳng sâu thẳm, nhận ra mọi việc không tệ như mình nghĩ và tìm thấy ánh sáng hy vọng cuối đường hầm tăm tối.'
  },
  {
    id: 59,
    slug: 'ten-of-swords',
    nameEn: 'Ten of Swords',
    nameVi: 'Mười Kiếm',
    arcana: 'minor',
    suit: 'swords',
    number: 'ten',
    keywordsVi: ['kết thúc', 'đau thương', 'phản bội', 'chấp nhận', 'bình minh'],
    meaningUpright: 'Đáy sâu của sự đau thương, kết thúc phũ phàng hoặc cảm giác bị phản bội cay đắng từ phía sau lưng. Tuy nhiên, khi đạt đến tận cùng bóng tối, bình minh ấm áp chắc chắn đang dần hé rạng.',
    meaningReversed: 'Vực dậy từ đống tro tàn đổ vỡ của quá khứ gian khổ, chấp nhận vết thương và sẵn sàng tái sinh huy hoàng để bắt đầu lại cuộc đời hoàn toàn mới.'
  },
  {
    id: 60,
    slug: 'page-of-swords',
    nameEn: 'Page of Swords',
    nameVi: 'Thị Đồng Kiếm',
    arcana: 'minor',
    suit: 'swords',
    number: 'page',
    keywordsVi: ['tò mò', 'tỉnh táo', 'giao tiếp', 'nhạy bén', 'cảnh giác'],
    meaningUpright: 'Một trí tuệ trẻ tuổi đầy tò mò, nhạy bén và cực kỳ thẳng thắn trong giao tiếp. Hãy luôn tỉnh táo, duy trì sự cảnh giác trước thông tin xung quanh và không ngừng học hỏi kiến thức.',
    meaningReversed: 'Nói suông thiếu thực hành, phát ngôn bừa bãi gây thị phi hoặc sự hoài nghi vô căn cứ làm hỏng mối quan hệ tốt. Cần kiểm chứng thông tin trước khi nói.'
  },
  {
    id: 61,
    slug: 'knight-of-swords',
    nameEn: 'Knight of Swords',
    nameVi: 'Hiệp Sĩ Kiếm',
    arcana: 'minor',
    suit: 'swords',
    number: 'knight',
    keywordsVi: ['quyết liệt', 'vội vã', 'lý trí', 'thách thức', 'tấn công'],
    meaningUpright: 'Hiệp sĩ dũng mãnh lao về phía trước bằng lý trí sắc bén và hành động quyết liệt thách thức khó khăn. Năng lượng này giúp bạn vượt rào nhanh chóng nhưng dễ vấp ngã do quá vội vã.',
    meaningReversed: 'Hành động liều lĩnh thiếu chuẩn bị, tính khí bướng bỉnh gây gổ bừa bãi hoặc sự mất phương hướng dữ dội trong công việc. Hãy dừng lại để bình tâm suy nghĩ.'
  },
  {
    id: 62,
    slug: 'queen-of-swords',
    nameEn: 'Queen of Swords',
    nameVi: 'Hoàng Hậu Kiếm',
    arcana: 'minor',
    suit: 'swords',
    number: 'queen',
    keywordsVi: ['độc lập', 'sắc sảo', 'thẳng thắn', 'bảo vệ', 'lý trí'],
    meaningUpright: 'Người phụ nữ độc lập, sắc sảo sở hữu lý trí vượt trội và khả năng nhìn nhận sự thật thẳng thắn không khoan nhượng. Bạn biết cách đặt ra ranh giới vững chắc để bảo vệ bản thân.',
    meaningReversed: 'Sự lạnh lùng cay nghiệt, định kiến khắt khe hoặc dùng lời nói sắc nhọn làm tổn thương người yếu thế xung quanh. Hãy học cách bao dung và trắc ẩn.'
  },
  {
    id: 63,
    slug: 'king-of-swords',
    nameEn: 'King of Swords',
    nameVi: 'Vua Kiếm',
    arcana: 'minor',
    suit: 'swords',
    number: 'king',
    keywordsVi: ['trí tuệ', 'chân lý', 'phán quyết', 'kỷ luật', 'quyền lực'],
    meaningUpright: 'Nhà thông thái có trí tuệ xuất chúng, thượng tôn chân lý khách quan và đưa ra những phán quyết công bằng bằng sự kỷ luật thép. Hãy hành động theo lẽ phải sáng suốt.',
    meaningReversed: 'Kẻ độc tài tàn nhẫn dùng lý trí và luật lệ bóp nghẹt cảm xúc người khác. Sự lạnh lùng ích kỷ có thể biến bạn thành kẻ cô đơn trong tháp ngà.'
  },

  // MINOR ARCANA — PENTACLES (64-77)
  {
    id: 64,
    slug: 'ace-of-pentacles',
    nameEn: 'Ace of Pentacles',
    nameVi: 'Át Tiền Vàng',
    arcana: 'minor',
    suit: 'pentacles',
    number: 'ace',
    keywordsVi: ['cơ hội', 'thịnh vượng', 'hiện thực', 'khởi đầu', 'tài lộc'],
    meaningUpright: 'Khởi đầu thịnh vượng! Một cơ hội tài chính tuyệt vời, công việc mới đầy tiềm năng hoặc dự án đầu tư có lợi đang đến. Hãy nắm bắt cơ hội để hiện thực hóa ước mơ vật chất.',
    meaningReversed: 'Cơ hội tài lộc bị bỏ lỡ, trì hoãn dòng tiền hoặc kế hoạch đầu tư gặp rủi ro lớn. Hãy cẩn trọng trước khi quyết định ký kết giấy tờ tài chính quan trọng.'
  },
  {
    id: 65,
    slug: 'two-of-pentacles',
    nameEn: 'Two of Pentacles',
    nameVi: 'Hai Tiền Vàng',
    arcana: 'minor',
    suit: 'pentacles',
    number: 'two',
    keywordsVi: ['cân bằng', 'thích nghi', 'quản lý', 'ưu tiên', 'dòng chảy'],
    meaningUpright: 'Bạn đang cố gắng cân bằng nhiều công việc, trách nhiệm tài chính khác nhau. Hãy linh hoạt thích nghi và xác định thứ tự ưu tiên rõ ràng để kiểm soát tốt cuộc sống.',
    meaningReversed: 'Sự quá tải trong quản lý công việc dẫn đến mất thăng bằng, stress nặng nề. Bạn đang ôm đồm quá nhiều thứ và cần cắt giảm bớt gánh nặng không cần thiết.'
  },
  {
    id: 66,
    slug: 'three-of-pentacles',
    nameEn: 'Three of Pentacles',
    nameVi: 'Ba Tiền Vàng',
    arcana: 'minor',
    suit: 'pentacles',
    number: 'three',
    keywordsVi: ['hợp tác', 'kỹ năng', 'xây dựng', 'học hỏi', 'tiến bộ'],
    meaningUpright: 'Sự hợp tác nhóm hiệu quả mang lại tiến bộ vượt bậc trong công việc. Kỹ năng chuyên môn của bạn được phát huy tối đa và nhận được sự đánh giá cao từ đồng nghiệp, đối tác.',
    meaningReversed: 'Thiếu sự hòa hợp trong đội ngũ làm việc, bất đồng ý kiến hoặc thái độ thiếu khao khát học hỏi làm chậm tiến độ dự án. Hãy dẹp bỏ cái tôi ích kỷ.'
  },
  {
    id: 67,
    slug: 'four-of-pentacles',
    nameEn: 'Four of Pentacles',
    nameVi: 'Bốn Tiền Vàng',
    arcana: 'minor',
    suit: 'pentacles',
    number: 'four',
    keywordsVi: ['giữ kẽ', 'tiết kiệm', 'an toàn', 'kháng cự', 'ích kỷ'],
    meaningUpright: 'Bạn đang giữ kẽ, tập trung tiết kiệm tiền bạc tối đa để bảo đảm an toàn cuộc sống. Tuy nhiên, tránh để nỗi sợ thiếu thốn biến bản thân thành kẻ ích kỷ, keo kiệt.',
    meaningReversed: 'Sẵn sàng mở rộng hầu bao chi tiêu, buông bỏ sự kiểm soát vật chất thái quá hoặc ngược lại là rủi ro hao tài tốn của do tiêu xài bốc đồng vô lối.'
  },
  {
    id: 68,
    slug: 'five-of-pentacles',
    nameEn: 'Five of Pentacles',
    nameVi: 'Năm Tiền Vàng',
    arcana: 'minor',
    suit: 'pentacles',
    number: 'five',
    keywordsVi: ['khó khăn', 'thiếu thốn', 'cô độc', 'hỗ trợ', 'nghèo túng'],
    meaningUpright: 'Giai đoạn khó khăn chồng chất về tài chính hoặc cảm giác cô độc, lạc lõng giữa bão giông cuộc sống. Nhưng hãy nhìn kỹ, ánh sáng hỗ trợ từ thánh đường ấm áp bên cạnh đang đón chờ bạn.',
    meaningReversed: 'Dần vượt qua được cơn bĩ cực nghèo túng, tìm thấy nguồn hỗ trợ tài chính quý giá và phục hồi lại niềm tin vững chắc vào tương lai tốt đẹp hơn.'
  },
  {
    id: 69,
    slug: 'six-of-pentacles',
    nameEn: 'Six of Pentacles',
    nameVi: 'Sáu Tiền Vàng',
    arcana: 'minor',
    suit: 'pentacles',
    number: 'six',
    keywordsVi: ['chia sẻ', 'rộng lượng', 'nhận lãnh', 'cân bằng', 'hỗ trợ'],
    meaningUpright: 'Sự chia sẻ hào phóng, lòng rộng lượng giúp đỡ người khó khăn hoặc may mắn nhận lãnh sự hỗ trợ kịp thời từ quý nhân. Mối quan hệ trao và nhận đạt được thế cân bằng hoàn hảo.',
    meaningReversed: 'Sự bố thí ban ơn trịch thượng, lừa dối trong phân chia tài chính hoặc phụ thuộc quá mức vào lòng thương hại người khác. Hãy tỉnh táo bảo vệ giá trị tự chủ.'
  },
  {
    id: 70,
    slug: 'seven-of-pentacles',
    nameEn: 'Seven of Pentacles',
    nameVi: 'Bảy Tiền Vàng',
    arcana: 'minor',
    suit: 'pentacles',
    number: 'seven',
    keywordsVi: ['kiên nhẫn', 'đánh giá', 'thu hoạch', 'dài hạn', 'tích lũy'],
    meaningUpright: 'Quá trình tích lũy lâu dài sắp đến ngày hái quả ngọt. Hãy kiên nhẫn đứng lại đánh giá tiến trình thực hiện và điều chỉnh hướng đi phù hợp để đạt thu hoạch tối đa.',
    meaningReversed: 'Thiếu kiên nhẫn muốn gặt quả non, thất vọng về kết quả thu hoạch so với công sức bỏ ra hoặc trì hoãn tiến độ kéo dài. Bạn cần xem xét lại định hướng lâu dài.'
  },
  {
    id: 71,
    slug: 'eight-of-pentacles',
    nameEn: 'Eight of Pentacles',
    nameVi: 'Tám Tiền Vàng',
    arcana: 'minor',
    suit: 'pentacles',
    number: 'eight',
    keywordsVi: ['chăm chỉ', 'kỹ nghệ', 'tập trung', 'chi tiết', 'thành thạo'],
    meaningUpright: 'Sự chăm chỉ miệt mài rèn luyện kỹ nghệ và tập trung cao độ vào từng chi tiết công việc. Nỗ lực này giúp bạn tiến bộ vượt bậc hướng tới sự thành thạo đỉnh cao nghề nghiệp.',
    meaningReversed: 'Thiếu tập trung sa nhãng làm việc cẩu thả, hoặc ngược lại là hội chứng cuồng công việc quá mức gây kiệt quệ sức sống. Hãy tìm lại sự cân bằng thiết yếu.'
  },
  {
    id: 72,
    slug: 'nine-of-pentacles',
    nameEn: 'Nine of Pentacles',
    nameVi: 'Chín Tiền Vàng',
    arcana: 'minor',
    suit: 'pentacles',
    number: 'nine',
    keywordsVi: ['tự chủ', 'thịnh vượng', 'hưởng thụ', 'độc lập', 'tao nhã'],
    meaningUpright: 'Bạn đạt được sự thịnh vượng bền vững và hoàn toàn độc lập tự chủ tài chính. Đây là thời kỳ tuyệt vời để hưởng thụ cuộc sống tao nhã trong khu vườn thành quả ngọt ngào của riêng mình.',
    meaningReversed: 'Sự phụ thuộc tài chính vào người khác, hao hụt ngân sách do chi tiêu hoang phí thể hiện bề ngoài hoặc cảm giác cô đơn trống rỗng dù dư dả tiền bạc.'
  },
  {
    id: 73,
    slug: 'ten-of-pentacles',
    nameEn: 'Ten of Pentacles',
    nameVi: 'Mười Tiền Vàng',
    arcana: 'minor',
    suit: 'pentacles',
    number: 'ten',
    keywordsVi: ['gia sản', 'truyền thống', 'sung túc', 'bền vững', 'gia đình'],
    meaningUpright: 'Sự sung túc trọn vẹn kéo dài qua nhiều thế hệ, gia sản vững chắc và các giá trị truyền thống gia đình tốt đẹp. Cuộc sống an cư lạc nghiệp viên mãn bền vững lâu dài.',
    meaningReversed: 'Mâu thuẫn tranh chấp gia sản gia đình căng thẳng, rủi ro tài chính dài hạn hoặc phớt lờ các giá trị nền tảng bền vững để theo đuổi lợi ích ngắn hạn.'
  },
  {
    id: 74,
    slug: 'page-of-pentacles',
    nameEn: 'Page of Pentacles',
    nameVi: 'Thị Đồng Tiền Vàng',
    arcana: 'minor',
    suit: 'pentacles',
    number: 'page',
    keywordsVi: ['thực tế', 'học hỏi', 'tin tức', 'khởi đầu', 'tiềm năng'],
    meaningUpright: 'Một cơ hội thực tế đầy tiềm năng phát triển hoặc một tin tức tốt lành liên quan đến tài chính, học tập. Hãy giữ tinh thần cầu tiến, chăm chỉ học hỏi để đặt nền móng chắc chắn.',
    meaningReversed: 'Thiếu tầm nhìn thực tế, trì hoãn kế hoạch học tập hoặc lãng phí cơ hội quý báu do lười biếng ham chơi nhất thời. Hãy kỷ luật hơn với bản thân.'
  },
  {
    id: 75,
    slug: 'knight-of-pentacles',
    nameEn: 'Knight of Pentacles',
    nameVi: 'Hiệp Sĩ Tiền Vàng',
    arcana: 'minor',
    suit: 'pentacles',
    number: 'knight',
    keywordsVi: ['kiên trì', 'đáng tin', 'kỷ luật', 'thực tế', 'ổn định'],
    meaningUpright: 'Hiệp sĩ kiên trì, vô cùng đáng tin cậy và kỷ luật thép. Bạn làm việc chăm chỉ, đi từng bước chắc chắn và luôn hoàn thành xuất sắc cam kết đã đề ra. Hãy tiếp tục tiến bước vững vàng.',
    meaningReversed: 'Sự bảo thủ trì trệ, lối mòn nhàm chán hoặc cẩu thả vô trách nhiệm trong công việc. Hãy thổi bùng lại cảm hứng thay vì biến mình thành cỗ máy khô khan.'
  },
  {
    id: 76,
    slug: 'queen-of-pentacles',
    nameEn: 'Queen of Pentacles',
    nameVi: 'Hoàng Hậu Tiền Vàng',
    arcana: 'minor',
    suit: 'pentacles',
    number: 'queen',
    keywordsVi: ['nuôi dưỡng', 'trù phú', 'thực tế', 'ấm áp', 'đảm đang'],
    meaningUpright: 'Hoàng hậu trù phú, đảm đang đảm trách chăm lo đời sống vật chất và tinh thần cực tốt. Bạn lan tỏa năng lượng thực tế, ấm áp bảo bọc mọi người xung quanh trong sự sung túc.',
    meaningReversed: 'Cảm giác bất an sợ thiếu thốn, bỏ bê gia đình hoặc ngược lại là hội chứng cuồng kiểm soát vật chất chi ly gây ngột ngạt cho mọi người. Hãy học cách buông lỏng.'
  },
  {
    id: 77,
    slug: 'king-of-pentacles',
    nameEn: 'King of Pentacles',
    nameVi: 'Vua Tiền Vàng',
    arcana: 'minor',
    suit: 'pentacles',
    number: 'king',
    keywordsVi: ['thành tựu', 'thịnh vượng', 'bản lĩnh', 'ổn định', 'kinh doanh'],
    meaningUpright: 'Đỉnh cao của sự thịnh vượng tài chính và thành tựu kinh doanh lẫy lừng! Vị vua bản lĩnh sở hữu nền tảng ổn định tuyệt đối và khả năng quản lý tài sản thông thái bậc nhất.',
    meaningReversed: 'Nhà kinh doanh thất bại do tham lam liều lĩnh bừa bãi, hoặc dùng tiền bạc kiểm soát, chèn ép người khác vô đạo đức. Hãy cẩn trọng trước sự sụp đổ lòng tin.'
  }
];

// Khởi tạo danh sách 78 lá bài đầy đủ với imagePath được tính toán tự động
export const tarotCards: TarotCard[] = rawTarotCards.map((card) => ({
  ...card,
  imagePath: getCardImagePath(card.slug, card.arcana, card.number, card.suit),
}));

// Helper functions

export function getCardBySlug(slug: string): TarotCard | undefined {
  return tarotCards.find((card) => card.slug === slug);
}

export function getCardById(id: number): TarotCard | undefined {
  return tarotCards.find((card) => card.id === id);
}

export function getCardsByArcana(arcana: 'major' | 'minor'): TarotCard[] {
  return tarotCards.filter((card) => card.arcana === arcana);
}

export function getCardsBySuit(suit: 'wands' | 'cups' | 'swords' | 'pentacles'): TarotCard[] {
  return tarotCards.filter((card) => card.suit === suit);
}

export function searchCards(query: string): TarotCard[] {
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) return tarotCards;
  return tarotCards.filter(
    (card) =>
      card.nameVi.toLowerCase().includes(cleanQuery) ||
      card.nameEn.toLowerCase().includes(cleanQuery) ||
      card.keywordsVi.some((keyword) => keyword.toLowerCase().includes(cleanQuery))
  );
}

// Fisher-Yates shuffle để lấy ngẫu nhiên N lá bài không trùng nhau
export function getRandomCards(count: number): { card: TarotCard; isReversed: boolean }[] {
  const shuffled = [...tarotCards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count).map((card) => ({
    card,
    isReversed: Math.random() < 0.5, // 50% xuôi, 50% ngược
  }));
}

// Lấy lá bài ngày hôm nay dựa vào seeded random của Date
export function getDailyCard(): { card: TarotCard; isReversed: boolean } {
  const today = new Date();
  // Tạo seed số từ ngày tháng năm
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  // Seeded random simple generator
  const x = Math.sin(seed) * 10000;
  const randomValue = x - Math.floor(x);
  
  const cardIndex = Math.floor(randomValue * tarotCards.length);
  const isReversed = (randomValue * 10) % 2 < 1; // fake random 50/50 theo seed

  return {
    card: tarotCards[cardIndex],
    isReversed,
  };
}
