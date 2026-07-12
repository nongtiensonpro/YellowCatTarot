import { TarotCard, tarotCards, getCardBySlug as getRwsCardBySlug, getCardById as getRwsCardById } from './cards-data';
import { thothCards, getCardBySlug as getThothCardBySlug, getCardById as getThothCardById } from './thoth-cards-data';
import { marseilleCards, getCardBySlug as getMarseilleCardBySlug, getCardById as getMarseilleCardById } from './marseille-cards-data';
import { lenormandCards, getCardBySlug as getLenormandCardBySlug, getCardById as getLenormandCardById } from './lenormand-cards-data';
import { lightSeersCards, getCardBySlug as getLightSeersCardBySlug, getCardById as getLightSeersCardById } from './light-seers-cards-data';
import { modernWitchCards, getCardBySlug as getModernWitchCardBySlug, getCardById as getModernWitchCardById } from './modern-witch-cards-data';
import { yoloCards, getCardBySlug as getYoloCardBySlug, getCardById as getYoloCardById } from './yolo-cards-data';
import { kittycornCards, getCardBySlug as getKittycornCardBySlug, getCardById as getKittycornCardById } from './kittycorn-cards-data';
import { moonlightSenshiCards, getCardBySlug as getMoonlightSenshiCardBySlug, getCardById as getMoonlightSenshiCardById } from './moonlight-senshi-cards-data';

export interface DeckInfo {
  id: string;                    // 'rws' | 'thoth' | 'marseille'
  name: string;                  // 'Rider-Waite-Smith' | 'Thoth Tarot' | 'Tarot de Marseille'
  nameVi: string;                // 'Rider-Waite-Smith' | 'Thoth Tarot' | 'Tarot de Marseille'
  description: string;           // Mô tả ngắn
  descriptionVi: string;         // Mô tả tiếng Việt
  totalCards: number;             // 78
  cardBackPath: string;           // Đường dẫn card back mặc định
  previewImagePath: string;       // Ảnh preview cho deck selector UI
}

export interface DeckProvider {
  info: DeckInfo;
  cards: TarotCard[];
  getById: (id: number) => TarotCard | undefined;
  getBySlug: (slug: string) => TarotCard | undefined;
  getByArcana: (arcana: 'major' | 'minor') => TarotCard[];
  getBySuit: (suit: 'wands' | 'cups' | 'swords' | 'pentacles') => TarotCard[];
}

const rwsInfo: DeckInfo = {
  id: 'rws',
  name: 'Rider-Waite-Smith',
  nameVi: 'Rider-Waite-Smith',
  description: 'The classic 1910 tarot deck by Arthur Edward Waite and Pamela Colman Smith.',
  descriptionVi: 'Bộ bài Tarot cổ điển phổ biến nhất thế giới được vẽ bởi Pamela Colman Smith dưới sự chỉ dẫn của Arthur Edward Waite vào năm 1910.',
  totalCards: 78,
  cardBackPath: '/cards/Backofthecard/Waite–Smith_Tarot_Roses_and_Lilies_cropped.jpg',
  previewImagePath: '/cards/MajorArcana/TheFool.webp'
};

const thothInfo: DeckInfo = {
  id: 'thoth',
  name: 'Thoth Tarot',
  nameVi: 'Thoth Tarot',
  description: 'The Crowley Thoth Tarot deck painted by Lady Frieda Harris, featuring Kabbalistic and astrological attributions.',
  descriptionVi: 'Bộ bài huyền học sâu sắc do Aleister Crowley sáng tạo và Lady Frieda Harris vẽ trong vòng 5 năm, tích hợp Kabbalah, Chiêm tinh học và Giả kim thuật.',
  totalCards: 78,
  cardBackPath: '/Thoth_Tarot/thoth-reverse-of-cards_6243764710_l.jpg',
  previewImagePath: '/Thoth_Tarot/thoth-trumps-00-the-fool_6242948151_l.jpg'
};

const marseilleInfo: DeckInfo = {
  id: 'marseille',
  name: 'Tarot de Marseille',
  nameVi: 'Tarot de Marseille',
  description: 'The classic Tarot de Marseille deck, featuring historical French woodcut designs.',
  descriptionVi: 'Bộ bài Tarot de Marseille cổ điển mang tính lịch sử vương quyền của Pháp thế kỷ 18, nổi tiếng với các nét vẽ khắc gỗ mộc mạc và phong cách bói toán nguyên bản.',
  totalCards: 78,
  cardBackPath: '/cards/Backofthecard/Waite–Smith_Tarot_Roses_and_Lilies_cropped.jpg',
  previewImagePath: '/Tarot_de_Marseille/marseille-arcanes-majeurs-01-le-bateleur_6243960859_l.jpg'
};

