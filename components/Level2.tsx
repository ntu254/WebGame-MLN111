import React, { useState } from 'react';
import { SkillNode, LogEntry } from '../types';
import { generateSkillNodeQuestionWithFallback as generateSkillNodeQuestion } from '../services/aiService';
import { playSound } from '../services/soundService';
import { Brain, Pickaxe, Eye, Microscope, Lock, CheckCircle, Unlock, CircleHelp, X, Trophy, BarChart3 } from 'lucide-react';

interface Level2Props {
    onComplete: (score: number) => void;
    addLog: (msg: string, type: LogEntry['type']) => void;
}

const INITIAL_NODES: SkillNode[] = [
    { id: 'root', label: 'Ý Thức', x: 50, y: 50, status: 'unlocked', parents: [], description: 'Khái niệm trung tâm của tư duy con người' },
    { id: 'brain', label: 'Bộ Óc', x: 30, y: 30, status: 'unlocked', parents: ['root'], description: 'Cơ quan vật chất của ý thức' },
    { id: 'labor', label: 'Lao động', x: 70, y: 30, status: 'unlocked', parents: ['root'], description: 'Hoạt động cải tạo thế giới tự nhiên' },
    { id: 'reflect', label: 'Phản Ánh', x: 20, y: 60, status: 'locked', parents: ['brain'], description: 'Thuộc tính chung của vật chất' },
    { id: 'language', label: 'Ngôn ngữ', x: 80, y: 60, status: 'locked', parents: ['labor'], description: 'Vỏ vật chất của tư duy' },
];

