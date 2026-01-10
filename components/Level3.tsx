import React, { useState, useEffect, useRef } from 'react';
import { LogEntry, CityStats } from '../types';
import { consultDialecticAdvisor, generateEventOutcome } from '../services/geminiService';
import { playSound } from '../services/soundService';
import {
    Hammer, BookOpen, AlertTriangle, Play, Pause, Zap, Scale, Building2, Landmark, Leaf,
    CircleHelp, X, Bot, Sparkles, Settings, Factory, Wheat, Users, GraduationCap, Cpu,
    Plus, Minus, Target, TreePine
} from 'lucide-react';

interface Level3Props {
    onComplete: (score: number) => void;
    addLog: (msg: string, type: LogEntry['type']) => void;
}

const INITIAL_STATS: CityStats = {
    material: 50,
    consciousness: 50,
    population: 100,
    stability: 100
};

// Resources for the game
interface Resources {
    steel: number;
    food: number;
    labor: number;
}

// Building types with names
type BuildingType = 'empty' | 'factory' | 'farm' | 'school' | 'tech';

interface Building {
    type: BuildingType;
    name: string;
    level: number;
}

interface GameEvent {
    id: string;
    title: string;
    description: string;
    options: { label: string, effect: () => void }[];
}

// Grid size
const GRID_SIZE = 4;

// Building names generator
const buildingNames = {
    factory: ['Nhà máy Thép', 'Xưởng Cơ khí', 'Khu Công nghiệp'],
    farm: ['Nông trang Tập thể', 'Hợp tác xã', 'Trang trại Nhân dân'],
    school: ['Trường Đảng', 'Viện Nghiên cứu', 'Đại học Nhân dân'],
    tech: ['Trung tâm Công nghệ', 'Phòng thí nghiệm', 'Viện Khoa học']
};

