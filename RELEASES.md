# 🚀 Nhật Ký Phát Hành & Cập Nhật Tính Năng (Project Releases Log)

Tài liệu này ghi nhận toàn bộ các phiên bản phát hành lớn của hệ thống **TNCB Rent (FindX)**, chi tiết hóa các thay đổi và tính năng được cập nhật.

> 🔔 **Quy trình tạo GitHub Release tự động:**
> Mỗi khi phát hành phiên bản mới, bạn chỉ cần:
> 1. Cập nhật file `RELEASES.md` này với format:
>    ```markdown
>    ## [vX.Y.Z] - YYYY-MM-DD
>    ### Tiêu đề release
>    Chi tiết thay đổi...
>    ```
> 2. Commit và push file lên GitHub.
> 3. Tạo tag và push tag:
>    ```bash
>    git tag vX.Y.Z
>    git push origin vX.Y.Z
>    ```
> GitHub Actions sẽ tự động đọc phần nội dung tương ứng dưới tiêu đề `## [vX.Y.Z]` trong file này và tạo GitHub Release mới tương ứng.

## [v2.5.0] - 2026-06-12
### 📊 Nhập Liệu Song Song (Nhập Tay & Google Sheets) & Lưu MongoDB Trực Tiếp

Phiên bản này tích hợp và tối ưu hóa hệ thống để hỗ trợ song song hai hình thức nhập tin đăng (nhập thủ công trên website và đồng bộ từ Google Sheets), đồng thời bảo đảm an toàn dữ liệu cũ và khắc phục các vấn đề tương thích ID tùy chỉnh.

#### 📌 Tính năng mới & Cải tiến:
* **Hỗ trợ chạy song song 2 luồng nhập liệu:**
  - Giữ lại đầy đủ các tính năng Đăng/Sửa/Xóa tin thủ công trên trang Dashboard dành cho Admin và Chủ trọ.
  - Đồng thời cho phép đồng bộ tự động định kỳ hoặc kích hoạt Webhook tức thời từ Google Sheets.
* **Lưu trữ Persistent MongoDB cho dữ liệu Google Sheets:**
  - Chuyển đổi cơ chế lưu trữ dữ liệu Google Sheets từ lưu tạm trên RAM sang lưu trực tiếp vào cơ sở dữ liệu MongoDB thông qua trường phân biệt `source: 'sheet'` và `source: 'manual'`.
  - Tích hợp cấu hình dọn dẹp tin đăng cũ (`clearExisting`):
    - Khi kích hoạt dọn dẹp (`clearExisting === true`): Hệ thống chỉ xóa các tin đăng có nguồn từ Google Sheets (`source: 'sheet'`), giữ nguyên 100% các tin đăng do người dùng nhập tay (`source: 'manual'`).
    - Khi tắt dọn dẹp (`clearExisting === false`): Thực hiện cập nhật đè (upsert) từng tin từ Google Sheets theo ID ổn định để tránh ghi đè dữ liệu.
* **Nới lỏng bộ lọc Bloom Filter & Middleware:**
  - Cấu hình lại Regex trong middleware `checkPropertyBloomFilter` để cho phép cả định dạng ID Mongoose (24 ký tự hex) và định dạng ID chuỗi tùy chỉnh từ Google Sheets (`prop-xxxx`).
  - Tự động gọi lại `initPropertyBloomFilter()` sau mỗi phiên đồng bộ để cập nhật danh sách ID hợp lệ mới nhất vào Bloom Filter.
* **Sửa lỗi CastError khi so khớp trùng tin đăng:**
  - Chuyển đổi kiểu dữ liệu của trường `duplicateReport.matchedProperty` trong Schema `Property` sang `String`. Việc này giúp ngăn ngừa các lỗi CastError của Mongoose khi hệ thống so sánh trùng lặp với tin đăng từ Google Sheets.

---

## [v2.4.0] - 2026-06-04
### 🔒 Tích hợp Xác thực Email OTP & Đồng tồn tại với Bảo mật 2 lớp (MFA)
Phiên bản này nâng cấp luồng đăng nhập bảo mật của hệ thống bằng phương thức xác thực mã OTP qua Email, đồng thời thiết lập cơ chế đồng tồn tại và phân cấp ưu tiên thông minh giữa Email OTP và ứng dụng Authenticator (MFA).

