// AI Service with Fallback - Try Gemini first, then OpenRouter
import { generateSkillNodeQuestion as geminiGenerateQuestion } from './geminiService';
import { generateSkillNodeQuestion as openRouterGenerateQuestion, searchPhilosophicalConceptOpenRouter } from './openRouterService';

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

// For philosophical concept search
export const searchPhilosophicalConceptWithFallback = async (query: string): Promise<string> => {
    try {
        console.log('🔄 Trying OpenRouter AI for search...');
        const result = await searchPhilosophicalConceptOpenRouter(query);

        // Check if it's a real response
        if (result && !result.includes('cần API Key') && !result.includes('Lỗi kết nối')) {
            console.log('✅ OpenRouter AI success!');
            return result;
        }
        throw new Error('OpenRouter returned error response');
    } catch (error) {
        console.error('❌ Search failed', error);
        return "Không thể kết nối với dịch vụ AI. Vui lòng kiểm tra API key trong file .env và thử lại.";
    }
};
