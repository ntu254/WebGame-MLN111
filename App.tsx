import React, { useState } from 'react';
import { GameView, UserState, LogEntry } from './types';
import { Level1 } from './components/Level1';
import { Level2 } from './components/Level2';
import { Level3 } from './components/Level3';
import { Leaderboard } from './components/Leaderboard';
import { LayoutGrid, Network, Map, Trophy, User, Search, Settings, ShieldAlert, Home as HomeIcon } from 'lucide-react';
import { Home } from './components/Home';
import { searchPhilosophicalConceptWithFallback as searchPhilosophicalConcept } from './services/aiService';
import { playSound } from './services/soundService';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
    const [currentView, setCurrentView] = useState<GameView>(GameView.MENU);
    const [userState, setUserState] = useState<UserState>({
        score: 0,
        level1Complete: false,
        level2Complete: false,
        level3Complete: false,
        username: 'Đồng chí Sinh viên',
    });
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [activeToasts, setActiveToasts] = useState<LogEntry[]>([]); // Toasts tự ẩn
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState('');
    const [settingsOpen, setSettingsOpen] = useState(false);

    const addLog = (message: string, type: LogEntry['type']) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
        const entry: LogEntry = {
            id,
            timestamp: new Date().toLocaleTimeString('vi-VN'),
            message,
            type
        };

        // 1. Lưu vào lịch sử (Level 1 dùng cái này)
        setLogs(prev => [entry, ...prev].slice(0, 50));

        // 2. Hiện thông báo nổi (Level 2, 3 dùng cái này)
        setActiveToasts(prev => [entry, ...prev].slice(0, 5));

        // 3. Tự động ẩn sau 3 giây
        setTimeout(() => {
            setActiveToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const handleLevelComplete = (level: number, scoreToAdd: number) => {
        playSound('levelComplete');
        setUserState(prev => ({
            ...prev,
            score: prev.score + scoreToAdd,
            level1Complete: level === 1 ? true : prev.level1Complete,
            level2Complete: level === 2 ? true : prev.level2Complete,
            level3Complete: level === 3 ? true : prev.level3Complete,
        }));
        addLog(`Cấp độ ${level} hoàn thành. +${scoreToAdd} XP`, 'success');
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;
        setSearchResult('Đang tra cứu dữ liệu...');
        const result = await searchPhilosophicalConcept(searchQuery);
        setSearchResult(result);
    }

    const renderContent = () => {
        switch (currentView) {
            case GameView.MENU:
                return <Home onStart={(level) => setCurrentView(level === 1 ? GameView.LEVEL_1 : level === 2 ? GameView.LEVEL_2 : GameView.LEVEL_3)} />;
            case GameView.LEVEL_1:
                return <Level1 onComplete={(s) => handleLevelComplete(1, s)} addLog={addLog} logs={logs} />;
            case GameView.LEVEL_2:
                return <Level2 onComplete={(s) => handleLevelComplete(2, s)} addLog={addLog} />;
            case GameView.LEVEL_3:
                return <Level3 onComplete={(s) => handleLevelComplete(3, s)} addLog={addLog} />;
            case GameView.LEADERBOARD:
                return <Leaderboard currentScore={userState.score} />;
            default:
                return <div className="text-center mt-20">Chọn một cấp độ để bắt đầu</div>;
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
            {/* Top Navigation Bar */}
            <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setCurrentView(GameView.MENU)}>
                    <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                        <LayoutGrid className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-white text-lg tracking-wide">CỖ MÁY BIỆN CHỨNG <span className="text-xs text-blue-400 font-mono">v1.0</span></h1>
                        <div className="flex items-center gap-2 text-[10px] uppercase text-slate-500 font-bold tracking-widest">
                            Trạng thái: <span className="text-green-400">Trực tuyến</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex gap-1 bg-slate-800 p-1 rounded-lg">
                        <button
                            onClick={() => setCurrentView(GameView.LEVEL_1)}
                            className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 ${currentView === GameView.LEVEL_1 ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            <LayoutGrid size={14} /> Vật Chất
                        </button>
                        <button
                            onClick={() => setCurrentView(GameView.LEVEL_2)}
                            className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 ${currentView === GameView.LEVEL_2 ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Network size={14} /> Ý Thức
                        </button>
                        <button
                            onClick={() => setCurrentView(GameView.LEVEL_3)}
                            className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 ${currentView === GameView.LEVEL_3 ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Map size={14} /> Biện Chứng
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={() => setSearchOpen(true)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors" title="Tra cứu">
                            <Search size={20} />
                        </button>
                        <button onClick={() => setSettingsOpen(true)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors" title="Cài đặt API Key">
                            <Settings size={20} />
                        </button>
                        <button onClick={() => setCurrentView(GameView.LEADERBOARD)} className="flex items-center gap-2 bg-gradient-to-r from-yellow-600/20 to-yellow-900/20 border border-yellow-700/50 rounded-full px-4 py-1.5 text-yellow-500 hover:border-yellow-500 transition-all">
                            <Trophy size={14} />
                            <span className="font-mono font-bold text-sm">{userState.score.toLocaleString()} XP</span>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                            <User size={20} className="text-slate-400" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative">
                {renderContent()}
            </main>

            {/* Footer / Status Bar */}
            <footer className="h-8 bg-slate-950 border-t border-slate-900 flex items-center justify-between px-4 text-[10px] text-slate-600 font-mono uppercase">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1"><Settings size={10} /> Hệ thống sẵn sàng</span>
                    <span className="flex items-center gap-1"><ShieldAlert size={10} /> Bảo mật cấp 3</span>
                </div>
                <div>
                    Powered by React & OpenRouter AI
                </div>
            </footer>

            {/* Global Logs Overlay - Auto hides after 3s */}
            {currentView !== GameView.LEVEL_1 && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 w-96 pointer-events-none z-50 flex flex-col items-center gap-2">
                    {activeToasts.map((log) => (
                        <div
                            key={log.id}
                            className={`
                        pointer-events-auto bg-slate-900/95 backdrop-blur border-l-4 p-3 rounded shadow-2xl text-xs w-full 
                        animate-in slide-in-from-top-4 fade-in duration-300
                        ${log.type === 'error' ? 'border-red-500 text-red-200' :
                                    log.type === 'success' ? 'border-green-500 text-green-200' :
                                        log.type === 'ai' ? 'border-purple-500 text-purple-200' : 'border-blue-500 text-slate-300'}
                    `}
                        >
                            <div className="flex justify-between items-start">
                                <span>{log.message}</span>
                            </div>
                            {/* Progress bar to show time left (Visual flair) */}
                            <div className="w-full h-0.5 bg-white/10 mt-2 rounded-full overflow-hidden">
                                <div className="h-full bg-white/50 animate-[width_3s_linear_forwards] w-full origin-left" style={{ animationDuration: '3s' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Search Modal */}
            {searchOpen && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-start justify-center pt-20">
                    <div className="bg-slate-900 w-full max-w-lg rounded-xl shadow-2xl border border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                            <Search className="text-slate-400" />
                            <form onSubmit={handleSearch} className="flex-1">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Tra cứu khái niệm triết học (VD: Duy vật là gì?)..."
                                    className="w-full bg-transparent border-none outline-none text-white placeholder-slate-600"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </form>
                            <button onClick={() => setSearchOpen(false)} className="text-xs text-slate-500 hover:text-white uppercase font-bold">ESC</button>
                        </div>
                        {searchResult && (
                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                <h4 className="text-blue-400 text-sm font-bold uppercase mb-2">Kết quả từ Cỗ Máy</h4>
                                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">{searchResult}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
    );
}