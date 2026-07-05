# Kế Hoạch Xây Dựng Bản Clone Nền Tảng Thuê Trọ Thông Minh (Tương tự HouseZy.vn)

Tài liệu này đề xuất kế hoạch thiết kế và triển khai nền tảng **TNCB Rent** (hoặc **FTU Housing Bank**) được phát triển hoàn toàn bằng **JavaScript** và tuân thủ nghiêm ngặt bộ tiêu chuẩn thiết kế cao cấp **Taste Skill** (chống rập khuôn, chống AI slop).

---

## 🎨 Tuyên Bố Thiết Kế & Các Bộ Xoay (Design Read & Dials)

> [!IMPORTANT]
> **Design Read:** "Reading this as: Web application landing + premium directory for students and young professionals seeking room rentals, with a high-end, clean, and highly editorial vibe language, leaning toward a custom Outfit-based design system + targeted Google Maps/OSM footer routing integration."

### Cấu hình các bộ xoay (Core Dials)
- **`DESIGN_VARIANCE: 7`** - Bố cục bất đối xứng, lưới Bento hiển thị chỉ số tài sản, trang chi tiết phân mảng chuyên nghiệp.
- **`MOTION_INTENSITY: 6`** - Chuyển động mượt mà sử dụng Spring Physics, hiệu ứng di chuột marker bản đồ mượt và hiệu ứng vào trang êm ái.
- **`VISUAL_DENSITY: 4`** - Khoảng trống thoáng đãng cho trang chủ và danh sách, tối ưu hóa mật độ hiển thị thông tin vừa phải trong bảng điều khiển và thanh bên bản đồ.

---

## 🛠️ Công Nghệ & Quy Tắc Thiết Kế (Tech Stack & Styling Rules)

Hệ thống sẽ được xây dựng trên nền tảng cực kỳ ổn định, tốc độ và tối ưu trải nghiệm:

| Thành phần | Công nghệ | Cách áp dụng quy tắc Taste Skill |
| :--- | :--- | :--- |
| **Frontend Framework** | **Vite + React (JavaScript)** | Sử dụng state-driven của React để xử lý việc lọc tìm kiếm động, lưu trữ trạng thái lưu tin yêu thích, quản lý hóa đơn. |
| **Styling System** | **Vanilla CSS + CSS Variables** | Thiết lập hệ thống Token tập trung tại `variables.css`. **Tuyệt đối cấm sử dụng AI-purple gradients** (tông màu tím lập lòe mặc định). |
| **Typography** | **Outfit + Geist Mono** | Bỏ qua font `Inter` mặc định nhàm chán. Sử dụng **Outfit** cho Display/Headline và **Geist Mono** cho các chỉ số kỹ thuật phòng trọ. |
| **Bản đồ tương tác** | **Google Maps / Leaflet.js** | Tích hợp bản đồ tương tác chỉ dẫn vị trí chính xác ở chân trang chi tiết phòng trọ giúp khách thuê dễ dàng xem sơ đồ dẫn đường từ các địa điểm lân cận. |
| **Icons** | **Phosphor Icons** | Sử dụng duy nhất bộ icon Phosphor để đảm bảo tính nhất quán nét vẽ và `strokeWidth` (mặc định `1.5` hoặc `2.0`). |

---

## 🎨 Hệ Thống Tokens & Bảng Màu (CSS Variables)

Để kiểm soát 100% thuộc tính CSS nâng cao, chúng tôi định nghĩa hệ thống token nhất quán như sau tại `src/styles/variables.css`:

```css
:root {
  /* Fonts */
  --font-display: 'Outfit', sans-serif;
  --font-mono: 'Geist Mono', monospace;

  /* Colors (Light Theme - default) */
  --bg-primary: #fcfcfc;
  --bg-secondary: #f4f5f6;
  --color-text-main: #0f172a;
  --color-text-muted: #475569;
  
  /* Taste Skill: Khóa 1 màu nhấn đồng nhất (FTUGate Crimson) */
  --color-accent: #ad171c; /* Crimson Red */
  --color-accent-hover: #801115; /* Crimson Dark */
  --color-accent-subtle: rgba(173, 23, 28, 0.08);
  
  /* Glassmorphism token */
  --glass-bg: rgba(255, 255, 255, 0.65);
  --glass-border: rgba(15, 23, 42, 0.08);
  --glass-shadow: 0 8px 32px 0 rgba(15, 23, 42, 0.04);
  
  /* Shape Lock: Bo góc nhất quán */
  --radius-main: 12px;
  --radius-subtle: 8px;
  --radius-pill: 9999px;
  
  /* Layout constraints */
  --header-height: 72px;
  --max-width: 1400px;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Colors (Dark Theme) */
    --bg-primary: #0b0f19; /* Deep Slate */
    --bg-secondary: #141b2d;
    --color-text-main: #f8fafc;
    --color-text-muted: #94a3b8;
    
    --color-accent: #ff5a5f; /* Crimson Light */
    --color-accent-hover: #ad171c;
    --color-accent-subtle: rgba(255, 90, 95, 0.12);
    
    /* Glassmorphism token dark */
    --glass-bg: rgba(11, 15, 25, 0.75);
    --glass-border: rgba(248, 250, 252, 0.1);
    --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.32);
  }
}
```

---

## 🚫 Các Quy Tắc Thiết Kế Bắt Buộc (Strict Design Guardrails)

Dự án này tuân thủ các quy tắc cốt lõi của **Taste Skill** để loại bỏ mọi cảm giác "mì ăn liền" thường gặp ở các sản phẩm do AI tạo ra:

1. **Khóa màu đồng nhất (Color Consistency Lock)**: Chọn duy nhất 1 tông màu nhấn chủ đạo (Đỏ FTU Crimson `#ad171c` đại diện cho màu sắc đặc trưng của Ngoại thương), tuyệt đối không pha tạp các màu tương phản lòe loẹt khác ở các phần dưới.
2. **Khóa hình khối nhất quán (Shape Consistency Lock)**: Đồng bộ hóa toàn bộ bo góc (radius) trên trang: Nút và thẻ đều sử dụng `border-radius: 12px`, các nút hành động nhỏ hơn dùng `border-radius: 8px`.
3. **Cấm tuyệt đối dấu gạch ngang Em-Dash (`—`)**: Loại bỏ hoàn toàn dấu gạch ngang này trong tiêu đề, trích dẫn hay phần ghi chú.
4. **Giới hạn số lượng thẻ lông mày (Eyebrow Restraint)**: Tối đa 1 eyebrow (nhãn chữ in hoa nhỏ phía trên tiêu đề) trên mỗi 3 phần của trang để tránh sự lặp lại đơn điệu.
5. **Cấm tiêu đề cột đôi (Split-Header Ban)**: Không sử dụng kiểu bố cục "bên trái tiêu đề to + bên phải đoạn mô tả ngắn". Các phần tiêu đề luôn được căn lề dọc tinh tế, cân đối.
6. **Khống chế kích thước màn hình đầu tiên (Hero Viewport Stability)**: Phần Hero của trang chủ bắt buộc nằm gọn trong màn hình đầu tiên (`min-h-[100dvh]`). Tiêu đề không quá 2 dòng, đoạn mô tả không quá 20 từ, đảm bảo các nút kêu gọi hành động (CTA) luôn hiển thị mà không cần cuộn trang.
7. **Cấm ảnh chụp màn hình giả lập bằng Div**: Mọi hình ảnh xem trước phần mềm hoặc tài sản phải là ảnh thực tế hoặc sơ đồ thiết kế chỉn chu được tạo bằng công cụ tạo ảnh, không tự vẽ khung xương bảng điều khiển bằng CSS thô sơ.
8. **Đa dạng hóa nền bento (Bento Background Diversity)**: Các ô lưới Bento phải có ít nhất 2 ô chứa hình ảnh trực quan hoặc màu nền đậm, tránh toàn bộ các ô đều có nền trắng chữ đen nhàm chán.

---

## 💾 Cấu Trúc Dữ Liệu Thực Tế (Mock Data Structure)