export const Level3: React.FC<Level3Props> = ({ onComplete, addLog }) => {
    const [stats, setStats] = useState<CityStats>(INITIAL_STATS);
    const [resources, setResources] = useState<Resources>({ steel: 150, food: 800, labor: 95 });
    const [isRunning, setIsRunning] = useState(false);
    const [turn, setTurn] = useState(0);
    const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [buildings, setBuildings] = useState<Building[]>(
        Array(GRID_SIZE * GRID_SIZE).fill(null).map(() => ({ type: 'empty' as BuildingType, name: '', level: 0 }))
    );
    const [showHelp, setShowHelp] = useState(false);
    const [dialecticError, setDialecticError] = useState<string | null>(null);
    const [selectedBuildType, setSelectedBuildType] = useState<BuildingType | null>(null);
    const [zoom, setZoom] = useState(1);

    // Refs
    const statsRef = useRef(stats);
    useEffect(() => { statsRef.current = stats; }, [stats]);
    const prevPopRef = useRef(stats.population);

    // Check for dialectic errors
    useEffect(() => {
        const ratio = stats.material / (stats.consciousness || 1);
        if (ratio > 2.5) {
            setDialecticError("Mục tiêu quá xa rời thực tế khách quan! Bạn phải phát triển cả sở vật chất trước khi nâng cao kiến trúc thượng tầng.");
        } else if (ratio < 0.4) {
            setDialecticError("Ý thức đang vượt trước vật chất quá nhiều! Không đủ tài nguyên để xây dựng theo kế hoạch.");
        } else {
            setDialecticError(null);
        }
    }, [stats.material, stats.consciousness]);

    // Monitor Population
    useEffect(() => {
        if (stats.population > prevPopRef.current && stats.population % 50 === 0) {
            addLog(`Dân số đạt ${stats.population.toLocaleString()} người.`, 'success');
        }
        prevPopRef.current = stats.population;
    }, [stats.population, addLog]);

    // Game Loop
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isRunning && !activeEvent && !aiAnalysis) {
            interval = setInterval(() => tick(), 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, activeEvent, aiAnalysis]);

    const tick = () => {
        setTurn(t => t + 1);

        // Update resources based on buildings
        const factoryCount = buildings.filter(b => b.type === 'factory').length;
        const farmCount = buildings.filter(b => b.type === 'farm').length;
        const schoolCount = buildings.filter(b => b.type === 'school').length;
        const techCount = buildings.filter(b => b.type === 'tech').length;

        setResources(prev => ({
            steel: Math.min(999, prev.steel + factoryCount * 10 - 5),
            food: Math.min(999, prev.food + farmCount * 15 - 10),
            labor: Math.min(100, Math.max(0, prev.labor + schoolCount * 2 - 1))
        }));

        setStats(prev => {
            const newStats = { ...prev };

            // Production logic
            newStats.material += (factoryCount * 2) + (techCount * 3) - (newStats.population * 0.05);
            newStats.consciousness += (schoolCount * 3) + (techCount * 2) - (factoryCount * 0.3);

            // Natural decay
            newStats.material = Math.max(0, newStats.material - 0.5);
            newStats.consciousness = Math.max(0, newStats.consciousness - 0.5);

            // Stability calculation
            const ratio = newStats.material / (newStats.consciousness || 1);
            let stabilityChange = 0;

            if (ratio > 3.0) stabilityChange = -3;
            else if (ratio < 0.33) stabilityChange = -3;
            else stabilityChange = 1;

            newStats.stability = Math.min(100, Math.max(0, newStats.stability + stabilityChange));

            // Population Growth
            if (newStats.stability > 60 && newStats.material > newStats.population * 0.5) {
                newStats.population += 5;
            }

            // Game Over / Win
            if (newStats.stability <= 0) {
                setIsRunning(false);
                addLog("Xã hội sụp đổ do mâu thuẫn không thể điều hòa!", 'error');
                playSound('error');
            }
            if (newStats.population >= 2000) {
                setIsRunning(false);
                onComplete(10000);
                addLog("Chiến thắng! Xã hội đạt tới trạng thái Cộng sản chủ nghĩa.", 'success');
            }

            return newStats;
        });

        // Random Event
        if (Math.random() < 0.03) triggerRandomEvent();
    };

    const triggerRandomEvent = () => {
        const events: GameEvent[] = [
            {
                id: 'crisis',
                title: 'Khủng Hoảng Thừa',
                description: 'Hàng hóa sản xuất quá nhiều nhưng người dân không đủ tiền mua.',
                options: [
                    { label: 'Tiêu hủy hàng hóa', effect: () => handleStatsChange(-30, 0, -10) },
                    { label: 'Phân phối lại', effect: () => handleStatsChange(-10, 20, 10) }
                ]
            },
            {
                id: 'ideology',
                title: 'Xung Đột Tư Tưởng',
                description: 'Một trào lưu triết học mới đang thách thức các giá trị truyền thống.',
                options: [
                    { label: 'Đàn áp tư tưởng', effect: () => handleStatsChange(0, -20, -15) },
                    { label: 'Mở tranh luận', effect: () => handleStatsChange(0, 30, 5) }
                ]
            }
        ];

        const randomEvent = events[Math.floor(Math.random() * events.length)];
        setActiveEvent(randomEvent);
        setIsRunning(false);
        playSound('alert');
    };

    const handleStatsChange = (m: number, c: number, s: number) => {
        setStats(prev => ({
            ...prev,
            material: Math.max(0, prev.material + m),
            consciousness: Math.max(0, prev.consciousness + c),
            stability: Math.min(100, Math.max(0, prev.stability + s))
        }));
    };

    const handleBuild = (type: BuildingType) => {
        // Find empty spot
        const emptyIdx = buildings.findIndex(b => b.type === 'empty');
        if (emptyIdx === -1) {
            addLog("Không còn chỗ trống để xây dựng!", 'error');
            return;
        }

        // Check resources
        const costs: Record<BuildingType, { steel: number, food: number }> = {
            factory: { steel: 50, food: 20 },
            farm: { steel: 20, food: 10 },
            school: { steel: 30, food: 30 },
            tech: { steel: 60, food: 40 },
            empty: { steel: 0, food: 0 }
        };

        if (resources.steel < costs[type].steel || resources.food < costs[type].food) {
            addLog("Không đủ tài nguyên!", 'error');
            playSound('error');
            return;
        }

        // Build
        const names = buildingNames[type as keyof typeof buildingNames];
        const name = names[Math.floor(Math.random() * names.length)] + ` số ${buildings.filter(b => b.type === type).length + 1}`;

        setBuildings(prev => {
            const newBuildings = [...prev];
            newBuildings[emptyIdx] = { type, name, level: 1 };
            return newBuildings;
        });

        setResources(prev => ({
            ...prev,
            steel: prev.steel - costs[type].steel,
            food: prev.food - costs[type].food
        }));

        // Stats effect
        if (type === 'factory') handleStatsChange(15, -5, -2);
        if (type === 'farm') handleStatsChange(10, 5, 2);
        if (type === 'school') handleStatsChange(-5, 20, 2);
        if (type === 'tech') handleStatsChange(10, 15, 5);

        addLog(`Đã xây dựng ${name}`, 'success');
        playSound('build');
        setSelectedBuildType(null);
    };

    const toggleHelp = () => {
        playSound('click');
        setShowHelp(!showHelp);
    };

    const closeAiModal = () => {
        setAiAnalysis(null);
        setIsRunning(true);
    };

    const handleEventChoice = (effect: () => void) => {
        effect();
        setActiveEvent(null);
        setIsRunning(true);
        playSound('click');
    };

    const getBuildingIcon = (type: BuildingType) => {
        switch (type) {
            case 'factory': return <Factory className="text-blue-400" />;
            case 'farm': return <Wheat className="text-green-400" />;
            case 'school': return <GraduationCap className="text-purple-400" />;
            case 'tech': return <Cpu className="text-cyan-400" />;
            default: return null;
        }
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 overflow-hidden relative">

            {/* ===== TOP BAR ===== */}
            <header className="h-14 bg-slate-900/90 backdrop-blur border-b border-slate-700/50 flex items-center justify-between px-4 z-30">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/30">
                        <Zap size={14} className="text-blue-400" />
                        <span className="text-xs font-bold text-slate-300">CẤP ĐỘ 3:</span>
                        <span className="text-xs font-bold text-blue-400 uppercase">Mô Phỏng Xã Hội Biện Chứng</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase">Học phần Duy vật Lịch sử</span>
                </div>

                {/* Resources */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1 rounded border border-slate-700/50">
                        <Factory size={14} className="text-blue-400" />
                        <span className="text-xs text-slate-400">THÉP</span>
                        <span className="text-sm font-mono font-bold text-white">{resources.steel} Tấn</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1 rounded border border-slate-700/50">
                        <Wheat size={14} className="text-amber-400" />
                        <span className="text-xs text-slate-400">LƯƠNG THỰC</span>
                        <span className="text-sm font-mono font-bold text-white">{resources.food} Tạ</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1 rounded border border-slate-700/50">
                        <Users size={14} className="text-green-400" />
                        <span className="text-xs text-slate-400">NHÂN LỰC</span>
                        <span className="text-sm font-mono font-bold text-white">{resources.labor}%</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <button onClick={toggleHelp} className="p-2 bg-slate-800 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all">
                        <Settings size={16} />
                    </button>
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={`p-2 rounded-lg border transition-all ${isRunning
                            ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400'
                            : 'bg-green-500/10 border-green-500/50 text-green-400 animate-pulse'}`}
                    >
                        {isRunning ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                </div>
            </header>

            {/* ===== MAIN CONTENT ===== */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* ===== ISOMETRIC MAP ===== */}
                <div className="flex-1 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #1a2e1a 0%, #0d1a0d 50%, #0a1510 100%)' }}>
                    {/* Grid Pattern Background */}
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(#2d5a2d 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                    </div>

                    {/* Isometric Grid */}
                    <div
                        className="absolute top-1/2 left-1/2 transition-transform duration-300"
                        style={{
                            transform: `translate(-50%, -50%) scale(${zoom}) perspective(1000px) rotateX(55deg) rotateZ(45deg)`,
                        }}
                    >
                        <div className="grid grid-cols-4 gap-3 p-6 bg-gradient-to-br from-slate-800/30 to-slate-900/50 rounded-xl border border-slate-700/30">
                            {buildings.map((building, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => building.type === 'empty' && selectedBuildType && handleBuild(selectedBuildType)}
                                    className={`
                    w-24 h-24 rounded-lg transition-all duration-300 relative group cursor-pointer
                    ${building.type === 'empty'
                                            ? 'bg-slate-800/30 hover:bg-slate-700/50 border-2 border-dashed border-slate-700 hover:border-slate-500'
                                            : 'bg-gradient-to-br from-slate-700/50 to-slate-800/70 border border-slate-600/50 shadow-xl'}
                  `}
                                >
                                    {building.type !== 'empty' && (
                                        <>
                                            {/* Building Icon */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-4xl transform -rotate-45">
                                                    {getBuildingIcon(building.type)}
                                                </div>
                                            </div>
                                            {/* Building Label */}
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform -rotate-45 whitespace-nowrap">
                                                <div className="bg-slate-900/90 backdrop-blur px-2 py-0.5 rounded text-[9px] text-white font-bold border border-slate-700 flex items-center gap-1">
                                                    {building.type === 'factory' && <Factory size={10} className="text-blue-400" />}
                                                    {building.type === 'farm' && <Wheat size={10} className="text-green-400" />}
                                                    {building.type === 'school' && <GraduationCap size={10} className="text-purple-400" />}
                                                    {building.type === 'tech' && <Cpu size={10} className="text-cyan-400" />}
                                                    {building.name}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {building.type === 'empty' && selectedBuildType && (
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                                            <Plus size={24} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trees decoration */}
                    <div className="absolute bottom-10 left-10 text-green-700 opacity-50">
                        <TreePine size={40} />
                    </div>
                    <div className="absolute bottom-20 left-20 text-green-600 opacity-40">
                        <TreePine size={30} />
                    </div>
                    <div className="absolute top-20 right-40 text-green-700 opacity-30">
                        <TreePine size={35} />
                    </div>

                    {/* Zoom Controls */}
                    <div className="absolute right-4 bottom-32 flex flex-col gap-1 z-20">
                        <button
                            onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
                            className="w-8 h-8 bg-slate-900/90 border border-slate-700 rounded text-slate-400 hover:text-white hover:border-slate-500 flex items-center justify-center transition-all"
                        >
                            <Plus size={16} />
                        </button>
                        <button
                            onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                            className="w-8 h-8 bg-slate-900/90 border border-slate-700 rounded text-slate-400 hover:text-white hover:border-slate-500 flex items-center justify-center transition-all"
                        >
                            <Minus size={16} />
                        </button>
                        <button
                            onClick={() => setZoom(1)}
                            className="w-8 h-8 bg-slate-900/90 border border-slate-700 rounded text-slate-400 hover:text-white hover:border-slate-500 flex items-center justify-center transition-all"
                        >
                            <Target size={16} />
                        </button>
                    </div>
                </div>

                {/* ===== SIDE PANEL ===== */}
                {dialecticError && (
                    <div className="absolute top-4 right-4 w-80 bg-slate-900/95 backdrop-blur border border-red-500/50 rounded-lg p-4 z-20 shadow-2xl">
                        <div className="flex items-center gap-2 text-red-400 mb-2">
                            <AlertTriangle size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Lỗi Biện Chứng</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-2">Mục tiêu quá xa rời thực tế khách quan!</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{dialecticError}</p>

                        {/* Preview placeholder */}
                        <div className="mt-4 bg-slate-800/50 rounded p-2 border border-slate-700">
                            <div className="w-full h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded flex items-center justify-center">
                                <Building2 size={32} className="text-slate-500" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ===== BOTTOM BAR ===== */}
            <div className="h-28 bg-slate-900/95 backdrop-blur border-t border-slate-700/50 flex items-center px-6 gap-6 z-30">

                {/* Left: Material Progress */}
                <div className="w-56">
                    <div className="flex items-center gap-2 mb-2">
                        <Hammer size={14} className="text-blue-400" />
                        <span className="text-xs font-bold text-slate-400 uppercase">Điều kiện Vật chất</span>
                        <span className="text-sm font-mono font-bold text-blue-400">{Math.floor(stats.material)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, stats.material)}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1">Năng lực sản xuất giới hạn sự mở rộng tư tưởng.</p>
                </div>

                {/* Center: Build Actions */}
                <div className="flex-1 flex items-center justify-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold mr-2">Hoạt động Xây dựng</span>

                    {[
                        { type: 'farm' as BuildingType, icon: <Wheat size={20} />, label: 'NÔNG NGHIỆP', color: 'green' },
                        { type: 'factory' as BuildingType, icon: <Factory size={20} />, label: 'NHÀ MÁY', color: 'blue' },
                        { type: 'school' as BuildingType, icon: <GraduationCap size={20} />, label: 'TRƯỜNG HỌC', color: 'purple' },
                        { type: 'tech' as BuildingType, icon: <Cpu size={20} />, label: 'CÔNG NGHỆ', color: 'cyan' },
                    ].map(item => (
                        <button
                            key={item.type}
                            onClick={() => setSelectedBuildType(selectedBuildType === item.type ? null : item.type)}
                            disabled={!isRunning}
                            className={`
                flex flex-col items-center gap-1 px-4 py-2 rounded-lg border transition-all
                ${selectedBuildType === item.type
                                    ? `bg-${item.color}-500/20 border-${item.color}-500 text-${item.color}-400`
                                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'}
                ${!isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
                        >
                            {item.icon}
                            <span className="text-[9px] font-bold uppercase">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Right: Consciousness Progress */}
                <div className="w-56 text-right">
                    <div className="flex items-center justify-end gap-2 mb-2">
                        <BookOpen size={14} className="text-purple-400" />
                        <span className="text-xs font-bold text-slate-400 uppercase">Mục tiêu Ý thức</span>
                        <span className="text-sm font-mono font-bold text-purple-400">{Math.floor(stats.consciousness)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500 ml-auto"
                            style={{ width: `${Math.min(100, stats.consciousness)}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1">Tham vọng vượt quá thực tế vật chất.</p>
                </div>
            </div>

            {/* ===== MODALS ===== */}

            {/* Help Modal */}
            {showHelp && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-blue-500 rounded-lg max-w-md w-full p-6 shadow-2xl relative">
                        <button onClick={toggleHelp} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                        <h3 className="text-xl font-display text-blue-400 mb-4 uppercase tracking-wider border-b border-slate-800 pb-2">Hướng dẫn</h3>
                        <div className="space-y-3 text-sm text-slate-300">
                            <p><strong className="text-white">🎯 Mục tiêu:</strong> Đạt 2000 dân số để tiến tới Cộng sản chủ nghĩa.</p>
                            <p><strong className="text-white">🏗️ Xây dựng:</strong> Chọn loại công trình ở thanh dưới, sau đó click vào ô trống.</p>
                            <p><strong className="text-white">⚖️ Cân bằng:</strong> Giữ tỷ lệ Vật chất/Ý thức hợp lý để tránh sụp đổ.</p>
                        </div>
                        <button onClick={toggleHelp} className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded">
                            BẮT ĐẦU
                        </button>
                    </div>
                </div>
            )}

            {/* Event Modal */}
            {activeEvent && (
                <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-slate-900 border-2 border-red-500 rounded-xl max-w-lg w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4 text-red-500">
                            <AlertTriangle size={32} />
                            <h3 className="text-2xl font-display font-bold uppercase">{activeEvent.title}</h3>
                        </div>
                        <p className="text-slate-300 mb-6">{activeEvent.description}</p>
                        <div className="grid gap-3">
                            {activeEvent.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleEventChoice(opt.effect)}
                                    className="w-full text-left p-4 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-blue-500 transition-all"
                                >
                                    <span className="font-bold text-blue-400">Phương án {String.fromCharCode(65 + idx)}:</span>
                                    <span className="text-slate-200 ml-2">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* AI Analysis Modal */}
            {aiAnalysis && (
                <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
                    <div className="bg-slate-900/90 border-2 border-purple-500 rounded-xl max-w-lg w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
                            <Bot size={28} className="text-purple-400" />
                            <div>
                                <h3 className="text-xl font-bold text-white uppercase flex items-center gap-2">
                                    Phân Tích Chiến Lược <Sparkles size={14} className="text-yellow-400" />
                                </h3>
                                <p className="text-xs text-purple-400 font-mono">Neural Core v3.0</p>
                            </div>
                        </div>
                        <p className="text-slate-200 leading-relaxed border-l-2 border-purple-500 pl-4 italic mb-6">
                            "{aiAnalysis}"
                        </p>
                        <button
                            onClick={closeAiModal}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg"
                        >
                            Tiếp nhận thông tin
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};