import { majorArcanaDetails } from './major-arcana';
import { cupsDetails } from './cups';
import { wandsDetails } from './wands';
import { swordsDetails } from './swords';
import { pentaclesDetails } from './pentacles';

export interface CardDetail {
  slug: string;
  generalOverview: string; // Phân tích tổng quan chiều sâu của năng lượng lá bài
  symbolism: string;       // Giải mã hình ảnh RWS gốc dưới góc nhìn Mèo Vàng Ghibli
  upright: {
    general: string;       // Tóm tắt chiều xuôi
    career: string;        // Chiều xuôi trong công việc & tài chính
    love: string;          // Chiều xuôi trong tình cảm & mối quan hệ
    health: string;        // Chiều xuôi trong sức khỏe & tinh thần
  };
  reversed: {
    general: string;       // Tóm tắt chiều ngược
    career: string;        // Chiều ngược trong công việc & tài chính
    love: string;          // Chiều ngược trong tình cảm & mối quan hệ
    health: string;        // Chiều ngược trong sức khỏe & tinh thần
  };
  advice: string;          // Lời khuyên ngọt ngào, ấm áp từ Mèo Vàng phong cách Ghibli
}

const allDetails: Record<string, CardDetail> = {
  ...majorArcanaDetails,
  ...cupsDetails,
  ...wandsDetails,
  ...swordsDetails,
  ...pentaclesDetails,
};

/**
 * Lấy dữ liệu chi tiết chuyên sâu của một lá bài theo slug.
 * Trả về null nếu lá bài chưa có dữ liệu chuyên sâu (đang ở giai đoạn sau của roadmap).
 */
export function getCardDetailBySlug(slug: string): CardDetail | null {
  return allDetails[slug] || null;
}