export const Level2: React.FC<Level2Props> = ({ onComplete, addLog }) => {
    const [nodes, setNodes] = useState<SkillNode[]>(INITIAL_NODES);
    const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState<{ question: string, options: string[], correctAnswerIndex: number } | null>(null);
    const [showSummary, setShowSummary] = useState(false);
    const [quizHistory, setQuizHistory] = useState<{
        nodeLabel: string;
        question: string;
        correctAnswer: string;
        wasCorrect: boolean;
        attempts: number;
    }[]>([]);

    const toggleHelp = () => {
        playSound('click');
        setShowHelp(!showHelp);
    };

    const handleNodeClick = async (node: SkillNode) => {
        playSound('click');
        if (node.status === 'locked') {
            addLog("Nút này chưa được mở khóa. Hoàn thành nút cha trước.", 'error');
            playSound('error');
            return;
        }
        if (node.status === 'completed') {
            addLog("Bạn đã thành thạo kiến thức này.", 'info');
            return;
        }

        setSelectedNode(node);
        setLoading(true);
        setModalOpen(true);

        const quiz = await generateSkillNodeQuestion(node.label);
        setCurrentQuiz(quiz);
        setLoading(false);
    };

    const handleAnswer = (index: number) => {
        if (!currentQuiz || !selectedNode) return;

        if (index === currentQuiz.correctAnswerIndex) {
            playSound('success');
            addLog(`Chính xác! Đã mở khóa kiến thức: ${selectedNode.label}`, 'success');

            // Save to quiz history
            setQuizHistory(prev => [...prev, {
                nodeLabel: selectedNode.label,
                question: currentQuiz.question,
                correctAnswer: currentQuiz.options[currentQuiz.correctAnswerIndex],
                wasCorrect: true,
                attempts: 1
            }]);

            // Unlock children
            const updatedNodes = nodes.map(n => {
                if (n.id === selectedNode.id) return { ...n, status: 'completed' as const };
                if (n.parents.includes(selectedNode.id)) return { ...n, status: 'unlocked' as const };
                return n;
            });
            setNodes(updatedNodes);
            setModalOpen(false);

            // Check if all completed
            if (updatedNodes.filter(n => n.status === 'completed').length === nodes.length) {
                setTimeout(() => setShowSummary(true), 500);
            }
        } else {
            playSound('error');
            addLog("Sai rồi. Hãy suy nghĩ theo quan điểm duy vật biện chứng.", 'error');
        }
    };

    const getNodeIcon = (id: string) => {
        switch (id) {
            case 'root': return <Brain />;
            case 'labor': return <Pickaxe />;
            case 'brain': return <Microscope />;
            case 'reflect': return <Eye />;
            default: return <Brain />;
        }
    };

    return (
        <div className="relative w-full h-full bg-slate-950 p-6 overflow-hidden">
            <div className="absolute top-6 left-6 z-10 flex gap-4 items-start">
                <div>
                    <h2 className="text-2xl font-display text-white">Cấp độ 2: Cây Ý Thức</h2>
                    <p className="text-slate-400 text-sm">Mở khóa các nút để hiểu về nguồn gốc tư duy con người.</p>
                </div>
                <button onClick={toggleHelp} className="p-2 bg-slate-800 border border-slate-600 rounded-full text-slate-400 hover:text-white hover:border-blue-500 transition-all" title="Hướng dẫn">
                    <CircleHelp size={20} />
                </button>
            </div>

            {/* Help Modal */}
            {showHelp && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-blue-500 rounded-lg max-w-md w-full p-6 shadow-2xl relative">
                        <button onClick={toggleHelp} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                        <h3 className="text-xl font-display text-blue-400 mb-4 uppercase tracking-wider border-b border-slate-800 pb-2">Hệ thống Kích hoạt Noron</h3>
                        <div className="space-y-4 text-sm text-slate-300">
                            <div>
                                <strong className="text-white block mb-1">🎯 Nhiệm vụ:</strong>
                                <p>Khai mở toàn bộ <span className="text-blue-400 font-bold">Cây Ý Thức</span> bằng cách chứng minh sự hiểu biết về nguồn gốc của nó.</p>
                            </div>
                            <div>
                                <strong className="text-white block mb-1">🎮 Cách chơi:</strong>
                                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                                    <li>Nhấp vào các Nút (Node) đang phát sáng (đã mở khóa).</li>
                                    <li>Trả lời đúng câu hỏi trắc nghiệm do AI đưa ra.</li>
                                    <li>Mở khóa dần từ gốc đến ngọn theo logic biện chứng.</li>
                                </ul>
                            </div>
                            <div className="bg-blue-900/20 p-3 rounded border border-blue-900/50 text-xs italic">
                                "Lao động là điều kiện cơ bản đầu tiên của toàn bộ đời sống loài người..." - Ph.Ăngghen
                            </div>
                        </div>
                        <button
                            onClick={toggleHelp}
                            className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded transition-colors"
                        >
                            BẮT ĐẦU
                        </button>
                    </div>
                </div>
            )}

            {/* Drawing Area */}
            <div className="w-full h-full relative flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {nodes.map(node => {
                        return node.parents.map(parentId => {
                            const parent = nodes.find(n => n.id === parentId);
                            if (!parent) return null;
                            // Simple coordinate mapping (percent to px roughly) for demo
                            // In real app use a graph lib or precise calculations
                            return (
                                <line
                                    key={`${parentId}-${node.id}`}
                                    x1={`${parent.x}%`} y1={`${parent.y}%`}
                                    x2={`${node.x}%`} y2={`${node.y}%`}
                                    stroke={node.status === 'locked' ? '#334155' : '#3b82f6'}
                                    strokeWidth="2"
                                    strokeDasharray={node.status === 'locked' ? "5,5" : "0"}
                                />
                            );
                        });
                    })}
                </svg>

                {nodes.map(node => (
                    <div
                        key={node.id}
                        onClick={() => handleNodeClick(node)}
                        className={`
                    absolute transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                    hover:scale-110 z-20
                    ${node.status === 'locked' ? 'bg-slate-900 border-slate-700 text-slate-600 grayscale' :
                                node.status === 'completed' ? 'bg-blue-900/50 border-green-400 text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.3)]' :
                                    'bg-slate-800 border-blue-500 text-blue-400 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.3)]'}
                `}
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                        {node.status === 'locked' ? <Lock size={20} /> : node.status === 'completed' ? <CheckCircle size={24} /> : getNodeIcon(node.id)}
                        <span className="mt-1 text-[10px] font-bold tracking-wider bg-slate-950/80 px-2 rounded text-center">{node.label}</span>
                    </div>
                ))}
            </div>

            {/* Quiz Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-blue-500/50 rounded-xl p-6 max-w-lg w-full shadow-2xl relative">
                        <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                                <Unlock size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Mở khóa: {selectedNode?.label}</h3>
                                <p className="text-xs text-slate-400">YÊU CẦU: TRẢ LỜI ĐÚNG ĐỂ TIẾP TỤC</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p>Đang tải dữ liệu từ Cỗ máy...</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-slate-200 mb-6 italic">"{currentQuiz?.question}"</p>
                                <div className="space-y-3">
                                    {currentQuiz?.options.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(idx)}
                                            className="w-full text-left p-4 rounded-lg bg-slate-800 border border-slate-700 hover:border-blue-500 hover:bg-slate-700 transition-all text-sm group"
                                        >
                                            <span className="inline-block w-6 h-6 rounded bg-slate-900 text-center leading-6 text-slate-500 group-hover:text-blue-400 mr-3 text-xs border border-slate-700 font-mono">
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Summary Modal */}
            {showSummary && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-auto">
                    <div className="bg-slate-900 border border-green-500 rounded-xl p-6 max-w-2xl w-full shadow-2xl relative my-8">
                        <button onClick={() => { setShowSummary(false); onComplete(500); }} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>

                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-700">
                            <div className="p-3 bg-green-500/20 rounded-full">
                                <Trophy size={32} className="text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-green-400">🎉 Hoàn thành Cây Ý Thức!</h3>
                                <p className="text-slate-400">Bạn đã mở khóa toàn bộ kiến thức về nguồn gốc ý thức</p>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-slate-800 p-4 rounded-lg text-center">
                                <div className="text-3xl font-bold text-cyan-400">{quizHistory.length}</div>
                                <div className="text-xs text-slate-400">Câu hỏi hoàn thành</div>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-lg text-center">
                                <div className="text-3xl font-bold text-green-400">{quizHistory.filter(q => q.wasCorrect).length}</div>
                                <div className="text-xs text-slate-400">Trả lời đúng</div>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-lg text-center">
                                <div className="text-3xl font-bold text-yellow-400">500</div>
                                <div className="text-xs text-slate-400">Điểm nhận được</div>
                            </div>
                        </div>

                        {/* Questions Review */}
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                <BarChart3 size={16} /> Tổng kết câu hỏi
                            </h4>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {quizHistory.map((item, idx) => (
                                    <div key={idx} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">{item.nodeLabel}</span>
                                            <CheckCircle size={14} className="text-green-400" />
                                        </div>
                                        <p className="text-sm text-slate-300 mb-2">"{item.question}"</p>
                                        <p className="text-xs text-green-400">
                                            ✓ Đáp án đúng: <span className="text-white">{item.correctAnswer}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Key Concepts */}
                        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/50 mb-6">
                            <h4 className="text-sm font-bold text-blue-400 mb-2">📚 Kiến thức chốt:</h4>
                            <ul className="text-xs text-slate-300 space-y-1">
                                <li>• <strong>Ý thức</strong> là sự phản ánh thế giới khách quan vào bộ não người</li>
                                <li>• <strong>Bộ óc</strong> là cơ quan vật chất của ý thức</li>
                                <li>• <strong>Lao động</strong> là điều kiện quyết định sự hình thành ý thức</li>
                                <li>• <strong>Ngôn ngữ</strong> là vỏ vật chất của tư duy</li>
                                <li>• <strong>Phản ánh</strong> là thuộc tính chung của mọi vật chất</li>
                            </ul>
                        </div>

                        <button
                            onClick={() => { setShowSummary(false); onComplete(500); }}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-colors text-lg"
                        >
                            Tiếp tục → Cấp độ 3
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};