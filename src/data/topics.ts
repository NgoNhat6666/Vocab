export interface Topic {
  id: string;
  band: number;
  order: number;
  title: string;
  description: string;
  icon?: string;
}

export const BAND_TOPICS: Record<number, Topic[]> = {
  0: [
    { id: '0-1', band: 0, order: 1, title: 'Nhập môn', description: 'Từ vựng cơ bản nhất', icon: 'Star' },
    { id: '0-2', band: 0, order: 2, title: 'Động từ', description: 'Hành động cơ bản', icon: 'Activity' },
  ],
  1: [
    { id: '1-1', band: 1, order: 1, title: 'Cơ bản 1', description: 'Từ vựng nền tảng', icon: 'Star' },
    { id: '1-2', band: 1, order: 2, title: 'Chào hỏi', description: 'Giao tiếp hàng ngày', icon: 'MessageCircle' },
    { id: '1-3', band: 1, order: 3, title: 'Gia đình', description: 'Người thân & bạn bè', icon: 'Users' },
    { id: '1-4', band: 1, order: 4, title: 'Đồ ăn', description: 'Ẩm thực cơ bản', icon: 'Coffee' },
  ],
  2: [
    { id: '2-1', band: 2, order: 1, title: 'Thói quen', description: 'Hoạt động thường ngày', icon: 'Clock' },
    { id: '2-2', band: 2, order: 2, title: 'Sở thích', description: 'Thời gian rảnh', icon: 'Heart' },
    { id: '2-3', band: 2, order: 3, title: 'Du lịch', description: 'Khám phá thế giới', icon: 'Plane' },
    { id: '2-4', band: 2, order: 4, title: 'Công việc', description: 'Nghề nghiệp', icon: 'Briefcase' },
  ],
  3: [
    { id: '3-1', band: 3, order: 1, title: 'Môi trường', description: 'Tự nhiên & khí hậu', icon: 'Leaf' },
    { id: '3-2', band: 3, order: 2, title: 'Sức khỏe', description: 'Y tế & thể chất', icon: 'Activity' },
    { id: '3-3', band: 3, order: 3, title: 'Công nghệ', description: 'Thiết bị & internet', icon: 'Smartphone' },
    { id: '3-4', band: 3, order: 4, title: 'Văn hóa', description: 'Nghệ thuật & truyền thống', icon: 'Globe' },
  ],
  4: [
    { id: '4-1', band: 4, order: 1, title: 'Xã hội', description: 'Vấn đề đương đại', icon: 'Users' },
    { id: '4-2', band: 4, order: 2, title: 'Khoa học', description: 'Khám phá & phát minh', icon: 'Microscope' },
    { id: '4-3', band: 4, order: 3, title: 'Kinh doanh', description: 'Thương mại & tài chính', icon: 'TrendingUp' },
    { id: '4-4', band: 4, order: 4, title: 'Lịch sử', description: 'Sự kiện quá khứ', icon: 'BookOpen' },
  ],
  5: [
    { id: '5-1', band: 5, order: 1, title: 'Toàn cầu', description: 'Thách thức quốc tế', icon: 'Globe' },
    { id: '5-2', band: 5, order: 2, title: 'Tâm lý', description: 'Hành vi con người', icon: 'Brain' },
    { id: '5-3', band: 5, order: 3, title: 'Luật pháp', description: 'Quy định & công lý', icon: 'Scale' },
    { id: '5-4', band: 5, order: 4, title: 'Kinh tế', description: 'Thị trường & chính sách', icon: 'PieChart' },
  ],
  6: [
    { id: '6-1', band: 6, order: 1, title: 'Triết học', description: 'Tư tưởng & lý luận', icon: 'Book' },
    { id: '6-2', band: 6, order: 2, title: 'Văn học', description: 'Tác phẩm kinh điển', icon: 'Feather' },
    { id: '6-3', band: 6, order: 3, title: 'Kiến trúc', description: 'Thiết kế & không gian', icon: 'Home' },
    { id: '6-4', band: 6, order: 4, title: 'Ngôn ngữ', description: 'Cấu trúc & ý nghĩa', icon: 'MessageCircle' },
  ],
  7: [
    { id: '7-1', band: 7, order: 1, title: 'Từ vựng khó', description: 'Từ vựng học thuật', icon: 'Star' },
    { id: '7-2', band: 7, order: 2, title: 'Thành ngữ', description: 'Cách diễn đạt tự nhiên', icon: 'MessageSquare' },
    { id: '7-3', band: 7, order: 3, title: 'Cụm động từ', description: 'Phrasal verbs phổ biến', icon: 'Link' },
    { id: '7-4', band: 7, order: 4, title: 'Sắc thái', description: 'Phân biệt từ đồng nghĩa', icon: 'Layers' },
  ],
};
