# Nhà Tư Duy Trẻ: Cỗ Máy Biện Chứng

Một trò chơi giáo dục triết học tương tác khám phá Chủ nghĩa Duy vật Biện chứng qua ba cấp độ, được xây dựng bằng React, TypeScript và tích hợp AI qua Google Gemini.

## 🛠 Yêu cầu hệ thống

- **Node.js**: Phiên bản 18.0.0 trở lên.
- **Trình quản lý gói**: npm hoặc yarn.

## 🚀 Hướng dẫn Cài đặt & Chạy Local

### 1. Khởi tạo dự án (Nếu chưa có)

Chúng ta sẽ sử dụng Vite để tạo môi trường chạy React TypeScript. Mở Terminal và chạy lệnh:

```bash
npm create vite@latest nha-tu-duy-tre -- --template react-ts
cd nha-tu-duy-tre
```

### 2. Cài đặt các thư viện phụ thuộc

Dự án sử dụng các thư viện: `lucide-react` (icon), `recharts` (biểu đồ), `@google/genai` (AI SDK) và `@supabase/supabase-js` (Database).

Chạy lệnh sau để cài đặt:

```bash
npm install lucide-react recharts @google/genai @supabase/supabase-js
```

### 3. Sao chép mã nguồn

Hãy sao chép các file code vào đúng cấu trúc thư mục trong dự án Vite vừa tạo:

- **`index.html`**: Thay thế file ở thư mục gốc (root).
- **`src/App.tsx`**: Thay thế file trong thư mục `src`.
- **`src/types.ts`**: Tạo mới file này trong `src`.
- **`src/components/`**: Tạo thư mục này và chép các file `Level1.tsx`, `Level2.tsx`, `Level3.tsx`, `Leaderboard.tsx` vào đây.
- **`src/services/`**: Tạo thư mục này và chép các file `geminiService.ts`, `soundService.ts`, `supabaseService.ts` vào đây.
- **`src/index.tsx`**: Đổi tên file `src/main.tsx` của Vite thành `index.tsx` hoặc copy nội dung file `index.tsx` đè lên `main.tsx`.

### 4. Cấu hình Biến môi trường (.env)

Tạo một file tên là `.env` tại **thư mục gốc** của dự án (ngang hàng với `package.json`) và điền thông tin sau:

```env
# API Key Google Gemini (BẮT BUỘC để AI hoạt động)
# Lấy key miễn phí tại: https://aistudio.google.com/app/apikey
API_KEY=your_google_gemini_api_key

# Cấu hình Supabase (TÙY CHỌN - Để lưu bảng xếp hạng)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Cấu hình Vite (Quan trọng!)

Do mã nguồn sử dụng `process.env` (chuẩn Node.js) thay vì `import.meta.env` (chuẩn Vite), bạn cần cập nhật file `vite.config.ts` để dự án chạy đúng:

Mở file `vite.config.ts` và sửa thành:

```typescript
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env': env
    }
  }
})
```

### 6. Chạy dự án

Sau khi hoàn tất, chạy lệnh:

```bash
npm run dev
```

Truy cập vào địa chỉ hiển thị trên terminal (thường là `http://localhost:5173`) để chơi game.

---

## 🗄 Cấu hình Database (Supabase)

Để tính năng Bảng xếp hạng (Leaderboard) hoạt động, bạn cần tạo bảng trong Supabase:

1. Vào **SQL Editor** trong dashboard Supabase.
2. Chạy câu lệnh SQL sau:

```sql
create table leaderboard (
  id uuid default gen_random_uuid() primary key,
  username text not null,
  score int8 not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Cho phép ai cũng có thể xem bảng xếp hạng (SELECT)
alter table leaderboard enable row level security;
create policy "Public Leaderboard View" on leaderboard for select using (true);

-- Cho phép ai cũng có thể lưu điểm (INSERT)
create policy "Public Score Save" on leaderboard for insert with check (true);
```

## 🎮 Cách chơi

1. **Level 1 (Vật Chất)**: Kéo thả các thực thể vào vòng xoáy nếu chúng là Vật chất.
2. **Level 2 (Ý Thức)**: Mở khóa Cây Ý Thức bằng cách trả lời câu hỏi trắc nghiệm.
3. **Level 3 (Biện Chứng)**: Quản lý xã hội giả lập, cân bằng giữa Vật chất, Ý thức và Ổn định.
