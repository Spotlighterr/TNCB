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
  - **Tối ưu hóa Server thành công**: Xác định được Netdata và Healthcheck của MongoDB 8.0 gây nghẽn CPU nghiêm trọng (Load Average ~8.0). Thực hiện dừng và cấu hình không tự chạy lại cho Overleaf, FindX, Netdata và Uptime Kuma. Kết quả: Tải CPU giảm về **0.09** (CPU rảnh rỗi ~95%), RAM sử dụng giảm từ **2.6GB về 1.1GB** (trống 6.0GB).
  - Loại bỏ hoàn toàn Netdata khỏi tệp cấu hình [docker-compose.yml](file:///d:/Tìm/TNCB/deploy/docker-compose.yml) và đồng bộ lên server.
  - Cập nhật hướng dẫn chi tiết cách tái khởi chạy dự án FindX trong [README.md](file:///d:/Tìm/TNCB/README.md) và [deploy/README_DEPLOY.md](file:///d:/Tìm/TNCB/deploy/README_DEPLOY.md) (đã đồng bộ lên server).
  - Chuẩn bị quay lại thực hiện giải pháp TV Cast (sử dụng DLNA/UPnP truyền luồng video trực tiếp thay thế phương án trình duyệt gián tiếp).

---

## 🚀 3. Kế Hoạch & Các Task Tiếp Theo
1. **Tiếp tục triển khai giải pháp TV Cast**:
   - Thiết kế và triển khai ứng dụng `tv-cast` (Python/Flask) cho phép người dùng cast link video trực tiếp từ điện thoại/PC lên Samsung Smart TV qua giao thức DLNA/UPnP hoặc Web Receiver cho PC.
   - Kiểm tra khả năng quét và phát trực tiếp các nguồn phim như `ninoyo.online`, `vtvprime`, `tv360`.
2. **Kiểm tra/Tối ưu hóa các module Server FindX**:
   - Khi cần chạy lại FindX, tối ưu hóa các module Xác thực (MFA), Thuật toán lọc trùng tin (Deduplication), và đồng bộ Google Sheets.
