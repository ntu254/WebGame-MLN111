// AI Service with Fallback - Try Cerebras first, then Gemini (with user's custom API key), then OpenRouter
import { generateSkillNodeQuestion as geminiGenerateQuestion, searchPhilosophicalConcept as geminiSearchConcept } from './geminiService';
import { generateSkillNodeQuestion as openRouterGenerateQuestion, searchPhilosophicalConceptOpenRouter } from './openRouterService';
import { generateSkillNodeQuestion as cerebrasGenerateQuestion, searchPhilosophicalConceptCerebras } from './cerebrasService';

// Mock questions for Level 2 when all AI services fail
const MOCK_QUESTIONS: Record<string, { question: string; options: string[]; correctAnswerIndex: number }> = {
    'Ý Thức': {
        question: 'Theo quan điểm duy vật biện chứng, ý thức là gì?',
        options: [
            'Sản phẩm của não bộ, phản ánh thế giới khách quan',
            'Một thực thể độc lập tồn tại riêng biệt',
            'Hiện tượng siêu nhiên không thể giải thích',
            'Năng lực bẩm sinh từ khi sinh ra'
        ],
        correctAnswerIndex: 0
    },
    'Bộ Óc': {
        question: 'Vai trò của bộ óc đối với ý thức là gì?',
        options: [
            'Không liên quan, ý thức tồn tại độc lập',
            'Bộ óc là cơ quan vật chất của ý thức',
            'Bộ óc chỉ là nơi lưu trữ trí nhớ',
            'Bộ óc tạo ra linh hồn'
        ],
        correctAnswerIndex: 1
    },
    'Lao động': {
        question: 'Theo Ph.Ăngghen, vai trò của lao động trong sự hình thành con người như thế nào?',
        options: [
            'Lao động giúp kiếm sống',
            'Lao động là điều kiện cơ bản đầu tiên của toàn bộ đời sống loài người',
            'Lao động chỉ phát triển cơ bắp',
            'Lao động là hình phạt của thần linh'
        ],
        correctAnswerIndex: 1
    },
    'Phản Ánh': {
        question: 'Phản ánh là thuộc tính của cái gì?',
        options: [
            'Chỉ của con người',
            'Chỉ của động vật có não',
            'Thuộc tính chung của mọi vật chất',
            'Chỉ của sinh vật sống'
        ],
        correctAnswerIndex: 2
    },
    'Ngôn ngữ': {
        question: 'Quan hệ giữa ngôn ngữ và tư duy là gì?',
        options: [
            'Ngôn ngữ là vỏ vật chất của tư duy',
            'Ngôn ngữ và tư duy không liên quan',
            'Tư duy có thể tồn tại không cần ngôn ngữ',
            'Ngôn ngữ quan trọng hơn tư duy'
        ],
        correctAnswerIndex: 0
    },
    'Tâm lý Xã hội': {
        question: 'Tâm lý xã hội là gì?',
        options: [
            'Khoa học nghiên cứu hành vi',
            'Những tình cảm, thói quen, truyền thống của cộng đồng',
            'Bệnh lý tâm thần',
            'Tư tưởng của các nhà lãnh đạo'
        ],
        correctAnswerIndex: 1
    },
    'Hệ tư tưởng': {
        question: 'Hệ tư tưởng bao gồm những gì?',
        options: [
            'Chỉ có triết học',
            'Chỉ có chính trị',
            'Triết học, chính trị, pháp quyền, đạo đức, nghệ thuật',
            'Chỉ có văn học và nghệ thuật'
        ],
        correctAnswerIndex: 2
    }
};

// For quiz generation (Level 2)
export const generateSkillNodeQuestionWithFallback = async (nodeName: string): Promise<{ question: string; options: string[]; correctAnswerIndex: number }> => {
    // Try Cerebras first (fastest and you have the API key!)
    try {
        console.log('🔄 Trying Cerebras AI for quiz (llama-3.3-70b)...');
        const result = await cerebrasGenerateQuestion(nodeName);

        if (result.question && result.options && result.options.length > 0) {
            console.log('✅ Cerebras AI success!');
            return result;
        }
        throw new Error('Cerebras returned invalid response');
    } catch (cerebrasError) {
        console.warn('⚠️ Cerebras failed, switching to Gemini...', cerebrasError);

        // Try Gemini as backup
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
                console.error('❌ All AI services failed, using mock questions', openRouterError);

                // Use mock questions as fallback
                const mockQuestion = MOCK_QUESTIONS[nodeName];
                if (mockQuestion) {
                    console.log(`📚 Using mock question for: ${nodeName}`);
                    return mockQuestion;
                }

                // Final fallback if node name not found in mock data
                return {
                    question: `Câu hỏi về ${nodeName}: Theo quan điểm duy vật biện chứng, ${nodeName.toLowerCase()} có vai trò như thế nào?`,
                    options: [
                        `${nodeName} có vai trò quan trọng trong triết học Mác`,
                        `${nodeName} không liên quan đến vật chất`,
                        `${nodeName} là hiện tượng siêu nhiên`,
                        `${nodeName} chỉ tồn tại trong tưởng tượng`
                    ],
                    correctAnswerIndex: 0
                };
            }
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

