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
