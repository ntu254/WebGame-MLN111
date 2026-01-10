import React, { useState, useEffect, useRef } from 'react';
import { LogEntry, CityStats } from '../types';
import { consultDialecticAdvisor, generateEventOutcome } from '../services/geminiService';
import { playSound } from '../services/soundService';
import { Hammer, BookOpen, AlertTriangle, Play, Pause, Zap, Scale, Building2, Landmark, Leaf, CircleHelp, X, Bot, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

// Isometric Grid Helper
const GRID_SIZE = 5;
type BuildingType = 'empty' | 'factory' | 'academy' | 'utopia';

interface GameEvent {
    id: string;
    title: string;
    description: string;
    options: { label: string, effect: () => void }[];
}

const StatBadge = ({ icon, value, label, color }: { icon: React.ReactNode, value: number, label: string, color: string }) => (
    <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded border border-slate-700/50">
         <div className={`p-1 rounded bg-slate-900 ${color}`}>
             {icon}
         </div>
         <div className="flex flex-col">
             <span className={`text-sm font-mono font-bold leading-none ${color}`}>{Math.floor(value)}</span>
             <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">{label}</span>
         </div>
    </div>
);

const ActionButton = ({ title, desc, icon, color, onClick, disabled }: { 
    title: string; 
    desc: string; 
    icon: React.ReactNode; 
    color: 'blue' | 'purple' | 'green'; 
    onClick: () => void; 
    disabled: boolean;
}) => {
    const colorStyles = {
        blue: 'border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 text-blue-400',
        purple: 'border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10 text-purple-400',
        green: 'border-green-500/30 hover:border-green-500 hover:bg-green-500/10 text-green-400'
    };

    return (
        <button 
            onClick={onClick}
            disabled={disabled}
            className={`
                w-full flex items-center gap-3 p-3 rounded-lg border bg-slate-800/40 transition-all group
                ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : `${colorStyles[color]} hover:shadow-lg hover:translate-x-1`}
            `}
        >
            <div className="p-2 bg-slate-900 rounded-md shrink-0 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div className="text-left">
                <div className="font-bold text-sm text-slate-200 group-hover:text-white">{title}</div>
                <div className="text-[10px] text-slate-500 font-mono">{desc}</div>
            </div>
        </button>
    );
};

export const Level3: React.FC<Level3Props> = ({ onComplete, addLog }) => {
  const [stats, setStats] = useState<CityStats>(INITIAL_STATS);
  const [isRunning, setIsRunning] = useState(false);
  const [turn, setTurn] = useState(0);
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null); // New state for AI Analysis Modal
  const [buildings, setBuildings] = useState<BuildingType[]>(Array(GRID_SIZE * GRID_SIZE).fill('empty'));
  const [history, setHistory] = useState<{name: string, m: number, c: number, s: number}[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<{id: number, text: string, x: number, y: number, color: string}[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  // Refs for loop
  const statsRef = useRef(stats);
  useEffect(() => { statsRef.current = stats; }, [stats]);

  // Track previous population for logging
  const prevPopRef = useRef(stats.population);

  // Monitor Population Growth
  useEffect(() => {
    if (stats.population > prevPopRef.current) {
        // Log every 50 population to avoid spamming the log every second
        if (stats.population % 50 === 0) {
            addLog(`Dân số đạt ${stats.population.toLocaleString()} - Dân số tăng nhờ ổn định xã hội.`, 'success');
        }
    }
    prevPopRef.current = stats.population;
  }, [stats.population, addLog]);

  // Game Loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && !activeEvent && !aiAnalysis) { // Pause if AI analysis modal is open too
        interval = setInterval(() => {
            tick();
        }, 1000);
    }
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, activeEvent, aiAnalysis]);

  const tick = () => {
      setTurn(t => t + 1);
      
      setStats(prev => {
          const newStats = { ...prev };
          
          // Passive changes based on buildings
          const factoryCount = buildings.filter(b => b === 'factory').length;
          const academyCount = buildings.filter(b => b === 'academy').length;
          const utopiaCount = buildings.filter(b => b === 'utopia').length;

          // Production logic
          newStats.material += (factoryCount * 2) + (utopiaCount * 3) - (newStats.population * 0.1); 
          newStats.consciousness += (academyCount * 2) + (utopiaCount * 3) - (factoryCount * 0.5);
          
          // Natural Decay/Consumption
          newStats.material = Math.max(0, newStats.material - 1);
          newStats.consciousness = Math.max(0, newStats.consciousness - 1);

          // Stability calculation (The dialectic balance)
          const ratio = newStats.material / (newStats.consciousness || 1);
          let stabilityChange = 0;

          if (ratio > 3.0) {
             stabilityChange = -2;
             if (Math.random() > 0.9) triggerFloatingText("Chủ nghĩa duy vật tầm thường!", 'red');
          } else if (ratio < 0.33) {
             stabilityChange = -2;
             if (Math.random() > 0.9) triggerFloatingText("Chủ nghĩa duy tâm!", 'red');
          } else {
             stabilityChange = 1;
          }
          
          newStats.stability = Math.min(100, Math.max(0, newStats.stability + stabilityChange));
          
          // Population Growth if stable
          if (newStats.stability > 60 && newStats.material > newStats.population) {
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

          updateBuildings(newStats);
          
          // Chart update
          setHistory(h => [...h.slice(-19), { 
              name: `T${turn}`, 
              m: Math.floor(newStats.material), 
              c: Math.floor(newStats.consciousness),
              s: Math.floor(newStats.stability)
          }]);

          return newStats;
      });

      // Random Event Chance
      if (Math.random() < 0.05) { // 5% chance per tick
          triggerRandomEvent();
      }
  };

  const updateBuildings = (currentStats: CityStats) => {
      // Determines how many buildings we should have based on population
      const targetBuildings = Math.min(GRID_SIZE * GRID_SIZE, Math.floor(currentStats.population / 50));
      
      setBuildings(prev => {
          const newBuildings = [...prev];
          const currentCount = newBuildings.filter(b => b !== 'empty').length;
          
          if (currentCount < targetBuildings) {
              // Add a building
              // Find empty spot
              const emptyIndices = newBuildings.map((b, i) => b === 'empty' ? i : -1).filter(i => i !== -1);
              if (emptyIndices.length > 0) {
                  const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
                  
                  // Decide type based on stats
                  const ratio = currentStats.material / (currentStats.consciousness || 1);
                  let type: BuildingType = 'utopia';
                  if (ratio > 1.5) type = 'factory';
                  else if (ratio < 0.6) type = 'academy';
                  
                  newBuildings[idx] = type;
                  triggerFloatingText("Xây dựng mới!", 'green');
                  playSound('build');
              }
          }
          return newBuildings;
      });
  };

  const triggerFloatingText = (text: string, color: 'green' | 'red' | 'blue' | 'yellow' = 'blue') => {
      const id = Date.now();
      const x = Math.random() * 60 + 20; // %
      const y = Math.random() * 60 + 20; // %
      const colorMap = { green: '#4ade80', red: '#f87171', blue: '#60a5fa', yellow: '#facc15' };
      
      setFloatingTexts(prev => [...prev, { id, text, x, y, color: colorMap[color] }]);
      setTimeout(() => {
          setFloatingTexts(prev => prev.filter(t => t.id !== id));
      }, 2000);
  };

  const triggerRandomEvent = () => {
      const events: GameEvent[] = [
          {
              id: 'crisis_overproduction',
              title: 'Khủng Hoảng Thừa',
              description: 'Hàng hóa sản xuất quá nhiều nhưng người dân không đủ tiền mua. Mâu thuẫn giữa sản xuất và tiêu thụ.',
              options: [
                  { 
                      label: 'Tiêu hủy hàng hóa (Giữ giá)', 
                      effect: () => { 
                          handleStatsChange(-30, 0, -10); 
                          processEventOutcome("Tiêu hủy hàng hóa", "Giữ ổn định thị trường nhưng gây lãng phí xã hội.", 'Khủng Hoảng Thừa');
                      } 
                  },
                  { 
                      label: 'Phân phối lại (Cải cách)', 
                      effect: () => { 
                          handleStatsChange(-10, 20, 10); 
                          processEventOutcome("Phân phối lại tư liệu", "Tăng cường ý thức xã hội và ổn định.", 'Khủng Hoảng Thừa');
                      } 
                  }
              ]
          },
          {
              id: 'ideological_conflict',
              title: 'Xung Đột Tư Tưởng',
              description: 'Một trào lưu triết học mới đang thách thức các giá trị truyền thống.',
              options: [
                  { 
                      label: 'Đàn áp tư tưởng (Duy ý chí)', 
                      effect: () => { 
                          handleStatsChange(0, -20, -15);
                          processEventOutcome("Đàn áp tư tưởng", "Gây bất mãn trong tầng lớp trí thức.", 'Xung Đột Tư Tưởng');
                      } 
                  },
                  { 
                      label: 'Mở rộng tranh luận (Biện chứng)', 
                      effect: () => { 
                          handleStatsChange(0, 30, 5); 
                          processEventOutcome("Tranh luận biện chứng", "Thúc đẩy sự phát triển của nhận thức xã hội.", 'Xung Đột Tư Tưởng');
                      } 
                  }
              ]
          }
      ];
      
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setActiveEvent(randomEvent);
      setIsRunning(false);
      playSound('alert');
  };

  const processEventOutcome = async (choice: string, defaultOutcome: string, eventTitle: string) => {
      playSound('click');
      addLog(`Sự kiện: ${eventTitle} - Đã chọn: ${choice}`, 'info');
      
      // Close event modal immediately
      setActiveEvent(null);
      
      // Briefly show loading/processing state via floating text or log
      triggerFloatingText("Đang phân tích...", 'blue');

      // AI generation
      const aiOutcome = await generateEventOutcome(eventTitle, choice);
      
      if (aiOutcome) {
          // Open AI Analysis Modal instead of just logging
          setAiAnalysis(aiOutcome);
          addLog(`AI Phân tích: ${aiOutcome}`, 'ai'); // Still keep in log for record
          playSound('success'); // Good sound when analysis arrives
      } else {
          // Fallback if AI fails
          addLog(`Kết quả: ${defaultOutcome}`, 'info');
          setIsRunning(true);
      }
  };

  const handleStatsChange = (m: number, c: number, s: number) => {
      setStats(prev => ({
          ...prev,
          material: Math.max(0, prev.material + m),
          consciousness: Math.max(0, prev.consciousness + c),
          stability: Math.min(100, Math.max(0, prev.stability + s))
      }));
      triggerFloatingText(`${m >= 0 ? '+' : ''}${m} VC / ${c >= 0 ? '+' : ''}${c} YT`, m > 0 ? 'blue' : 'yellow');
  };

  // Action Handlers
  const handleBuildMaterial = () => {
      handleStatsChange(25, -5, -2);
      addLog("Đã mở rộng khu công nghiệp.", 'info');
      playSound('build');
  };

  const handleBuildConsciousness = () => {
      handleStatsChange(-10, 25, -2);
      addLog("Đã xây dựng viện nghiên cứu.", 'info');
      playSound('build');
  };

  const handleHarmonize = () => {
      if (stats.material < 20 || stats.consciousness < 20) {
          triggerFloatingText("Không đủ nguồn lực!", 'red');
          playSound('error');
          return;
      }
      handleStatsChange(-20, -20, 15);
      triggerFloatingText("Hòa giải mâu thuẫn!", 'green');
      addLog("Thực hiện cải cách để tăng cường ổn định.", 'success');
      playSound('success');
  };

  const toggleHelp = () => {
      playSound('click');
      setShowHelp(!showHelp);
  };

  const closeAiModal = () => {
      setAiAnalysis(null);
      setIsRunning(true); // Resume game after closing modal
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden relative">
        {/* Floating Texts Layer */}
        {floatingTexts.map(ft => (
            <div 
                key={ft.id}
                className="absolute pointer-events-none text-sm font-bold animate-[bounce_1s_ease-out_forwards] z-50 shadow-black text-shadow"
                style={{ left: `${ft.x}%`, top: `${ft.y}%`, color: ft.color, textShadow: '1px 1px 2px black' }}
            >
                {ft.text}
            </div>
        ))}

        {/* Help Modal */}
        {showHelp && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-blue-500 rounded-lg max-w-md w-full p-6 shadow-2xl relative">
                  <button onClick={toggleHelp} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
                  <h3 className="text-xl font-display text-blue-400 mb-4 uppercase tracking-wider border-b border-slate-800 pb-2">Chiến Thuật Biện Chứng</h3>
                  <div className="space-y-4 text-sm text-slate-300">
                      <div>
                          <strong className="text-white block mb-1">🎯 Nhiệm vụ:</strong>
                          <p>Phát triển xã hội đạt tới trạng thái <span className="text-green-400 font-bold">Cộng sản chủ nghĩa</span> (Dân số: 2000).</p>
                      </div>
                      <div>
                          <strong className="text-white block mb-1">🎮 Cách chơi:</strong>
                          <ul className="list-disc pl-5 space-y-1 text-slate-400">
                              <li>Dùng 3 nút hành động bên phải để điều chỉnh chỉ số.</li>
                              <li><span className="text-blue-400">Vật chất</span> quá cao = Duy vật tầm thường.</li>
                              <li><span className="text-purple-400">Ý thức</span> quá cao = Duy tâm chủ quan.</li>
                              <li>Luôn giữ chỉ số <span className="text-green-400">Ổn định</span> {' > '} 0.</li>
                              <li>Xử lý sự kiện ngẫu nhiên bằng tư duy biện chứng.</li>
                          </ul>
                      </div>
                      <div className="bg-blue-900/20 p-3 rounded border border-blue-900/50 text-xs italic">
                          "Vật chất quyết định ý thức, nhưng ý thức có tính độc lập tương đối..."
                      </div>
                  </div>
                  <button 
                    onClick={toggleHelp}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded transition-colors"
                  >
                      TRIỂN KHAI
                  </button>
              </div>
          </div>
        )}

        {/* AI Analysis Modal (The new tab/popup) */}
        {aiAnalysis && (
            <div className="absolute inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 backdrop-blur-md animate-in zoom-in-95 duration-300">
                <div className="bg-slate-900/90 border-2 border-purple-500 rounded-xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(168,85,247,0.3)] relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-pulse"></div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"></div>
                    
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
                        <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-500/50 text-purple-400">
                            <Bot size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                Phân Tích Chiến Lược <Sparkles size={14} className="text-yellow-400"/>
                            </h3>
                            <p className="text-xs text-purple-400 font-mono">Dữ liệu xử lý bởi Neural Core v3.0</p>
                        </div>
                    </div>

                    <div className="prose prose-invert prose-sm max-w-none mb-8">
                        <p className="text-slate-200 leading-relaxed text-base border-l-2 border-purple-500 pl-4 py-1 italic">
                            "{aiAnalysis}"
                        </p>
                    </div>

                    <button 
                        onClick={closeAiModal}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-900/40 uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                        Tiếp nhận thông tin
                    </button>
                </div>
            </div>
        )}

        {/* Modal Event */}
        {activeEvent && (
            <div className="absolute inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-slate-900 border-2 border-red-500 rounded-xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>
                    <div className="flex items-center gap-3 mb-4 text-red-500">
                        <AlertTriangle size={32} />
                        <h3 className="text-2xl font-display font-bold uppercase tracking-widest">Sự Kiện Biện Chứng</h3>
                    </div>
                    <h4 className="text-xl text-white font-bold mb-2">{activeEvent.title}</h4>
                    <p className="text-slate-300 mb-8 leading-relaxed">{activeEvent.description}</p>
                    
                    <div className="grid gap-4">
                        {activeEvent.options.map((opt, idx) => (
                            <button 
                                key={idx}
                                onClick={opt.effect}
                                className="w-full text-left p-4 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-blue-500 hover:translate-x-1 transition-all group"
                            >
                                <span className="font-bold text-blue-400 group-hover:text-blue-300">Phương án {String.fromCharCode(65+idx)}:</span>
                                <span className="text-slate-200 ml-2">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Top HUD */}
        <div className="h-16 bg-slate-900/90 border-b border-slate-700 flex items-center justify-between px-6 shrink-0 z-20">
             <div className="flex items-center gap-6">
                 <div className="flex flex-col">
                     <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Năm thứ</span>
                     <span className="text-xl font-mono font-bold text-white">{(2025 + Math.floor(turn / 10))}</span>
                 </div>
                 <div className="h-8 w-px bg-slate-700"></div>
                 <div className="flex items-center gap-4">
                      <StatBadge icon={<Hammer size={14}/>} value={stats.material} label="Vật chất" color="text-blue-400" />
                      <StatBadge icon={<BookOpen size={14}/>} value={stats.consciousness} label="Ý thức" color="text-purple-400" />
                      <StatBadge icon={<Scale size={14}/>} value={stats.stability} label="Ổn định" color={stats.stability > 50 ? "text-green-400" : "text-red-400"} />
                 </div>
             </div>
             
             <div className="flex items-center gap-2">
                 <button onClick={toggleHelp} className="p-2 bg-slate-800 border border-slate-600 rounded-full text-slate-400 hover:text-white hover:border-blue-500 transition-all" title="Hướng dẫn">
                     <CircleHelp size={16} />
                 </button>
                 <button 
                    onClick={() => setIsRunning(!isRunning)}
                    className={`flex items-center gap-2 px-4 py-2 rounded font-bold border transition-all
                        ${isRunning 
                            ? 'bg-yellow-900/20 border-yellow-700 text-yellow-500 hover:bg-yellow-900/40' 
                            : 'bg-green-900/20 border-green-700 text-green-500 hover:bg-green-900/40 animate-pulse'
                        }`}
                >
                    {isRunning ? <><Pause size={16}/> Tạm dừng</> : <><Play size={16}/> Tiếp tục</>}
                </button>
             </div>
        </div>

        {/* Main View: Split Layout */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* Left: Isometric City View */}
            <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-20" 
                     style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>
                
                {/* Isometric Container */}
                <div className="relative w-[600px] h-[400px] transform transition-transform duration-500 scale-75 md:scale-100">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-x-60 rotate-z-45 grid grid-cols-5 gap-2 p-4 bg-slate-900/50 border-4 border-slate-800 rounded-xl shadow-2xl">
                         {buildings.map((type, idx) => (
                             <div 
                                key={idx} 
                                className={`
                                    w-16 h-16 rounded transition-all duration-700 relative group
                                    ${type === 'empty' ? 'bg-slate-800/50 hover:bg-slate-800' : ''}
                                `}
                             >
                                 {type !== 'empty' && (
                                     <div className={`
                                        absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center
                                        transition-all duration-500 animate-[bounce_2s_infinite]
                                     `}>
                                         {type === 'factory' && <Building2 size={32} className="text-blue-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" />}
                                         {type === 'academy' && <Landmark size={32} className="text-purple-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" />}
                                         {type === 'utopia' && <Leaf size={32} className="text-green-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" />}
                                     </div>
                                 )}
                                 {/* Base Plate */}
                                 <div className={`absolute inset-0 border rounded opacity-50 ${type === 'factory' ? 'border-blue-500 bg-blue-900/20' : type === 'academy' ? 'border-purple-500 bg-purple-900/20' : type === 'utopia' ? 'border-green-500 bg-green-900/20' : 'border-slate-700'}`}></div>
                             </div>
                         ))}
                    </div>
                </div>

                <div className="absolute bottom-6 left-6 bg-slate-900/80 p-3 rounded border border-slate-700 backdrop-blur">
                    <h4 className="text-xs text-slate-400 uppercase font-bold mb-2">Thống kê Dân số</h4>
                    <div className="text-2xl font-display text-white">{stats.population.toLocaleString()} <span className="text-xs text-slate-500">công dân</span></div>
                </div>
            </div>

            {/* Right: Controls & Info */}
            <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col p-4 gap-4 z-10 shadow-xl">
                
                {/* Actions Panel */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Hành động Chiến lược</h3>
                    
                    <ActionButton 
                        title="Phát triển Hạ tầng" 
                        desc="+25 VC, -5 YT, -2 OĐ" 
                        icon={<Hammer size={18}/>} 
                        color="blue" 
                        onClick={handleBuildMaterial} 
                        disabled={!isRunning}
                    />
                    
                    <ActionButton 
                        title="Giáo dục Tư tưởng" 
                        desc="-10 VC, +25 YT, -2 OĐ" 
                        icon={<BookOpen size={18}/>} 
                        color="purple" 
                        onClick={handleBuildConsciousness} 
                        disabled={!isRunning}
                    />

                    <ActionButton 
                        title="Hòa giải Mâu thuẫn" 
                        desc="-20 VC, -20 YT, +15 OĐ" 
                        icon={<Scale size={18}/>} 
                        color="green" 
                        onClick={handleHarmonize} 
                        disabled={!isRunning}
                    />
                </div>

                {/* Advisor / Alert Box */}
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 min-h-[100px] relative">
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-[10px] px-2 py-0.5 rounded text-white font-bold">AI ADVISOR</div>
                    <div className="flex items-start gap-3">
                        <Zap size={16} className="text-yellow-400 shrink-0 mt-1" />
                        <p className="text-xs text-slate-300 italic leading-relaxed">
                            {stats.stability < 40 ? "Cảnh báo: Xã hội đang mất ổn định nghiêm trọng. Cần thực hiện hòa giải mâu thuẫn ngay lập tức!" :
                             stats.material > stats.consciousness * 2 ? "Cơ sở hạ tầng đang phát triển quá nóng so với nhận thức xã hội. Cần đầu tư giáo dục." :
                             stats.consciousness > stats.material * 2 ? "Tư tưởng đang đi trước thực tại quá xa. Cần củng cố cơ sở vật chất." :
                             "Xã hội đang phát triển cân bằng theo hướng biện chứng."}
                        </p>
                    </div>
                </div>

                {/* Mini Chart */}
                <div className="flex-1 min-h-[150px] bg-slate-950 rounded border border-slate-800 p-2 flex flex-col">
                     <h4 className="text-[10px] text-slate-500 uppercase font-bold mb-2">Lịch sử Biện chứng</h4>
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                            <defs>
                                <linearGradient id="colorM" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5}/>
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                            <YAxis hide domain={[0, 200]} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '10px' }} itemStyle={{ padding: 0 }} />
                            <Area type="monotone" dataKey="m" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorM)" name="Vật chất" />
                            <Area type="monotone" dataKey="c" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorC)" name="Ý thức" />
                            <Area type="monotone" dataKey="s" stroke="#4ade80" strokeWidth={1} fill="none" strokeDasharray="2 2" name="Ổn định" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
  );
};