Để đảm bảo Bản đồ tương tác hiển thị tọa độ thực tế chính xác tại TP.HCM (Quận 1, Bình Thạnh, Gò Vấp, Phú Nhuận), file `src/data/mockProperties.js` sẽ có cấu trúc như sau:

```javascript
export const mockProperties = [
  {
    id: "prop-1",
    title: "Căn Hộ Studio Ban Công Kính Gần ĐH Ngoại Thương FTU",
    type: "Studio",
    price: 6500000, // VND
    area: 32, // m2
    district: "Bình Thạnh",
    address: "215 D5, Phường 25, Bình Thạnh, TP. HCM",
    coords: [10.8016, 106.7118], // Leaflet [lat, lng]
    images: [
      "https://picsum.photos/seed/prop-ftu-1/800/600",
      "https://picsum.photos/seed/prop-ftu-2/800/600"
    ],
    verified: true,
    amenities: ["AirConditioner", "Balcony", "Fridge", "WashingMachine", "FingerprintLock"],
    electricity: 3800, // VND/kwh
    water: 100000, // VND/person
    service: 150000, // VND/room
    owner: {
      name: "Nguyễn Văn Đạt",
      phone: "0869333366",
      avatar: "https://picsum.photos/seed/owner-dat/100/100"
    }
  },
  {
    id: "prop-2",
    title: "Phòng Trọ Duplex Tối Giản Nguyễn Gia Trí Gần HUTECH",
    type: "Duplex",
    price: 5200000,
    area: 28,
    district: "Bình Thạnh",
    address: "135/2 Nguyễn Gia Trí, Phường 25, Bình Thạnh, TP. HCM",
    coords: [10.8032, 106.7145],
    images: [
      "https://picsum.photos/seed/prop-hutech-1/800/600"
    ],
    verified: true,
    amenities: ["AirConditioner", "WashingMachine", "FreeTime"],
    electricity: 4000,
    water: 120000,
    service: 100000,
    owner: {
      name: "Trần Thị Lan",
      phone: "0909123456",
      avatar: "https://picsum.photos/seed/owner-lan/100/100"
    }
  }
];
```

---

## 📋 Cấu Trúc Các Trang & Component Chi Tiết

### 1. Trang Chủ (`src/pages/Home.jsx`)
- **Hero Section**: Sử dụng bố cục **Asymmetric Split** (Tiêu đề chữ lớn xếp so le lệch trái, bên phải là ảnh phong cách tối giản lớn được bo góc bằng `var(--radius-main)`).
- **Featured Grid**: Hiển thị 2 phòng nổi bật nhất bằng các thẻ `PropertyCard.jsx` có micro-interaction: Khi hover, ảnh thu phóng mượt (`transform: scale(1.05)`), nút nhấn thụt nhẹ (`active: scale(0.98)`).
- **Bento Stats Grid**: Trực quan hóa dữ liệu thống kê số lượng phòng, tỷ lệ lấp đầy, số thành viên hỗ trợ. Bento Grid được thiết kế đa dạng màu nền (ít nhất 2 ô có màu nền đỏ mờ hoặc có sắc thái riêng).

### 2. Trang Tìm Kiếm Phòng Trọ (`src/pages/Search.jsx`)
- Bố cục danh bạ tối giản: Lưới hiển thị các thẻ phòng trọ (`PropertyCard.jsx`) rộng rãi, thoáng mát, dễ đọc.
- **Thanh tìm kiếm cố định (Header Filter)**: Nằm cố định ở đầu trang giúp lọc theo Quận, Giá trần, Loại phòng mà không cần tải lại trang.
- **Micro-interactions**: Khi người dùng thay đổi bộ lọc, danh sách phòng trọ mờ dần và hiện ra mượt mà sử dụng hiệu ứng CSS fade-in.