const lenormandInfo: DeckInfo = {
  id: 'lenormand',
  name: 'Lenormand Oracle',
  nameVi: 'Lenormand Oracle',
  description: 'The classic Lenormand oracle deck with 36 symbolic cards.',
  descriptionVi: 'Bộ bài tiên tri Lenormand cổ điển gồm 36 lá bài biểu tượng gần gũi, giúp giải quyết các khía cạnh cụ thể, thực tế trong cuộc sống hàng ngày.',
  totalCards: 36,
  cardBackPath: '/Lenormand/cardback.png',
  previewImagePath: '/Lenormand/D01.png'
};

const lightSeersInfo: DeckInfo = {
  id: 'lightseer',
  name: 'Light Seers Tarot',
  nameVi: "Light Seer's Tarot",
  description: 'A contemporary tarot deck featuring detailed Bohemian and spiritual artwork by Chris-Anne.',
  descriptionVi: 'Bộ bài Tarot đương đại với phong cách nghệ thuật Bohemian phóng khoáng, mang tính chữa lành và đánh thức tâm linh sâu sắc của tác giả Chris-Anne.',
  totalCards: 78,
  cardBackPath: '/cards/Backofthecard/Waite–Smith_Tarot_Roses_and_Lilies_cropped.jpg',
  previewImagePath: '/Light_Seers_Tarot/T00_TheFool.jpg'
};

const modernWitchInfo: DeckInfo = {
  id: 'modernwitch',
  name: 'Modern Witch Tarot',
  nameVi: 'Modern Witch Tarot',
  description: 'A modern, fashionable, and feminist take on the classic Rider-Waite-Smith deck by Lisa Sterle.',
  descriptionVi: 'Bộ bài Tarot đương đại, thời trang và mang đậm tinh thần nữ quyền của tác giả Lisa Sterle, làm mới hoàn toàn biểu tượng cổ điển RWS dưới lăng kính hiện đại.',
  totalCards: 78,
  cardBackPath: '/cards/Backofthecard/Waite–Smith_Tarot_Roses_and_Lilies_cropped.jpg',
  previewImagePath: '/Modern_Witch_Tarot/MW00_TheFool.jpg'
};

const yoloInfo: DeckInfo = {
  id: 'yolo',
  name: 'YOLO Tarot',
  nameVi: 'YOLO Tarot',
  description: 'A bold, vibrant, and fun modern Rider-Waite-Smith-inspired tarot deck.',
  descriptionVi: 'Bộ bài Tarot lấy cảm hứng từ RWS với phong cách trẻ trung, phá cách và ngập tràn năng lượng YOLO năng động.',
  totalCards: 78,
  cardBackPath: '/cards/Backofthecard/Waite–Smith_Tarot_Roses_and_Lilies_cropped.jpg',
  previewImagePath: '/YOLO_Tarot/YOLO00_TheFool.jpg'
};

const kittycornInfo: DeckInfo = {
  id: 'kittycorn',
  name: 'Kittycorn Tarot',
  nameVi: 'Kittycorn Tarot',
  description: 'A cute, whimsical, and colorful tarot deck featuring adorable kittycorns.',
  descriptionVi: 'Bộ bài Tarot vô cùng đáng yêu, tươi sáng và tràn ngập phép màu với hình ảnh những chú mèo một sừng Kittycorn tinh nghịch.',
  totalCards: 78,
  cardBackPath: '/cards/Backofthecard/Waite–Smith_Tarot_Roses_and_Lilies_cropped.jpg',
  previewImagePath: '/Kittycorn_Tarot/KC00_TheFool.jpg'
};

const moonlightSenshiInfo: DeckInfo = {
  id: 'moonlightsenshi',
  name: 'Moonlight Senshi Tarot',
  nameVi: 'Moonlight Senshi Tarot',
  description: 'A magical Sailor Moon-inspired tarot deck.',
  descriptionVi: 'Bộ bài Tarot đầy lung linh lấy cảm hứng từ thế giới Thủy Thủ Mặt Trăng (Sailor Moon) phép thuật, mang lại năng lượng chiến binh bảo vệ công lý và tình yêu.',
  totalCards: 78,
  cardBackPath: '/cards/Backofthecard/Waite–Smith_Tarot_Roses_and_Lilies_cropped.jpg',
  previewImagePath: '/Moonlight_Senshi_Tarot/MS00_TheFool.jpg'
};


