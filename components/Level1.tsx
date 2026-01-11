import React, { useState, useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { playSound } from '../services/soundService';
import { checkClassificationWithAI } from '../services/geminiService';
import {
    Atom, Brain, Zap, Radio, CircleHelp, Info, X, Trophy,
    BarChart3, CheckCircle, ArrowRight, Dna, Activity,
    Globe, Flame, Layers, Clock, Repeat, MousePointer2
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
    const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4>(0); // 0: Intro, 1: Classification, 2: Motion, 3: Quiz, 4: Summary
    const [score, setScore] = useState(0);
    const [showHelp, setShowHelp] = useState(false);

    // Stage 1 State
    const [entities, setEntities] = useState(CLASSIFICATION_DATA);
    const [draggedEntity, setDraggedEntity] = useState<MatterEntity | null>(null);
    const [stage1Progress, setStage1Progress] = useState(0);

    // Stage 2 State
    const [draggedMotionItem, setDraggedMotionItem] = useState<{ id: string, type: string, label: string } | null>(null);
    const [motionSlots, setMotionSlots] = useState<(string | null)[]>([null, null, null, null, null]); // 5 levels
    const [availableMotionItems, setAvailableMotionItems] = useState(DROPPABLE_ITEMS);

    // Stage 3 State
    const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
    const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean, text: string } | null>(null);

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
    const handleQuizAnswer = (optionIdx: number) => {
        if (quizFeedback) return; // Wait 

        const currentQ = QUIZ_DATA[currentQuizIdx];
        const isCorrect = optionIdx === currentQ.correct;

        if (isCorrect) {
            playSound('success');
            setScore(s => s + 200);
            setQuizFeedback({ isCorrect: true, text: "Chính xác! " + currentQ.explanation });
        } else {
            playSound('error');
            setQuizFeedback({ isCorrect: false, text: "Chưa đúng. " + currentQ.explanation });
        }

        setTimeout(() => {
            setQuizFeedback(null);
            if (currentQuizIdx < QUIZ_DATA.length - 1) {
                setCurrentQuizIdx(i => i + 1);
            } else {
                nextStage(); // Finish
            }
        }, 3000);
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
                                <span>Phân định ranh giới giữa <strong>Vật chất</strong> và <strong>Ý thức</strong>.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="bg-purple-500/20 text-purple-400 px-2 rounded font-mono text-sm">02</span>
                                <span>Sắp xếp thang bậc <strong>Vận động</strong> của vật chất.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="bg-green-500/20 text-green-400 px-2 rounded font-mono text-sm">03</span>
                                <span>Nắm vững Không gian, Thời gian và Tính thống nhất vật chất.</span>
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
                        <div className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-1">Giai đoạn 1/3</div>
                        <h2 className="text-xl md:text-2xl font-display text-white">Phân Loại Thực Tại</h2>
                        <p className="text-slate-400 text-xs md:text-sm">Kéo hoặc <span className="text-green-400 font-bold">Chạm</span> vào thẻ <span className="text-blue-400 font-bold">VẬT CHẤT</span>. Bỏ qua Ý Thức.</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-8 items-center z-10 overflow-hidden">
                    {/* Source Items - Scrollable on mobile */}
                    <div className="w-full h-full overflow-y-auto pr-2 grid grid-cols-2 gap-2 md:gap-3 content-start">
                        {entities.map(item => (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={() => { setDraggedEntity(item); playSound('click'); }}
                                onClick={() => handleEntityDrop('material', item)} // Tap to submit
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

    // 3. STAGE 2: FORMS OF MOTION
    if (stage === 2) {
        return (
            <div className="h-full flex flex-col p-4 md:p-6 space-y-4 bg-slate-950 relative overflow-hidden">
                <div className="z-10 bg-slate-950/50 backdrop-blur-sm p-2 rounded-lg sticky top-0">
                    <div className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-1">Giai đoạn 2/3</div>
                    <h2 className="text-xl md:text-2xl font-display text-white">Các Hình Thức Vận Động</h2>
                    <p className="text-slate-400 text-xs md:text-sm">Sắp xếp các ví dụ vào đúng thang bậc vận động (Từ thấp đến cao).</p>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-8 z-10 overflow-hidden">
                    {/* Items Pool */}
                    <div className="w-full lg:w-1/3 h-1/3 lg:h-full space-y-2 lg:space-y-3 overflow-y-auto pr-2">
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 lg:mb-4">Ví Dụ Cần Xếp Hạng</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                            {availableMotionItems.map(item => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={() => { setDraggedMotionItem(item); playSound('click'); }}
                                    className="bg-slate-800 p-3 rounded border border-slate-700 flex items-center gap-3 cursor-grab hover:bg-slate-700 hover:border-white transition-all shadow-md touch-none"
                                >
                                    <MousePointer2 size={16} className="text-slate-500 shrink-0" />
                                    <span className="font-bold text-slate-200 text-sm">{item.label}</span>
                                </div>
                            ))}
                        </div>
                        {availableMotionItems.length === 0 && (
                            <div className="text-center text-green-400 py-8 bg-slate-900/50 rounded-lg">
                                <CheckCircle className="mx-auto mb-2" />
                                Hoàn thành sắp xếp!
                            </div>
                        )}
                    </div>

                    {/* Hierarchy Ladder */}
                    <div className="flex-1 flex flex-col-reverse justify-between gap-1 lg:gap-2 relative bg-slate-900/30 p-2 lg:p-4 rounded-xl border border-slate-800 overflow-y-auto">
                        {/* Background Arrow */}
                        <div className="absolute right-4 top-4 bottom-4 w-1 bg-gradient-to-t from-slate-800 via-blue-900 to-purple-500 rounded-full hidden lg:block" />

                        {MOTION_FORMS.map((form, idx) => (
                            <div
                                key={form.id}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleMotionDrop(idx)}
                                className={`
                                    flex-1 flex items-center gap-2 lg:gap-4 px-3 lg:px-6 py-2 rounded-lg border-2 transition-all relative
                                    ${motionSlots[idx] ? 'border-green-500/50 bg-green-900/10' : 'border-dashed border-slate-700 bg-slate-900/50 hover:border-blue-500 hover:bg-slate-800'}
                                `}
                            >
                                <div className={`p-1.5 lg:p-2 rounded-full shrink-0 ${motionSlots[idx] ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                                    {React.cloneElement(form.icon as React.ReactElement, { size: 16 })}
                                </div>
                                <div className="w-24 lg:w-32 shrink-0">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold">Mức độ {form.level}</div>
                                    <div className="font-bold text-white text-sm lg:text-base">{form.name}</div>
                                </div>

                                {/* Slot Content */}
                                <div className="flex-1 h-full flex items-center justify-start lg:justify-center">
                                    {motionSlots[idx] ? (
                                        <div className="bg-green-500 text-slate-900 px-2 lg:px-4 py-1 lg:py-2 rounded font-bold shadow-lg animate-in fade-in zoom-in text-xs lg:text-sm truncate max-w-full">
                                            {motionSlots[idx]}
                                        </div>
                                    ) : (
                                        <div className="text-slate-600 text-[10px] lg:text-sm italic">Thả ví dụ vào đây</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // 4. STAGE 3: QUIZ
    if (stage === 3) {
        const currentQ = QUIZ_DATA[currentQuizIdx];
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-950">
                <div className="max-w-3xl w-full text-center mb-8">
                    <div className="text-xs text-green-400 font-bold uppercase tracking-widest mb-2">Giai đoạn 3/3: Lý Thuyết Nâng Cao</div>
                    <h2 className="text-3xl font-display text-white">Kiểm Tra Nhận Thức</h2>
                    <div className="w-full bg-slate-800 h-1 mt-4 rounded-full">
                        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${((currentQuizIdx) / QUIZ_DATA.length) * 100}%` }} />
                    </div>
                </div>

                <div className="w-full max-w-3xl">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed">
                            {currentQ.question}
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            {currentQ.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuizAnswer(idx)}
                                    disabled={!!quizFeedback}
                                    className={`
                                        text-left p-4 rounded-xl border transition-all flex items-center gap-4
                                        ${quizFeedback && idx === currentQ.correct ? 'bg-green-500/20 border-green-500 text-green-100' : ''}
                                        ${quizFeedback && idx !== currentQ.correct && quizFeedback.isCorrect === false ? 'opacity-50' : ''}
                                        ${!quizFeedback ? 'bg-slate-800 border-slate-700 hover:bg-blue-600 hover:border-blue-500 hover:text-white text-slate-300' : ''}
                                    `}
                                >
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0
                                         ${!quizFeedback ? 'border-slate-600 text-slate-500 group-hover:border-white group-hover:text-white' : ''}
                                         ${quizFeedback && idx === currentQ.correct ? 'bg-green-500 border-green-500 text-slate-900' : ''}
                                     `}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className="font-medium text-lg">{opt}</span>
                                </button>
                            ))}
                        </div>

                        {/* Feedback Overlay */}
                        {quizFeedback && (
                            <div className={`absolute bottom-0 left-0 right-0 p-4 text-center font-bold animate-in slide-in-from-bottom-full duration-300 ${quizFeedback.isCorrect ? 'bg-green-600/90 text-white' : 'bg-red-600/90 text-white'}`}>
                                {quizFeedback.text}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // 5. SUMMARY
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
};