#### 📌 Tính năng mới & Cải tiến:
* **Luồng xác thực Email OTP đăng nhập thông minh:**
  - Đăng ký tài khoản (Người dùng mới): Bắt buộc xác thực mã OTP gửi qua Email để hoàn tất đăng ký.
  - Đăng nhập (Từ lần thứ hai): Mặc định không yêu cầu OTP, trừ khi người dùng chủ động kích hoạt tính năng xác thực OTP qua Email trong cấu hình Hồ sơ cá nhân.
  - Cơ chế Google SSO: Tự động bỏ qua kiểm tra Email OTP khi đăng nhập nhanh bằng Google, đảm bảo trải nghiệm liền mạch.
* **Cơ chế phân cấp ưu tiên Bảo mật (MFA vs OTP):**
  - Nếu người dùng kích hoạt cả hai tính năng Email OTP và Ứng dụng Authenticator (MFA): Hệ thống sẽ tự động ưu tiên và chỉ yêu cầu điền mã Authenticator (MFA) có tính bảo mật cao hơn khi đăng nhập.
* **Giao diện quản lý Bảo mật & Xác thực song song:**
  - Tái cấu trúc tab MFA thành **Bảo mật & Xác thực** trong Profile Modal, hiển thị song song cấu hình Email OTP và Authenticator kèm nhãn trạng thái kích hoạt trực quan.
  - Tích hợp khung nhập mã 6 số cho Email OTP tại Auth Modal trên Header, có hỗ trợ badge hiển thị mã OTP Sandbox trên môi trường phát triển cục bộ.

---

## [v2.3.0] - 2026-06-04
### 📸 Tải Ảnh WebP Cục Bộ, Tự Động Dọn Dẹp Ảnh Cũ & Đồng Bộ Persistent Volume
Phiên bản này tối ưu hóa dung lượng lưu trữ hình ảnh tin đăng trọ, tăng tốc độ tải trang bằng định dạng WebP chất lượng cao và giải phóng ổ đĩa máy chủ qua cơ chế dọn dẹp ảnh mồ côi tự động.

#### 📌 Tính năng mới & Cải tiến:
* **Tải file và nén chuyển đổi WebP trực tiếp trên server:**
  - Thay thế cơ chế lưu ảnh Base64 thô nặng nề trong cơ sở dữ liệu MongoDB bằng việc tải luồng nhị phân thông qua middleware `multer` và `sharp`.
  - Tự động nén chất lượng ở mức **`85%`**, thay đổi kích thước tối đa về độ phân giải **`1600px`** (HD sắc nét) và chuyển đổi sang định dạng **`.webp`** siêu nhẹ trước khi ghi tệp tin lên đĩa cứng.
* **Cơ chế Garbage Collection tự động dọn rác ổ cứng:**
  - Khi chủ trọ chỉnh sửa bài viết và thay đổi/xóa ảnh: Backend tự động so khớp và gọi `fs.promises.unlink()` để xóa vật lý các file ảnh cũ bị loại bỏ.
  - Khi xóa tin đăng: Tự động xóa sạch toàn bộ các file ảnh đính kèm của bài viết đó trên đĩa cứng máy chủ.
* **Đồng bộ persistent lưu trữ an toàn (Docker Volume & Nginx Proxy):**
  - Cấu hình volume `tncb_uploads` ánh xạ vào `/app/uploads` bên trong container backend để bảo toàn dữ liệu hình ảnh của chủ trọ khi restart hoặc rebuild hệ thống.
  - Bổ sung định tuyến `/uploads` trên Nginx Reverse Proxy để phục vụ truy cập trực tiếp file ảnh tĩnh.
  - Sửa lỗi phân quyền `Permission denied` bên trong môi trường Docker bằng việc gán quyền sở hữu thư mục cho user `node` ngay khi khởi tạo container.
* **Sửa lỗi Phường/Xã khi đăng tin:**
  - Tích hợp ô chọn Phường/Xã cascading liên kết động theo Thành phố/Quận huyện trên giao diện Dashboard, ngăn chặn triệt để lỗi thiếu trường thông tin bắt buộc từ Mongoose Schema.

---

