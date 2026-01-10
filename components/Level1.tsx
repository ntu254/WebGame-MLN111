import React, { useState, useEffect, useRef } from 'react';
import { MatterEntity, LogEntry } from '../types';
import { checkClassificationWithAI } from '../services/geminiService';
import { playSound } from '../services/soundService';
import { MoveRight, Atom, Brain, Zap, Radio, CircleHelp, Info, X, Trophy, BarChart3, CheckCircle } from 'lucide-react';

interface Level1Props {
    onComplete: (score: number) => void;
    addLog: (msg: string, type: LogEntry['type']) => void;
    logs: LogEntry[];
}

const INITIAL_ENTITIES: MatterEntity[] = [
    { id: '1', name: 'Sóng âm', type: 'material', description: 'Dao động cơ học của môi trường', category: 'Vật lý' },
    { id: '2', name: 'Ảo giác', type: 'consciousness', description: 'Tri giác sai lệch không có đối tượng', category: 'Tâm trí' },
    { id: '3', name: 'Điện tử', type: 'material', description: 'Hạt hạ nguyên tử mang điện tích', category: 'Vật lý' },
    { id: '4', name: 'Suy nghĩ', type: 'consciousness', description: 'Hoạt động của bộ não', category: 'Trừu tượng' },
    { id: '5', name: 'Nguyên tử', type: 'material', description: 'Đơn vị cơ bản của vật chất', category: 'Vật chất' },
    { id: '6', name: 'Giấc mơ', type: 'consciousness', description: 'Trải nghiệm trong khi ngủ', category: 'Tâm trí' },
];

