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
- [ ] **Cài đặt thư viện phụ thuộc**:
  - Cài đặt `otplib` (xử lý sinh/xác thực mã TOTP) và `qrcode` (tạo mã QR hiển thị cho người dùng quét).
- [ ] **Mở rộng Schema `User.js`**:
  - Thêm trường `mfaSecret` (String - lưu secret key được mã hóa của người dùng).
  - Thêm trường `mfaEnabled` (Boolean, mặc định `false`).
- [ ] **Xây dựng API thiết lập MFA**:
  - [ ] `/api/auth/mfa/setup` (Chỉ cho user đã đăng nhập): Tạo TOTP secret ngẫu nhiên, sinh mã QR code dạng Base64 và trả về.
  - [ ] `/api/auth/mfa/verify` (Xác thực lần đầu): Nhận mã OTP từ người dùng, đối chiếu với secret. Nếu khớp, cập nhật `mfaEnabled = true`.
  - [ ] `/api/auth/mfa/disable` (Hủy kích hoạt): Xác minh mật khẩu hoặc mã OTP hiện tại trước khi đặt `mfaEnabled = false`.
- [ ] **Cập nhật Logic Đăng nhập**:
  - Cập nhật luồng đăng nhập thường và Google SSO: Nếu người dùng đã kích hoạt MFA (`mfaEnabled === true`), backend sẽ không cấp ngay JWT session token chính mà trả về mã trạng thái `requiresMfa` kèm theo một mã token tạm thời (`tempMfaToken`).
  - [ ] Xây dựng API `/api/auth/mfa/login-verify`: Nhận `tempMfaToken` và mã OTP 6 chữ số, nếu đúng mới cấp JWT session token chính thức.

### B. Cập nhật Frontend
- [ ] **Giao diện quản lý MFA trong Hồ sơ (Profile Modal)**:
  - [ ] Thêm tuỳ chọn "Kích hoạt Xác thực 2 lớp (MFA)" trong `ProfileModal.jsx`.
  - [ ] Hiển thị mã QR và chuỗi khóa dự phòng khi người dùng nhấp kích hoạt.
  - [ ] Yêu cầu người dùng nhập mã 6 số từ ứng dụng Authenticator để xác thực trước khi bật thành công.
- [ ] **Giao diện Đăng nhập MFA**:
  - [ ] Khi backend phản hồi tài khoản yêu cầu MFA, chuyển giao diện Auth Modal sang chế độ nhập mã xác thực 2 lớp (MFA Code).
  - [ ] Thiết kế form nhập 6 chữ số trực quan tương tự như form nhập mã OTP SMS.

---

## 📦 3. Đóng gói & Triển khai ứng dụng trên Máy chủ riêng (On-premise Server)

Chuẩn bị sẵn sàng ứng dụng để vận hành trực tiếp trên máy chủ vật lý do nhà trường cung cấp.

- [ ] **Đóng gói mã nguồn với Docker**:
  - [ ] Tạo file `Dockerfile` cho backend để build Node image tối ưu.
  - [ ] Tạo file `Dockerfile` cho frontend (build bằng Vite, phục vụ file tĩnh qua Nginx gọn nhẹ).
  - [ ] Thiết lập file `docker-compose.yml` để liên kết:
    - Container Backend (Node.js/Express)
    - Container Frontend (Nginx phục vụ client)
    - Container Database (MongoDB Community Edition chạy cục bộ lưu hoàn toàn offline, kèm thiết lập volume persistence bảo toàn dữ liệu).
- [ ] **Cấu hình Upload ảnh nội bộ**:
  - [ ] Viết API endpoint upload ảnh sử dụng thư viện `multer` trong backend Node.js thay vì Cloudinary.
  - [ ] Lưu trữ trực tiếp ảnh vào thư mục ổ đĩa được ánh xạ (volume mount `/app/public/uploads`) trên máy chủ của trường.
  - [ ] Cấu hình Nginx / Express static middleware để phục vụ đường dẫn ảnh trực tiếp.
- [ ] **Tài liệu Hướng dẫn Triển khai (Handover Documentation)**:
  - [ ] Viết tệp hướng dẫn từng bước (Step-by-step) cài đặt Docker, Docker Compose trên máy chủ (Ubuntu/Windows Server).
  - [ ] Hướng dẫn lệnh khởi chạy duy nhất: `docker-compose up -d` để chạy toàn bộ hệ thống.
  - [ ] Hướng dẫn thiết lập sao lưu cơ sở dữ liệu tự động (`mongodump` định kỳ).

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

