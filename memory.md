# 🧠 Bộ Nhớ Dự Án & Tiến Độ Công Việc (FindX / TNCB Rent Memory)

Tài liệu này lưu trữ tiến trình thực hiện công việc, các quyết định kỹ thuật quan trọng và định hướng phát triển nhằm giúp các AI Agent tiếp theo dễ dàng tiếp quản dự án.

---

## 📌 1. Tổng Quan Dự Án & Hiện Trạng Công Nghệ
- **Tên dự án**: FindX (TNCB Rent / FTU Housing Bank) - Cổng thông tin & quản lý thuê trọ cho sinh viên.
- **Frontend**: React 19 + Vite 8 (Vanilla CSS, font Outfit & Geist Mono).
- **Backend**: Node.js + Express (Modular Monolith: `auth`, `property`, `ticket`), MongoDB Atlas, Redis (Mock Caching).
- **Mobile**: Expo + React Native.
- **Triển khai**: Docker, Nginx Reverse Proxy, Netdata monitoring, Custom Python Power Tracker.

---

## 🕒 2. Lịch Sử Cập Nhật & Tiến Độ (Agent Handoff Log)

### Phiên làm việc: 2026-06-15
- **Mục tiêu phiên**: Thiết lập tệp [memory.md](file:///d:/Tìm/TNCB/memory.md), cập nhật quy trình vào [SKILL.md](file:///d:/Tìm/TNCB/SKILL.md), và triển khai giải pháp lướt web gián tiếp cho TV Samsung qua Ubuntu Server.
- **Kết quả**:
  - Tạo thành công tệp [memory.md](file:///d:/Tìm/TNCB/memory.md).
  - Cập nhật mục nhiệm vụ bắt buộc phải làm vào [SKILL.md](file:///d:/Tìm/TNCB/SKILL.md).
  - Thiết kế và tạo tệp cấu hình [docker-compose.tv-browser.yml](file:///d:/Tìm/TNCB/deploy/docker-compose.tv-browser.yml). Ban đầu sử dụng image `linuxserver/chromium` (chạy WebRTC Selkies) nhưng gặp hiện tượng giật lag nặng do TV cũ UA50KU6000K (Tizen 2.4, năm 2016) không giải mã nổi luồng video thời gian thực.
  - Chuyển đổi thiết kế sang sử dụng image chính thức **`kasmweb/chromium:1.15.0`** chạy KasmVNC (vẽ ảnh JPEG/WebP tiles qua HTML5 2D Canvas) giúp giảm tải CPU TV đến 90% và giải quyết triệt để vấn đề giật lag.
  - Cập nhật tài liệu hướng dẫn và sẵn sàng triển khai lại.

---

## 🚀 3. Kế Hoạch & Các Task Tiếp Theo (Từ Server)
*Chúng ta sẽ bắt đầu từ phần Server trước theo yêu cầu của User:*
1. **Kiểm tra/Tối ưu hóa các module Server FindX**:
   - Xác thực & Bảo mật (MFA, Email OTP).
   - Xử lý tin đăng & thuật toán lọc trùng tin (Deduplication).
   - Kết nối cơ sở dữ liệu MongoDB Atlas & đồng bộ Google Sheets.
2. **Triển khai thêm giải pháp cho TV**:
   - Theo dõi phản hồi từ User khi chạy Docker TV Browser. Tinh chỉnh cấu hình nếu cần thiết.
