# Kế Hoạch Xây Dựng Thư Viện Tra Cứu Chuyên Sâu 78 Lá Bài Tarot Mèo Vàng

Yêu cầu hiện tại là mở rộng phần tra cứu chi tiết 78 lá bài với thông tin chuyên sâu, đầy đủ và chuyên nghiệp hơn. Do số lượng lá bài cực lớn (78 lá x 2 chiều x 4 khía cạnh), chúng ta sẽ thiết lập một **kiến trúc modular mở rộng** và chia lộ trình thực hiện thành nhiều giai đoạn (Phases) để đảm bảo chất lượng nội dung tốt nhất.

---

## Lộ Trình Phân Chia Các Giai Đoạn (Roadmap)

Chúng ta sẽ phân chia 78 lá bài thành 5 giai đoạn chính theo cấu trúc Tarot huyền học:

1.  **Giai đoạn 1 (Phase 1 - Hiện tại): Hợp nhất 22 Lá bài Bộ Ẩn Chính (Major Arcana)**
    *   *Chi tiết:* Từ lá số 0 (The Fool) đến lá số 21 (The World). Đây là xương sống của Tarot, phản ánh hành trình tiến hóa của linh hồn.
    *   *Mục tiêu:* Viết thông tin chuyên sâu cho 22 lá bài + Xây dựng cấu trúc UI Tabs tương tác động ở trang chi tiết lá bài.
2.  **Giai đoạn 2 (Phase 2): Bộ Ẩn Phụ - Cốc (Suit of Cups - 14 Lá)**
    *   *Chi tiết:* Phân tích khía cạnh cảm xúc, tình yêu, trực giác và mối quan hệ.
3.  **Giai đoạn 3 (Phase 3): Bộ Ẩn Phụ - Quyền Trượng (Suit of Wands - 14 Lá)**
    *   *Chi tiết:* Phân tích khía cạnh đam mê, hành động, sự nghiệp và năng lượng sáng tạo.
4.  **Giai đoạn 4 (Phase 4): Bộ Ẩn Phụ - Kiếm (Suit of Swords - 14 Lá)**
    *   *Chi tiết:* Phân tích khía cạnh trí tuệ, lý trí, xung đột và các quyết định.
5.  **Giai đoạn 5 (Phase 5): Bộ Ẩn Phụ - Tiền Vàng (Suit of Pentacles - 14 Lá)**
    *   *Chi tiết:* Phân tích khía cạnh vật chất, tài chính, sức khỏe và tính ổn định.

---

## Kiến Trúc Dữ Liệu Modular Đề Xuất

Để tránh làm phình to file `cards-data.ts` làm chậm tải trang, chúng ta sẽ tạo một thư mục modular mới: `lib/cards-details/`

### 1. Định nghĩa Interface Chuyên Sâu (`lib/cards-details/index.ts`)
```typescript
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
    love: string;          // Chiều ngược trong tình yêu & mối quan hệ
    health: string;        // Chiều ngược trong sức khỏe & tinh thần
  };
  advice: string;          // Lời khuyên ngọt ngào, ấm áp từ Mèo Vàng phong cách Ghibli
}
```

### 2. Quản lý File
*   [NEW] `lib/cards-details/index.ts` - File xuất bản trung tâm, cung cấp hàm `getCardDetailBySlug(slug: string)`.
*   [NEW] `lib/cards-details/major-arcana.ts` - Chứa toàn bộ nội dung chuyên sâu của 22 lá Ẩn Chính (Phase 1).
*   *Các phase sau sẽ thêm:* `cups.ts`, `wands.ts`, `swords.ts`, `pentacles.ts`.

---

## Đề Xuất Thay Đổi Giao Diện (UI/UX)

Tại trang chi tiết lá bài `app/cards/[slug]/page.tsx`:

1.  **Nếu lá bài đã có thông tin chuyên sâu (Bộ Ẩn Chính trong Phase 1):**
    *   Ẩn phần giải nghĩa mặc định cũ.
    *   Hiển thị một **Bảng Tabs Tương Tác** tuyệt đẹp với phong cách gỗ sồi Ghibli:
        *   **Tab 1: 👁️ Tổng Quan & Biểu Tượng** (General & Symbolism)
        *   **Tab 2: ☀️ Ý Nghĩa Chiều Xuôi** (Upright - chia nhỏ thành 3 khối: 💼 Công Việc, 💜 Tình Cảm, 🌿 Sức Khỏe)
        *   **Tab 3: ↩️ Ý Nghĩa Chiều Ngược** (Reversed - chia nhỏ tương tự chiều xuôi)
        *   **Tab 4: 🐱 Lời Khuyên Của Mèo Vàng** (Comforting Ghibli Advice)
2.  **Nếu lá bài chưa có thông tin chuyên sâu (Các bộ ẩn phụ đang đợi Phase tiếp theo):**
    *   Hiển thị thông tin mặc định cũ (Upright & Reversed cơ bản).
    *   Hiện một banner thông báo dễ thương từ Mèo Vàng:
        > [!TIP]
        > *Quý nhân ơi, tập hồ sơ chuyên sâu về bộ ẩn phụ này đang được miêu miêu nhỏ bé cẩn thận ghi chép lại... Hiện tại quý nhân có thể đọc ý nghĩa cơ bản hoặc đặt câu hỏi để em kết nối với Gemini luận giải tức thì nhé!*

---

## Kế Hoạch Thực Hiện Giai Đoạn 1 (Phase 1)

### Bước 1: Khởi tạo Cấu trúc & Viết Dữ liệu 22 Lá Ẩn Chính
*   Tạo file `lib/cards-details/major-arcana.ts` với đầy đủ 22 lá bài (Kẻ Hề, Pháp Sư, Nữ Tu Sĩ, Nữ Hoàng, Hoàng Đế, Giáo Hoàng, Đôi Tình Nhân, Chiến Xa, Sức Mạnh, Ẩn Sĩ, Bánh Xe Vận Mệnh, Công Lý, Người Bị Treo, Thần Chết, Điều Độ, Ác Quỷ, Tháp Sụp Đổ, Ngôi Sao, Mặt Trăng, Mặt Trời, Phán Xét, Thế Giới).
*   Mỗi lá bài sẽ có thông tin cực kỳ chi tiết, phong phú khoảng 200 - 300 từ.

### Bước 2: Tạo hàm tra cứu trung tâm
*   Tạo file `lib/cards-details/index.ts` tổng hợp dữ liệu và export hàm `getCardDetailBySlug`.

### Bước 3: Nâng cấp Trang Chi Tiết Lá Bài (`app/cards/[slug]/page.tsx`)
*   Import hàm `getCardDetailBySlug` và gọi nó trong component.
*   Cấu hình state cho bộ Tab tương tác mới.
*   Thiết kế giao diện các Tab mượt mà, đầy đủ icon và responsive trên Mobile.

---

## User Feedback Required

> [!IMPORTANT]
> **Về Lộ trình chia Phase:** Bạn có đồng ý với phương án ưu tiên viết sâu cho **22 lá Ẩn Chính** trước (Phase 1), các bộ ẩn phụ sẽ hiển thị banner thông báo dễ thương của Mèo Vàng và bổ sung dần ở các phase sau để bảo toàn chất lượng không gian gác mái không?
