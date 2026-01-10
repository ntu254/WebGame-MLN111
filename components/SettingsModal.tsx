import React, { useState, useEffect } from 'react';
import { Settings, Key, ExternalLink, Check, X, Trash2, AlertCircle } from 'lucide-react';
import {
    getGeminiApiKey,
    setGeminiApiKey,
    clearGeminiApiKey,
    hasCustomApiKey,
    isValidApiKeyFormat
} from '../services/apiKeyService';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [hasCustomKey, setHasCustomKey] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setHasCustomKey(hasCustomApiKey());
            setApiKey('');
            setSaveStatus('idle');
        }
    }, [isOpen]);

    const handleSave = () => {
        if (!apiKey.trim()) {
            setSaveStatus('error');
            return;
        }

        if (!isValidApiKeyFormat(apiKey.trim())) {
            setSaveStatus('error');
            return;
        }

        setGeminiApiKey(apiKey.trim());
        setHasCustomKey(true);
        setSaveStatus('saved');
        setApiKey('');

        setTimeout(() => {
            setSaveStatus('idle');
        }, 2000);
    };

    const handleClear = () => {
        clearGeminiApiKey();
        setHasCustomKey(false);
        setSaveStatus('idle');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4">
            <div className="bg-slate-900 w-full max-w-md rounded-xl shadow-2xl border border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/20 rounded-lg">
                            <Settings className="text-blue-400" size={20} />
                        </div>
                        <h2 className="text-white font-bold text-lg">Cài đặt API Key</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status indicator */}
                    <div className={`p-4 rounded-lg border ${hasCustomKey
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                        <div className="flex items-center gap-3">
                            {hasCustomKey ? (
                                <>
                                    <Check className="text-green-400" size={20} />
                                    <div>
                                        <p className="text-green-400 font-medium">Đang dùng API Key tùy chỉnh</p>
                                        <p className="text-green-400/70 text-sm">Gemini AI sẵn sàng hoạt động</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="text-yellow-400" size={20} />
                                    <div>
                                        <p className="text-yellow-400 font-medium">Chưa có API Key tùy chỉnh</p>
                                        <p className="text-yellow-400/70 text-sm">Đang dùng key mặc định (nếu có)</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* API Key Input */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-300">
                            <Key className="inline mr-2" size={14} />
                            Gemini API Key
                        </label>
                        <div className="relative">
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => {
                                    setApiKey(e.target.value);
                                    setSaveStatus('idle');
                                }}
                                placeholder="AIza..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            />
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                            >
                                {showKey ? 'Ẩn' : 'Hiện'}
                            </button>
                        </div>

                        {saveStatus === 'error' && (
                            <p className="text-red-400 text-sm flex items-center gap-1">
                                <AlertCircle size={14} />
                                API Key không hợp lệ. Key phải bắt đầu bằng "AIza"
                            </p>
                        )}

                        {saveStatus === 'saved' && (
                            <p className="text-green-400 text-sm flex items-center gap-1">
                                <Check size={14} />
                                Đã lưu thành công!
                            </p>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={!apiKey.trim()}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Check size={18} />
                            Lưu API Key
                        </button>

                        {hasCustomKey && (
                            <button
                                onClick={handleClear}
                                className="bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 border border-red-500/30"
                            >
                                <Trash2 size={18} />
                                Xóa
                            </button>
                        )}
                    </div>

                    {/* Help section */}
                    <div className="pt-4 border-t border-slate-800">
                        <p className="text-slate-400 text-sm mb-3">
                            Chưa có API Key? Lấy miễn phí tại Google AI Studio:
                        </p>
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                            <ExternalLink size={14} />
                            https://aistudio.google.com/app/apikey
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
