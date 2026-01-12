import React, { useState, useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { playSound } from '../services/soundService';
import { checkClassificationWithAI } from '../services/geminiService';
import {
    Atom, Brain, Zap, Radio, CircleHelp, Info, X, Trophy,
    BarChart3, CheckCircle, ArrowRight, Dna, Activity,
    Globe, Flame, Layers, Clock, Repeat, MousePointer2, ShieldAlert
} from 'lucide-react';

interface Level1Props {
    onComplete: (score: number) => void;
    addLog: (msg: string, type: LogEntry['type']) => void;
    logs: LogEntry[];
}

// STAGE 1: CLASSIFICATION DATA
interface MatterEntity {
    id: string;
    name: string;
    type: 'material' | 'consciousness';
    description: string;
    category: string;
}

const CLASSIFICATION_DATA: MatterEntity[] = [
    { id: '1', name: 'Nguyên tử', type: 'material', description: 'Hạt cơ bản cấu tạo nên vật chất', category: 'Vật lý' },
    { id: '2', name: 'Tư tưởng', type: 'consciousness', description: 'Sản phẩm của bộ óc con người', category: 'Tâm trí' },
    { id: '3', name: 'Sóng điện từ', type: 'material', description: 'Dạng tồn tại cụ thể của vật chất', category: 'Vật lý' },
    { id: '4', name: 'Thần linh', type: 'consciousness', description: 'Hình ảnh hư ảo trong tâm trí', category: 'Tâm linh' },
    { id: '5', name: 'Phản ứng hóa học', type: 'material', description: 'Quá trình biến đổi khách quan', category: 'Hóa học' },
    { id: '6', name: 'Giấc mơ', type: 'consciousness', description: 'Phản ánh sai lệch/hư ảo của não', category: 'Tâm trí' },
    { id: '7', name: 'Cây xanh', type: 'material', description: 'Thực thể sống tồn tại khách quan', category: 'Sinh học' },
    { id: '8', name: 'Quy luật Xã hội', type: 'material', description: 'Tồn tại khách quan trong xã hội', category: 'Xã hội' },
];

// STAGE 2: FORMS OF MOTION DATA
interface MotionForm {
    id: 'mechanical' | 'physical' | 'chemical' | 'biological' | 'social';
    name: string;
    level: number; // 1-5
    icon: React.ReactNode;
    examples: string[];
}

const MOTION_FORMS: MotionForm[] = [
    { id: 'mechanical', name: 'Cơ học', level: 1, icon: <Repeat size={20} />, examples: ['Xe chạy', 'Trái đất quay'] },
    { id: 'physical', name: 'Vật lý', level: 2, icon: <Zap size={20} />, examples: ['Dòng điện', 'Hạt nhân', 'Nhiệt'] },
    { id: 'chemical', name: 'Hóa học', level: 3, icon: <Flame size={20} />, examples: ['Phản ứng axit', 'Biến đổi chất'] },
    { id: 'biological', name: 'Sinh học', level: 4, icon: <Dna size={20} />, examples: ['Trao đổi chất', 'Di truyền'] },
    { id: 'social', name: 'Xã hội', level: 5, icon: <Globe size={20} />, examples: ['Cách mạng', 'Kinh tế', 'Văn hóa'] },
];

const DROPPABLE_ITEMS = [
    { id: 'm1', label: 'Xe ô tô chạy', type: 'mechanical' },
    { id: 'm2', label: 'Dòng điện chạy', type: 'physical' },
    { id: 'm3', label: 'Sắt bị gỉ (Oxy hóa)', type: 'chemical' },
    { id: 'm4', label: 'Cây quang hợp', type: 'biological' },
    { id: 'm5', label: 'Cải cách Minh Trị', type: 'social' },
];

// STAGE 3: QUIZ DATA
const QUIZ_DATA = [
    {
        question: "Chọn phát biểu ĐÚNG về mối quan hệ giữa Vận động và Đứng im?",
        options: [
            "Đứng im là tuyệt đối, vận động là tương đối.",
            "Vận động và đứng im đều là tuyệt đối.",
            "Vận động là tuyệt đối, đứng im là tương đối, tạm thời.",
            "Vật chất có thể không vận động trong thời gian ngắn."
        ],
        correct: 2,
        explanation: "Vận động là phương thức tồn tại vĩnh viễn của vật chất (tuyệt đối). Đứng im chỉ là trạng thái cân bằng tạm thời trong một quan hệ nhất định (tương đối)."
    },
    {
        question: "Theo Lênin, Không gian và Thời gian là gì?",
        options: [
            "Là sản phẩm của tư duy con người để đo lường.",
            "Là hình thức tồn tại khách quan của vật chất.",
            "Là môi trường chứa đựng vật chất, tách rời vật chất.",
            "Là ảo giác của cảm giác."
        ],
        correct: 1,
        explanation: "Vật chất vận động không thể tồn tại ngoài không gian và thời gian. Chúng là hình thức tồn tại khách quan của vật chất."
    },
    {
        question: "Cơ sở của tính thống nhất của thế giới là gì?",
        options: [
            "Tính vật chất.",
            "Tính tồn tại.",
            "Ý niệm tuyệt đối.",
            "Năng lượng."
        ],
        correct: 0,
        explanation: "Chủ nghĩa duy vật biện chứng khẳng định: Thế giới thống nhất ở tính vật chất của nó."
    }
];

export const Level1: React.FC<Level1Props> = ({ onComplete, addLog, logs }) => {
    // Game State
    const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4 | 5>(0); // 0: Intro, 1: Classification, 2: Motion, 3: Tunnel, 4: Quiz, 5: Summary
    const [score, setScore] = useState(0);
    const [showHelp, setShowHelp] = useState(false);



    // Stage 1 State
    const [entities, setEntities] = useState(CLASSIFICATION_DATA);
    const [draggedEntity, setDraggedEntity] = useState<MatterEntity | null>(null);
    const [stage1Progress, setStage1Progress] = useState(0);
    const [blackholes, setBlackholes] = useState<{ id: number, x: number, y: number, vx: number, vy: number }[]>([]);

    useEffect(() => {
        if (stage === 1) {
            // Spawn blackholes
            const initialBlackholes = Array.from({ length: 3 }).map((_, i) => ({
                id: i,
                x: Math.random() * 80 + 10, // %
                y: Math.random() * 60 + 20, // %
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            }));
            setBlackholes(initialBlackholes);

            const interval = setInterval(() => {
                setBlackholes(prev => prev.map(bh => {
                    let newX = bh.x + bh.vx;
                    let newY = bh.y + bh.vy;
                    // Bounce
                    if (newX <= 5 || newX >= 95) bh.vx *= -1;
                    if (newY <= 10 || newY >= 90) bh.vy *= -1;
                    return { ...bh, x: newX, y: newY };
                }));
            }, 50);
            return () => clearInterval(interval);
        }
    }, [stage]);

    // Stage 2 State
    const [draggedMotionItem, setDraggedMotionItem] = useState<{ id: string, type: string, label: string } | null>(null);
    const [motionSlots, setMotionSlots] = useState<(string | null)[]>([null, null, null, null, null]); // 5 levels
    const [availableMotionItems, setAvailableMotionItems] = useState(DROPPABLE_ITEMS);

    // Stage 2 State (Atomic Dance)
    const [fallingItems, setFallingItems] = useState<{ id: number, item: typeof DROPPABLE_ITEMS[0], y: number, hit: boolean }[]>([]);
    const [collectedTypes, setCollectedTypes] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (stage === 2) {
            // Spawn items
            const spawnInterval = setInterval(() => {
                if (Math.random() < 0.4) { // Reduced spawn rate
                    const randomItem = DROPPABLE_ITEMS[Math.floor(Math.random() * DROPPABLE_ITEMS.length)];
                    setFallingItems(prev => [...prev, {
                        id: Date.now(),
                        item: randomItem,
                        y: -10,
                        hit: false
                    }]);
                }
            }, 1000);

            // Move items
            const moveInterval = setInterval(() => {
                setFallingItems(prev => {
                    const next = prev.map(i => ({ ...i, y: i.y + 0.6 })); // Speed reduced

                    // Remove missed items
                    const kept = next.filter(i => {
                        return i.y < 100;
                    });

                    return kept;
                });
            }, 30);

            // Win condition logic handled in handleRhythmHit mostly, or checked here if we tracked separate score
            if (stage1Progress >= 10) {
                // Already handled in click handler, but safe to keep check if needed
            }

            return () => { clearInterval(spawnInterval); clearInterval(moveInterval); };
        }
    }, [stage, stage1Progress]);

    const handleRhythmHit = (level: number) => {
        // Find item in zone (approx 80-90%)
        setFallingItems(prev => {
            const hitItem = prev.find(i => i.y >= 75 && i.y <= 92 && !i.hit);
            if (hitItem) {
                // Check valid type
                const targetType = MOTION_FORMS[level].id;
                if (hitItem.item.type === targetType) {
                    playSound('success');
                    setScore(s => s + 100);

                    // Update Progress (Unique Types)
                    setCollectedTypes(prevTypes => {
                        const newTypes = new Set(prevTypes);
                        newTypes.add(targetType);

                        if (newTypes.size >= 5 && stage1Progress < 5) { // Ensure runs once
                            // Use stage1Progress as a "locked" flag effectively or just check current size
                            // Better: Check if we haven't already won
                            // We need a ref or state that doesn't rely on the closure of 'stage1Progress' which might be stale? 
                            // No, setCollectedTypes gives us fresh prev.
                        }
                        return newTypes;
                    });

                    // Check Win Condition in a simpler way: count unique hits
                    // We need to trigger this securely. 
                    // Let's use a separate useEffect for win condition based on collectedTypes size
                    return prev.map(i => i.id === hitItem.id ? { ...i, hit: true, y: 110 } : i);
                } else {
                    playSound('error');
                    setScore(s => Math.max(0, s - 50));
                    return prev;
                }
            } else {
                return prev;
            }
        });
    };

    // Stage 2 Win Check
    useEffect(() => {
        if (stage === 2 && collectedTypes.size >= 5) {
            setTimeout(() => {
                addLog("Hoàn thành Vũ điệu Nguyên tử: Đủ 5 hình thức!", 'info');
                setStage(3); // Explicitly set to 3 to avoid double increment
                playSound('levelComplete');
            }, 500);
        }
    }, [collectedTypes, stage]);

    // Stage 3 State
    const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
    const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean, text: string } | null>(null);

    // Stage 3 State (Tunnel)
    const [tunnelTime, setTunnelTime] = useState(0);
    const [playerPos, setPlayerPos] = useState(50); // % X
    const [obstacles, setObstacles] = useState<{ id: number, x: number, y: number, type: 'barrier' | 'orb' }[]>([]);
    const [isQuizActive, setIsQuizActive] = useState(false);
    const TUNNEL_DURATION = 30; // Seconds

    useEffect(() => {
        if (stage === 3 && !isQuizActive) {
            const gameLoop = setInterval(() => {
                setTunnelTime(t => {
                    if (t >= TUNNEL_DURATION) {
                        clearInterval(gameLoop);
                        // Skip Stage 4 (Quiz), go to Summary (Stage 5 -> mapped to 4 now or straightforward)
                        // If I remove stage 4, Summary becomes stage 4.
                        setStage(4 as any);
                        playSound('levelComplete');
                        return t;
                    }
                    return t + 0.05;
                });

                // Spawn Obstacles
                if (Math.random() < 0.05) {
                    setObstacles(prev => [...prev, {
                        id: Date.now(),
                        x: Math.random() * 80 + 10,
                        y: -10, // Start slightly above
                        type: Math.random() > 0.3 ? 'barrier' : 'orb'
                    }]);
                }

                // Move & Check Collision
                setObstacles(prev => {
                    const next = prev.map(ob => ({ ...ob, y: ob.y + 1.5 })).filter(ob => ob.y < 110);
                    return next;
                });

            }, 50);
            return () => clearInterval(gameLoop);
        }
    }, [stage, isQuizActive]);

    // Collision Check for Tunnel separate ref hook to avoid closure staleness
    const playerPosRef = useRef(playerPos);
    useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);

    useEffect(() => {
        if (stage === 3 && !isQuizActive) {
            const checkCollision = setInterval(() => {
                setObstacles(prev => {
                    let hitBarrier = false;
                    const kept = prev.filter(ob => {
                        if (ob.y > 80 && ob.y < 95 && Math.abs(ob.x - playerPosRef.current) < 10) {
                            if (ob.type === 'barrier') {
                                playSound('error');
                                setScore(s => Math.max(0, s - 50));
                                hitBarrier = true;
                                return false; // Remove
                            } else if (ob.type === 'orb') {
                                playSound('success');
                                setScore(s => s + 50);
                                return false; // Collect
                            }
                        }
                        return true;
                    });
                    if (hitBarrier) {
                        setIsQuizActive(true);
                        // Pick random logic or just next logic is fine, let's just create pause behavior first
                    }
                    return kept;
                });
            }, 100);
            return () => clearInterval(checkCollision);
        }
    }, [stage, isQuizActive]);

    // Common Logic
    const nextStage = () => {
        setStage(s => (s + 1) as any);
        playSound('levelComplete');
    };

    // --- STAGE 1 LOGIC: CLASSIFICATION ---
    const handleEntityDrop = (targetInfo: 'material' | 'consciousness', entityStr?: any) => {
        // Support both drag (state) and click (direct arg)
        const currentEntity = entityStr || draggedEntity;

        if (!currentEntity) return;

        playSound('click');
        const isCorrect = currentEntity.type === 'material'; // In this game, we only collect MATTER into the vortex

        // Logic specifically designed: Drop MATTER into Vortex. Drop CONSCIOUSNESS -> Error.
        if (targetInfo === 'material') {
            if (isCorrect) {
                playSound('success');
                addLog(`Chính xác: '${currentEntity.name}' là Vật chất.`, 'success');
                setScore(s => s + 100);
                setEntities(prev => prev.filter(e => e.id !== currentEntity.id));
                setStage1Progress(p => p + 1);
            } else {
                playSound('error');
                addLog(`SAI: '${currentEntity.name}' là Ý thức, không thể tồn tại độc lập!`, 'error');
                setScore(s => Math.max(0, s - 50));
            }
        }
        setDraggedEntity(null);

        // Check completion of Stage 1
        const remainingMaterial = entities.filter(e => e.type === 'material').length;
        // Check if we just removed the last one (using currentEntity to check what we removed basically, or just re-check state logic carefully)
        const nextRemaining = isCorrect ? remainingMaterial - 1 : remainingMaterial;

        if (nextRemaining <= 0) {
            setTimeout(() => {
                addLog("Hoàn thành Giai đoạn 1: Phân loại Vật chất.", 'info');
                nextStage();
            }, 1000);
        }
    };

    // --- STAGE 2 LOGIC: MOTION FORMS ---
    const handleMotionDrop = (levelIndex: number) => { // 0 to 4
        if (!draggedMotionItem) return;

        // Check if correct level
        // levelIndex 0 -> mechanical (level 1)
        // ...
        // levelIndex 4 -> social (level 5)

        const targetType = MOTION_FORMS[levelIndex].id;
        if (draggedMotionItem.type === targetType) {
            playSound('success');
            addLog(`Đúng: ${draggedMotionItem.label} thuộc ${MOTION_FORMS[levelIndex].name}`, 'success');
            setScore(s => s + 150);

            // Update slots
            const newSlots = [...motionSlots];
            newSlots[levelIndex] = draggedMotionItem.label;
            setMotionSlots(newSlots);

            // Remove from available
            setAvailableMotionItems(prev => prev.filter(i => i.id !== draggedMotionItem.id));

            // Check complete
            if (availableMotionItems.length <= 1) {
                setTimeout(() => {
                    addLog("Hoàn thành Giai đoạn 2: Các hình thức vận động.", 'info');
                    nextStage();
                }, 1000);
            }
        } else {
            playSound('error');
            addLog(`Sai: ${draggedMotionItem.label} không thuộc cấp độ này.`, 'error');
            setScore(s => Math.max(0, s - 20));
        }
        setDraggedMotionItem(null);
    };

    // --- STAGE 3 LOGIC: QUIZ ---
    // --- STAGE 3 LOGIC: QUIZ (Now Penalty) ---
    const handleQuizAnswer = (optionIdx: number) => {
        if (quizFeedback) return; // Wait 

        const currentQ = QUIZ_DATA[currentQuizIdx];
        const isCorrect = optionIdx === currentQ.correct;

        if (isCorrect) {
            playSound('success');
            setScore(s => s + 50); // Recuperate some points
            setQuizFeedback({ isCorrect: true, text: "Chính xác! " + currentQ.explanation });
        } else {
            playSound('error');
            setQuizFeedback({ isCorrect: false, text: "Chưa đúng. " + currentQ.explanation });
        }

        setTimeout(() => {
            setQuizFeedback(null);
            setIsQuizActive(false); // Resume game
            setCurrentQuizIdx(i => (i + 1) % QUIZ_DATA.length);
        }, 2000);
    };


    // --- RENDERING ---

    // 1. INTRO VIEW
    if (stage === 0) {
        return (
            <div className="h-full flex items-center justify-center p-8 bg-slate-950">
                <div className="max-w-2xl w-full bg-slate-900 border border-blue-500/30 rounded-2xl p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-blue-500/10">
                        <Atom size={40} className="text-blue-400 animate-spin-slow" />
                    </div>

                    <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider">
                        Module 1: Bản Thể Luận
                    </h2>

                    <div className="text-left bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4">
                        <h3 className="text-lg font-bold text-blue-400">Nội dung huấn luyện:</h3>
                        <ul className="space-y-3 text-slate-300">
                            <li className="flex items-start gap-3">
                                <span className="bg-blue-500/20 text-blue-400 px-2 rounded font-mono text-sm">01</span>
                                <span>Phân định Vật chất & Ý thức (Cẩn thận <strong>Hố Đen</strong>!)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="bg-green-500/20 text-green-400 px-2 rounded font-mono text-sm">02</span>
                                <span>Cảm nhận nhịp điệu <strong>Vận động</strong> của thế giới.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="bg-purple-500/20 text-purple-400 px-2 rounded font-mono text-sm">03</span>
                                <span>Du hành xuyên <strong>Không gian & Thời gian</strong>.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="bg-yellow-500/20 text-yellow-400 px-2 rounded font-mono text-sm">04</span>
                                <span>Hoàn thành và Tổng kết.</span>
                            </li>
                        </ul>
                    </div>

                    <p className="text-slate-500 italic text-sm">
                        "Vật chất là thực tại khách quan mang lại cho con người trong cảm giác..." - V.I.Lênin
                    </p>

                    <button
                        onClick={() => nextStage()}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                    >
                        BẮT ĐẦU HUẤN LUYỆN <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    // 2. STAGE 1: CLASSIFICATION
    if (stage === 1) {
        return (
            <div className="h-full flex flex-col p-4 md:p-6 space-y-2 md:space-y-4 bg-slate-950 relative overflow-hidden">
                <div className="flex justify-between items-start z-10 shrink-0">
                    <div>
                        <div className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-1">Giai đoạn 1/4</div>
                        <h2 className="text-xl md:text-2xl font-display text-white">Phân Loại Thực Tại</h2>
                        <p className="text-slate-400 text-xs md:text-sm">Kéo thẻ <span className="text-blue-400 font-bold">VẬT CHẤT</span> vào Vòng xoáy. Tránh <span className="text-purple-500 font-bold">HỐ ĐEN</span>!</p>
                    </div>
                </div>

                {/* Anti-Matter Traps (Blackholes) */}
                {blackholes.map(bh => (
                    <div
                        key={bh.id}
                        className="absolute w-16 h-16 rounded-full bg-black border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)] z-20 flex items-center justify-center animate-pulse"
                        style={{ left: `${bh.x}%`, top: `${bh.y}%`, transition: 'left 50ms linear, top 50ms linear' }}
                        onDragEnter={() => {
                            if (draggedEntity) {
                                playSound('error');
                                addLog(`CẢNH BÁO: ${draggedEntity.name} bị Hố đen Duy tâm nuốt chửng!`, 'error');
                                setScore(s => Math.max(0, s - 200));
                                setDraggedEntity(null); // Destroy entity
                                // Optionally remove from list or just reset drag
                            }
                        }}
                    >
                        <div className="w-full h-full rounded-full border border-purple-400/30 animate-[spin_3s_linear_infinite]" />
                        <div className="absolute inset-0 flex items-center justify-center text-[8px] text-purple-500 font-bold opacity-0 hover:opacity-100 transition-opacity">
                            HƯ VÔ
                        </div>
                    </div>
                ))}

                <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-8 items-center z-10 overflow-hidden">
                    {/* Source Items - Scrollable on mobile */}
                    <div className="w-full h-full overflow-y-auto pr-2 grid grid-cols-2 gap-2 md:gap-3 content-start">
                        {entities.map(item => (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={() => { setDraggedEntity(item); playSound('click'); }}
                                // onClick removed to enforce drag
                                className="bg-slate-800 border border-slate-700 p-3 md:p-4 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-slate-700 transition-all select-none active:scale-95 touch-manipulation"
                            >
                                <div className="flex items-center gap-2 mb-1 md:mb-2">
                                    {item.category === 'Vật lý' && <Zap size={14} className="text-cyan-400" />}
                                    {item.category === 'Tâm trí' && <Brain size={14} className="text-purple-400" />}
                                    {item.category === 'Xã hội' && <Globe size={14} className="text-green-400" />}
                                    <span className="text-[9px] md:text-[10px] uppercase text-slate-500 font-bold">{item.category}</span>
                                </div>
                                <div className="text-white font-bold text-sm md:text-base">{item.name}</div>
                                <div className="text-[10px] md:text-xs text-slate-500 mt-1 line-clamp-2 md:line-clamp-none leading-tight">{item.description}</div>
                            </div>
                        ))}
                        {entities.filter(e => e.type === 'material').length === 0 && (
                            <div className="col-span-2 text-center text-green-400 py-8 border-2 border-dashed border-slate-700 rounded-lg">
                                <CheckCircle className="mx-auto mb-2" />
                                Đã thu thập đủ vật chất!
                            </div>
                        )}
                    </div>

                    {/* Target Vortex - Fixed at bottom on mobile via flex logic */}
                    <div
                        className="shrink-0 w-full flex justify-center pb-4 lg:pb-0"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleEntityDrop('material')}
                    >
                        <div className={`
                            relative aspect-square w-48 h-48 md:w-80 md:h-80 lg:max-h-[400px] rounded-full border-2 flex items-center justify-center
                            transition-all duration-300
                            ${draggedEntity ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_50px_rgba(59,130,246,0.2)]' : 'border-slate-800 bg-slate-900/50'}
                        `}>
                            {/* Background Animation - Optimized for mobile performance */}
                            <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-[spin_10s_linear_infinite]" />
                            <div className="absolute inset-4 md:inset-8 rounded-full border border-cyan-500/20 animate-[spin_7s_linear_infinite_reverse]" />
                            <div className="absolute inset-8 md:inset-16 rounded-full border border-purple-500/20 animate-[spin_5s_linear_infinite]" />

                            <div className="text-center z-10 pointer-events-none">
                                <Atom size={32} className={`mx-auto mb-1 md:mb-2 text-blue-500 md:w-12 md:h-12 ${draggedEntity ? 'animate-bounce' : ''}`} />
                                <h3 className="text-sm md:text-xl font-display font-bold text-white tracking-widest">VÒNG XOÁY</h3>
                                <p className="text-[9px] md:text-xs text-slate-400 mt-1 max-w-[120px] md:max-w-[200px] mx-auto hidden md:block">
                                    Nơi thu nhận thực tại khách quan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 3. STAGE 2: ATOMIC DANCE RENDER
    if (stage === 2) {
        return (
            <div className="h-full flex flex-col p-4 md:p-6 bg-slate-950 relative overflow-hidden">
                <div className="z-10 bg-slate-950/50 backdrop-blur-sm p-2 rounded-lg sticky top-0 flex justify-between">
                    <div>
                        <div className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-1">Giai đoạn 2/4</div>
                        <h2 className="text-xl md:text-2xl font-display text-white animate-pulse">Vũ Điệu Nguyên Tử</h2>
                        <p className="text-slate-400 text-xs md:text-sm">Nhấn phím (1-5) hoặc Click đúng lúc Cấp độ vận động chạm vạch!</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-green-400">{collectedTypes.size}/5</div>
                        <div className="text-xs text-slate-500">MỤC TIÊU</div>
                    </div>
                </div>

                {/* Game Area */}
                <div className="flex-1 relative border-x-2 border-slate-800 mx-auto w-full max-w-3xl mt-4 bg-slate-900/20">
                    {/* Lanes / Grid */}
                    <div className="absolute inset-0 grid grid-rows-5 opacity-20 pointer-events-none">
                        {/* Visual lines maybe? */}
                    </div>

                    {/* Threshold Line */}
                    <div className="absolute bottom-[15%] left-0 right-0 h-16 border-y-2 border-green-500/50 bg-green-500/10 flex items-center justify-center">
                        <span className="text-green-500/30 font-bold text-4xl uppercase tracking-[1em]">HIT ZONE</span>
                    </div>

                    {/* Falling Items */}
                    {fallingItems.map(item => (
                        <div
                            key={item.id}
                            className={`absolute left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg border-2 font-bold shadow-lg transition-transform
                                ${item.hit ? 'scale-150 opacity-0' : 'scale-100'}
                                ${item.y > 95 ? 'bg-red-500/50 border-red-500' : 'bg-slate-800 border-blue-400'}
                            `}
                            style={{ top: `${item.y}%` }}
                        >
                            {item.item.label}
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="h-32 grid grid-cols-5 gap-2 mt-4">
                    {MOTION_FORMS.map((form, idx) => (
                        <button
                            key={form.id}
                            onClick={() => handleRhythmHit(idx)}
                            className="flex flex-col items-center justify-center bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 active:bg-blue-600 active:scale-95 transition-all group"
                        >
                            <div className="p-2 bg-slate-900 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                {form.icon}
                            </div>
                            <div className="text-xs text-slate-500 font-bold uppercase">Level {form.level}</div>
                            <div className="text-xs md:text-sm font-bold text-white text-center">{form.name}</div>
                            <div className="mt-1 text-[10px] text-slate-600 font-mono hidden md:block">Phím {idx + 1}</div>
                        </button>
                    ))}
                </div>
            </div >
        )
    }

    // 4. STAGE 3: SPACE-TIME TUNNEL (Runner) (and Quiz Penalty)
    if (stage === 3) {
        return (
            <div
                className={`h-full flex flex-col items-center justify-center bg-black relative overflow-hidden ${isQuizActive ? 'cursor-auto' : 'cursor-none'}`}
                onMouseMove={(e) => {
                    // Calculate % X based on container width
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    setPlayerPos(Math.min(95, Math.max(5, x)));
                }}
                onTouchMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
                    setPlayerPos(Math.min(95, Math.max(5, x)));
                }}
            >
                {/* HUD */}
                <div className="absolute top-4 left-4 right-4 flex justify-between z-20 pointer-events-none">
                    <div className="bg-slate-900/50 p-2 rounded border border-blue-500/30">
                        <div className="text-xs text-blue-400 font-bold">THỜI GIAN</div>
                        <div className="text-2xl font-mono text-white">{(TUNNEL_DURATION - tunnelTime).toFixed(1)}s</div>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded border border-yellow-500/30">
                        <div className="text-xs text-yellow-500 font-bold">ĐIỂM</div>
                        <div className="text-2xl font-mono text-white">{score}</div>
                    </div>
                </div>

                {/* Tunnel Visuals (Perspective lines) */}
                <div className="absolute inset-0 z-0 opacity-50">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] border-[100px] border-blue-900/20 rounded-full animate-[spin_4s_linear_infinite]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] border-[50px] border-purple-900/20 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
                    {/* Speed lines */}
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-ping"
                            style={{
                                animationDuration: `${Math.random() * 1 + 0.5}s`,
                                transform: `rotate(${Math.random() * 360}deg) translateX(${Math.random() * 500}px)`
                            }}
                        ></div>
                    ))}
                </div>

                {/* Obstacles & Orbs */}
                {obstacles.map(ob => (
                    <div
                        key={ob.id}
                        className={`absolute w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform
                            ${ob.type === 'barrier' ? 'bg-red-500 border-2 border-red-400 animate-pulse' : 'bg-green-400 border-2 border-white animate-bounce'}
                        `}
                        style={{ left: `${ob.x}%`, top: `${ob.y}%`, transform: `translate(-50%, -50%) scale(${0.5 + (ob.y / 100)})` }}
                    >
                        {ob.type === 'barrier' ? <X size={24} className="text-white" /> : <Atom size={24} className="text-white spin" />}
                    </div>
                ))}

                {/* Player Ship */}
                <div
                    className="absolute bottom-10 w-16 h-16 z-30 transition-all duration-75 ease-out"
                    style={{ left: `${playerPos}%`, transform: 'translateX(-50%)' }}
                >
                    <div className="w-full h-full bg-blue-500 rounded-full blur-md absolute opacity-50 animate-pulse"></div>
                    <Clock size={48} className="text-white relative z-10 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                    {/* Engine trails */}
                    <div className="absolute top-full left-1/4 w-1 h-8 bg-blue-400 blur-sm"></div>
                    <div className="absolute top-full right-1/4 w-1 h-8 bg-blue-400 blur-sm"></div>
                </div>

                <div className="absolute bottom-4 text-center text-slate-500 text-xs animate-pulse pointer-events-none">
                    Di chuyển chuột để né chướng ngại vật (Đỏ) và thu thập Vật chất (Xanh)
                </div>

                {isQuizActive && (
                    <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 cursor-auto pointer-events-auto">
                            <h3 className="text-xl font-bold text-red-400 mb-4 uppercase flex items-center gap-2">
                                <ShieldAlert /> Cảnh báo va chạm!
                            </h3>
                            <p className="text-slate-300 mb-6 font-display text-lg">{QUIZ_DATA[currentQuizIdx].question}</p>
                            <div className="grid grid-cols-1 gap-3">
                                {QUIZ_DATA[currentQuizIdx].options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); handleQuizAnswer(idx); }}
                                        disabled={!!quizFeedback}
                                        className={`
                                            text-left p-3 md:p-4 rounded-xl border transition-all flex items-center gap-4
                                            ${quizFeedback && idx === QUIZ_DATA[currentQuizIdx].correct ? 'bg-green-500/20 border-green-500 text-green-100' : ''}
                                            ${quizFeedback && idx !== QUIZ_DATA[currentQuizIdx].correct && quizFeedback.isCorrect === false ? 'opacity-50' : ''}
                                            ${!quizFeedback ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' : ''}
                                        `}
                                    >
                                        <span className="font-medium">{opt}</span>
                                    </button>
                                ))}
                            </div>
                            {quizFeedback && (
                                <div className={`mt-4 p-3 rounded text-center font-bold ${quizFeedback.isCorrect ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                                    {quizFeedback.text}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 5. SUMMARY (Renumbered to 4 actually in render check to match)
    if (stage === 4) {
        return (
            <div className="h-full flex items-center justify-center p-6 bg-slate-950">
                <div className="max-w-md w-full bg-slate-900 border border-yellow-500 rounded-2xl p-8 shadow-[0_0_100px_rgba(234,179,8,0.2)] text-center animate-in zoom-in">
                    <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-yellow-500/10">
                        <Trophy size={48} className="text-yellow-400" />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2">Hoàn Thành Module!</h2>
                    <p className="text-slate-400 mb-8">Bạn đã nắm vững các nguyên lý cơ bản về Vật chất và Vận động.</p>

                    <div className="bg-slate-800 p-4 rounded-xl mb-8 flex justify-between items-center px-8">
                        <span className="text-slate-400 uppercase text-sm font-bold">Tổng Điểm XP</span>
                        <span className="text-3xl font-mono font-bold text-yellow-500">{score}</span>
                    </div>

                    <button
                        onClick={() => onComplete(score)}
                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-bold py-4 rounded-xl transition-colors text-lg"
                    >
                        TIẾP TỤC HÀNH TRÌNH
                    </button>
                </div>
            </div>
        );
    }
    return null;
};