export const Level1: React.FC<Level1Props> = ({ onComplete, addLog, logs }) => {
    const [entities, setEntities] = useState<MatterEntity[]>(INITIAL_ENTITIES);
    const [draggedItem, setDraggedItem] = useState<MatterEntity | null>(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [syncRate, setSyncRate] = useState(50);
    const [showHelp, setShowHelp] = useState(false);
    const [successAnim, setSuccessAnim] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [classificationHistory, setClassificationHistory] = useState<{
        name: string;
        type: 'material' | 'consciousness';
        description: string;
        wasCorrect: boolean;
    }[]>([]);
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logs.length === 0) {
            addLog("Hệ thống đã khởi tạo. Vòng xoáy đã hiệu chỉnh 400rpm.", 'info');
            // Show help automatically on first load
            setTimeout(() => setShowHelp(true), 500);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-scroll to bottom of logs
    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    const toggleHelp = () => {
        playSound('click');
        setShowHelp(!showHelp);
    };

    const handleDragStart = (entity: MatterEntity) => {
        setDraggedItem(entity);
        playSound('click');
    };

    const handleDrop = async (targetType: 'material') => {
        if (!draggedItem) return;

        const isCorrect = draggedItem.type === targetType;

        if (isCorrect) {
            playSound('success');
            setScore(s => s + 100 + (streak * 10));
            setStreak(s => s + 1);
            setSyncRate(prev => Math.min(100, prev + 5));
            addLog(`'${draggedItem.name}' được phân loại đúng là Vật chất.`, 'success');

            // Save to history
            setClassificationHistory(prev => [...prev, {
                name: draggedItem.name,
                type: draggedItem.type,
                description: draggedItem.description,
                wasCorrect: true
            }]);

            setEntities(prev => prev.filter(e => e.id !== draggedItem.id));

            // Trigger Success Animation
            setSuccessAnim(true);
            setTimeout(() => setSuccessAnim(false), 500);

        } else {
            playSound('error');
            setStreak(0);
            setSyncRate(prev => Math.max(0, prev - 10));
            addLog(`CẢNH BÁO: '${draggedItem.name}' bị từ chối. Lỗi: Chủ nghĩa Duy tâm.`, 'error');

            // AI Feedback
            const feedback = await checkClassificationWithAI(draggedItem.name, 'Vật chất');
            addLog(`AI Phân tích: ${feedback}`, 'ai');
        }

        setDraggedItem(null);

        // Check if all material entities are classified
        const remainingMaterial = entities.filter(e => e.type === 'material').length;
        if (remainingMaterial <= 1 && isCorrect) {
            setTimeout(() => setShowSummary(true), 1000);
        }
    };

    const handleClickEntity = (entity: MatterEntity) => {
        setDraggedItem(entity);
        playSound('click');
    };

    const getIcon = (category: string) => {
        switch (category) {
            case 'Vật lý': return <Zap size={16} />;
            case 'Tâm trí': return <Brain size={16} />;
            case 'Vật chất': return <Atom size={16} />;
            case 'Trừu tượng': return <Radio size={16} />;
            default: return <CircleHelp size={16} />;
        }
    };

    return (
        <div className="relative grid grid-cols-1 lg:grid-cols-4 gap-6 h-full p-6">

            {/* Help Button */}
            <button
                onClick={toggleHelp}
                className="absolute top-6 right-6 z-20 p-2 bg-slate-800 border border-slate-600 rounded-full text-slate-400 hover:text-white hover:border-blue-500 transition-all"
                title="Hướng dẫn"
            >
                <CircleHelp size={20} />
            </button>

            {/* Help Modal */}
            {showHelp && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-blue-500 rounded-lg max-w-md w-full p-6 shadow-2xl relative">
                        <button onClick={toggleHelp} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                        <h3 className="text-xl font-display text-blue-400 mb-4 uppercase tracking-wider border-b border-slate-800 pb-2">Giao thức Phân loại</h3>
                        <div className="space-y-4 text-sm text-slate-300">
                            <div>
                                <strong className="text-white block mb-1">🎯 Nhiệm vụ:</strong>
                                <p>Xác định các thực thể thuộc phạm trù <span className="text-blue-400 font-bold">VẬT CHẤT</span>.</p>
                            </div>
                            <div>
                                <strong className="text-white block mb-1">🎮 Cách chơi:</strong>
                                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                                    <li>Kéo thẻ từ danh sách bên trái.</li>
                                    <li>Thả vào <span className="text-blue-400">Vòng Xoáy</span> nếu đó là Vật chất.</li>
                                    <li>Nếu là Ý thức/Tinh thần, đừng thả vào vòng xoáy (sẽ bị lỗi hệ thống).</li>
                                </ul>
                            </div>
                            <div className="bg-blue-900/20 p-3 rounded border border-blue-900/50 text-xs italic">
                                "Vật chất là thực tại khách quan mang lại cho con người trong cảm giác..." - V.I.Lênin
                            </div>
                        </div>
                        <button
                            onClick={toggleHelp}
                            className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded transition-colors"
                        >
                            ĐÃ HIỂU
                        </button>
                    </div>
                </div>
            )}

            {/* Left Panel: Entities */}
            <div className="col-span-1 bg-slate-900/80 border border-slate-700 rounded-lg p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <h3 className="text-blue-400 font-display text-sm tracking-wider">THỰC THỂ CHƯA PHÂN LOẠI</h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">Kéo các mục vào vòng xoáy để phân loại.</p>

                <div className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] pr-2">
                    {entities.map(entity => (
                        <div
                            key={entity.id}
                            draggable
                            onDragStart={() => handleDragStart(entity)}
                            onClick={() => handleClickEntity(entity)}
                            className={`
                        group p-4 rounded bg-slate-800 border cursor-pointer transition-all hover:bg-slate-700
                        ${draggedItem?.id === entity.id ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-900/20' : 'border-slate-600'}
                    `}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-900 rounded text-cyan-400">
                                        {getIcon(entity.category)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-200">{entity.name}</h4>
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500">{entity.category}</span>
                                    </div>
                                </div>
                                <MoveRight size={16} className="text-slate-600 group-hover:text-blue-400" />
                            </div>
                        </div>
                    ))}
                    {entities.length === 0 && (
                        <div className="text-center text-slate-500 py-10">
                            <p>Không còn dữ liệu.</p>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-700">
                    <div className="flex items-start gap-2 text-xs text-slate-400">
                        <Info size={14} className="mt-0.5 shrink-0" />
                        <p>Mẹo: Theo Lênin, vật chất là thực tại khách quan tồn tại bên ngoài cảm giác.</p>
                    </div>
                </div>
            </div>

            {/* Center: Vortex */}
            <div className="col-span-1 lg:col-span-2 relative flex flex-col items-center justify-center min-h-[400px] bg-slate-950/50 rounded-lg border border-slate-800/50 overflow-hidden">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                </div>

                <h2 className="absolute top-8 font-display text-2xl text-slate-300 tracking-[0.2em] uppercase text-center w-full">Vòng Xoáy Vật Chất</h2>
                <p className="absolute top-16 text-blue-500/60 text-xs font-mono animate-pulse">[ ĐANG CHỜ TÍN HIỆU ]</p>

                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop('material')}
                    onClick={() => draggedItem && handleDrop('material')}
                    className={`
                relative w-64 h-64 rounded-full border border-blue-500/30 flex items-center justify-center
                transition-all duration-300
                ${draggedItem && !successAnim ? 'scale-110 border-blue-400 shadow-[0_0_50px_rgba(59,130,246,0.3)]' : ''}
                ${successAnim ? 'scale-110 border-cyan-300 shadow-[0_0_100px_rgba(34,211,238,0.6)] bg-cyan-900/10' : ''}
            `}
                >
                    {/* Vortex Animation */}
                    <div className="absolute inset-0 rounded-full border-t-2 border-l-2 border-blue-500/20 vortex-spin w-full h-full" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute inset-4 rounded-full border-b-2 border-r-2 border-cyan-500/20 vortex-spin w-[calc(100%-2rem)] h-[calc(100%-2rem)]" style={{ animationDuration: '5s', animationDirection: 'reverse' }}></div>

                    <div className="z-10 text-center pointer-events-none">
                        {draggedItem ? (
                            <span className="text-blue-300 font-bold animate-pulse">THẢ VÀO ĐÂY</span>
                        ) : successAnim ? (
                            <span className="text-cyan-300 font-bold animate-bounce tracking-widest text-lg">CHẤP NHẬN</span>
                        ) : (
                            <div className="w-16 h-8 border-2 border-blue-500/50 rounded flex items-center justify-center mx-auto">
                                <span className="text-2xl text-blue-500">∞</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="absolute bottom-8 font-mono text-xs text-slate-500 tracking-widest uppercase">
                    Phân loại: Có phải là vật chất?
                </div>
            </div>

            {/* Right Panel: Stats */}
            <div className="col-span-1 flex flex-col gap-4 h-full min-h-0">
                {/* Objectives Panel */}
                <div className="bg-slate-900/80 border border-cyan-500/50 rounded-lg p-4 shrink-0">
                    <h4 className="text-sm font-bold text-cyan-400 mb-3 flex items-center gap-2">
                        🎯 Điều kiện qua màn
                    </h4>
                    <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Phân loại đúng VẬT CHẤT</span>
                            <span className="text-white font-mono">
                                {INITIAL_ENTITIES.filter(e => e.type === 'material').length - entities.filter(e => e.type === 'material').length}
                                /{INITIAL_ENTITIES.filter(e => e.type === 'material').length}
                            </span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-300"
                                style={{
                                    width: `${((INITIAL_ENTITIES.filter(e => e.type === 'material').length - entities.filter(e => e.type === 'material').length) / INITIAL_ENTITIES.filter(e => e.type === 'material').length) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex gap-1">
                        {INITIAL_ENTITIES.filter(e => e.type === 'material').map((item, idx) => {
                            const isCompleted = !entities.find(e => e.id === item.id);
                            return (
                                <div
                                    key={item.id}
                                    className={`flex-1 text-center py-1 rounded text-[9px] ${isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}
                                    title={item.name}
                                >
                                    {isCompleted ? '✓' : (idx + 1)}
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">Kéo thẻ VẬT CHẤT vào vòng xoáy</p>
                </div>

                <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4 shrink-0">
                    <div className="flex justify-between items-end mb-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase">Độ Đồng Bộ Biện Chứng</h4>
                        <span className="text-blue-400 font-mono font-bold">{syncRate}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${syncRate}%` }}></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 shrink-0">
                    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4">
                        <span className="text-[10px] text-slate-500 uppercase block mb-1">Độ chính xác</span>
                        <div className="flex items-end gap-1">
                            <span className="text-2xl font-display font-bold text-white">{(streak > 0 ? 100 : 0)}%</span>
                            {streak > 1 && <span className="text-[10px] text-green-400 mb-1">+{streak * 5}%</span>}
                        </div>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4">
                        <span className="text-[10px] text-slate-500 uppercase block mb-1">Chuỗi đúng</span>
                        <div className="flex items-end gap-1">
                            <span className="text-2xl font-display font-bold text-white">{streak}</span>
                            <span className="text-[10px] text-blue-400 mb-1">TỐI ĐA</span>
                        </div>
                    </div>
                </div>

                {/* SYSTEM LOGS PANEL */}
                <div className="flex-1 bg-black/40 border border-slate-800 rounded-lg p-4 font-mono text-xs flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-2 text-slate-500 border-b border-slate-800 pb-1 shrink-0">
                        <span className="font-bold tracking-wider text-blue-500/80">NHẬT KÝ HỆ THỐNG</span>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700 min-h-0">
                        {logs.length === 0 && <p className="text-slate-600 italic">Đang chờ dữ liệu...</p>}
                        {[...logs].reverse().map((log) => (
                            <div key={log.id} className="border-l-2 border-slate-700 pl-2 py-0.5 animate-in fade-in duration-300">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[9px] text-slate-500">{log.timestamp}</span>
                                    <span className={`text-[9px] font-bold px-1 rounded 
                                    ${log.type === 'error' ? 'bg-red-900/30 text-red-400' :
                                            log.type === 'success' ? 'bg-green-900/30 text-green-400' :
                                                log.type === 'ai' ? 'bg-purple-900/30 text-purple-400' : 'bg-blue-900/30 text-blue-400'}`}>
                                        {log.type.toUpperCase()}
                                    </span>
                                </div>
                                <p className={`leading-relaxed break-words 
                                ${log.type === 'error' ? 'text-red-300' :
                                        log.type === 'success' ? 'text-green-300' :
                                            log.type === 'ai' ? 'text-purple-200 italic' : 'text-slate-300'}`}>
                                    {log.message}
                                </p>
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </div>
            </div>


            {/* Summary Modal */}
            {
                showSummary && (
                    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-auto">
                        <div className="bg-slate-900 border border-green-500 rounded-xl p-6 max-w-2xl w-full shadow-2xl relative my-8">
                            <button onClick={() => { setShowSummary(false); onComplete(score); }} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>

                            {/* Header */}
                            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-700">
                                <div className="p-3 bg-green-500/20 rounded-full">
                                    <Trophy size={32} className="text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-green-400">🎉 Hoàn thành Phân loại!</h3>
                                    <p className="text-slate-400">Bạn đã phân loại đúng tất cả các thực thể vật chất</p>
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-slate-800 p-4 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-cyan-400">{classificationHistory.length}</div>
                                    <div className="text-xs text-slate-400">Đã phân loại</div>
                                </div>
                                <div className="bg-slate-800 p-4 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-green-400">{syncRate}%</div>
                                    <div className="text-xs text-slate-400">Độ đồng bộ</div>
                                </div>
                                <div className="bg-slate-800 p-4 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-yellow-400">{score}</div>
                                    <div className="text-xs text-slate-400">Điểm số</div>
                                </div>
                            </div>

                            {/* Classification Review */}
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                    <BarChart3 size={16} /> Kết quả phân loại
                                </h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                    {classificationHistory.map((item, idx) => (
                                        <div key={idx} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex items-center gap-3">
                                            <CheckCircle size={16} className="text-green-400 shrink-0" />
                                            <div className="flex-1">
                                                <span className="text-white font-bold">{item.name}</span>
                                                <span className="text-xs text-slate-500 ml-2">({item.description})</span>
                                            </div>
                                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">VẬT CHẤT</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Explanation */}
                            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/50 mb-6">
                                <h4 className="text-sm font-bold text-blue-400 mb-3">📚 Giải thích phân loại:</h4>
                                <div className="space-y-3 text-xs">
                                    <div className="flex gap-3">
                                        <div className="w-20 shrink-0 text-blue-400 font-bold">VẬT CHẤT</div>
                                        <div className="text-slate-300">
                                            <p className="mb-1">Là thực tại khách quan, tồn tại bên ngoài và độc lập với ý thức:</p>
                                            <ul className="text-slate-400 space-y-0.5">
                                                <li>• <strong>Sóng âm</strong>: Dao động vật lý của môi trường</li>
                                                <li>• <strong>Điện tử</strong>: Hạt hạ nguyên tử tồn tại khách quan</li>
                                                <li>• <strong>Nguyên tử</strong>: Đơn vị cơ bản cấu tạo vật chất</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 border-t border-slate-700 pt-3">
                                        <div className="w-20 shrink-0 text-purple-400 font-bold">Ý THỨC</div>
                                        <div className="text-slate-300">
                                            <p className="mb-1">Là sự phản ánh thế giới khách quan vào bộ não:</p>
                                            <ul className="text-slate-400 space-y-0.5">
                                                <li>• <strong>Ảo giác</strong>: Tri giác không có đối tượng thực</li>
                                                <li>• <strong>Suy nghĩ</strong>: Hoạt động của bộ não</li>
                                                <li>• <strong>Giấc mơ</strong>: Trải nghiệm chủ quan khi ngủ</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quote */}
                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 mb-6">
                                <p className="text-xs text-slate-400 italic text-center">
                                    "Vật chất là thực tại khách quan được đem lại cho con người trong cảm giác, được cảm giác của chúng ta chép lại, chụp lại, phản ánh và tồn tại không lệ thuộc vào cảm giác."
                                    <span className="text-blue-400 block mt-1">— V.I. Lênin</span>
                                </p>
                            </div>

                            <button
                                onClick={() => { setShowSummary(false); onComplete(score); }}
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-colors text-lg"
                            >
                                Tiếp tục → Cấp độ 2
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};