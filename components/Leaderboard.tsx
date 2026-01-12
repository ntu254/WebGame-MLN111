import React, { useEffect, useState } from 'react';
import { getLeaderboard, saveUserScore, isSupabaseConfigured, LeaderboardEntry } from '../services/supabaseService';
import { Trophy, Save, RefreshCw, AlertTriangle, User } from 'lucide-react';
import { playSound } from '../services/soundService';

export const Leaderboard: React.FC<{ currentScore: number }> = ({ currentScore }) => {
    const [data, setData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const result = await getLeaderboard();
        setData(result);
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        playSound('click');
        setIsSaving(true);
        const success = await saveUserScore(username, currentScore);

        if (success) {
            playSound('success');
            setHasSaved(true);
            await fetchData(); // Refresh list
        } else {
            playSound('error');
            setErrorMsg("Lỗi kết nối máy chủ. Vui lòng thử lại.");
        }
        setIsSaving(false);
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' }) + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    if (!isSupabaseConfigured()) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center text-slate-400">
                <AlertTriangle className="mx-auto mb-4 text-yellow-500" size={48} />
                <h2 className="text-2xl font-bold text-white mb-2">Chưa kết nối dữ liệu</h2>
                <p>Vui lòng cấu hình VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY để kích hoạt tính năng bảng xếp hạng trực tuyến.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-900/20 rounded-full border border-yellow-700/50">
                        <Trophy className="text-yellow-500" size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-display text-white">Bảng Xếp Hạng</h2>
                        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Dữ liệu thời gian thực</p>
                    </div>
                </div>
                <button
                    onClick={() => { playSound('click'); fetchData(); }}
                    className="p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                    title="Làm mới"
                >
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Save Score Section - Only show if user has score and hasn't saved yet */}
            {currentScore > 0 && !hasSaved && (
                <div className="mb-8 bg-blue-900/10 border border-blue-500/30 rounded-xl p-6 relative overflow-hidden animate-in slide-in-from-top duration-500">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Ghi danh vào lịch sử!</h3>
                            <p className="text-slate-400 text-sm">Điểm số hiện tại của bạn: <span className="text-blue-400 font-mono font-bold text-lg">{currentScore.toLocaleString()} XP</span></p>
                        </div>

                        <form onSubmit={handleSave} className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Nhập tên danh dự..."
                                    className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white outline-none focus:border-blue-500 transition-all w-full md:w-64"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    maxLength={15}
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSaving || !username}
                                className={`
                                flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg
                                ${!username ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 hover:shadow-blue-500/40'}
                            `}
                            >
                                {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                                Lưu
                            </button>
                        </form>
                    </div>
                    {errorMsg && <p className="text-red-400 text-xs mt-2 ml-1">{errorMsg}</p>}
                </div>
            )}

            {/* Leaderboard Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex-1 flex flex-col min-h-0">
                {/* Header */}
                <div className="grid grid-cols-12 bg-slate-950 p-4 font-bold text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800 shrink-0">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-5 md:col-span-6">Nhà Tư Duy</div>
                    <div className="col-span-3 text-right">Điểm Tư Duy</div>
                    <div className="col-span-3 md:col-span-2 text-right">Thời gian</div>
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-700">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-2">
                            <RefreshCw className="animate-spin text-blue-500" size={32} />
                            <p>Đang đồng bộ dữ liệu...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500 italic">
                            <p>Chưa có dữ liệu. Hãy là người đầu tiên!</p>
                        </div>
                    ) : (
                        data.map((entry, index) => {
                            const rank = index + 1;
                            let rankClass = "text-slate-500";
                            if (rank === 1) rankClass = "text-yellow-400 font-bold text-lg drop-shadow-sm";
                            if (rank === 2) rankClass = "text-slate-300 font-bold text-lg";
                            if (rank === 3) rankClass = "text-amber-700 font-bold text-lg";

                            const isCurrentUser = hasSaved && entry.username === username && entry.score === currentScore;

                            return (
                                <div
                                    key={entry.id}
                                    className={`
                                    grid grid-cols-12 p-4 border-b border-slate-800/50 items-center hover:bg-slate-800/40 transition-colors
                                    ${isCurrentUser ? 'bg-blue-900/20 border-l-2 border-l-blue-500' : ''}
                                `}
                                >
                                    <div className={`col-span-1 text-center font-mono ${rankClass}`}>
                                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                                    </div>
                                    <div className="col-span-5 md:col-span-6 font-medium text-slate-200 flex items-center gap-2 truncate pr-2">
                                        {entry.username}
                                        {isCurrentUser && <span className="text-[9px] bg-blue-600/20 text-blue-400 border border-blue-500/50 px-1.5 rounded uppercase">Bạn</span>}
                                    </div>
                                    <div className="col-span-3 text-right font-mono text-blue-400 font-bold">{entry.score.toLocaleString()}</div>
                                    <div className="col-span-3 md:col-span-2 text-right text-xs text-slate-600 font-mono">{formatTime(entry.created_at)}</div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Status */}
                <div className="bg-slate-950 p-2 text-center text-[10px] text-slate-600 border-t border-slate-900 shrink-0">
                    Kết nối an toàn tới Superbase Database • Hiển thị Top 20
                </div>
            </div>
        </div>
    );
};