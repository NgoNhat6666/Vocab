export interface Topic {
  id: string;
  band: number;
  order: number;
  title: string;
  description: string;
  icon?: string;
  type?: 'vocabulary' | 'grammar';
}

export const BAND_TOPICS: Record<number, Topic[]> = {
  0: [
    { id: '0-1', band: 0, order: 1, title: 'Nhập môn', description: 'Từ vựng cơ bản nhất', icon: 'Star', type: 'vocabulary' },
    { id: 'g-0', band: 0, order: 2, title: 'To be & Đại từ', description: 'Trạm Ngữ pháp 1', icon: 'Book', type: 'grammar' },
    { id: '0-2', band: 0, order: 3, title: 'Động từ', description: 'Hành động cơ bản', icon: 'Activity', type: 'vocabulary' },
    { id: 'g-1', band: 0, order: 4, title: 'Hiện tại đơn', description: 'Trạm Ngữ pháp 2', icon: 'Feather', type: 'grammar' },
  ],
  1: [
    { id: '1-1', band: 1, order: 1, title: 'Cơ bản 1', description: 'Từ vựng nền tảng', icon: 'Star', type: 'vocabulary' },
    { id: 'g-2', band: 1, order: 2, title: 'Quá khứ đơn', description: 'Trạm Ngữ pháp 3', icon: 'BookOpen', type: 'grammar' },
    { id: '1-2', band: 1, order: 3, title: 'Chào hỏi', description: 'Giao tiếp hàng ngày', icon: 'MessageCircle', type: 'vocabulary' },
    { id: 'g-3', band: 1, order: 4, title: 'Hiện tại tiếp diễn', description: 'Trạm Ngữ pháp 4', icon: 'Activity', type: 'grammar' },
    { id: '1-3', band: 1, order: 5, title: 'Gia đình', description: 'Người thân & bạn bè', icon: 'Users', type: 'vocabulary' },
    { id: '1-4', band: 1, order: 6, title: 'Đồ ăn', description: 'Ẩm thực cơ bản', icon: 'Coffee', type: 'vocabulary' },
  ],
  2: [
    { id: '2-1', band: 2, order: 1, title: 'Thói quen', description: 'Hoạt động thường ngày', icon: 'Clock', type: 'vocabulary' },
    { id: 'g-5', band: 2, order: 2, title: 'Tương lai đơn', description: 'Trạm Ngữ pháp 5', icon: 'Zap', type: 'grammar' },
    { id: '2-2', band: 2, order: 3, title: 'Sở thích', description: 'Thời gian rảnh', icon: 'Heart', type: 'vocabulary' },
    { id: 'g-8', band: 2, order: 4, title: 'So sánh', description: 'Trạm Ngữ pháp 6', icon: 'Scale', type: 'grammar' },
    { id: '2-3', band: 2, order: 5, title: 'Du lịch', description: 'Khám phá thế giới', icon: 'Plane', type: 'vocabulary' },
    { id: '2-4', band: 2, order: 6, title: 'Công việc', description: 'Nghề nghiệp', icon: 'Briefcase', type: 'vocabulary' },
  ],
  3: [
    { id: '3-1', band: 3, order: 1, title: 'Môi trường', description: 'Tự nhiên & khí hậu', icon: 'Leaf', type: 'vocabulary' },
    { id: 'g-4', band: 3, order: 2, title: 'Hiện tại hoàn thành', description: 'Trạm Ngữ pháp 7', icon: 'Clock', type: 'grammar' },
    { id: '3-2', band: 3, order: 3, title: 'Sức khỏe', description: 'Y tế & thể chất', icon: 'Activity', type: 'vocabulary' },
    { id: 'g-10', band: 3, order: 4, title: 'Động từ khuyết thiếu', description: 'Trạm Ngữ pháp 8', icon: 'Shield', type: 'grammar' },
    { id: '3-3', band: 3, order: 5, title: 'Công nghệ', description: 'Thiết bị & internet', icon: 'Smartphone', type: 'vocabulary' },
    { id: '3-4', band: 3, order: 6, title: 'Văn hóa', description: 'Nghệ thuật & truyền thống', icon: 'Globe', type: 'vocabulary' },
  ],
  4: [
    { id: '4-1', band: 4, order: 1, title: 'Xã hội', description: 'Vấn đề đương đại', icon: 'Users', type: 'vocabulary' },
    { id: 'g-6', band: 4, order: 2, title: 'Câu bị động', description: 'Trạm Ngữ pháp 9', icon: 'Layers', type: 'grammar' },
    { id: 'g-11', band: 4, order: 3, title: 'Quá khứ tiếp diễn', description: 'Trạm Ngữ pháp 10', icon: 'Clock', type: 'grammar' },
    { id: '4-2', band: 4, order: 4, title: 'Khoa học', description: 'Khám phá & phát minh', icon: 'Microscope', type: 'vocabulary' },
    { id: '4-3', band: 4, order: 5, title: 'Kinh doanh', description: 'Thương mại & tài chính', icon: 'TrendingUp', type: 'vocabulary' },
    { id: '4-4', band: 4, order: 6, title: 'Lịch sử', description: 'Sự kiện quá khứ', icon: 'BookOpen', type: 'vocabulary' },
  ],
  5: [
    { id: '5-1', band: 5, order: 1, title: 'Toàn cầu', description: 'Thách thức quốc tế', icon: 'Globe', type: 'vocabulary' },
    { id: 'g-7', band: 5, order: 2, title: 'Mệnh đề quan hệ', description: 'Trạm Ngữ pháp 11', icon: 'Link', type: 'grammar' },
    { id: 'g-12', band: 5, order: 3, title: 'Câu gián tiếp', description: 'Trạm Ngữ pháp 12', icon: 'MessageSquare', type: 'grammar' },
    { id: 'g-13', band: 5, order: 4, title: 'V-ing hay To-V?', description: 'Trạm Ngữ pháp 13', icon: 'Zap', type: 'grammar' },
    { id: '5-2', band: 5, order: 5, title: 'Tâm lý', description: 'Hành vi con người', icon: 'Brain', type: 'vocabulary' },
    { id: '5-3', band: 5, order: 6, title: 'Luật pháp', description: 'Quy định & công lý', icon: 'Scale', type: 'vocabulary' },
    { id: '5-4', band: 5, order: 7, title: 'Kinh tế', description: 'Thị trường & chính sách', icon: 'PieChart', type: 'vocabulary' },
  ],
  6: [
    { id: '6-1', band: 6, order: 1, title: 'Triết học', description: 'Tư tưởng & lý luận', icon: 'Book', type: 'vocabulary' },
    { id: 'g-9', band: 6, order: 2, title: 'Câu điều kiện', description: 'Trạm Ngữ pháp 14', icon: 'Zap', type: 'grammar' },
    { id: 'g-16', band: 6, order: 3, title: 'Điều kiện nâng cao', description: 'Trạm Ngữ pháp 15', icon: 'Zap', type: 'grammar' },
    { id: 'g-14', band: 6, order: 4, title: 'Từ nối (Linking)', description: 'Trạm Ngữ pháp 16', icon: 'Link', type: 'grammar' },
    { id: '6-2', band: 6, order: 5, title: 'Văn học', description: 'Tác phẩm kinh điển', icon: 'Feather', type: 'vocabulary' },
    { id: '6-3', band: 6, order: 6, title: 'Kiến trúc', description: 'Thiết kế & không gian', icon: 'Home', type: 'vocabulary' },
    { id: '6-4', band: 6, order: 7, title: 'Ngôn ngữ', description: 'Cấu trúc & ý nghĩa', icon: 'MessageCircle', type: 'vocabulary' },
  ],
  7: [
    { id: '7-1', band: 7, order: 1, title: 'Từ vựng khó', description: 'Từ vựng học thuật', icon: 'Star', type: 'vocabulary' },
    { id: 'g-17', band: 7, order: 2, title: 'Mệnh đề phân từ', description: 'Trạm Ngữ pháp 17', icon: 'Layers', type: 'grammar' },
    { id: 'g-15', band: 7, order: 3, title: 'Mạo từ & Lượng từ', description: 'Trạm Ngữ pháp 18', icon: 'PieChart', type: 'grammar' },
    { id: '7-2', band: 7, order: 4, title: 'Thành ngữ', description: 'Cách diễn đạt tự nhiên', icon: 'MessageSquare', type: 'vocabulary' },
    { id: '7-3', band: 7, order: 5, title: 'Cụm động từ', description: 'Phrasal verbs phổ biến', icon: 'Link', type: 'vocabulary' },
    { id: '7-4', band: 7, order: 6, title: 'Sắc thái', description: 'Phân biệt từ đồng nghĩa', icon: 'Layers', type: 'vocabulary' },
  ],
};
