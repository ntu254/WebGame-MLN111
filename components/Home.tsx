import React from 'react';
import { Play, BookOpen, Brain, Zap, Building2, ArrowRight, Star, Shield, Users } from 'lucide-react';

interface HomeProps {
    onStart: (level: number) => void;
}

export const Home: React.FC<HomeProps> = ({ onStart }) => {
    return (
        <div className="h-full w-full overflow-y-auto bg-slate-950 p-4 md:p-12 scrollbar-thin scrollbar-thumb-slate-800">
            <div className="max-w-6xl mx-auto space-y-12 md:space-y-16 animate-in fade-in duration-700 slide-in-from-bottom-4">

                {/* Hero Section */}
                <div className="text-center space-y-4 md:space-y-6 relative py-8 md:py-12">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[400px] bg-blue-500/10 blur-[60px] md:blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs md:text-sm font-medium mb-2 md:mb-4">
                        <Star size={14} className="fill-blue-400" />
                        <span>Phiên bản Giáo dục 2.0</span>
                    </div>

                    <h1 className="text-3xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight leading-tight">
                        NHÀ TƯ DUY TRẺ<br />
                        <span className="text-blue-500">CỖ MÁY BIỆN CHỨNG</span>
                    </h1>

                    <p className="text-sm md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed px-2">
                        Chào mừng bạn đến với hệ thống mô phỏng tư duy Triết học Mác - Lênin.
                        Nơi bạn không chỉ học lý thuyết, mà còn trực tiếp <span className="text-white font-bold">trải nghiệm</span> và <span className="text-white font-bold">vận dụng</span> các quy luật biện chứng để giải quyết vấn đề.
                    </p>

                    <div className="flex flex-col md:flex-row justify-center gap-3 pt-4 px-4">
                        <button
                            onClick={() => onStart(1)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold text-base md:text-lg transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 group w-full md:w-auto"
                        >
                            <Play size={20} className="fill-white group-hover:scale-110 transition-transform" />
                            KHỞI ĐỘNG CỖ MÁY
                        </button>
                        <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-lg font-bold text-base md:text-lg transition-all border border-slate-700 hover:border-slate-500 flex items-center justify-center gap-2 w-full md:w-auto">
                            <BookOpen size={20} />
                            HƯỚNG DẪN
                        </button>
                    </div>
                </div>

                {/* Levels Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                    {/* Level 1 Card */}
                    <div className="group relative bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-2">
                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                            <Zap size={24} className="text-white md:w-8 md:h-8" />
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Cấp độ 1: Vật Chất</h3>
                        <p className="text-blue-400 font-mono text-xs md:text-sm mb-4 uppercase tracking-wider">Phân loại Thực tại</p>

                        <p className="text-slate-400 mb-6 text-xs md:text-sm leading-relaxed">
                            Bước vào Vòng xoáy Vật chất. Nhiệm vụ của bạn là phân định rõ ràng giữa Vật chất (thực tại khách quan) và Ý thức (phản ánh chủ quan). Bản lĩnh của nhà tư duy bắt đầu từ việc nhìn nhận đúng sự thật.
                        </p>

                        <button
                            onClick={() => onStart(1)}
                            className="w-full py-3 bg-slate-800 group-hover:bg-blue-600 text-slate-300 group-hover:text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            Truy cập Module <ArrowRight size={16} />
                        </button>
                    </div>

                    {/* Level 2 Card */}
                    <div className="group relative bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-2">
                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                            <Brain size={24} className="text-white md:w-8 md:h-8" />
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Cấp độ 2: Ý Thức</h3>
                        <p className="text-purple-400 font-mono text-xs md:text-sm mb-4 uppercase tracking-wider">Nguồn gốc Tư duy</p>

                        <p className="text-slate-400 mb-6 text-xs md:text-sm leading-relaxed">
                            Khai mở Cây Ý Thức. Truy tìm nguồn gốc ra đời của ý thức từ thủa sơ khai đến văn minh hiện đại. Lao động, Ngôn ngữ và Bộ óc con người đóng vai trò gì?
                        </p>

                        <button
                            onClick={() => onStart(2)}
                            className="w-full py-3 bg-slate-800 group-hover:bg-purple-600 text-slate-300 group-hover:text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            Truy cập Module <ArrowRight size={16} />
                        </button>
                    </div>

                    {/* Level 3 Card */}
                    <div className="group relative bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-2">
                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-cyan-500 to-green-500 rounded-xl flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-500">
                            <Building2 size={24} className="text-white md:w-8 md:h-8" />
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Cấp độ 3: Biện Chứng</h3>
                        <p className="text-cyan-400 font-mono text-xs md:text-sm mb-4 uppercase tracking-wider">Xã hội & Vận động</p>

                        <p className="text-slate-400 mb-6 text-xs md:text-sm leading-relaxed">
                            Thử thách tối thượng: Xây dựng một xã hội thịnh vượng dựa trên nền tảng Duy vật Biện chứng. Cân bằng giữa Cơ sở vật chất và Kiến trúc thượng tầng, giải quyết mâu thuẫn để phát triển.
                        </p>

                        <button
                            onClick={() => onStart(3)}
                            className="w-full py-3 bg-slate-800 group-hover:bg-cyan-600 text-slate-300 group-hover:text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            Truy cập Module <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Features / Footer Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-8 md:pt-12 border-t border-slate-800/50">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-900/30">
                        <div className="p-2 bg-slate-800 rounded-lg text-yellow-400 shrink-0">
                            <Star size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-1 text-sm md:text-base">Xếp hạng & Thành tích</h4>
                            <p className="text-xs text-slate-400">Tích lũy điểm XP qua từng cấp độ và cạnh tranh trên bảng xếp hạng toàn server.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-900/30">
                        <div className="p-2 bg-slate-800 rounded-lg text-purple-400 shrink-0">
                            <Brain size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-1 text-sm md:text-base">Hỗ trợ bởi AI</h4>
                            <p className="text-xs text-slate-400">Tích hợp Gemini & OpenRouter để giải đáp mọi thắc mắc triết học của bạn trong thời gian thực.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-900/30">
                        <div className="p-2 bg-slate-800 rounded-lg text-green-400 shrink-0">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-1 text-sm md:text-base">Chuẩn kiến thức</h4>
                            <p className="text-xs text-slate-400">Nội dung được biên soạn bám sát giáo trình Triết học Mác - Lênin hiện hành.</p>
                        </div>
                    </div>
                </div>

                {/* AI Appendix Section */}
                <div className="mt-8 md:mt-16 p-6 md:p-8 bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-2xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/20 rounded-lg shrink-0">
                                <Brain size={20} className="text-blue-400 md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-lg md:text-xl font-display font-bold text-white uppercase tracking-wider">Phụ Lục: Trí Tuệ Nhân Tạo Trong Hệ Thống</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            <div className="space-y-2 md:space-y-3">
                                <h4 className="text-blue-300 font-bold flex items-center gap-2 text-sm md:text-base">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                    Tra Cứu Khái Niệm
                                </h4>
                                <p className="text-slate-400 text-xs md:text-sm leading-relaxed text-justify">
                                    Sử dụng <strong>LLM (Large Language Models)</strong> để phân tích và giải thích các khái niệm triết học trừu tượng một cách dễ hiểu, chính xác theo ngữ cảnh câu hỏi của người học.
                                </p>
                            </div>

                            <div className="space-y-2 md:space-y-3">
                                <h4 className="text-purple-300 font-bold flex items-center gap-2 text-sm md:text-base">
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                                    Cố Vấn Chiến Lược (Level 3)
                                </h4>
                                <p className="text-slate-400 text-xs md:text-sm leading-relaxed text-justify">
                                    AI đóng vai trò là "Cố vấn ảo", phân tích các chỉ số Sinh học, Kinh tế, Văn hóa của xã hội người chơi xây dựng để đưa ra lời khuyên phát triển cân bằng.
                                </p>
                            </div>

                            <div className="space-y-2 md:space-y-3">
                                <h4 className="text-green-300 font-bold flex items-center gap-2 text-sm md:text-base">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                    Hệ Thống Phản Hồi
                                </h4>
                                <p className="text-slate-400 text-xs md:text-sm leading-relaxed text-justify">
                                    Tự động đánh giá câu trả lời của người học, cung cấp phản hồi chi tiết về lý do đúng/sai dựa trên các nguyên lý của Chủ nghĩa Duy vật Biện chứng.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center pt-8 text-slate-600 text-[10px] md:text-xs font-mono">
                    <p>Dự án mã nguồn mở phục vụ cộng đồng sinh viên Việt Nam</p>
                    <p>© 2024 Cỗ Máy Biện Chứng. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};