## [v2.2.0] - 2026-06-04
### 🔒 Nâng cấp Bảo mật, Giám sát Phần cứng Docker & Tối ưu hóa Bloom Filter chống Cache Penetration
Phiên bản này mang lại các cải tiến cốt lõi về bảo mật truy cập từ xa, giám sát phần cứng vật lý chuyên sâu và tối ưu hóa hiệu năng tầng cơ sở dữ liệu.

#### 📌 Tính năng mới & Cải tiến:
* **Tối ưu hóa Bloom Filter chống Cache Penetration:**
  * Tích hợp bộ lọc Bloom Filter tự phát triển bằng mã JavaScript thuần (sử dụng thuật toán băm FNV-1a siêu tốc độ) chạy tại lớp Middleware.
  * Tự động đồng bộ nạp toàn bộ danh sách ID tin đăng có trong MongoDB khi server khởi chạy và thêm ID mới khi chủ trọ tạo tin trọ.
  * Tự động kiểm tra định dạng và so khớp ID tức thì, chặn đứng 100% các request truy cập tin đăng ảo/không tồn tại, ngăn chặn hoàn toàn việc quá tải cơ sở dữ liệu MongoDB.
* **Bảo mật truy cập trang giám sát (Nginx Basic Auth):**
  * Tái cấu trúc file cấu hình Nginx trong Docker phục vụ reverse proxy cho Netdata qua tên miền phụ `monitor.findx.id.vn`.
  * Thiết lập bảo mật Basic Authentication cố định với tài khoản và mật khẩu được mã hóa an toàn bằng thuật toán APR1-MD5 trong file `.htpasswd`.
* **Giám sát năng lượng máy chủ tự động (tncb-power-tracker):**
  * Viết dịch vụ nền Python `power_tracker.py` chạy trực tiếp dưới dạng Systemd service trên host để thu thập dữ liệu tiêu thụ điện từ CPU Intel RAPL.
  * Tự động cộng thêm mức tiêu thụ điện tĩnh (baseline 5W) của laptop khi gập nắp màn hình để đảm bảo đo đạc chính xác nhất.
  * Tạo bảng thống kê đẹp mắt `power-report.html` tích hợp vào Nginx và được bảo mật đăng nhập tại địa chỉ `https://monitor.findx.id.vn/power-report.html`.
* **Docker Log Rotation chống quá tải ổ cứng:**
  * Thiết lập chính sách quay vòng file log cho toàn bộ 6 container trong tệp `docker-compose.yml` (tối đa 3 file log, 10MB mỗi file), khống chế dung lượng logs tối đa dưới 180MB để ngăn ngừa tràn SSD.

---

## [v2.1.0] - 2026-06-03
### 🛠️ Tái cấu trúc Modular Monolith & Tối ưu hóa Trải nghiệm Cổng thông tin kết nối
Phiên bản này tối ưu hóa kiến trúc mã nguồn chuẩn bị cho định hướng Microservices tương lai, đồng thời tinh giản các tính năng sau thuê để định vị FindX như một mạng xã hội kết nối phòng trọ và roommate.

#### 📌 Tính năng mới & Cải tiến:
* **Tái cấu trúc Modular Monolith:** Phân bổ toàn bộ controllers, models và routes backend vào các module nghiệp vụ biệt lập (`modules/auth`, `modules/property`, `modules/ticket`), sẵn sàng cho việc tách database/dịch vụ sau này.
* **Lịch sử xem tin tự động dọn dẹp:** Loại bỏ nút "Yêu thích" (Favorites). Thay vào đó là tính năng tự động ghi nhận các phòng trọ người dùng đã xem trong 7 ngày gần nhất, tự động xóa bản ghi quá hạn để tránh phình dữ liệu.
* **Tối giản hóa Dashboard Tenant:** Loại bỏ các tab quản lý sau thuê bao gồm "Phòng đang thuê", "Yêu cầu hỗ trợ", và "Danh bạ liên hệ", chỉ giữ lại tab Lịch sử xem tin và Tin ở ghép của tôi.
* **Tự động cuộn trang lên đầu:** Cấu hình tự động đặt lại vị trí cuộn lên `(0, 0)` khi người dùng chuyển trang, nhấn Back hoặc reload trang.
* **Tích hợp nút Sáng/Tối vào menu nổi:** Gỡ nút đổi giao diện ở Header, đưa vào danh mục hiển thị khi click nút Liên hệ nổi dưới góc phải màn hình kèm hiệu ứng gradient động.

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
