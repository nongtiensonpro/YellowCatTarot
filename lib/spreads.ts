export interface SpreadPosition {
  id: number;
  nameVi: string;
  descriptionVi: string;
}

export interface SpreadType {
  type: 'single' | 'three-card' | 'celtic-cross';
  nameVi: string;
  descriptionVi: string;
  positions: SpreadPosition[];
}

export const spreadTypes: Record<string, SpreadType> = {
  single: {
    type: 'single',
    nameVi: 'Trải Bài Một Lá',
    descriptionVi: 'Nhận câu trả lời nhanh, thông điệp tập trung cho ngày hôm nay hoặc một vấn đề cụ thể.',
    positions: [
      {
        id: 1,
        nameVi: 'Lá Bài Duy Nhất',
        descriptionVi: 'Thông điệp tổng thể, lời khuyên cốt lõi và câu trả lời trực tiếp cho câu hỏi của bạn.',
      },
    ],
  },
  'three-card': {
    type: 'three-card',
    nameVi: 'Trải Bài Ba Lá (Quá Khứ · Hiện Tại · Tương Lai)',
    descriptionVi: 'Cái nhìn toàn cảnh về tiến trình thời gian và dòng chảy năng lượng trong câu chuyện của bạn.',
    positions: [
      {
        id: 1,
        nameVi: 'Quá Khứ',
        descriptionVi: 'Nền tảng lịch sử, những trải nghiệm hoặc sự kiện đã định hình nên hoàn cảnh hiện tại.',
      },
      {
        id: 2,
        nameVi: 'Hiện Tại',
        descriptionVi: 'Năng lượng đang hiện diện, thách thức hoặc cơ hội bạn đang trực tiếp đối mặt lúc này.',
      },
      {
        id: 3,
        nameVi: 'Tương Lai',
        descriptionVi: 'Kết quả tiềm năng, hướng đi tiếp theo nếu bạn giữ nguyên dòng năng lượng hiện có.',
      },
    ],
  },
  'celtic-cross': {
    type: 'celtic-cross',
    nameVi: 'Trải Bài Celtic Cross (10 Lá)',
    descriptionVi: 'Kiểu trải bài cổ điển kinh điển cung cấp phân tích cực kỳ sâu sắc, đa chiều cho mọi khía cạnh cuộc sống.',
    positions: [
      { id: 1, nameVi: 'Tình huống hiện tại', descriptionVi: 'Trọng tâm vấn đề lúc này.' },
      { id: 2, nameVi: 'Thách thức', descriptionVi: 'Trở ngại đang cản đường bạn.' },
      { id: 3, nameVi: 'Ý thức / Mục tiêu', descriptionVi: 'Điều bạn đang mong muốn đạt được.' },
      { id: 4, nameVi: 'Tiềm thức', descriptionVi: 'Động lực ngầm hoặc cảm xúc ẩn giấu.' },
      { id: 5, nameVi: 'Quá khứ gần', descriptionVi: 'Sự kiện vừa xảy ra dẫn tới tình huống này.' },
      { id: 6, nameVi: 'Tương lai gần', descriptionVi: 'Điều gì sắp xảy ra tiếp theo.' },
      { id: 7, nameVi: 'Vị thế bản thân', descriptionVi: 'Thái độ và năng lượng nội tại của bạn.' },
      { id: 8, nameVi: 'Môi trường xung quanh', descriptionVi: 'Yếu tố bên ngoài, con người ảnh hưởng đến bạn.' },
      { id: 9, nameVi: 'Hy vọng / Nỗi sợ', descriptionVi: 'Niềm tin mong mỏi hoặc nỗi lo âu tiềm ẩn.' },
      { id: 10, nameVi: 'Kết quả cuối cùng', descriptionVi: 'Điểm đến lâu dài của toàn bộ hành trình.' },
    ],
  },
};