### 3. Hệ Điều Hành Chủ Trọ (`src/pages/Dashboard.jsx`)
- **Sidebar**: Giao diện điều hướng bằng chất liệu kính mờ (Glassmorphism Sidebar) cao 100dvh.
- **Overview Widgets**: Thẻ thống kê doanh thu tháng này, số tiền đang nợ và tỷ lệ phòng đang trống.
- **AMS Manage Table**: Danh sách phòng kèm bộ chỉnh sửa Trạng thái trống/đang thuê thông qua chuyển mạch bật tắt (Switch) cực kỳ mượt mà.

---

## 📂 Tổ Chức Dự Án (Folder Directory Layout)

Dự án được tách biệt rõ ràng giữa ứng dụng Client (Frontend) và Máy chủ (Backend):

```
d:\TNCB
├── backend/                       # Máy chủ REST API Node.js/Express (Modular Monolith)
│   ├── src/
│   │   ├── config/                # Cấu hình db.js kết nối MongoDB Atlas
│   │   ├── middleware/            # Middleware dùng chung (auth.js)
│   │   ├── modules/               # Các mô-đun nghiệp vụ độc lập (cho Microservices)
│   │   │   ├── auth/              # Mô-đun Xác thực (User, authController, authRoutes)
│   │   │   ├── property/          # Mô-đun Tin đăng (Property, propertyController, propertyRoutes, deduplication)
│   │   │   └── ticket/            # Mô-đun Hỗ trợ (Ticket, ticketController, ticketRoutes)
│   │   └── index.js               # Entry point chạy server (Port 5000)
│   ├── src/seedData.js            # Dữ liệu seeding khởi tạo
│   └── package.json
│
├── frontend/                      # Client React (Vite SPA)
│   ├── src/
│   │   ├── assets/                # Hình ảnh và logo tĩnh
│   │   ├── styles/                # global.css, mobile.css, và variables.css (tokens)
│   │   ├── context/               # AppContext.jsx (giao tiếp API và quản lý state toàn cục)
│   │   ├── components/            # UI Components tái sử dụng (Header, PropertyCard...)
│   │   └── pages/                 # Các trang hiển thị (Home, Search, PropertyDetail, Dashboard)
│   ├── index.html                 # Mount root + SDK Google Identity Services
│   └── package.json
│
└── deploy/                        # Kế hoạch cấu hình Docker chạy Production
```

---

## 🧪 Kế Hoạch Xác Minh Dự Án (Verification Plan)

### Kiểm thử Tự động & Kỹ thuật
- Chạy lệnh build của Vite: `npm run build` để kiểm tra toàn bộ lỗi biên dịch.
- Sử dụng **Lighthouse** trong Chrome DevTools để chấm điểm kiểm duyệt:
  - **Performance**: > 90 (nhờ Leaflet.js tải bất đồng bộ và CSS thuần nhẹ).
  - **SEO & Accessibility**: 100% nhờ sử dụng HTML5 ngữ nghĩa và đảm bảo độ tương phản của nút kêu gọi hành động (CTA) lớn hơn 4.5:1.

### Danh Sách Kiểm Tra Pre-Flight Check (Taste Skill Matrix)
Trước khi bàn giao, chúng tôi sẽ kiểm tra thủ công từng tiêu chí sau:
- [ ] Đã có dòng khai báo **Design Read** đầu tiên?
- [ ] Bảng màu có bị dính lỗi màu "tím AI" hay "beige craft" rập khuôn?
- [ ] Toàn bộ trang web có chứa bất kỳ dấu gạch ngang `—` nào không? (Phải đảm bảo bằng 0).
- [ ] Số lượng nhãn chữ in hoa nhỏ (Eyebrow) có vượt quá tỷ lệ 1/3 tổng số phần trang?
- [ ] Có nút CTA nào bị xuống dòng chữ trên máy tính không?
- [ ] Phần Hero có bị tràn màn hình đầu tiên không? Chiều cao nav bar có nhỏ hơn 80px không?
- [ ] Đã cấu hình và kiểm thử tính năng giảm chuyển động (`prefers-reduced-motion`) cho các hoạt ảnh mượt mà chưa?
- [ ] Đã đồng bộ cập nhật tệp README.md khớp với cấu trúc thư mục thực tế của dự án?
