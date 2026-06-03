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