const rwsProvider: DeckProvider = {
  info: rwsInfo,
  cards: tarotCards,
  getById: (id) => getRwsCardById(id),
  getBySlug: (slug) => getRwsCardBySlug(slug),
  getByArcana: (arcana) => tarotCards.filter(c => c.arcana === arcana),
  getBySuit: (suit) => tarotCards.filter(c => c.suit === suit)
};

const thothProvider: DeckProvider = {
  info: thothInfo,
  cards: thothCards,
  getById: (id) => getThothCardById(id),
  getBySlug: (slug) => getThothCardBySlug(slug),
  getByArcana: (arcana) => thothCards.filter(c => c.arcana === arcana),
  getBySuit: (suit) => thothCards.filter(c => c.suit === suit)
};

const marseilleProvider: DeckProvider = {
  info: marseilleInfo,
  cards: marseilleCards,
  getById: (id) => getMarseilleCardById(id),
  getBySlug: (slug) => getMarseilleCardBySlug(slug),
  getByArcana: (arcana) => marseilleCards.filter(c => c.arcana === arcana),
  getBySuit: (suit) => marseilleCards.filter(c => c.suit === suit)
};

const lenormandProvider: DeckProvider = {
  info: lenormandInfo,
  cards: lenormandCards,
  getById: (id) => getLenormandCardById(id),
  getBySlug: (slug) => getLenormandCardBySlug(slug),
  getByArcana: (arcana) => lenormandCards,
  getBySuit: (suit) => []
};

const lightSeersProvider: DeckProvider = {
  info: lightSeersInfo,
  cards: lightSeersCards,
  getById: (id) => getLightSeersCardById(id),
  getBySlug: (slug) => getLightSeersCardBySlug(slug),
  getByArcana: (arcana) => lightSeersCards.filter(c => c.arcana === arcana),
  getBySuit: (suit) => lightSeersCards.filter(c => c.suit === suit)
};

const modernWitchProvider: DeckProvider = {
  info: modernWitchInfo,
  cards: modernWitchCards,
  getById: (id) => getModernWitchCardById(id),
  getBySlug: (slug) => getModernWitchCardBySlug(slug),
  getByArcana: (arcana) => modernWitchCards.filter(c => c.arcana === arcana),
  getBySuit: (suit) => modernWitchCards.filter(c => c.suit === suit)
};

const yoloProvider: DeckProvider = {
  info: yoloInfo,
  cards: yoloCards,
  getById: (id) => getYoloCardById(id),
  getBySlug: (slug) => getYoloCardBySlug(slug),
  getByArcana: (arcana) => yoloCards.filter(c => c.arcana === arcana),
  getBySuit: (suit) => yoloCards.filter(c => c.suit === suit)
};

const kittycornProvider: DeckProvider = {
  info: kittycornInfo,
  cards: kittycornCards,
  getById: (id) => getKittycornCardById(id),
  getBySlug: (slug) => getKittycornCardBySlug(slug),
  getByArcana: (arcana) => kittycornCards.filter(c => c.arcana === arcana),
  getBySuit: (suit) => kittycornCards.filter(c => c.suit === suit)
};

const moonlightSenshiProvider: DeckProvider = {
  info: moonlightSenshiInfo,
  cards: moonlightSenshiCards,
  getById: (id) => getMoonlightSenshiCardById(id),
  getBySlug: (slug) => getMoonlightSenshiCardBySlug(slug),
  getByArcana: (arcana) => moonlightSenshiCards.filter(c => c.arcana === arcana),
  getBySuit: (suit) => moonlightSenshiCards.filter(c => c.suit === suit)
};

const registry: Record<string, DeckProvider> = {
  rws: rwsProvider,
  thoth: thothProvider,
  marseille: marseilleProvider,
  lenormand: lenormandProvider,
  lightseer: lightSeersProvider,
  modernwitch: modernWitchProvider,
  yolo: yoloProvider,
  kittycorn: kittycornProvider,
  moonlightsenshi: moonlightSenshiProvider
};

export function getDeck(deckId: string): DeckProvider {
  return registry[deckId] || rwsProvider;
}

export function getAllDecks(): DeckInfo[] {
  return [rwsInfo, thothInfo, marseilleInfo, lenormandInfo, lightSeersInfo, modernWitchInfo, yoloInfo, kittycornInfo, moonlightSenshiInfo];
}

export function getDefaultDeckId(): string {
  return 'rws';
}
