# Nhà Tư Duy Trẻ: Cỗ Máy Biện Chứng 🤖🧠

**Phiên bản Giáo dục Tương tác 2.0 - Khám phá Triết học Mác-Lênin qua Gamification**

Dự án này là một web game giáo dục tương tác, biến những khái niệm triết học trừu tượng thành các trải nghiệm trực quan, sinh động. Người chơi sẽ hành trình qua 3 cấp độ nhận thức để "tốt nghiệp" khóa học Triết học.

![Banner](https://img.shields.io/badge/Status-Active-success) ![Tech](https://img.shields.io/badge/Tech-React_Typescript_Vite-blue) ![AI](https://img.shields.io/badge/AI-Google_Gemini-orange)

---

## 🌟 Tính Năng Nổi Bật

### 1. Level 1: Thế Giới Quan Duy Vật (Hành Trình Vật Chất)
*Khắc sâu nguyên lý: "Vật chất có trước, Ý thức có sau".*
- **Chặng 1 (Phân loại):** Game kéo thả (Drag & Drop) để phân biệt các hiện tượng Vật chất và Ý thức, tránh bẫy "Anti-Matter".
- **Chặng 2 (Vận động):** Game nhịp điệu (Rhythm Game). Thu thập các hình thức vận động của vật chất (Cơ, Lý, Hóa, Sinh, Xã hội) trên nền nhạc.
- **Chặng 3 (Không-Thời gian):** Game chạy vô tận (Endless Runner) trong đường hầm không-thời gian. Né tránh chướng ngại vật và trả lời câu hỏi nhanh để kiến tạo dòng chảy lịch sử.

### 2. Level 2: Nguồn Gốc Ý Thức (Cây Ý Thức)
*Giải mã sự ra đời của tư duy con người.*
- **Lao động Biến hình (Clicker):** Mô phỏng quá trình tiến hóa từ Vượn -> Người thông qua lao động và chế tác công cụ.
- **Tranh biện Triết học (Card Battle):** Đấu bài lý luận với "Nhà Duy Tâm". Sử dụng các thẻ bài "Thực tiễn", "Vật chất", "Biện chứng" để đánh bại các lập luận sai lầm.
- **Hệ thống Kỹ năng:** Mở khóa cây kỹ năng từ Phản ánh, Ngôn ngữ đến Tư duy trừu tượng.

### 3. Level 3: Phép Biện Chứng (Tháp Biện Chứng)
*Vận dụng Triết học vào Xây dựng Xã hội.*
- **Mô phỏng Xã hội (Sim City-lite):** Quản lý mối quan hệ biện chứng giữa **Cơ sở hạ tầng** (Kinh tế) và **Kiến trúc thượng tầng** (Văn hóa/Chính trị).
- **Cách mạng Xã hội:** Kích hoạt "Bước nhảy lượng-chất" khi các mâu thuẫn xã hội đã chín muồi để đưa xã hội lên hình thái cao hơn.
- **AI Advisor:** Cố vấn ảo (AI) đưa ra lời khuyên chiến lược dựa trên tình hình thực tế.

---

## 🤖 Tích Hợp Trí Tuệ Nhân Tạo (AI)

Dự án sử dụng **Google Gemini (Flash Model)** làm bộ xử lý trung tâm:
- **Game Master:** Tự động tạo câu hỏi trắc nghiệm ngữ cảnh, không trùng lặp.
- **Judge (Trọng tài):** Phân tích câu trả lời của người chơi trong các tình huống khó.
- **Advisor (Cố vấn):** Đóng vai các nhà tư tưởng để đưa ra gợi ý trong Level 3.

---

## 🛠 Yêu cầu Hệ thống

- **Node.js**: Phiên bản 18+
- **NPM/Yarn**: Trình quản lý gói tiêu chuẩn.

---

## 🚀 Hướng dẫn Cài đặt & Chạy

### 1. Cài đặt Dependencies
Mở terminal tại thư mục dự án và chạy:
```bash
npm install
```

### 2. Cấu hình Biến Môi trường (.env)
Tạo file `.env` tại thư mục gốc và điền thông tin API Key của bạn:

```env
# Google Gemini API Key (Bắt buộc cho các tính năng AI)
# Lấy miễn phí tại: https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=your_api_key_here

# Supabase Configuration (Tùy chọn - Cho Bảng xếp hạng)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Khởi chạy
Chạy server phát triển:
```bash
npm run dev
```
Truy cập `http://localhost:5173` để trải nghiệm.

---

## 📚 Công Nghệ Sử Dụng
- **Frontend Framework**: React 18, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **AI SDK**: Google Generative AI SDK
- **Database**: Supabase (PostgreSQL)

---

## 📝 Giấy Phép
Dự án mã nguồn mở phục vụ mục đích giáo dục phi lợi nhuận.
*© 2026 Cỗ Máy Biện Chứng nttu254.*
