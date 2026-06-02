# FindX — Tìm Nhà Cùng Bạn

**FindX** (FTU Housing Bank). Repo được làm cho mục đích nghiên cứu cá nhân của tôi, có thể được deploy miễn phí. Anh nào ủng hộ bạn đi =((

**Demo:** [https://findx-backtest-01.onrender.com/](https://findx-backtest-01.onrender.com/)

---

## Tính năng chính

| Khu vực | Mô tả |
|--------|--------|
| **Trang chủ** | Hero + tìm kiếm nhanh theo thành phố/quận, phòng nổi bật, thống kê dạng Bento |
| **Tìm phòng** (`/search`) | Lưới phòng trọ, bộ lọc theo quận, giá, loại phòng và tiện ích |
| **Chi tiết phòng** (`/property/:id`) | Carousel ảnh, bảng giá/chi phí, tiện ích, liên hệ chủ trọ, bản đồ (Leaflet) |
| **Quản lý** (`/dashboard`) | Dashboard khách thuê, chủ trọ & Admin: lưu phòng, quản lý bài đăng, ẩn/hiện và kiểm duyệt tin |
| **Đăng nhập / Đăng ký** | Phân quyền **Khách thuê** và **Chủ trọ** (dữ liệu lưu local, demo) |
| **Giao diện** | Light/Dark mode, bottom navigation trên mobile, thiết kế responsive |


---

## Công nghệ

- [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
- [React Router](https://reactrouter.com/) — định tuyến SPA
- [Phosphor Icons](https://phosphoricons.com/)
- [Leaflet](https://leafletjs.com/) / react-leaflet — bản đồ OpenStreetMap
- CSS thuần (design tokens, glassmorphism, mobile-first)

---

## Cấu trúc thư mục

```
TNCB/                              # Repository gốc (FindX / FTU Housing Bank)
│
├── public/                        # Tài nguyên tĩnh — Vite copy nguyên vào dist/ khi build
│   ├── _redirects                 # Rule SPA cho Netlify (/* → /index.html 200)
│   └── icons.svg                  # Sprite / icon dùng chung
│
├── src/                           # Mã nguồn React
│   ├── main.jsx                   # Entry: BrowserRouter, AppProvider, import CSS global
│   ├── App.jsx                    # Layout chính + định tuyến (Routes)
│   ├── App.css                    # Style legacy (template Vite, ít dùng)
│   ├── index.css                  # Style bổ sung cấp app
│   │
│   ├── components/                # UI tái sử dụng
│   │   ├── Header.jsx             # Navbar, đăng nhập/đăng ký, theme toggle, menu mobile
│   │   ├── Footer.jsx             # Footer desktop + bottom nav mobile
│   │   ├── PropertyCard.jsx       # Thẻ phòng trên lưới tìm kiếm / trang chủ
│   │   ├── PropertyMap.jsx        # Bản đồ Leaflet (trang chi tiết phòng)
│   │   └── ImageCarousel.jsx      # Carousel ảnh + lightbox
│   │
│   ├── pages/                     # Trang theo route
│   │   ├── Home.jsx               # / — Hero, tìm kiếm, phòng nổi bật, Bento stats
│   │   ├── Search.jsx             # /search — Lưới phòng + bộ lọc
│   │   ├── PropertyDetail.jsx     # /property/:id — Chi tiết, giá, liên hệ, bản đồ
│   │   └── Dashboard.jsx          # /dashboard — Panel khách thuê / chủ trọ
│   │
│   ├── context/
│   │   └── AppContext.jsx         # State toàn cục: user, theme, saved, mock data helpers
│   │
│   ├── data/                      # Dữ liệu mẫu (chưa có API)
│   │   ├── mockProperties.js      # Danh sách phòng, quận, tiện ích
│   │   └── mockContracts.js       # Hợp đồng & hóa đơn mẫu
│   │
│   └── styles/                    # Design system CSS
│       ├── variables.css          # Design tokens (màu, spacing, radius, theme dark/light)
│       ├── global.css             # Reset, typography, buttons, cards, responsive base
│       └── mobile.css             # Tinh chỉnh mobile (iPhone 17 Pro Max, safe area)
│
├── deploy/                        # Triển khai production (Docker)
│   ├── Dockerfile                 # Multi-stage: build Vite → phục vụ bằng NGINX
│   ├── docker-compose.yml         # Frontend + mock API + Redis + Cloudflare Tunnel
│   ├── nginx.conf                 # NGINX: gzip, security headers, SPA try_files
│   └── README_DEPLOY.md           # Hướng dẫn vận hành & Cloudflare Tunnel
│
├── index.html                     # HTML gốc, meta SEO, font, mount #root
├── vite.config.js                 # Cấu hình Vite + plugin React
├── eslint.config.js               # Quy tắc ESLint
├── package.json                   # Dependencies & scripts npm
│
├── chucnang.md                    # Đặc tả chức năng nghiệp vụ
├── thietke.md                     # Kế hoạch thiết kế UI/UX
├── project_architecture.md        # Sơ đồ khối kiến trúc hệ thống
├── project_algorithms.md          # Sơ đồ thuật toán khối các luồng xử lý
├── implementation_plan.md         # Kế hoạch triển khai kỹ thuật
├── RELEASES.md                    # Nhật ký phát hành & cập nhật tính năng
├── taikhoantest.md                # Danh sách tài khoản thử nghiệm
└── README.md                      # Tài liệu dự án (file này)
```

### Thư mục sinh ra khi build (không commit)

| Thư mục / file | Mô tả |
|----------------|--------|
| `node_modules/` | Dependency npm (sau `npm install`) |
| `dist/` | Bản build production (sau `npm run build`) — Netlify publish từ đây |

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
5. **Lưu tin yêu thích (Saved properties):** Quản lý mảng danh sách phòng yêu thích lưu local và cập nhật badge số lượng trên thanh tiêu đề.
6. Chi tiết sơ đồ thuật toán xem tại [project_algorithms.md](project_algorithms.md).

---

## Yêu cầu

- **Node.js** 18+ (khuyến nghị 20 LTS)
- **npm** 9+

---

## Chạy trên máy local

```bash
# Clone repository
git clone https://github.com/Spotlighterr/TNCB.git
cd TNCB

# Cài dependency
npm install

# Chạy dev server (mặc định http://localhost:5173)
npm run dev
```

### Các lệnh khác

| Lệnh | Mô tả |
|------|--------|
| `npm run build` | Build production → thư mục `dist/` |
| `npm run preview` | Xem bản build local |
| `npm run lint` | Kiểm tra ESLint |

---

## Triển khai

### Netlify (khuyến nghị cho frontend)

1. Kết nối repo GitHub với [Netlify](https://www.netlify.com/).
2. Cấu hình build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Deploy — file `public/_redirects` được copy vào `dist` để **tránh lỗi 404 khi reload** trên các route như `/search`, `/dashboard`.
4. Hoặc sử dụng Render.com, build frontend.

### Docker + NGINX

Dùng khi cần chạy stack đầy đủ (frontend + mock API + Redis + Cloudflare Tunnel). Xem hướng dẫn chi tiết trong [`deploy/README_DEPLOY.md`](deploy/README_DEPLOY.md).
Chưa bao gồm cơ sở dữ liệu (bổ sung sau).

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
