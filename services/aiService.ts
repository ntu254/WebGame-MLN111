// AI Service with Fallback - Try Cerebras first, then Gemini (with user's custom API key), then OpenRouter
import { generateSkillNodeQuestion as geminiGenerateQuestion, searchPhilosophicalConcept as geminiSearchConcept } from './geminiService';
import { generateSkillNodeQuestion as openRouterGenerateQuestion, searchPhilosophicalConceptOpenRouter } from './openRouterService';
import { searchPhilosophicalConceptCerebras } from './cerebrasService';

// For quiz generation (Level 2)
export const generateSkillNodeQuestionWithFallback = async (nodeName: string): Promise<{ question: string; options: string[]; correctAnswerIndex: number }> => {
    try {
        console.log('🔄 Trying Gemini AI for quiz...');
        const result = await geminiGenerateQuestion(nodeName);

        // Check if it's a real response (not error/fallback message)
        if (result.question && !result.question.includes('Lỗi') && !result.question.includes('giả lập')) {
            console.log('✅ Gemini AI success!');
            return result;
        }
        throw new Error('Gemini returned fallback response');
    } catch (geminiError) {
        console.warn('⚠️ Gemini failed, switching to OpenRouter...', geminiError);

        try {
            const result = await openRouterGenerateQuestion(nodeName);
            console.log('✅ OpenRouter AI success!');
            return result;
        } catch (openRouterError) {
            console.error('❌ Both AI services failed', openRouterError);
            return {
                question: `Cả hai dịch vụ AI đều không khả dụng. Câu hỏi về ${nodeName}?`,
                options: ["Vui lòng thử lại sau"],
                correctAnswerIndex: 0
            };
        }
    }
};

// For philosophical concept search - Try Cerebras → Gemini → OpenRouter
export const searchPhilosophicalConceptWithFallback = async (query: string): Promise<string> => {
    // Try Cerebras first (fastest and most reliable)
    try {
        console.log('🔄 Trying Cerebras AI for search (llama-3.3-70b)...');
        const result = await searchPhilosophicalConceptCerebras(query);

        // Check if it's a real response (not error/fallback message)
        if (result && !result.includes('cần') && !result.includes('Không nhận được')) {
            console.log('✅ Cerebras AI success!');
            return result;
        }
        throw new Error('Cerebras returned error response');
    } catch (cerebrasError) {
        console.warn('⚠️ Cerebras failed, switching to Gemini...', cerebrasError);

        // Try Gemini (supports user's custom API key)
        try {
            console.log('🔄 Trying Gemini AI for search (with user custom API key support)...');
            const result = await geminiSearchConcept(query);

            // Check if it's a real response (not error/fallback message)
            if (result && !result.includes('cần API Key') && !result.includes('Lỗi kết nối') && !result.includes('Không thể tìm kiếm')) {
                console.log('✅ Gemini AI success!');
                return result;
            }
            throw new Error('Gemini returned error response');
        } catch (geminiError) {
            console.warn('⚠️ Gemini also failed, switching to OpenRouter...', geminiError);

            // Try OpenRouter as last resort
            try {
                console.log('🔄 Trying OpenRouter AI as final fallback...');
                const result = await searchPhilosophicalConceptOpenRouter(query);

                // Check if it's a real response
                if (result && !result.includes('cần API Key') && !result.includes('Lỗi kết nối')) {
                    console.log('✅ OpenRouter AI success!');
                    return result;
                }
                throw new Error('OpenRouter returned error response');
            } catch (openRouterError) {
                console.error('❌ All three AI services failed', openRouterError);
                return "⚠️ Không thể kết nối với các dịch vụ AI.\n\n🔧 Giải pháp:\n1. Kiểm tra kết nối mạng\n2. Mở 'Cài đặt' để nhập Gemini API Key\n3. Hoặc cấu hình API keys trong file .env\n\n📖 Lấy API key miễn phí:\n- Gemini: https://aistudio.google.com/app/apikey\n- Cerebras: https://cerebras.ai";
            }
        }
    }
};

