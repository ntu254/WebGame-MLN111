import React, { useState, useEffect, useRef } from 'react';
import { LogEntry, CityStats } from '../types';
import { consultDialecticAdvisor, generateEventOutcome } from '../services/geminiService';
import { playSound } from '../services/soundService';
import {
    Hammer, BookOpen, AlertTriangle, Play, Pause, Zap, Scale, Building2, Landmark, Leaf,
    CircleHelp, X, Bot, Sparkles, Settings, Factory, Wheat, Users, GraduationCap, Cpu,
    Plus, Minus, Target, TreePine, RotateCcw, Trophy, Skull, TrendingUp, ArrowRight
} from 'lucide-react';

interface Level3Props {
    onComplete: (score: number) => void;
    addLog: (msg: string, type: LogEntry['type']) => void;
}

const INITIAL_STATS: CityStats = {
    material: 30,
    consciousness: 30,
    population: 50,
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
    const [resources, setResources] = useState<Resources>({ steel: 100, food: 200, labor: 50 });
    const [isRunning, setIsRunning] = useState(false);
    const [turn, setTurn] = useState(0);
    const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [buildings, setBuildings] = useState<Building[]>(
        Array(GRID_SIZE * GRID_SIZE).fill(null).map(() => ({ type: 'empty' as BuildingType, name: '', level: 0 }))
    );
    const [showHelp, setShowHelp] = useState(true); // Show help on first load
    const [showSummary, setShowSummary] = useState(false); // Mobile summary panel toggle
    const [completionMessage, setCompletionMessage] = useState<string | null>(null);
    const [dialecticError, setDialecticError] = useState<string | null>(null);
    const [selectedBuildType, setSelectedBuildType] = useState<BuildingType | null>(null);
    const [zoom, setZoom] = useState(1);

    // Calculate production rates for display
    const factoryCount = buildings.filter(b => b.type === 'factory').length;
    const farmCount = buildings.filter(b => b.type === 'farm').length;
    const schoolCount = buildings.filter(b => b.type === 'school').length;
    const techCount = buildings.filter(b => b.type === 'tech').length;

    const steelRate = factoryCount * 8;
    const foodRate = farmCount * 10 - Math.floor(stats.population / 50);
    const laborRate = schoolCount * 3;
    const popRate = (farmCount > 0) ? farmCount * 2 : 0;

    const consumptionRate = 1 + Math.floor(stats.population / 25);
    const materialNetRate = (factoryCount * 2 + techCount * 1) - consumptionRate;

    let consConsumptionRate = 0.5 + Math.floor(stats.population / 40);
    if (stats.material < 30) consConsumptionRate += 2;
    const consNetRate = (schoolCount * 2 + techCount * 2) - consConsumptionRate;

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
    }, [isRunning, activeEvent, aiAnalysis, buildings, stats.population, resources.food]);

    const tick = () => {
        setTurn(t => t + 1);

        // Count buildings
        const factories = buildings.filter(b => b.type === 'factory').length;
        const farms = buildings.filter(b => b.type === 'farm').length;
        const schools = buildings.filter(b => b.type === 'school').length;
        const techs = buildings.filter(b => b.type === 'tech').length;

        // Update resources (simple logic)
        setResources(r => {
            const foodConsumption = Math.floor(stats.population / 50);
            return {
                steel: Math.min(999, r.steel + factories * 8),
                food: Math.min(999, Math.max(0, r.food + farms * 10 - foodConsumption)),
                labor: Math.min(100, r.labor + schools * 3)
            };
        });

        // Update stats (simple logic)
        setStats(prev => {
            const newStats = { ...prev };

            // Material from factories and tech - MINUS CONSUMPTION (Reproduction cost)
            const consumption = 1 + Math.floor(newStats.population / 25); // Base 1 + 1 per 25 pop
            const materialProduction = factories * 2 + techs * 1;
            const netMaterialChange = materialProduction - consumption;

            newStats.material = Math.max(0, Math.min(100, newStats.material + netMaterialChange));

            // Consciousness from schools and tech - MINUS DILUTION (Maintenance cost) & REALITY CHECK
            let consConsumption = 0.5 + Math.floor(newStats.population / 40); // Slower decay than material
            if (newStats.material < 30) consConsumption += 2; // "Có thực mới vực được đạo" - Low material kills consciousness

            const consProduction = schools * 2 + techs * 2;
            const netConsChange = consProduction - consConsumption;

            newStats.consciousness = Math.min(100, newStats.consciousness + netConsChange);

            // Population from farms
            if (farms > 0 && resources.food > 0) {
                newStats.population += farms * 2;
            }

            // === WIN CONDITION: All 3 Goals Met ===
            if (newStats.population >= 300 && newStats.material >= 100 && newStats.consciousness >= 100) {
                setIsRunning(false);
                playSound('levelComplete');

                // Generate Dialectic Advice based on final stats
                let advice = "";
                const ratio = newStats.material / (newStats.consciousness || 1);

                if (ratio > 1.5) {
                    advice = "Xã hội của bạn có nền tảng vật chất vững chắc, nhưng đời sống tinh thần còn chưa theo kịp. Hãy nhớ: 'Vật chất quyết định ý thức', nhưng ý thức cũng có tính độc lập tương đối và tác động ngược lại. Cần đầu tư thêm cho văn hóa và giáo dục để xã hội phát triển bền vững.";
                } else if (ratio < 0.7) {
                    advice = "Xã hội của bạn rất chú trọng tư tưởng, nhưng cơ sở vật chất còn yếu. Cảnh giác với bệnh 'chủ quan duy ý chí'. Không có bột sao gột nên hồ? Cần đẩy mạnh sản xuất để hiện thực hóa các lý tưởng cao đẹp.";
                } else {
                    advice = "Tuyệt vời! Bạn đã đạt được sự cân bằng biện chứng giữa cơ sở vật chất và kiến trúc thượng tầng. Đây là hình mẫu lý tưởng của một xã hội phát triển hài hòa, nơi kinh tế và văn hóa thúc đẩy lẫn nhau.";
                }

                setCompletionMessage(advice);
            }

            return newStats;
        });
    };

    const triggerRandomEvent = () => {
        const events: GameEvent[] = [
            // === QUY LUẬT LƯỢNG - CHẤT ===
            {
                id: 'quantity_quality',
                title: '📚 Quy luật Lượng - Chất',
                description: 'Số lượng nhà máy tăng đến mức gây ô nhiễm nghiêm trọng. Theo quy luật lượng-chất, sự tích lũy về lượng sẽ dẫn đến biến đổi về chất.',
                options: [
                    { label: 'Giảm sản xuất (giữ môi trường)', effect: () => { handleStatsChange(-10, 10, 5); addLog('✅ Đáp án đúng! Cân bằng sản xuất và môi trường.', 'success'); } },
                    { label: 'Tiếp tục sản xuất (bỏ qua)', effect: () => { handleStatsChange(5, -15, -10); addLog('❌ Sai! Tích lũy ô nhiễm sẽ gây hậu quả nghiêm trọng.', 'error'); } }
                ]
            },
            // === QUY LUẬT THỐNG NHẤT VÀ ĐẤU TRANH ===
            {
                id: 'unity_struggle',
                title: '⚔️ Mâu thuẫn Biện chứng',
                description: 'Xung đột giữa công nhân và quản lý về điều kiện làm việc. Mâu thuẫn là động lực phát triển - cách giải quyết quyết định tương lai.',
                options: [
                    { label: 'Đối thoại, tìm điểm chung', effect: () => { handleStatsChange(5, 15, 10); setResources(r => ({ ...r, labor: Math.min(100, r.labor + 10) })); addLog('✅ Đúng! Thống nhất các mặt đối lập tạo phát triển.', 'success'); } },
                    { label: 'Áp đặt, bỏ qua ý kiến', effect: () => { handleStatsChange(0, -10, -15); addLog('❌ Sai! Bỏ qua mâu thuẫn sẽ tích tụ và bùng nổ.', 'error'); } }
                ]
            },
            // === QUY LUẬT PHỦ ĐỊNH CỦA PHỦ ĐỊNH ===
            {
                id: 'negation',
                title: '🔄 Phủ định của Phủ định',
                description: 'Công nghệ cũ đang lỗi thời. Theo quy luật phủ định của phủ định, cái mới ra đời từ cái cũ nhưng tiến bộ hơn.',
                options: [
                    { label: 'Kế thừa và đổi mới', effect: () => { handleStatsChange(10, 10, 5); setResources(r => ({ ...r, steel: r.steel + 30 })); addLog('✅ Đúng! Kế thừa có chọn lọc là cách phát triển đúng đắn.', 'success'); } },
                    { label: 'Phủ nhận hoàn toàn cái cũ', effect: () => { handleStatsChange(-5, 5, -5); addLog('❌ Sai! Phủ định sạch trơn làm mất kinh nghiệm quý báu.', 'error'); } }
                ]
            },
            // === VẬT CHẤT QUYẾT ĐỊNH Ý THỨC ===
            {
                id: 'matter_consciousness',
                title: '💡 Vật chất và Ý thức',
                description: 'Người dân đòi hỏi phúc lợi cao hơn nhưng nền kinh tế chưa đủ mạnh. Vật chất quyết định ý thức - nhưng ý thức có thể tác động ngược lại.',
                options: [
                    { label: 'Phát triển kinh tế trước', effect: () => { handleStatsChange(15, 5, 5); addLog('✅ Đúng! Cơ sở vật chất vững chắc mới đáp ứng nhu cầu.', 'success'); } },
                    { label: 'Hứa hẹn mà không có khả năng', effect: () => { handleStatsChange(0, -10, -10); addLog('❌ Sai! Ý thức không thể tách rời thực tế vật chất.', 'error'); } }
                ]
            },
            // === THỰC TIỄN LÀ TIÊU CHUẨN CHÂN LÝ ===
            {
                id: 'practice',
                title: '🔬 Thực tiễn và Chân lý',
                description: 'Một phương pháp canh tác mới được đề xuất. Theo triết học Mác, thực tiễn là tiêu chuẩn của chân lý.',
                options: [
                    { label: 'Thử nghiệm trước, đánh giá sau', effect: () => { handleStatsChange(5, 10, 5); setResources(r => ({ ...r, food: r.food + 50 })); addLog('✅ Đúng! Thực tiễn kiểm nghiệm tính đúng đắn của lý thuyết.', 'success'); } },
                    { label: 'Áp dụng ngay không thử', effect: () => { handleStatsChange(-5, 0, -5); setResources(r => ({ ...r, food: Math.max(0, r.food - 30) })); addLog('❌ Sai! Thiếu thực tiễn kiểm nghiệm dễ thất bại.', 'error'); } }
                ]
            },
            // === TỒN TẠI XÃ HỘI QUYẾT ĐỊNH Ý THỨC XÃ HỘI ===
            {
                id: 'social_being',
                title: '🏘️ Tồn tại xã hội',
                description: 'Điều kiện sống khó khăn làm xuất hiện tư tưởng tiêu cực. Tồn tại xã hội quyết định ý thức xã hội.',
                options: [
                    { label: 'Cải thiện điều kiện sống', effect: () => { handleStatsChange(10, 15, 10); addLog('✅ Đúng! Thay đổi tồn tại sẽ thay đổi ý thức.', 'success'); } },
                    { label: 'Tuyên truyền thay đổi tư tưởng', effect: () => { handleStatsChange(0, 5, -5); addLog('❌ Thiếu hiệu quả! Chỉ tuyên truyền mà không thay đổi thực tế.', 'error'); } }
                ]
            },
            // === QUAN HỆ BIỆN CHỨNG GIỮA CƠ SỞ HẠ TẦNG VÀ KIẾN TRÚC THƯỢNG TẦNG ===
            {
                id: 'base_superstructure',
                title: '🏛️ Cơ sở và Kiến trúc',
                description: 'Nền kinh tế phát triển nhưng hệ thống giáo dục lạc hậu. Kiến trúc thượng tầng cần phù hợp với cơ sở hạ tầng.',
                options: [
                    { label: 'Đầu tư cải cách giáo dục', effect: () => { handleStatsChange(5, 20, 10); addLog('✅ Đúng! Cập nhật kiến trúc thượng tầng theo cơ sở hạ tầng.', 'success'); } },
                    { label: 'Giữ nguyên hệ thống cũ', effect: () => { handleStatsChange(0, -10, -5); addLog('❌ Sai! Kiến trúc thượng tầng lạc hậu kìm hãm phát triển.', 'error'); } }
                ]
            },
            // === VAI TRÒ CỦA QUẦN CHÚNG NHÂN DÂN ===
            {
                id: 'masses',
                title: '👥 Vai trò Quần chúng',
                description: 'Cần quyết định hướng phát triển của thành phố. Theo quan điểm duy vật lịch sử, quần chúng là người sáng tạo lịch sử.',
                options: [
                    { label: 'Lấy ý kiến nhân dân', effect: () => { handleStatsChange(5, 15, 15); setStats(s => ({ ...s, population: s.population + 20 })); addLog('✅ Đúng! Phát huy sức mạnh quần chúng.', 'success'); } },
                    { label: 'Quyết định từ trên xuống', effect: () => { handleStatsChange(5, -5, -10); addLog('❌ Thiếu hiệu quả! Bỏ qua vai trò quần chúng.', 'error'); } }
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

    const handleBuild = (type: BuildingType, idx: number) => {
        // Check if position is empty
        if (buildings[idx].type !== 'empty') {
            addLog("Vị trí này đã có công trình!", 'error');
            playSound('error');
            return;
        }

        // Check resources - NEW COSTS
        const costs: Record<BuildingType, { steel: number, food: number }> = {
            factory: { steel: 30, food: 0 },
            farm: { steel: 20, food: 0 },
            school: { steel: 25, food: 20 },
            tech: { steel: 40, food: 30 },
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
            newBuildings[idx] = { type, name, level: 1 };
            return newBuildings;
        });

        setResources(prev => ({
            ...prev,
            steel: prev.steel - costs[type].steel,
            food: prev.food - costs[type].food
        }));

        // Stats effect on build (instant bonus)
        if (type === 'factory') handleStatsChange(5, 0, 0);
        if (type === 'farm') handleStatsChange(2, 2, 2);
        if (type === 'school') handleStatsChange(0, 5, 2);
        if (type === 'tech') handleStatsChange(3, 4, 3);

        addLog(`Đã xây dựng ${name}`, 'success');
        playSound('build');
        setSelectedBuildType(null);

        // Trigger event when reaching building milestones (3, 6, 9, 12)
        const totalBuildings = buildings.filter(b => b.type !== 'empty').length + 1;
        if (totalBuildings === 3 || totalBuildings === 6 || totalBuildings === 9 || totalBuildings === 12) {
            setTimeout(() => triggerRandomEvent(), 500); // Delay to show building first
        }
    };

    const toggleHelp = () => {
        playSound('click');
        setShowHelp(!showHelp);
    };

    const resetGame = () => {
        playSound('click');
        setStats(INITIAL_STATS);
        setResources({ steel: 100, food: 200, labor: 50 });
        setBuildings(Array(GRID_SIZE * GRID_SIZE).fill(null).map(() => ({ type: 'empty' as BuildingType, name: '', level: 0 })));
        setTurn(0);
        setIsRunning(false);
        setActiveEvent(null);
        setAiAnalysis(null);
        setDialecticError(null);
        setSelectedBuildType(null);
        addLog('Đã reset game - Bắt đầu lại từ đầu!', 'info');
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
            <header className="h-14 bg-slate-900/90 backdrop-blur border-b border-slate-700/50 flex items-center justify-between px-2 md:px-4 z-30 shrink-0">
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    <div className="flex items-center gap-2 bg-blue-500/10 px-2 md:px-3 py-1.5 rounded-full border border-blue-500/30">
                        <Zap size={14} className="text-blue-400" />
                        <span className="text-xs font-bold text-slate-300 hidden md:inline">CẤP ĐỘ 3:</span>
                        <span className="text-xs font-bold text-blue-400 uppercase hidden md:inline">Mô Phỏng Xã Hội Biện Chứng</span>
                        <span className="text-xs font-bold text-blue-400 uppercase md:hidden">Lvl 3</span>
                    </div>
                </div>

                {/* Resources with production rates - Scrollable on mobile */}
                <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar mx-2">
                    <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 md:px-3 py-1 rounded border border-slate-700/50 shrink-0">
                        <Factory size={14} className="text-blue-400" />
                        <span className="text-xs text-slate-400 hidden md:invoke">THÉP</span>
                        <span className="text-sm font-mono font-bold text-white">{resources.steel}</span>
                        {steelRate !== 0 && <span className={`text-[10px] md:text-xs font-mono ${steelRate > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {steelRate > 0 ? '+' : ''}{steelRate}/s
                        </span>}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 md:px-3 py-1 rounded border border-slate-700/50 shrink-0">
                        <Wheat size={14} className="text-amber-400" />
                        <span className="text-xs text-slate-400 hidden md:inline">LƯƠNG THỰC</span>
                        <span className="text-sm font-mono font-bold text-white">{resources.food}</span>
                        {foodRate !== 0 && <span className={`text-[10px] md:text-xs font-mono ${foodRate > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {foodRate > 0 ? '+' : ''}{foodRate}/s
                        </span>}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 md:px-3 py-1 rounded border border-slate-700/50 shrink-0">
                        <Users size={14} className="text-green-400" />
                        <span className="text-xs text-slate-400 hidden md:inline">DÂN SỐ</span>
                        <span className="text-sm font-mono font-bold text-white">{stats.population}</span>
                        {popRate > 0 && <span className="text-[10px] md:text-xs font-mono text-green-400">+{popRate}/s</span>}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                    <button onClick={resetGame} className="p-2 bg-slate-800 rounded-lg border border-slate-700 text-slate-400 hover:text-orange-400 hover:border-orange-500 transition-all" title="Chơi lại">
                        <RotateCcw size={16} />
                    </button>
                    <button onClick={toggleHelp} className="p-2 bg-slate-800 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all">
                        <CircleHelp size={16} /> {/* Changed to CircleHelp matching imports */}
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

                    {/* Objectives Panel - Toggleable on mobile */}
                    <div className="absolute top-4 left-4 z-20 pointer-events-none md:pointer-events-auto">
                        {/* Toggle Button for Mobile */}
                        <div className="pointer-events-auto md:hidden mb-2">
                            <button
                                onClick={() => setShowSummary(!showSummary)} // Using showSummary as toggle for mobile panel visibility or add new state
                                className="bg-slate-900/90 border border-cyan-500/50 text-cyan-400 p-2 rounded-lg shadow-lg"
                            >
                                <Target size={20} />
                            </button>
                        </div>

                        <div className={`
                            bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-4 w-64 pointer-events-auto transition-all origin-top-left
                            ${showSummary ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none absolute'} 
                            md:relative md:scale-100 md:opacity-100 md:pointer-events-auto md:block
                        `}>
                            {/* Render panel content always for desktop, handled differently for mobile if needed. 
                                For simplicity, let's just make it visible on desktop and hidden on mobile unless toggled? 
                                Actually, let's just use CSS media queries to hide/show or use a state.
                            */}
                            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                🎯 Mục tiêu: Hoàn thành 3 chỉ số
                            </h4>

                            {/* Main Progress */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-2xl font-mono font-bold text-cyan-400">{stats.population}</span>
                                    <span className="text-slate-400">/ 300</span>
                                </div>
                                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min(100, (stats.population / 300) * 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1">Xây Nông trang để tăng dân số</p>
                            </div>

                            {/* Secondary Goals */}
                            <div className="space-y-3 mb-4 border-t border-slate-700/50 pt-3">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-slate-300">Vật chất (Mục tiêu: 100)</span>
                                        <span className="text-xs font-mono font-bold text-blue-400">{Math.floor(stats.material)}</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min(100, stats.material)}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-slate-300">Ý thức (Mục tiêu: 100)</span>
                                        <span className="text-xs font-mono font-bold text-purple-400">{Math.floor(stats.consciousness)}</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min(100, stats.consciousness)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-slate-700 pt-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Lượt:</span>
                                    <span className="text-white font-mono">{turn}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Công trình:</span>
                                    <span className="text-white font-mono">{buildings.filter(b => b.type !== 'empty').length}/16</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Isometric Grid */}
                    <div
                        className="absolute top-1/2 left-1/2 transition-transform duration-300 touch-pan-x touch-pan-y"
                        style={{
                            transform: `translate(-50%, -50%) scale(${zoom}) perspective(1000px) rotateX(55deg) rotateZ(45deg)`,
                        }}
                    >
                        <div className="grid grid-cols-4 gap-3 p-6 bg-gradient-to-br from-slate-800/30 to-slate-900/50 rounded-xl border border-slate-700/30">
                            {buildings.map((building, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => building.type === 'empty' && selectedBuildType && handleBuild(selectedBuildType, idx)}
                                    className={`
                    w-16 h-16 md:w-24 md:h-24 rounded-lg transition-all duration-300 relative group 
                    ${building.type === 'empty' && selectedBuildType
                                            ? 'cursor-pointer bg-slate-700/50 hover:bg-blue-600/30 border-2 border-dashed border-blue-500 hover:border-blue-400 hover:scale-105'
                                            : building.type === 'empty'
                                                ? 'bg-slate-800/30 border-2 border-dashed border-slate-700 cursor-default'
                                                : 'bg-gradient-to-br from-slate-700/50 to-slate-800/70 border border-slate-600/50 shadow-xl cursor-default'}
                  `}
                                >
                                    {building.type !== 'empty' && (
                                        <>
                                            {/* Building Icon */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-2xl md:text-4xl transform -rotate-45">
                                                    {getBuildingIcon(building.type)}
                                                </div>
                                            </div>
                                            {/* Building Label */}
                                            <div className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 transform -rotate-45 whitespace-nowrap z-10">
                                                <div className="bg-slate-900/90 backdrop-blur px-1.5 py-0.5 rounded text-[7px] md:text-[9px] text-white font-bold border border-slate-700 flex items-center gap-1 shadow-lg">
                                                    {building.type === 'factory' && <Factory size={8} className="text-blue-400" />}
                                                    {building.type === 'farm' && <Wheat size={8} className="text-green-400" />}
                                                    {building.type === 'school' && <GraduationCap size={8} className="text-purple-400" />}
                                                    {building.type === 'tech' && <Cpu size={8} className="text-cyan-400" />}
                                                    <span className="max-w-[60px] md:max-w-none truncate">{building.name}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {building.type === 'empty' && selectedBuildType && (
                                        <div className="absolute inset-0 flex items-center justify-center text-blue-400 animate-pulse">
                                            <Plus size={20} className="md:w-6 md:h-6" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trees decoration */}
                    <div className="absolute bottom-10 left-10 text-green-700 opacity-50 hidden md:block">
                        <TreePine size={40} />
                    </div>

                    {/* Zoom Controls */}
                    <div className="absolute right-4 bottom-24 md:bottom-32 flex flex-col gap-1 z-20">
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
                    </div>
                </div>

                {/* ===== SIDE PANEL ===== */}
                {dialecticError && (
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 md:translate-x-0 md:top-4 md:right-4 w-[90%] md:w-80 bg-slate-900/95 backdrop-blur border border-red-500/50 rounded-lg p-4 z-50 shadow-2xl animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-2 text-red-400 mb-2">
                            <AlertTriangle size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Lỗi Biện Chứng</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-2">Mục tiêu quá xa rời thực tế khách quan!</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{dialecticError}</p>
                    </div>
                )}
            </div>

            {/* ===== BOTTOM BAR ===== */}
            <div className="h-auto min-h-[5rem] md:h-28 bg-slate-900/95 backdrop-blur border-t border-slate-700/50 flex flex-col md:flex-row items-center px-4 py-2 md:px-6 gap-2 md:gap-6 z-30 shrink-0">

                {/* Left: Material Progress - Hidden on small mobile to save space or made compact */}
                <div className="w-full md:w-56 hidden md:block">
                    <div className="flex items-center gap-2 mb-2">
                        <Hammer size={14} className="text-blue-400" />
                        <span className="text-xs font-bold text-slate-400 uppercase">Điều kiện Vật chất</span>
                        <span className="text-sm font-mono font-bold text-blue-400">{Math.floor(stats.material)}%</span>
                        <span className={`text-[10px] font-mono ml-2 ${materialNetRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ({materialNetRate >= 0 ? '+' : ''}{materialNetRate}/s)
                        </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, stats.material)}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1">Năng lực sản xuất giới hạn sự mở rộng tư tưởng.</p>
                </div>

                {/* Center: Build Actions - Grid on Mobile to avoid scroll */}
                <div className="w-full md:flex-1 grid grid-cols-4 gap-1 md:gap-2 md:flex md:items-center md:justify-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold mr-2 shrink-0 hidden md:block">Xây dựng</span>

                    {[
                        { type: 'farm' as BuildingType, icon: <Wheat size={16} className="md:w-5 md:h-5" />, label: 'NÔNG TRẠI', color: 'green' },
                        { type: 'factory' as BuildingType, icon: <Factory size={16} className="md:w-5 md:h-5" />, label: 'NHÀ MÁY', color: 'blue' },
                        { type: 'school' as BuildingType, icon: <GraduationCap size={16} className="md:w-5 md:h-5" />, label: 'TRƯỜNG', color: 'purple' },
                        { type: 'tech' as BuildingType, icon: <Cpu size={16} className="md:w-5 md:h-5" />, label: 'CÔNG NGHỆ', color: 'cyan' },
                    ].map(item => (
                        <button
                            key={item.type}
                            onClick={() => setSelectedBuildType(selectedBuildType === item.type ? null : item.type)}
                            disabled={!isRunning}
                            className={`
                flex flex-col items-center justify-center gap-1 px-1 py-2 rounded-lg border transition-all h-full
                ${selectedBuildType === item.type
                                    ? `bg-${item.color}-500/20 border-${item.color}-500 text-${item.color}-400`
                                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'}
                ${!isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
                        >
                            {item.icon}
                            <span className="text-[9px] font-bold uppercase truncate w-full text-center">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Right: Consciousness Progress - Hidden on small mobile */}
                <div className="w-full md:w-56 text-right hidden md:block">
                    <div className="flex items-center justify-end gap-2 mb-2">
                        <BookOpen size={14} className="text-purple-400" />
                        <span className="text-xs font-bold text-slate-400 uppercase">Mục tiêu Ý thức</span>
                        <span className="text-sm font-mono font-bold text-purple-400">{Math.floor(stats.consciousness)}%</span>
                        <span className={`text-[10px] font-mono ml-2 ${consNetRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ({consNetRate >= 0 ? '+' : ''}{consNetRate}/s)
                        </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500 ml-auto"
                            style={{ width: `${Math.min(100, stats.consciousness)}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1">
                        {stats.material < 30 ? "Vật chất thiếu thốn làm suy giảm Ý thức!" : "Tham vọng vượt quá thực tế vật chất."}
                    </p>
                </div>
            </div>

            {/* ===== MODALS ===== */}

            {/* Help Modal - Responsive */}
            {showHelp && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-cyan-500 rounded-lg max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={toggleHelp} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                        <h3 className="text-2xl font-bold text-cyan-400 mb-4 text-center">🎮 HƯỚNG DẪN CHƠI CẤP ĐỘ 3</h3>

                        <div className="space-y-4 text-sm">
                            {/* Mục tiêu */}
                            <div className="bg-cyan-500/10 p-4 rounded-lg border border-cyan-500/30">
                                <p className="text-cyan-400 font-bold mb-2">🎯 Mục tiêu chiến thắng</p>
                                <p className="text-slate-300 mb-2">Đạt được cả 3 chỉ số sau:</p>
                                <ul className="list-disc ml-5 text-slate-300 space-y-1">
                                    <li><span className="text-green-400 font-bold">Dân số: 300</span> người</li>
                                    <li><span className="text-blue-400 font-bold">Vật chất: 100</span> điểm</li>
                                    <li><span className="text-purple-400 font-bold">Ý thức: 100</span> điểm</li>
                                </ul>
                            </div>

                            {/* Cách chơi cơ bản */}
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <p className="text-white font-bold mb-2">📋 Cách chơi cơ bản</p>
                                <ol className="text-slate-300 space-y-2 ml-4 list-decimal">
                                    <li>Nhấn <span className="text-green-400 font-bold">▶ PLAY</span> để bắt đầu (thời gian chạy)</li>
                                    <li><span className="text-yellow-400 font-bold">Chọn loại công trình</span> ở thanh dưới (Nông trại, Nhà máy, Trường, Công nghệ)</li>
                                    <li><span className="text-blue-400 font-bold">Click vào ô trống</span> trên bản đồ để xây (các ô sẽ sáng màu xanh)</li>
                                    <li>Quan sát các chỉ số tăng/giảm theo thời gian</li>
                                    <li>Trả lời các <span className="text-red-400 font-bold">sự kiện biện chứng</span> khi xuất hiện</li>
                                </ol>
                            </div>

                            {/* Các loại công trình */}
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <p className="text-white font-bold mb-2">🏗️ Các loại công trình</p>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <Wheat size={16} className="text-green-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-green-400 font-bold">NÔNG TRẠI (20 thép)</p>
                                            <p className="text-slate-400 text-xs">Tăng: Dân số +2/s, Lương thực +10/s</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Factory size={16} className="text-blue-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-blue-400 font-bold">NHÀ MÁY (30 thép)</p>
                                            <p className="text-slate-400 text-xs">Tăng: Vật chất +2/s, Thép +8/s</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <GraduationCap size={16} className="text-purple-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-purple-400 font-bold">TRƯỜNG HỌC (25 thép + 20 lương thực)</p>
                                            <p className="text-slate-400 text-xs">Tăng: Ý thức +2/s, Lao động +3/s</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Cpu size={16} className="text-cyan-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-cyan-400 font-bold">CÔNG NGHỆ (40 thép + 30 lương thực)</p>
                                            <p className="text-slate-400 text-xs">Tăng: Vật chất +1/s, Ý thức +2/s</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cơ chế tiêu hao */}
                            <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                                <p className="text-red-400 font-bold mb-2">⚠️ Cơ chế tiêu hao (quan trọng!)</p>
                                <ul className="text-slate-300 space-y-1 text-xs">
                                    <li>• <span className="text-blue-400">Vật chất</span> bị tiêu hao: 1 + (Dân số ÷ 25) điểm/s</li>
                                    <li>• <span className="text-purple-400">Ý thức</span> bị tiêu hao: 0.5 + (Dân số ÷ 40) điểm/s</li>
                                    <li>• <span className="text-amber-400">Lương thực</span> tiêu hao: (Dân số ÷ 50) đơn vị/s</li>
                                    <li className="text-yellow-300">➜ Dân số càng đông, tiêu hao càng nhanh!</li>
                                </ul>
                            </div>

                            {/* Chiến lược */}
                            <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                                <p className="text-green-400 font-bold mb-2">💡 Mẹo chiến lược</p>
                                <ul className="text-slate-300 space-y-1 text-xs">
                                    <li>✓ Xây <span className="text-green-400">Nông trại</span> trước để có dân số và lương thực</li>
                                    <li>✓ Cân bằng <span className="text-blue-400">Vật chất</span> và <span className="text-purple-400">Ý thức</span> (tránh lệch quá 2.5 lần)</li>
                                    <li>✓ Đừng để Vật chất {"<"} 30 (Ý thức sẽ giảm nhanh!)</li>
                                    <li>✓ Trả lời đúng sự kiện để nhận thưởng lớn</li>
                                    <li>✓ Sự kiện xuất hiện khi xây được 3, 6, 9, 12 công trình</li>
                                </ul>
                            </div>

                            {/* Triết lý */}
                            <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
                                <p className="text-purple-400 font-bold text-xs italic mb-1">📚 Triết lý biện chứng:</p>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    "Vật chất quyết định ý thức, nhưng ý thức có tính độc lập tương đối và tác động ngược lại." - Cần phát triển cả kinh tế (vật chất) lẫn văn hóa (ý thức) một cách hài hòa!
                                </p>
                            </div>
                        </div>

                        <button onClick={toggleHelp} className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg text-lg transition-all shadow-lg">
                            BẮT ĐẦU XÂY DỰNG! 🚀
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
            {/* Completion Modal */}
            {completionMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
                    <div className="bg-slate-900 border-2 border-green-500 rounded-2xl w-full max-w-lg p-8 shadow-2xl relative overflow-hidden">
                        {/* Background Deco */}
                        <div className="absolute top-0 right-0 p-32 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10 text-center space-y-6">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-green-500/10 mb-4 animate-[bounce_2s_infinite]">
                                <Trophy size={40} className="text-green-400" />
                            </div>

                            <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider">
                                Sứ Mệnh Hoàn Thành!
                            </h2>

                            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-left space-y-4">
                                <h3 className="text-lg font-bold text-green-400 flex items-center gap-2">
                                    <Sparkles size={18} />
                                    Lời Khuyên Từ Cỗ Máy Biện Chứng:
                                </h3>
                                <p className="text-slate-300 leading-relaxed italic border-l-4 border-green-500 pl-4 py-1">
                                    "{completionMessage}"
                                </p>
                            </div>

                            <button
                                onClick={() => onComplete(10000)}
                                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-yellow-500/25 flex items-center justify-center gap-2 mt-4"
                            >
                                XEM BẢNG XẾP HẠNG <Trophy size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};