# 🧠 Bộ Nhớ Dự Án & Tiến Độ Công Việc (FindX / TNCB Rent Memory)

Tài liệu này lưu trữ tiến trình thực hiện công việc, các quyết định kỹ thuật quan trọng và định hướng phát triển nhằm giúp các AI Agent tiếp theo dễ dàng tiếp quản dự án.

---

## 📌 1. Tổng Quan Dự Án & Hiện Trạng Công Nghệ

- **Tên dự án**: FindX (TNCB Rent / FTU Housing Bank) - Cổng thông tin & quản lý thuê trọ cho sinh viên.
- **Frontend**: React 19 + Vite 8 (Vanilla CSS, font Outfit & Geist Mono).
- **Backend**: Node.js + Express (Modular Monolith: `auth`, `property`, `ticket`), MongoDB Atlas, Redis (Mock Caching).
- **Mobile**: Expo + React Native.
- **Triển khai**: Docker, Nginx Reverse Proxy, Custom Python Power Tracker.
- **Trạng thái server (2026-06-15)**: FindX đang **tắt** (không có nhu cầu). Chỉ còn qBittorrent + power tracker đang chạy trên server `192.168.1.218`.

---

## 🕒 2. Lịch Sử Cập Nhật & Tiến Độ (Agent Handoff Log)

### Phiên làm việc: 2026-06-15 (sáng)
- **Mục tiêu**: Tối ưu server, tắt các service không cần thiết.
- **Kết quả**:
  - Dừng và disable: Overleaf, FindX, Netdata, Uptime Kuma.
  - Loại bỏ Netdata khỏi `deploy/docker-compose.yml`.
  - Tải CPU giảm từ ~8.0 về **0.09**, RAM từ 2.6GB về **1.1GB**.
  - Cập nhật hướng dẫn tái deploy FindX trong `README.md` và `deploy/README_DEPLOY.md`.

### Phiên làm việc: 2026-06-15 (chiều - tối)
- **Mục tiêu**: Tìm giải pháp xem anime trên TV Samsung Smart TV (Tizen 2.4, 2016) qua LAN.
- **Các hướng đã thử / phân tích**:

  | Hướng | Kết quả |
  |-------|---------|
  | VNC-over-WebRTC | ❌ Lag không dùng được |
  | DLNA bookmarklet từ link web | ❌ Phải extract link thủ công |
  | IPTV HLS Proxy (kasmweb + ffmpeg) | ❌ VAAPI không support, quá phức tạp → đã xóa |
  | MJPEG / RTSP stream | ⏭️ Bỏ qua |
  | **Ninoyo Downloader + MiniDLNA** | ✅ **Hướng đi tiếp theo** |

- **Phát hiện quan trọng về ninoyo.online**:
  - Ninoyo hỗ trợ tải từng tập anime (~230–270MB/tập).
  - File lưu trên **SharePoint của ninoyo** (`pr0x9x-my.sharepoint.com`).
  - Flow kỹ thuật: Click tải → ninoyo gọi `/api/play-mp4?driveId=...&fileId=...` → trả SharePoint URL có `tempauth` token (hết hạn ~5–10 phút).
  - **URL SharePoint có thể wget trực tiếp** trong thời gian token còn hiệu lực.
  - Để tự động hóa: cần cookie ninoyo của user → gọi API → lấy URL mới → wget về server.
  - **User có tài khoản ninoyo** → kế hoạch khả thi.

---

## 🚀 3. Kế Hoạch & Các Task Tiếp Theo

### 🎯 Ưu tiên cao: Ninoyo Auto-Downloader + MiniDLNA → TV Samsung

**Mô tả**: Script/Web UI nhỏ cho phép user paste URL trang anime ninoyo → server tự tải về → MiniDLNA serve → TV Samsung xem qua AllShare.

**Các bước cần làm**:
1. **Setup MiniDLNA** trên server (1 lần duy nhất):
   ```bash
   sudo apt install minidlna
   # Cấu hình /etc/minidlna.conf: media_dir=V,/home/spotlighter/downloads/anime
   sudo systemctl enable --now minidlna
   ```
2. **Lấy cookie ninoyo** (user tự làm 1 lần bằng DevTools → Application → Cookies).
3. **Build `ninoyo_dl.py`** (Python):
   - Input: URL trang anime trên ninoyo.
   - Parse `driveId` + `fileId` từ trang (cần inspect JS/API của ninoyo).
   - Gọi `GET /api/play-mp4?driveId=...&fileId=...` với cookie → lấy SharePoint URL.
   - `wget` file về `~/downloads/anime/`.
4. **Tích hợp Web UI Flask**: User paste URL → server tải → hiển thị progress.
5. **Test**: TV Samsung → Source → AllShare → tìm thấy server → phát.

### 🔧 Task phụ: FindX
- Khi cần chạy lại FindX: xem `deploy/README_DEPLOY.md`.
- Tối ưu MFA, Deduplication, Google Sheets sync khi có nhu cầu.
