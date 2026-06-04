# Lộ trình & Nhiệm vụ phát triển tiếp theo (FindX)

Tài liệu này lưu lại danh sách công việc cần làm để chuyển giao hệ thống sang môi trường thực tế và tích hợp các tính năng bảo mật nâng cao trong tương lai.

> [!IMPORTANT]
> - Sau khi cấu hình xong môi trường thực tế và xác nhận Google SSO hoạt động bình thường, hãy xoá phần nhiệm vụ số 1 (Cấu hình Google SSO Thực tế) khỏi tài liệu này.
> - Bất kỳ nhiệm vụ hay tính năng mới nào được thống nhất phát triển trong tương lai sẽ được cập nhật trực tiếp tại tệp `task.md` này làm nguồn theo dõi chính thức.

---

## 🔐 1. Cấu hình Google SSO Thực tế (Sản xuất)

Hiện tại Google SSO đang chạy qua cơ chế Token giả lập (`mock_token_*`). Cần làm các bước sau để tích hợp tài khoản Google thật:

- [ ] **Google Cloud Console Setup**:
  - [ ] Truy cập [Google Cloud Console](https://console.cloud.google.com/).
  - [ ] Cấu hình màn hình đồng ý OAuth (OAuth consent screen) với phạm vi (scopes): `email`, `profile`, `openid`.
  - [ ] Tạo thông tin xác thực OAuth Client ID (loại Web Application).
  - [ ] Thêm `http://localhost:5173` và miền sản xuất vào mục **Authorized JavaScript origins**.
- [ ] **Cấu hình Backend**:
  - [ ] Cập nhật biến `GOOGLE_CLIENT_ID` trong `backend/.env` với Client ID thực tế.
- [ ] **Cấu hình Frontend**:
  - [ ] Cập nhật `client_id` trong file `frontend/src/components/Header.jsx` (dòng khởi tạo Google SDK trong `useEffect`).
- [ ] **Kiểm thử E2E**:
  - [ ] Thực hiện đăng nhập bằng một tài khoản Gmail thực tế và kiểm tra quy trình liên kết tài khoản / cập nhật số điện thoại.

---

## 🛡️ 2. Lộ trình tích hợp Xác thực 2 lớp (MFA - Multi-Factor Authentication)

Triển khai phương thức xác thực hai yếu tố (2FA) sử dụng ứng dụng tạo mã OTP (như Google Authenticator hoặc Microsoft Authenticator) dựa trên giao thức TOTP (Time-based One-time Password).

### A. Cập nhật Backend
- [x] **Cài đặt thư viện phụ thuộc**:
  - Cài đặt `otplib` (xử lý sinh/xác thực mã TOTP) và `qrcode` (tạo mã QR hiển thị cho người dùng quét).
- [x] **Mở rộng Schema `User.js`**:
  - Thêm trường `mfaSecret` (String - lưu secret key được mã hóa của người dùng).
  - Thêm trường `mfaEnabled` (Boolean, mặc định `false`).
- [x] **Xây dựng API thiết lập MFA**:
  - [x] `/api/auth/mfa/setup` (Chỉ cho user đã đăng nhập): Tạo TOTP secret ngẫu nhiên, sinh mã QR code dạng Base64 và trả về.
  - [x] `/api/auth/mfa/verify` (Xác thực lần đầu): Nhận mã OTP từ người dùng, đối chiếu với secret. Nếu khớp, cập nhật `mfaEnabled = true`.
  - [x] `/api/auth/mfa/disable` (Hủy kích hoạt): Xác minh mật khẩu hoặc mã OTP hiện tại trước khi đặt `mfaEnabled = false`.
- [x] **Cập nhật Logic Đăng nhập**:
  - Cập nhật luồng đăng nhập thường và Google SSO: Nếu người dùng đã kích hoạt MFA (`mfaEnabled === true`), backend sẽ không cấp ngay JWT session token chính mà trả về mã trạng thái `requiresMfa` kèm theo một mã token tạm thời (`tempMfaToken`).
  - [x] Xây dựng API `/api/auth/mfa/login-verify`: Nhận `tempMfaToken` và mã OTP 6 chữ số, nếu đúng mới cấp JWT session token chính thức.

### B. Cập nhật Frontend
- [x] **Giao diện quản lý MFA trong Hồ sơ (Profile Modal)**:
  - [x] Thêm tuỳ chọn "Kích hoạt Xác thực 2 lớp (MFA)" trong `ProfileModal.jsx`.
  - [x] Hiển thị mã QR và chuỗi khóa dự phòng khi người dùng nhấp kích hoạt.
  - [x] Yêu cầu người dùng nhập mã 6 số từ ứng dụng Authenticator để xác thực trước khi bật thành công.
- [x] **Giao diện Đăng nhập MFA**:
  - [x] Khi backend phản hồi tài khoản yêu cầu MFA, chuyển giao diện Auth Modal sang chế độ nhập mã xác thực 2 lớp (MFA Code).
  - [x] Thiết kế form nhập 6 chữ số trực quan tương tự như form nhập mã OTP SMS.

---

## 📦 3. Đóng gói & Triển khai ứng dụng trên Máy chủ riêng (On-premise Server)

Chuẩn bị sẵn sàng ứng dụng để vận hành trực tiếp trên máy chủ vật lý do nhà trường cung cấp.

- [x] **Đóng gói mã nguồn với Docker**:
  - [x] Tạo file `Dockerfile` cho backend để build Node image tối ưu.
  - [x] Tạo file `Dockerfile` cho frontend (build bằng Vite, phục vụ file tĩnh qua Nginx gọn nhẹ).
  - [x] Thiết lập file `docker-compose.yml` để liên kết:
    - Container Backend (Node.js/Express)
    - Container Frontend (Nginx phục vụ client)
    - Container Database (MongoDB Community Edition chạy cục bộ lưu hoàn toàn offline, kèm thiết lập volume persistence bảo toàn dữ liệu).
- [x] **Cấu hình Upload ảnh nội bộ**:
  - [x] Viết API endpoint upload ảnh sử dụng thư viện `multer` trong backend Node.js thay vì Cloudinary.
  - [x] Lưu trữ trực tiếp ảnh vào thư mục ổ đĩa được ánh xạ (volume mount `/app/public/uploads`) trên máy chủ của trường.
  - [x] Cấu hình Nginx / Express static middleware để phục vụ đường dẫn ảnh trực tiếp.
- [x] **Tài liệu Hướng dẫn Triển khai (Handover Documentation)**:
  - [x] Viết tệp hướng dẫn từng bước (Step-by-step) cài đặt Docker, Docker Compose trên máy chủ (Ubuntu/Windows Server).
  - [x] Hướng dẫn lệnh khởi chạy duy nhất: `docker-compose up -d` để chạy toàn bộ hệ thống.
  - [x] Hướng dẫn thiết lập sao lưu cơ sở dữ liệu tự động (`mongodump` định kỳ).

---

## 🌐 4. Lộ trình chuyển đổi sang Microservices (Định hướng tương lai)

Dự án hiện đã được tái cấu trúc sang mô hình **Modular Monolith** (tách biệt các module `auth`, `property`, `ticket` độc lập trong code backend). Khi quy mô người dùng tăng lớn, thực hiện các bước sau để chuyển giao sang Microservices:

- [ ] **Tách biệt Cơ sở dữ liệu (Database per Service)**:
  - Chia nhỏ MongoDB Atlas hoặc triển khai các instance DB riêng cho mỗi Service: `auth-db`, `property-db`, `ticket-db`.
- [ ] **Tách biệt Mã nguồn (Repository per Service)**:
  - Copy thư mục `backend/src/modules/auth` sang một repository riêng và cấu hình file `package.json` độc lập. Thực hiện tương tự cho `property` và `ticket`.
- [ ] **Xây dựng API Gateway**:
  - Triển khai một Gateway (sử dụng Express-Gateway hoặc Kong API Gateway) để tiếp nhận tất cả các yêu cầu từ Client và định tuyến đến đúng Microservice bên trong.
- [ ] **Giao tiếp bất đồng bộ qua Message Broker (Event-Driven)**:
  - Tích hợp RabbitMQ hoặc Apache Kafka để đồng bộ các sự kiện liên dịch vụ (ví dụ: khi xóa tài khoản ở Auth Service, phát sự kiện để Property Service tự động xóa tin đăng tương ứng).

---

## 💬 5. Tích hợp nút Chat Live Messenger trực tiếp trên Website

Triển khai nút nhắn tin Messenger nổi ở góc màn hình, cho phép khách truy cập chat trực tiếp với đội ngũ hỗ trợ của FindX ngay trên giao diện web mà không cần rời trang.

### Giải pháp đề xuất:
1. **Sử dụng Facebook Chat Plugin (SDK chính thức)**:
   - Đăng ký tên miền `findx.id.vn` vào danh sách trắng (Whitelist Domains) trong phần thiết lập Fanpage Facebook (Trang hỗ trợ của FindX).
   - Tích hợp mã JavaScript SDK của Facebook Customer Chat vào `frontend/index.html`.
   - Sử dụng thẻ `<div class="fb-customerchat" page_id="<PAGE_ID>"></div>` để Facebook tự động render khung chat bong bóng nổi ở góc dưới bên phải.
   - Khách thuê có thể chọn chat dưới danh nghĩa "Khách" (Guest Mode - không cần đăng nhập Facebook) hoặc bằng tài khoản Facebook cá nhân.
2. **Giải pháp thay thế (Custom Floating Bubble + Messenger Redirect)**:
   - Nếu Facebook giới hạn hoặc ngừng hỗ trợ Chat Plugin SDK cho một số loại Fanpage mới: Thiết kế một nút bong bóng tròn Messenger tùy biến bằng React + CSS thuần (sử dụng hiệu ứng Glassmorphism và màu gradient hồng-xanh đặc trưng của Messenger).
   - Khi người dùng click, kích hoạt cửa sổ Popup nhỏ (`window.open`) chuyển hướng tới link rút gọn `https://m.me/<PAGE_ID>` để người dùng chat nhanh trên cả điện thoại (mở app Messenger) và máy tính.

### Các bước thực hiện:
- [ ] **Bước 1**: Tạo Fanpage Facebook chính thức cho FindX (nếu chưa có).
- [ ] **Bước 2**: Lấy `Page ID` từ phần giới thiệu của Fanpage và Whitelist tên miền `https://findx.id.vn` trong mục Nhắn tin nâng cao của trang.
- [ ] **Bước 3**: Tạo component `<MessengerChat />` trong React:
  - Tải động script SDK Facebook Chat Plugin khi component mount.
  - Render thẻ div cấu hình chat plugin với `page_id` và các tuỳ chọn màu sắc (`theme_color`), câu chào mừng (`logged_in_greeting`, `logged_out_greeting`).
- [ ] **Bước 4**: Tích hợp component `<MessengerChat />` vào file bố cục chung `frontend/src/App.jsx` hoặc `frontend/src/components/FloatingContact.jsx`.
- [ ] **Bước 5**: Kiểm thử hiển thị responsive trên thiết bị di động, đảm bảo không che khuất các nút điều hướng quan trọng ở thanh Bottom Navigation.

---

## 💬 6. Tích hợp Zalo API & Zalo Chat Widget

Tích hợp cổng hỗ trợ qua Zalo Official Account (OA) hoặc Zalo Chat Widget để hỗ trợ khách thuê nhắn tin trực tiếp qua nền tảng Zalo phổ biến tại Việt Nam.

### Giải pháp đề xuất:
1. **Sử dụng Zalo Chat Widget (Nhúng trực tiếp)**:
   - Đăng ký tài khoản Zalo Official Account doanh nghiệp/cá nhân.
   - Nhúng đoạn mã Zalo Chat Widget SDK do Zalo Developer portal cung cấp vào `frontend/index.html`.
   - Hiển thị khung chat nổi tương tự như Messenger Chat.
2. **Sử dụng Zalo Share / Send Message API**:
   - Tích hợp nút "Chia sẻ tin trọ qua Zalo" hoặc gửi thông tin trực tiếp về tin đăng cho bạn bè qua Zalo Share SDK.
   - Khi chủ trọ đăng tin mới, có thể cấu hình gửi thông báo tự động (Zalo ZNS - Zalo Notification Service) về điện thoại của khách thuê đã đăng ký quan tâm.

### Các bước thực hiện:
- [ ] **Bước 1**: Khởi tạo ứng dụng trên [Zalo Developers Portal](https://developers.zalo.me/).
- [ ] **Bước 2**: Đăng ký Zalo Official Account (OA) và lấy Widget ID.
- [ ] **Bước 3**: Nhúng mã script Zalo SDK vào phần thẻ `<head>` của `frontend/index.html`.
- [ ] **Bước 4**: Tạo component `<ZaloChatWidget />` trong React và khai báo vùng chứa `<div class="zalo-chat-widget" data-oaid="<OA_ID>" data-welcome-message="Rất vui được hỗ trợ bạn!" data-autopopup="0" data-width="350" data-height="420"></div>`.
- [ ] **Bước 5**: Tích hợp component vào Layout chính và kiểm tra tính tương thích giao diện di động.

---

## 🛡️ 7. Bộ lọc Nội dung Nhạy cảm (Ngôn từ & Hình ảnh NSFW)

Xây dựng lớp bảo vệ kép cho cổng đăng tin FindX để tự động chặn các nội dung văn bản chứa ngôn từ tục tĩu/nhạy cảm và các hình ảnh không lành mạnh (NSFW - Not Safe For Work) do người dùng đăng tải.

### Giải pháp đề xuất:

1. **Bộ lọc ngôn từ nhạy cảm (Text Moderation)**:
   - **Giải pháp cục bộ (Local Filter)**: Xây dựng một thư viện regex kết hợp từ điển từ cấm tiếng Việt (khoảng 300-500 từ tục tĩu phổ biến). Khi có tin đăng mới, quét qua các trường `title`, `description` và `address`. Nếu phát hiện từ nhạy cảm, chặn phản hồi `400 Bad Request` kèm theo thông báo hướng dẫn sửa từ ngữ, hoặc tự động thay thế bằng ký tự `***`.
   - **Giải pháp Cloud (Perspective API)**: Sử dụng Perspective API của Google (hoàn toàn miễn phí, hỗ trợ tiếng Việt rất tốt). API này trả về điểm số độ độc hại (Toxicity Score) của đoạn văn bản. Nếu điểm số quá 0.7, tin đăng sẽ bị đẩy vào hàng chờ duyệt của Admin hoặc từ chối trực tiếp.

2. **Bộ lọc hình ảnh nhạy cảm (Image Moderation)**:
   - **Giải pháp cục bộ (NSFWJS)**: Tích hợp thư viện `@tensorflow/tfjs-node` và `nsfwjs` chạy trực tiếp trong container backend Node.js. Khi ảnh được gửi lên bộ nhớ đệm RAM qua Multer, mô hình Deep Learning của NSFWJS sẽ phân tích hình ảnh và trả về xác suất của 5 danh mục (`Porn`, `Sexy`, `Hentai`, `Neutral`, `Drawing`). Nếu xác suất ảnh nhạy cảm (`Porn` hoặc `Sexy`) lớn hơn 70%, ảnh sẽ bị từ chối lưu và báo lỗi trực tiếp cho người dùng.
   - **Giải pháp Cloud (Google Vision SafeSearch)**: Gửi luồng ảnh qua Google Cloud Vision API để kiểm tra tính an toàn thông qua bộ SafeSearch (chỉ số `adult`, `medical`, `spoof`, `violence`, `racy`). Giải pháp này có độ chính xác tuyệt đối nhưng cần tài khoản Cloud có liên kết thanh toán.

### Các bước thực hiện:
- [x] **Bước 1**: Thiết lập tệp từ điển từ ngữ nhạy cảm tiếng Việt hoặc đăng ký Google Perspective API Key.
- [x] **Bước 2**: Viết middleware `textModeration.js` ở Backend để quét văn bản đầu vào của Route Đăng tin/Sửa tin.
- [x] **Bước 3**: Cài đặt thử nghiệm thư viện `nsfwjs` cục bộ ở Backend hoặc tích hợp hàm gọi Google Cloud Vision API trong `upload.js`.
- [x] **Bước 4**: Viết middleware `imageModeration.js` chặn xử lý nén Sharp nếu ảnh bị đánh giá là nhạy cảm/NSFW.
- [x] **Bước 5**: Cập nhật thông báo lỗi thân thiện trên Frontend Dashboard khi bài viết hoặc hình ảnh bị bộ lọc từ chối.

