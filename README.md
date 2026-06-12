# FindX - Tìm Nhà Cùng Bạn

**FindX** (FTU Housing Bank). Repo được làm cho mục đích nghiên cứu cá nhân của tôi, có thể được deploy miễn phí. Anh nào ủng hộ bạn đi =((

**Demo:** [https://findx.id.vn](https://findx.id.vn)

---

## Tính năng chính

| Khu vực | Mô tả |
|--------|--------|
| **Trang chủ** | Hero + tìm kiếm nhanh theo thành phố/quận, phòng nổi bật, thống kê dạng Bento |
| **Tìm phòng** (`/search`) | Lưới phòng trọ, bộ lọc theo quận, giá, loại phòng và tiện ích |
| **Chi tiết phòng** (`/property/:id`) | Carousel ảnh, bảng giá/chi phí, tiện ích, liên hệ chủ trọ, bản đồ (Leaflet) |
| **Quản lý** (`/dashboard`) | Dashboard khách thuê, chủ trọ & Admin: lưu phòng, quản lý bài đăng, ẩn/hiện, kiểm duyệt tin và lọc tin trùng 3 lớp |
| **Đăng nhập / Đăng ký** | Đăng nhập thường & Google SSO (xác thực JWT), hoàn thiện hồ sơ với số điện thoại duy nhất, phân quyền Khách thuê, Chủ trọ và Admin |
| **Giao diện** | Light/Dark mode, bottom navigation trên mobile, thiết kế responsive |


---

## Công nghệ

- **Frontend**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/), React Router, Phosphor Icons, Leaflet (bản đồ), CSS thuần.
- **Backend**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/), [Mongoose/MongoDB](https://www.mongodb.com/), JWT authentication, `google-auth-library` cho Google SSO.
- **DevOps & Giám sát**: [Docker & Docker Compose](https://www.docker.com/), [Nginx](https://www.nginx.com/) (Reverse Proxy, Basic Auth), [Cloudflare Tunnel](https://www.cloudflare.com/products/tunnel/), [Netdata](https://www.netdata.cloud/) (giám sát phần cứng), Custom python power tracker daemon.

---

## Cấu trúc thư mục

```
TNCB/                              # Thư mục gốc dự án FindX
│
├── backend/                       # Máy chủ API Node.js/Express (Modular Monolith)
│   ├── src/
│   │   ├── config/                # Cấu hình db.js kết nối MongoDB
│   │   ├── middleware/            # Middleware dùng chung (auth.js, rateLimiter.js)
│   │   ├── modules/               # Các mô-đun nghiệp vụ độc lập (chuẩn bị cho Microservices)
│   │   │   ├── auth/              # Mô-đun Xác thực (User, authController, authRoutes)
│   │   │   ├── property/          # Mô-đun Tin đăng (Property, propertyController, propertyRoutes, propertyBloomFilter, deduplication)
│   │   │   └── ticket/            # Mô-đun Hỗ trợ (Ticket, ticketController, ticketRoutes)
│   │   └── index.js               # Entry point chạy server (Port 5000)
│   ├── .env                       # Biến môi trường backend
│   ├── src/seedData.js            # Script seeding khởi tạo dữ liệu
│   └── package.json
│
├── frontend/                      # Ứng dụng client React (Vite)
│   ├── public/                    # Tài nguyên tĩnh (sprites, redirects)
│   ├── src/
│   │   ├── assets/                # Hình ảnh minh họa
│   │   ├── components/            # Giao diện dùng chung (Header, Footer, ProfileModal...)
│   │   ├── context/               # AppContext.jsx xử lý state và gọi APIs
│   │   ├── pages/                 # Trang Route (Home, Search, PropertyDetail, Dashboard)
│   │   ├── styles/                # CSS variables, global, mobile styles
│   │   └── main.jsx / App.jsx     # Điểm bắt đầu React client (Port 5173)
│   ├── index.html                 # Chứa SDK Google Identity Services
│   └── package.json
│
├── deploy/                        # Tập lệnh Docker để deploy production
│   ├── nginx.conf                 # Cấu hình Nginx reverse proxy & Basic Authentication
│   ├── .htpasswd                  # Lưu trữ thông tin xác thực trang giám sát đã mã hóa
│   ├── power_tracker.py           # Daemon Python theo dõi điện năng tiêu thụ thực tế
│   └── tncb-power-tracker.service # Service systemd khởi chạy cùng hệ điều hành
│
├── task.md                        # Lộ trình & Việc cần làm ở môi trường thực tế (SSO/MFA/Deploy/Microservices)
├── README.md                      # Tài liệu hướng dẫn (File này)
└── [Các file tài liệu thiết kế & thuật toán khác] (.md)
```


### Thư mục sinh ra khi build (không commit)

| Thư mục / file | Mô tả |
|----------------|--------|
| `node_modules/` | Dependency npm (sau `npm install`) |
| `dist/` | Bản build production (sau `npm run build`) - Netlify publish từ đây |

---

## Kiến trúc & Thuật toán cốt lõi

### Kiến trúc hệ thống
* **Tầng dữ liệu:** Quản lý tập trung bằng React Context, đồng bộ tự động 2 chiều với `localStorage` qua các key `TNCB_PROPERTIES`, `TNCB_CONTRACTS`, `TNCB_SAVED`, `TNCB_USER`.
* **Phân cấp trang:**
  * **Trang chủ (`/`):** Hero section tối giản + Bento Stats Grid.
  * **Tìm kiếm (`/search`):** Giao diện danh bạ dạng Editorial Grid Layout kèm bộ lọc thông minh.
  * **Chi tiết (`/property/:id`):** Trình diễn album ảnh trượt, chi phí dịch vụ, bản đồ tương tác Leaflet.js ở chân trang.
  * **Dashboard (`/dashboard`):** Dashboard ba vai trò cực kỳ linh hoạt (Khách thuê / Chủ nhà / Quản trị viên Admin).
* **Phân quyền Admin:** Tài khoản `admin@tncb.vn` có quyền quản trị tối cao (sửa/xóa/gỡ bất kỳ tin nào, gắn/gỡ nhãn xác thực nhanh, và truy cập hàng chờ duyệt tin trùng lặp).
* Chi tiết sơ đồ khối kiến trúc xem tại [project_architecture.md](project_architecture.md).

### Thuật toán xử lý chính
1. **Bộ lọc thông minh:** Lọc cascade động theo Quận huyện tùy biến theo Thành phố, kiểm tra khoảng giá nhập (tự định dạng VND) và tiện ích tích hợp mà không tải lại trang.
2. **Gỡ & Đăng lại tin (Unlist/Publish):** Ẩn lập tức bài đăng khỏi trang tìm kiếm công khai/bản đồ mà không xóa dữ liệu, đồng thời loại bỏ bài đăng đó khỏi tập kiểm tra trùng lặp của thuật toán.
3. **Đồng bộ trạng thái bản đồ:** Chủ trọ gạt Switch phòng trống $\leftrightarrow$ đang thuê $\rightarrow$ cập nhật tức thì trạng thái marker trên bản đồ của khách thuê.
4. **Lọc trùng tin tự động 3 lớp & Hàng chờ Admin:** 
   - Kiểm tra khoảng cách GPS (công thức Haversine < 15m).
   - Kiểm tra tổ hợp đặc tính phòng (loại phòng, diện tích, giá).
   - Tính độ tương đồng văn bản Jaccard ($\ge 80\%$ chặn spam; $50\% \to 79\%$ chuyển trạng thái `pending` sang hàng chờ duyệt thủ công của Admin hiển thị giao diện đối chiếu song song).
5. **Tối ưu hóa Bloom Filter chống Cache Penetration:** Bộ lọc Bloom Filter tự phát triển bằng mã JS (thuật toán FNV-1a) chạy dưới dạng middleware, kiểm tra format ID và lọc chặn 100% request truy cập tin trọ ảo trước khi chúng chạm vào Database để chống quá tải MongoDB.
6. **Lịch sử xem tin (View History):** Quản lý lịch sử xem các bài đăng trong vòng 7 ngày gần nhất lưu ở Local Storage của trình duyệt và tự động dọn dẹp để tránh làm phình dữ liệu.
7. **Bảo mật, giám sát phần cứng & điện năng tiêu thụ:**
   - **Log Rotation**: Thiết lập giới hạn tối đa logs cho mỗi container (30MB) tránh đầy ổ SSD.
   - **Netdata & Basic Auth**: Trang giám sát `monitor.findx.id.vn` bảo mật tài khoản tĩnh qua Basic Auth của Nginx.
   - **Power Tracker**: Dịch vụ nền Python theo dõi điện năng CPU Intel RAPL, xuất giao diện dashboard `/power-report.html` theo dõi tiền điện và công suất tiêu thụ của server.
8. **Tối ưu hóa hình ảnh & Dọn dẹp ổ đĩa tự động (WebP uploads & GC)**:
   - Sử dụng middleware `multer` và `sharp` chuyển đổi toàn bộ ảnh tải lên thành định dạng `.webp` nén ở mức `85%`, kích thước tối đa `1600px` trực tiếp trên server thay vì lưu Base64 thô.
   - Tích hợp bộ dọn dẹp (Garbage Collector) chạy ngầm tự động gọi `fs.promises.unlink` xóa tệp tin ảnh cũ khỏi ổ đĩa khi tin đăng bị thay đổi ảnh hoặc xóa bài viết.
   - Lưu trữ dữ liệu ảnh tĩnh an toàn qua Docker Named Volume `tncb_uploads` và Nginx Proxy `/uploads`.
9. Chi tiết sơ đồ thuật toán xem tại [project_algorithms.md](project_algorithms.md).

---

## Yêu cầu

- **Node.js** 18+ (khuyến nghị 20 LTS)
- **npm** 9+

---

## Chạy trên máy local

### 1. Cấu hình Backend
```bash
cd TNCB/backend
npm install

# Tạo file .env và điền các cấu hình cần thiết (ví dụ: MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID)
cp .env.example .env

# Chạy seed dữ liệu mẫu lên database (nếu cần thiết)
node src/seedData.js

# Khởi chạy server API (mặc định chạy ở cổng http://localhost:5000)
npm run dev
```

### 2. Cấu hình Frontend
Mở một terminal mới:
```bash
cd TNCB/frontend
npm install

# Khởi chạy dev server (mặc định chạy ở cổng http://localhost:5173)
npm run dev
```

---

## Triển khai

### Netlify (khuyến nghị cho frontend)

1. Kết nối repo GitHub với [Netlify](https://www.netlify.com/).
2. Cấu hình build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Deploy - file `public/_redirects` được copy vào `dist` để **tránh lỗi 404 khi reload** trên các route như `/search`, `/dashboard`.
4. Hoặc sử dụng Render.com, build frontend.

### Docker + NGINX

Dùng khi cần chạy cụm dịch vụ đầy đủ (frontend + backend API + MongoDB + Redis + Cloudflare Tunnel). Xem hướng dẫn chi tiết trong [`deploy/README_DEPLOY.md`](deploy/README_DEPLOY.md).

```bash
docker compose -f deploy/docker-compose.yml up --build -d
```

Truy cập: [http://localhost](http://localhost)

---

## Mobile

Giao diện mobile được tinh chỉnh theo viewport của iP 17 Promax (440 × 956 CSS px), hỗ trợ **safe area** (Dynamic Island, home indicator). File stylesheet: `src/styles/mobile.css`.
Đang tiến hành xây dựng mobile app bằng React Native. 

---

## Tài liệu tham khảo

| File | Nội dung |
|------|----------|
| [`chucnang.md`](chucnang.md) | Đặc tả chức năng & luồng người dùng |
| [`thietke.md`](thietke.md) | Kế hoạch thiết kế giao diện |
| [`project_architecture.md`](project_architecture.md) | Sơ đồ khối kiến trúc hệ thống |
| [`project_algorithms.md`](project_algorithms.md) | Sơ đồ thuật toán khối các luồng xử lý |
| [`implementation_plan.md`](implementation_plan.md) | Kế hoạch triển khai kỹ thuật |
| [`RELEASES.md`](RELEASES.md) | Nhật ký phát hành & cập nhật tính năng |
| [`taikhoantest.md`](taikhoantest.md) | Danh sách tài khoản thử nghiệm |
| [`deploy/README_DEPLOY.md`](deploy/README_DEPLOY.md) | Triển khai Docker & Cloudflare Tunnel |

---

## Liên hệ

- Email: vuduchuyab@gmail.com
- Discord: spotlighter

---

## Bản quyền

Development by **Spotlighterr** 
