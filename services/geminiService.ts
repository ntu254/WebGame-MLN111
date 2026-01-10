import { GoogleGenAI, Type } from "@google/genai";
import { getGeminiApiKey } from "./apiKeyService";

// Create AI instance dynamically with current API key
const getAIInstance = () => {
  const apiKey = getGeminiApiKey();
  return new GoogleGenAI({ apiKey });
};

// Helper to check for API key
const hasKey = () => !!getGeminiApiKey();

export const checkClassificationWithAI = async (item: string, userChoice: string): Promise<string> => {
  if (!hasKey()) return "Hệ thống AI đang ngoại tuyến. (Thiếu API Key)";

  try {
    const response = await getAIInstance().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User classified "${item}" as "${userChoice}". In the context of Marxist-Leninist philosophy (Materialism vs Idealism), is this correct? Explain briefly in 1 sentence in Vietnamese.`,
    });
    return response.text || "Không thể phân tích dữ liệu.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Lỗi kết nối máy chủ AI.";
  }
};

export const generateSkillNodeQuestion = async (nodeName: string): Promise<{ question: string; options: string[]; correctAnswerIndex: number }> => {
  if (!hasKey()) {
    return {
      question: `Câu hỏi giả lập về ${nodeName}?`,
      options: ["Đáp án A", "Đáp án B", "Đáp án C"],
      correctAnswerIndex: 0
    };
  }

  try {
    const response = await getAIInstance().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a multiple-choice question in Vietnamese about the origin of consciousness related to "${nodeName}" based on Engels' or Marxist theory. Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswerIndex: { type: Type.INTEGER, description: "0-based index of correct answer" }
          }
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) throw new Error("Empty response");
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Quiz Gen Error", error);
    return {
      question: `Lỗi tạo câu hỏi cho ${nodeName}. Vui lòng thử lại.`,
      options: ["Thử lại"],
      correctAnswerIndex: 0
    };
  }
};

export const consultDialecticAdvisor = async (stats: { material: number, consciousness: number }): Promise<string> => {
  if (!hasKey()) return "Cố vấn: Cần cân bằng giữa cơ sở hạ tầng và kiến trúc thượng tầng.";

  try {
    const response = await getAIInstance().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Current stats: Material Conditions (Basis): ${stats.material}, Social Consciousness (Superstructure): ${stats.consciousness}. 
      Analyze the dialectical relationship. If Material >> Consciousness, warn about "Vulgar Materialism" or lack of culture. 
      If Consciousness >> Material, warn about "Idealism" or lack of resources. 
      If balanced, praise the development.
      Provide a short, futuristic strategic advice in Vietnamese.`,
    });
    return response.text || "Dữ liệu cố vấn bị hỏng.";
  } catch (error) {
    return "Kết nối với Cố vấn Biện chứng thất bại.";
  }
};

export const generateEventOutcome = async (eventName: string, choice: string): Promise<string> => {
  if (!hasKey()) return "Hệ thống ghi nhận quyết định của bạn.";

  try {
    const response = await getAIInstance().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `In a society simulation game based on Dialectical Materialism.
            Event: "${eventName}" occurred.
            Player Choice: "${choice}".
            Generate a 1-sentence outcome describing how society changes based on this choice in Vietnamese.`,
    });
    return response.text || "Quyết định đã được thực thi.";
  } catch (e) {
    return "Lỗi xử lý sự kiện.";
  }
}

export const searchPhilosophicalConcept = async (query: string): Promise<string> => {
  if (!hasKey()) return "Tính năng tìm kiếm cần API Key.";

  try {
    const response = await getAIInstance().models.generateContent({
      model: "gemini-3-flash-preview", // Using flash with tools as requested
      contents: `Explain "${query}" briefly in the context of Marxist philosophy in Vietnamese. Find a real-world example.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    let text = response.text || "";

    // Extract sources if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      const links = chunks
        .map((c: any) => c.web?.uri ? `[${c.web.title}](${c.web.uri})` : null)
        .filter(Boolean)
        .join(', ');
      if (links) text += `\n\nNguồn tham khảo: ${links}`;
    }

    return text;
  } catch (e) {
    console.error(e);
    return "Không thể tìm kiếm thông tin lúc này.";
  }
}