// DeepSeek AI Service for Philosophy Concept Search
// Tạm thời hardcode để test - sau đó sẽ chuyển về env
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || 'sk-cacc47adbe3241b48a0f0bf8c235f69d';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Debug: Log env status
console.log('DeepSeek API Key status:', DEEPSEEK_API_KEY ? 'Loaded ✓' : 'Missing ✗');
console.log('All VITE env:', import.meta.env);

export const searchPhilosophicalConceptDeepSeek = async (query: string): Promise<string> => {
    if (!DEEPSEEK_API_KEY) {
        return "Tính năng tìm kiếm cần API Key DeepSeek. Kiểm tra file .env có VITE_DEEPSEEK_API_KEY chưa.";
    }

    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: `Bạn là một chuyên gia triết học Mác-Lênin. Hãy giải thích các khái niệm triết học một cách dễ hiểu, súc tích và đưa ra ví dụ thực tế. Trả lời bằng tiếng Việt.`
                    },
                    {
                        role: 'user',
                        content: `Giải thích ngắn gọn khái niệm "${query}" trong bối cảnh triết học Mác-Lênin. Đưa ra một ví dụ thực tế.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 1024,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('DeepSeek API Error:', response.status, errorData);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            return "Không nhận được phản hồi từ DeepSeek AI.";
        }

        return content;
    } catch (error) {
        console.error('DeepSeek Error:', error);
        return "Lỗi kết nối với DeepSeek AI. Vui lòng thử lại sau.";
    }
};
