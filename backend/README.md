# ⚙️ Hướng dẫn cấu hình môi trường & Đồng bộ đa thiết bị (Backend)

Tài liệu này hướng dẫn cách thiết lập biến môi trường phát triển cục bộ (`.env`) và cách đồng bộ hóa cơ sở dữ liệu khi làm việc trên nhiều thiết bị khác nhau (ví dụ: máy tính bàn và laptop).

> [!IMPORTANT]
> **Tài liệu này hoàn toàn an toàn để công khai trên GitHub** vì nó chỉ chứa các chỉ dẫn cấu hình và không chứa bất kỳ mật khẩu hay thông tin bảo mật thực tế nào.

---

## 1. Thiết lập biến môi trường cục bộ (.env)

Khi tải dự án lần đầu tiên về máy tính mới, anh hãy thực hiện theo các bước sau để cấu hình phần Backend:

1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Tạo tệp cấu hình `.env` bằng cách sao chép từ tệp mẫu:
   - **Cách 1 (Dùng Terminal)**:
     ```bash
     cp .env.example .env
     ```
   - **Cách 2 (Thủ công)**: Chuột phải vào tệp `.env.example` chọn **Copy**, sau đó **Paste** ngay tại chỗ và đổi tên tệp mới thành **`.env`**.

3. Mở tệp `.env` vừa tạo và điền các giá trị thực tế của anh:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/tncb   # Thay bằng URI MongoDB của máy hiện tại
   JWT_SECRET=ma_khoa_bi_mat_cua_rieng_ban      # Thay bằng một chuỗi ký tự ngẫu nhiên bất kỳ
   ```

4. Tiến hành cài đặt thư viện và khởi động server:
   ```bash
   npm install
   npm run dev
   ```

---

## 2. Đồng bộ dữ liệu khi làm việc trên nhiều máy tính

Nếu anh làm việc trên cả máy tính bàn và laptop, để đảm bảo dữ liệu (tin đăng, tài khoản...) luôn giống nhau ở cả hai thiết bị, hãy sử dụng cơ sở dữ liệu đám mây **MongoDB Atlas (Miễn phí)** thay cho MongoDB cài cục bộ trên máy (`localhost`):

1. Đăng ký tài khoản miễn phí trên [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database).
2. Tạo một Cụm cơ sở dữ liệu (Cluster) miễn phí và tạo User truy cập DB.
3. Lấy **Chuỗi kết nối (Connection String)** có dạng:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/tncb
   ```
4. Điền chuỗi kết nối này vào dòng `MONGODB_URI` trong tệp `.env` của **cả hai máy tính**.
   - Máy 1: `.env` chứa `MONGODB_URI=mongodb://srv...`
   - Máy 2: `.env` chứa `MONGODB_URI=mongodb://srv...` (giống hệt Máy 1)
5. Khi đó, dù lập trình trên thiết bị nào, dữ liệu của anh cũng sẽ được đọc/ghi trực tiếp trên mây và đồng bộ 100%.

---

## 3. Cấu hình khi đưa vào vận hành thực tế (Production)

Khi đưa ứng dụng lên các máy chủ đám mây chạy thật (như Render, Railway, AWS...):
- **Không tạo tệp `.env` vật lý trên server**.
- Truy cập vào trang quản trị (Dashboard) của dịch vụ hosting của anh, tìm phần **Environment Variables** (hoặc **Config Vars**).
- Nhập trực tiếp các cặp khóa-giá trị (`MONGODB_URI`, `JWT_SECRET`, `PORT`) lên đó. Máy chủ sẽ tự động nạp các giá trị này vào bộ nhớ của ứng dụng khi khởi chạy.
