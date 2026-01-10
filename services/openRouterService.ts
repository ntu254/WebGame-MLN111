// OpenRouter AI Service for Philosophy Concept Search
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const searchPhilosophicalConceptOpenRouter = async (query: string): Promise<string> => {
    if (!OPENROUTER_API_KEY) {
        return "Tính năng tìm kiếm cần API Key OpenRouter.";
    }

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Co May Bien Chung',
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-3.3-70b-instruct:free',
                messages: [
                    {
                        role: 'user',
                        content: `Bạn là một chuyên gia triết học Mác-Lênin. Giải thích ngắn gọn khái niệm "${query}" trong bối cảnh triết học Mác-Lênin bằng tiếng Việt. Đưa ra một ví dụ thực tế.`
                    }
                ],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('OpenRouter API Error:', response.status, errorData);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            return "Không nhận được phản hồi từ OpenRouter AI.";
        }

        return content;
    } catch (error) {
        console.error('OpenRouter Error:', error);
        return "Lỗi kết nối với OpenRouter AI. Vui lòng thử lại sau.";
    }
};

// Generate quiz question for Level 2 skill tree
export const generateSkillNodeQuestion = async (nodeName: string): Promise<{ question: string; options: string[]; correctAnswerIndex: number }> => {
    if (!OPENROUTER_API_KEY) {
        return {
            question: `Câu hỏi giả lập về ${nodeName}?`,
            options: ["Đáp án A", "Đáp án B", "Đáp án C"],
            correctAnswerIndex: 0
        };
    }

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Co May Bien Chung',
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-3.3-70b-instruct:free',
                messages: [
                    {
                        role: 'user',
                        content: `Tạo MỘT câu hỏi trắc nghiệm tiếng Việt về nguồn gốc ý thức liên quan đến "${nodeName}" dựa theo lý thuyết của Ăngghen hoặc Mác.

Trả lời dưới dạng JSON với format chính xác như sau (không thêm bất kỳ text nào khác):
{
  "question": "Nội dung câu hỏi?",
  "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
  "correctAnswerIndex": 0
}

Trong đó correctAnswerIndex là chỉ số (0-3) của đáp án đúng.`
                    }
                ],
            }),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) throw new Error("Empty response");

        // Extract JSON from response (handle markdown code blocks)
        let jsonStr = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1].trim();
        }

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
