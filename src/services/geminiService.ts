import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const getAIExplanation = async (word: string, context?: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Giải thích chi tiết từ vựng "${word}" trong tiếng Anh. 
    ${context ? `Trong ngữ cảnh: "${context}"` : ""}
    Hãy cung cấp:
    1. Nghĩa tiếng Việt chính xác.
    2. Cách dùng phổ biến (collocations).
    3. 3 ví dụ câu thực tế.
    4. Phân biệt với các từ gần nghĩa (nếu có).
    Trả về định dạng Markdown đẹp mắt.`,
  });
  return response.text;
};

export const getWritingFeedback = async (text: string, targetWords: string[]) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Bạn là một giáo viên IELTS chuyên nghiệp. Hãy nhận xét đoạn văn sau của học sinh:
    "${text}"
    
    Học sinh đang cố gắng sử dụng các từ vựng sau: ${targetWords.join(", ")}.
    
    Hãy cung cấp phản hồi theo các tiêu chí:
    1. Độ chính xác của ngữ pháp.
    2. Cách sử dụng từ vựng (đặc biệt là các từ mục tiêu).
    3. Gợi ý cách viết tự nhiên hơn (Native-like).
    4. Chấm điểm ước lượng theo tiêu chí IELTS Writing (0-9).
    
    Trả về định dạng Markdown.`,
  });
  return response.text;
};

export const generateAIChatResponse = async (history: { role: 'user' | 'model', parts: { text: string }[] }[], topic: string) => {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `Bạn là một người bạn bản xứ đang trò chuyện với một học sinh học tiếng Anh. 
      Chủ đề hôm nay là: "${topic}". 
      Hãy trò chuyện tự nhiên, sử dụng từ vựng phù hợp với trình độ IELTS. 
      Thỉnh thoảng hãy sửa lỗi nhẹ nhàng cho học sinh nếu họ viết sai. 
      Khuyến khích học sinh sử dụng các từ vựng liên quan đến chủ đề.
      Hãy viết ngắn gọn, mỗi câu trả lời khoảng 2-3 câu.`,
    }
  });

  // Since we're creating a new chat each time for simplicity in this stateless example,
  // we'll send the whole history. In a real app, you'd keep the chat instance.
  // For now, let's just use generateContent for the latest message with history context.
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: history,
    config: {
      systemInstruction: `Bạn là một người bạn bản xứ đang trò chuyện với một học sinh học tiếng Anh. 
      Chủ đề hôm nay là: "${topic}". 
      Hãy trò chuyện tự nhiên, sử dụng từ vựng phù hợp với trình độ IELTS. 
      Thỉnh thoảng hãy sửa lỗi nhẹ nhàng cho học sinh nếu họ viết sai. 
      Khuyến khích học sinh sử dụng các từ vựng liên quan đến chủ đề.
      Hãy viết ngắn gọn, mỗi câu trả lời khoảng 2-3 câu.`,
    }
  });
  
  return response.text;
};
