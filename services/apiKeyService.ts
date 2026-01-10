// API Key Management Service
// Quản lý việc lưu trữ và truy xuất API keys từ localStorage

const GEMINI_KEY_STORAGE = 'gemini_api_key';

// Lấy API key (ưu tiên từ localStorage, fallback về env)
export const getGeminiApiKey = (): string => {
    const customKey = localStorage.getItem(GEMINI_KEY_STORAGE);
    if (customKey) {
        return customKey;
    }
    // Fallback to environment variable
    return import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY || '';
};

// Lưu API key vào localStorage
export const setGeminiApiKey = (key: string): void => {
    if (key.trim()) {
        localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
    }
};

// Xóa API key khỏi localStorage
export const clearGeminiApiKey = (): void => {
    localStorage.removeItem(GEMINI_KEY_STORAGE);
};

// Kiểm tra xem user có đang dùng custom key không
export const hasCustomApiKey = (): boolean => {
    return !!localStorage.getItem(GEMINI_KEY_STORAGE);
};

// Validate API key format (basic check)
export const isValidApiKeyFormat = (key: string): boolean => {
    // Gemini API keys typically start with 'AIza' and are ~39 characters
    return key.length >= 35 && key.startsWith('AIza');
};
