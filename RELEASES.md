# 🚀 Nhật Ký Phát Hành & Cập Nhật Tính Năng (Project Releases Log)

Tài liệu này ghi nhận toàn bộ các phiên bản phát hành lớn của hệ thống **TNCB Rent (FindX)**, chi tiết hóa các thay đổi và tính năng được cập nhật.

---

## [v2.0.0] - 2026-06-03
### 🌐 Kết Nối Backend REST APIs, MongoDB Atlas & Tích Hợp Google SSO
Phiên bản này đánh dấu sự chuyển đổi từ lưu trữ dữ liệu giả lập cục bộ (localStorage) sang kiến trúc client-server đồng bộ, lưu trữ dữ liệu trên đám mây MongoDB Atlas và cung cấp tính năng đăng nhập Google SSO kèm bảo mật số điện thoại độc nhất.

#### 📌 Tính năng mới:
* **Đồng bộ hóa Cơ sở dữ liệu MongoDB Atlas (Phase 4):**
  * Thiết lập và kết nối cơ sở dữ liệu đám mây MongoDB Atlas.
  * Toàn bộ dữ liệu Người dùng, Tin đăng, và Ticket hỗ trợ được lưu trữ và truy vấn tập trung thông qua REST API server chạy Node.js/Express.
  * Đồng bộ hóa khôi phục phiên đăng nhập thông qua mã JWT và endpoint `/api/auth/me`.
* **Đăng nhập Google SSO (Phase 5):**
  * Tích hợp đăng nhập một chạm sử dụng SDK Google Identity Services.
  * Tự động liên kết tài khoản SSO mới với tài khoản thường nếu trùng email.
  * Biểu mẫu **Hoàn tất đăng ký** (Complete Profile) bắt buộc thu thập vai trò (Khách thuê/Chủ trọ) và **Số điện thoại độc nhất** (không cho phép trùng lặp trong cơ sở dữ liệu).
  * Hỗ trợ cơ chế Mock Token phục vụ kiểm thử môi trường phát triển cục bộ.
* **Script Seeding Dữ Liệu:** Bổ sung script `seedData.js` hỗ trợ tự động băm mật khẩu và tạo 10 tin trọ ban đầu trên MongoDB Atlas.

---

## [v1.2.0] - 2026-06-02
### 🔑 Cập nhật Quyền Admin & Tối ưu hóa Tiện ích
Phiên bản này nâng cấp toàn diện quyền hạn tài khoản Admin (`admin@tncb.vn`), bổ sung cơ chế kiểm duyệt trực quan và tinh giản các chức năng tài chính dư thừa.

#### 📌 Tính năng mới:
* **Hàng chờ kiểm duyệt tin trùng (Admin Review Queue):** 
  * Các tin đăng bị nghi ngờ trùng lặp từ $50\% \to 79\%$ sẽ bị tạm giữ dưới trạng thái `status: 'pending'`.
  * Tích hợp tab **"Kiểm duyệt tin"** trên Sidebar của Admin.
  * Thiết kế **Modal so sánh song song đối chiếu** hiển thị chi tiết Tin mới đăng và Tin cũ bị trùng khớp kèm lý do hệ thống phát hiện để Admin phê duyệt hoặc từ chối thủ công.
* **Quyền quản trị toàn hệ thống (Super Admin Powers):**
  * Admin có quyền sửa, xóa hoặc ẩn/hiện bất kỳ bài viết nào của tất cả các chủ trọ.
  * Tích hợp công tắc bật/tắt **Xác thực** (Verified Badge) trực tiếp trên bảng quản trị cho mọi bài đăng.
  * Admin đăng tin sẽ tự động được duyệt hoạt động và tự động gắn nhãn Verified.
* **Tính năng Gỡ/Đăng lại tin (Unlist/Publish):**
  * Chủ nhà hoặc Admin có quyền tạm gỡ bài đăng (`isUnlisted: true`).
  * Bài đăng bị gỡ lập tức ẩn khỏi tìm kiếm công khai, bản đồ và **không tham gia** vào tập so sánh trùng lặp của thuật toán.
* **Gộp trang Tổng quan & Quản lý:** Hợp nhất hai màn hình "Tổng quan" và "Quản lý phòng/bài đăng" thành một giao diện tích hợp duy nhất để tinh giản thao tác. Thay thế thẻ chỉ số phòng trống/đang thuê cũ bằng thẻ thống kê "Tin đăng" và "Bài đang hoạt động".

#### 🗑️ Các chức năng loại bỏ:
* **Gỡ bỏ Mô-đun Hóa đơn (Billing Clean-up):** Xóa bỏ hoàn toàn tab Hóa đơn khỏi Sidebar của chủ trọ và khách thuê, loại bỏ lịch sử hóa đơn ở khách thuê và các form nhập chỉ số tính tiền.
* **Gỡ bỏ Mô-đun Hợp đồng (Contract Clean-up):** Loại bỏ hoàn toàn tab "Hợp đồng" khỏi thanh Sidebar của chủ trọ và Admin, gỡ bỏ form tạo hợp đồng mới và widget cảnh báo hợp đồng gần đây ở tab Tổng quan.

---

## [v1.1.0] - 2026-06-02
### 🛡️ Thuật Toán Chống Spam & Lọc Trùng Tin Tự Động
Giới thiệu bộ máy lọc tin rác và phát hiện trùng lặp đa tầng hỗ trợ tối ưu dữ liệu hiển thị.

#### 📌 Tính năng mới:
* **Bộ lọc trùng 3 tầng (Anti-Spam Deduplication Engine):**
  * **Tầng 1 (Địa lý):** Sử dụng công thức Haversine đo khoảng cách tọa độ GPS (< 15 mét) để xác định cùng một tòa nhà vật lý.
  * **Tầng 2 (Thông số phòng):** So sánh tổ hợp loại phòng, diện tích, giá thuê để tự động cấp phép nếu là các phòng khác nhau trong cùng tòa nhà.
  * **Tầng 3 (Văn bản Jaccard Similarity):** So khớp độ tương đồng chuỗi tiêu đề và mô tả chi tiết phòng.
* **Xử lý trùng lặp:**
  * Trùng lặp $\ge 80\%$: Chặn đăng bài và cảnh báo đỏ chi tiết lý do.
  * Trùng lặp từ $50\% \to 79\%$: Đưa vào hàng chờ phê duyệt.

---

## [v1.0.0] - 2026-06-01
### 🌱 Phiên Bản Đầu Tiên (Initial Release)
Xây dựng nền tảng tìm kiếm và quản lý phòng trọ trơn tru dành cho sinh viên FTU.

#### 📌 Tính năng cốt lõi:
* **Trang chủ tối giản:** Bento stats grid và danh sách phòng trọ nổi bật.
* **Tìm kiếm phòng trọ (`/search`):** Editorial grid layout, bộ lọc cascade động theo thành phố và quận huyện Hà Nội/TP.HCM.
* **Chi tiết phòng trọ:** Carousel ảnh mượt mà, bảng giá chi phí dịch vụ, tích hợp bản đồ dẫn đường tương tác Leaflet + OpenStreetMap.
* **Dashboard kép:** Chuyển đổi linh hoạt giữa vai trò Khách thuê (lưu phòng trọ, yêu cầu hỗ trợ, danh bạ chủ trọ) và Chủ trọ (quản lý tin đăng, đổi trạng thái trống/đang thuê).
