import React from 'react';
import { Play, BookOpen, Brain, Zap, Building2, ArrowRight, Star, Shield, Users, Lightbulb, Target, HeartHandshake } from 'lucide-react';

interface HomeProps {
    onStart: (level: number) => void;
}

export const Home: React.FC<HomeProps> = ({ onStart }) => {
    return (
        <div className="h-full w-full overflow-y-auto bg-slate-950 p-4 md:p-12 scrollbar-thin scrollbar-thumb-slate-800">
            <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in duration-700 slide-in-from-bottom-4">

                {/* Hero Section */}
                <div className="text-center space-y-6 relative py-12">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
                        <Star size={14} className="fill-blue-400" />
                        <span>Phiên bản Giáo dục Tương tác 2.0</span>
                    </div>

                    <h1 className="text-4xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight leading-tight">
                        NHÀ TƯ DUY TRẺ<br />
                        <span className="text-blue-500">CỖ MÁY BIỆN CHỨNG</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed px-4">
                        "Triết học không chỉ để giải thích thế giới, mà là để <span className="text-blue-400 font-bold">cải tạo</span> thế giới."
                    </p>

                    <div className="flex flex-col md:flex-row justify-center gap-4 pt-6 px-4">
                        <button
                            onClick={() => onStart(1)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-3 group w-full md:w-auto"
                        >
                            <Play size={24} className="fill-white group-hover:scale-110 transition-transform" />
                            KHỞI ĐỘNG HÀNH TRÌNH
                        </button>
                    </div>
                </div>

                {/* Section: Mục đích & Ý nghĩa */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Target className="text-red-500" />
                            Mục Đích Dự Án
                        </h2>
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-slate-300 leading-relaxed text-sm md:text-base">
                            <p className="mb-4">
                                Triết học Mác - Lênin thường bị coi là khô khan và trừu tượng. Dự án <strong>"Cỗ Máy Biện Chứng"</strong> ra đời với sứ mệnh:
                            </p>
                            <ul className="space-y-3 list-disc pl-5">
                                <li><strong className="text-white">Trực quan hóa:</strong> Biến các khái niệm "Vật chất", "Ý thức", "Biện chứng" thành hình ảnh và tương tác sinh động.</li>
                                <li><strong className="text-white">Học qua trải nghiệm (Gamification):</strong> Thay vì học thuộc lòng, bạn sẽ tự mình khám phá quy luật thông qua các thử thách.</li>
                                <li><strong className="text-white">Rèn luyện tư duy:</strong> Hình thành năng lực tư duy logic, nhìn nhận vấn đề đa chiều và khách quan.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <HeartHandshake className="text-green-500" />
                            Ứng Dụng Thực Tiễn
                        </h2>
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-slate-300 leading-relaxed text-sm md:text-base">
                            <p className="mb-4">
                                Không chỉ là điểm số trên lớp, tư duy biện chứng là công cụ sắc bén trong cuộc sống:
                            </p>
                            <ul className="space-y-3 list-disc pl-5">
                                <li><strong className="text-white">Giải quyết vấn đề:</strong> Phân tích nguyên nhân gốc rễ, nhìn thấy sự vận động và phát triển của sự việc.</li>
                                <li><strong className="text-white">Ra quyết định:</strong> Tránh chủ quan duy ý chí, luôn dựa trên thực tế khách quan.</li>
                                <li><strong className="text-white">Thích ứng:</strong> Hiểu rằng mọi thứ luôn thay đổi, giúp bạn linh hoạt và chủ động trước hoàn cảnh mới.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Section: Hướng dẫn chi tiết các cấp độ */}
                <div className="space-y-8 pt-8 border-t border-slate-800">
                    <h2 className="text-3xl font-bold text-white text-center mb-8">Lộ Trình Tư Duy (3 Cấp Độ)</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Level 1 Detail */}
                        <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Cấp 1: Thế Giới Quan Duy Vật</h3>
                            <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">Nhận diện Thực tại</p>
                            <div className="text-slate-400 text-sm space-y-3">
                                <p><strong>Nhiệm vụ:</strong> Phân loại chính xác các hiện tượng vào nhóm "Vật chất" hoặc "Ý thức".</p>
                                <p><strong>Bài học:</strong> Khắc sâu nguyên lý cơ bản: <em>"Vật chất có trước, ý thức có sau"</em>. Rèn luyện khả năng phân biệt giữa khách quan (sự thật) và chủ quan (suy nghĩ).</p>
                            </div>
                            <button onClick={() => onStart(1)} className="mt-6 w-full py-2 bg-slate-800 hover:bg-blue-600 rounded text-slate-300 hover:text-white font-bold text-sm transition-colors">Bắt đầu Cấp 1</button>
                        </div>

                        {/* Level 2 Detail */}
                        <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Brain size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Cấp 2: Nguồn Gốc Ý Thức</h3>
                            <p className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">Giải mã Tư duy</p>
                            <div className="text-slate-400 text-sm space-y-3">
                                <p><strong>Nhiệm vụ:</strong> Kết nối các yếu tố: Lao động, Ngôn ngữ, Bộ óc người để mở khóa sự ra đời của Ý thức.</p>
                                <p><strong>Bài học:</strong> Hiểu rõ nguồn gốc tự nhiên và nguồn gốc xã hội của ý thức. Ý thức không phải do thần thánh ban tặng, mà là kết quả của quá trình tiến hóa và lao động.</p>
                            </div>
                            <button onClick={() => onStart(2)} className="mt-6 w-full py-2 bg-slate-800 hover:bg-purple-600 rounded text-slate-300 hover:text-white font-bold text-sm transition-colors">Bắt đầu Cấp 2</button>
                        </div>

                        {/* Level 3 Detail */}
                        <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-green-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Building2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Cấp 3: Phép Biện Chứng</h3>
                            <p className="text-green-400 text-xs font-bold uppercase tracking-wider mb-4">Xây dựng & Kiến tạo</p>
                            <div className="text-slate-400 text-sm space-y-3">
                                <p><strong>Nhiệm vụ:</strong> Điều hành một xã hội giả lập. Cân bằng các chỉ số thông qua các quyết định dựa trên quy luật Mâu thuẫn và Lượng - Chất.</p>
                                <p><strong>Bài học:</strong> Áp dụng triết học vào quản lý và đời sống. Hiểu rằng sự phát triển đến từ việc giải quyết các mâu thuẫn nội tại.</p>
                            </div>
                            <button onClick={() => onStart(3)} className="mt-6 w-full py-2 bg-slate-800 hover:bg-green-600 rounded text-slate-300 hover:text-white font-bold text-sm transition-colors">Bắt đầu Cấp 3</button>
                        </div>
                    </div>
                </div>

                {/* Section: Hướng dẫn chơi chung */}
                <div className="bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-800">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <BookOpen className="text-yellow-500" />
                        Hướng Dẫn Chung
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm md:text-base text-slate-300">
                        <ul className="space-y-3">
                            <li className="flex gap-3">
                                <span className="font-bold text-blue-400">01.</span>
                                <span>Hoàn thành từng cấp độ để mở khóa kiến thức tiếp theo.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-blue-400">02.</span>
                                <span>Sử dụng <strong>Tra cứu AI</strong> (biểu tượng kính lúp) bất cứ khi nào bạn gặp khái niệm khó hiểu.</span>
                            </li>
                        </ul>
                        <ul className="space-y-3">
                            <li className="flex gap-3">
                                <span className="font-bold text-blue-400">03.</span>
                                <span>Điểm số (XP) thể hiện mức độ thông thạo của bạn. Hãy ghi tên lên Bảng Xếp Hạng để vinh danh.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-blue-400">04.</span>
                                <span><strong>Lưu ý:</strong> Đừng sợ sai. Mỗi lần sai là một lần củng cố lại nhận thức để tiến gần hơn đến chân lý.</span>
                            </li>
                        </ul>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <Zap size={18} className="text-blue-400" />
                                    </div>
                                    <h4 className="text-blue-300 font-bold">Google Gemini (Flash Model)</h4>
                                </div>
                                <p className="text-slate-400 text-xs md:text-sm leading-relaxed text-justify">
                                    <strong>Vai trò: Bộ xử lý trung tâm (Core Processor).</strong><br />
                                    Đảm nhiệm các tác vụ thời gian thực trong game:
                                </p>
                                <ul className="list-disc pl-5 text-slate-500 text-xs md:text-sm space-y-1">
                                    <li>Phân tích phân loại Vật chất/Ý thức (Level 1).</li>
                                    <li>Tạo câu hỏi trắc nghiệm tự động (Level 2).</li>
                                    <li>Đóng vai NPCs và Cố vấn chiến lược (Level 3).</li>
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                        <Brain size={18} className="text-purple-400" />
                                    </div>
                                    <h4 className="text-purple-300 font-bold">Meta Llama 3 (via OpenRouter)</h4>
                                </div>
                                <p className="text-slate-400 text-xs md:text-sm leading-relaxed text-justify">
                                    <strong>Vai trò: Thư viện tri thức (Knowledge Base).</strong><br />
                                    Chuyên gia tra cứu và giải thích khái niệm:
                                </p>
                                <ul className="list-disc pl-5 text-slate-500 text-xs md:text-sm space-y-1">
                                    <li>Hỗ trợ tính năng "Tra cứu" với độ chính xác cao.</li>
                                    <li>Hệ thống dự phòng (Fallback) đảm bảo dịch vụ liên tục.</li>
                                    <li>Cung cấp dẫn chứng và ví dụ thực tế.</li>
                                </ul>
                            </div>

                            <div className="space-y-4 md:col-span-2 border-t border-slate-800 pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/20 rounded-lg">
                                        <Lightbulb size={18} className="text-green-400" />
                                    </div>
                                    <h4 className="text-green-300 font-bold">DeepSeek R1 (Tùy chọn)</h4>
                                </div>
                                <p className="text-slate-400 text-xs md:text-sm leading-relaxed text-justify">
                                    <strong>Vai trò: Nhà lý luận chuyên sâu (Deep Thinker).</strong><br />
                                    Mô hình chuyên biệt cho các tác vụ suy luận phức tạp (Reasoning), được tích hợp sẵn trong mã nguồn để mở rộng khả năng phân tích các vấn đề triết học hóc búa nhất.
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
