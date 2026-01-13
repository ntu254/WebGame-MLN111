// Cerebras API Service for Philosophical Concept Search
// API Documentation: https://inference-docs.cerebras.ai/

const CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions';

const getCerebrasApiKey = (): string => {
    return import.meta.env.VITE_CEREBRAS_API_KEY || '';
};

export const searchPhilosophicalConceptCerebras = async (query: string): Promise<string> => {
    const apiKey = getCerebrasApiKey();

    if (!apiKey) {
        return "Tính năng tìm kiếm cần Cerebras API Key.";
    }

    try {
        const response = await fetch(CEREBRAS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b', // Cerebras's fastest model
                messages: [
                    {
                        role: 'system',
                        content: 'Bạn là một chuyên gia triết học Mác-Lênin. Hãy giải thích các khái niệm một cách ngắn gọn, dễ hiểu bằng tiếng Việt, kèm ví dụ thực tế.'
                    },
                    {
                        role: 'user',
                        content: `Giải thích khái niệm "${query}" trong triết học Mác-Lênin. Trả lời ngắn gọn trong 2-3 câu và cho 1 ví dụ thực tế.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Cerebras API Error:', response.status, errorData);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const answer = data.choices?.[0]?.message?.content || "Không nhận được phản hồi từ Cerebras AI.";

        return answer;
    } catch (error) {
        console.error('Cerebras Error:', error);
        throw error; // Re-throw to trigger fallback
    }
};

// Generate quiz question for Level 2 using Cerebras
export const generateSkillNodeQuestion = async (nodeName: string): Promise<{ question: string; options: string[]; correctAnswerIndex: number }> => {
    const apiKey = getCerebrasApiKey();

    if (!apiKey) {
        throw new Error("Cerebras API Key not found");
    }

    try {
        const response = await fetch(CEREBRAS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b',
                messages: [
                    {
                        role: 'system',
                        content: 'Bạn là một chuyên gia triết học Mác-Lênin. Tạo câu hỏi trắc nghiệm bằng tiếng Việt. Trả lời CHÍNH XÁC theo format JSON: {"question": "...", "options": ["A", "B", "C", "D"], "correctAnswerIndex": 0}'
                    },
                    {
                        role: 'user',
                        content: `Tạo 1 câu hỏi trắc nghiệm về "${nodeName}" trong triết học Mác-Lênin. 
                        
Yêu cầu:
- Câu hỏi phải liên quan đến nguồn gốc ý thức con người
- 4 đáp án, chỉ 1 đáp án đúng
- Đáp án đúng phải dựa trên quan điểm duy vật biện chứng

Trả lời ĐÚNG format JSON này (không thêm text nào khác):
{"question": "câu hỏi ở đây", "options": ["đáp án A", "đáp án B", "đáp án C", "đáp án D"], "correctAnswerIndex": 0}`
                    }
                ],
                temperature: 0.8,
                max_tokens: 400
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Cerebras Quiz API Error:', response.status, errorData);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content || "";

        // Parse JSON from response
        // Try to extract JSON if wrapped in markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || content.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
            content = jsonMatch[1];
        }

        const parsed = JSON.parse(content);

        // Validate structure
        if (!parsed.question || !Array.isArray(parsed.options) || typeof parsed.correctAnswerIndex !== 'number') {
            throw new Error('Invalid response structure');
        }

        return {
            question: parsed.question,
            options: parsed.options,
            correctAnswerIndex: parsed.correctAnswerIndex
        };
    } catch (error) {
        console.error('Cerebras Quiz Generation Error:', error);
        throw error;
    }
};
