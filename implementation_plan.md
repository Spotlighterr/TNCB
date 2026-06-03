# Kế Hoạch Xây Dựng Nền Tảng Thuê Trọ Thông Minh TNCB Rent (FTU Housing Bank)

Tài liệu này đề xuất kế hoạch thiết kế và triển khai nền tảng **TNCB Rent** (hoặc **FTU Housing Bank**) - nền tảng thuê trọ thông minh dành cho sinh viên tại **Hà Nội** và **TP. Hồ Chí Minh**. Được phát triển hoàn toàn bằng **JavaScript** và tuân thủ nghiêm ngặt bộ tiêu chuẩn thiết kế cao cấp **Taste Skill** (chống rập khuôn, chống AI slop).

---

## 🎨 Tuyên Bố Thiết Kế & Các Bộ Xoay (Design Read & Dials)

> [!IMPORTANT]
> **Design Read:** "Reading this as: Web application landing + premium directory for students and young professionals seeking room rentals in **Hanoi & Ho Chi Minh City**, with a high-end, clean, and highly editorial vibe language, leaning toward a custom Outfit-based design system + targeted Leaflet.js/OpenStreetMap footer routing integration."

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
| **Bản đồ tương tác** | **Leaflet.js + OpenStreetMap** | Tích hợp bản đồ tương tác chỉ dẫn vị trí chính xác ở chân trang chi tiết phòng trọ. Hoàn toàn miễn phí, không cần API key. |
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
  
  /* Taste Skill: Khóa 1 màu nhấn đồng nhất (Emerald) */
  --color-accent: #059669; /* Emerald 600 */
  --color-accent-hover: #047857; /* Emerald 700 */
  --color-accent-subtle: rgba(5, 150, 105, 0.08);
  
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
    
    --color-accent: #10b981; /* Emerald 500 */
    --color-accent-hover: #34d399;
    --color-accent-subtle: rgba(16, 185, 129, 0.12);
    
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

1. **Khóa màu đồng nhất (Color Consistency Lock)**: Chọn duy nhất 1 tông màu nhấn chủ đạo (Emerald `#10B981` cho sự an toàn và tài chính sạch sẽ), tuyệt đối không pha tạp các màu tương phản lòe loẹt khác ở các phần dưới.
2. **Khóa hình khối nhất quán (Shape Consistency Lock)**: Đồng bộ hóa toàn bộ bo góc (radius) trên trang: Nút và thẻ đều sử dụng `border-radius: 12px`, các nút hành động nhỏ hơn dùng `border-radius: 8px`.
3. **Cấm tuyệt đối dấu gạch ngang Em-Dash (`—`)**: Loại bỏ hoàn toàn dấu gạch ngang này trong tiêu đề, trích dẫn hay phần ghi chú.
4. **Giới hạn số lượng thẻ lông mày (Eyebrow Restraint)**: Tối đa 1 eyebrow (nhãn chữ in hoa nhỏ phía trên tiêu đề) trên mỗi 3 phần của trang để tránh sự lặp lại đơn điệu.
5. **Cấm tiêu đề cột đôi (Split-Header Ban)**: Không sử dụng kiểu bố cục "bên trái tiêu đề to + bên phải đoạn mô tả ngắn". Các phần tiêu đề luôn được căn lề dọc tinh tế, cân đối.
6. **Khống chế kích thước màn hình đầu tiên (Hero Viewport Stability)**: Phần Hero của trang chủ bắt buộc nằm gọn trong màn hình đầu tiên (`min-h-[100dvh]`). Tiêu đề không quá 2 dòng, đoạn mô tả không quá 20 từ, đảm bảo các nút kêu gọi hành động (CTA) luôn hiển thị mà không cần cuộn trang.
7. **Cấm ảnh chụp màn hình giả lập bằng Div**: Mọi hình ảnh xem trước phần mềm hoặc tài sản phải là ảnh thực tế hoặc sơ đồ thiết kế chỉn chu được tạo bằng công cụ tạo ảnh, không tự vẽ khung xương bảng điều khiển bằng CSS thô sơ.
8. **Đa dạng hóa nền bento (Bento Background Diversity)**: Các ô lưới Bento phải có ít nhất 2 ô chứa hình ảnh trực quan hoặc màu nền đậm, tránh toàn bộ các ô đều có nền trắng chữ đen nhàm chán.

---

## 💾 Cấu Trúc Dữ Liệu Thực Tế (Mock Data Structure)

Để đảm bảo bản đồ tương tác hiển thị tọa độ thực tế chính xác tại cả **Hà Nội** và **TP.HCM**, file `src/data/mockProperties.js` sẽ chứa **10 phòng trọ** với tọa độ GPS thực tế:

### Hà Nội (5 phòng)
| ID | Tên | Loại | Quận | Gần trường |
|:---|:---|:---|:---|:---|
| prop-1 | Studio Cầu Giấy Gần ĐH Ngoại Thương HN | Studio | Cầu Giấy | ĐH Ngoại Thương |
| prop-2 | Duplex Đống Đa Gần ĐH Bách Khoa | Duplex | Đống Đa | ĐH Bách Khoa |
| prop-3 | Chung cư mini Hai Bà Trưng | Chung cư mini | Hai Bà Trưng | ĐH Kinh Tế QD |
| prop-4 | Phòng trọ Thanh Xuân giá rẻ | Phòng trọ | Thanh Xuân | Học viện Ngân Hàng |
| prop-5 | Studio cao cấp Nam Từ Liêm | Studio | Nam Từ Liêm | ĐH Hà Nội |

### TP. Hồ Chí Minh (5 phòng)
| ID | Tên | Loại | Quận | Gần trường |
|:---|:---|:---|:---|:---|
| prop-6 | Studio Ban Công Kính Gần FTU CS2 | Studio | Bình Thạnh | ĐH Ngoại Thương CS2 |
| prop-7 | Duplex Tối Giản Gần HUTECH | Duplex | Bình Thạnh | HUTECH |
| prop-8 | Chung cư mini Gò Vấp | Chung cư mini | Gò Vấp | ĐH Công Nghiệp |
| prop-9 | Phòng trọ Phú Nhuận | Phòng trọ | Phú Nhuận | ĐH Ngoại Thương CS2 |
| prop-10 | Studio Thủ Đức Gần ĐHQG | Studio | Thủ Đức | ĐHQG TP.HCM |

Mỗi property có cấu trúc:
```javascript
{
  id: "prop-1",
  title: "Căn Hộ Studio Cầu Giấy Gần ĐH Ngoại Thương",
  type: "Studio",           // Studio | Duplex | Chung cư mini | Phòng trọ
  price: 4500000,           // VND/tháng
  area: 25,                 // m2
  city: "Hà Nội",           // MỚI: Hà Nội | TP. Hồ Chí Minh
  district: "Cầu Giấy",
  address: "91 Chùa Láng, Láng Thượng, Đống Đa, Hà Nội",
  coords: [21.0285, 105.7823], // Leaflet [lat, lng] - tọa độ thực
  images: ["https://picsum.photos/seed/prop-1a/800/600", ...],
  verified: true,
  amenities: ["AirConditioner", "Balcony", "Fridge", "WashingMachine", "FingerprintLock", "WiFi", "Parking", "FreeTime"],
  electricity: 3800,        // VND/kwh
  water: 100000,            // VND/người
  service: 150000,          // VND/phòng
  owner: {
    name: "Nguyễn Văn Đạt",
    phone: "0869333366",
    avatar: "https://picsum.photos/seed/owner-1/100/100"
  }
}
```

---

## 📋 Cấu Trúc Các Trang & Component Chi Tiết

### 1. Trang Chủ (`src/pages/Home.jsx`)
- **Hero Section**: Sử dụng bố cục **Asymmetric Split** (Tiêu đề chữ lớn xếp so le lệch trái, bên phải là ảnh phong cách tối giản lớn được bo góc bằng `var(--radius-main)`). Thông điệp chính: "Tìm trọ dễ dàng cho sinh viên Hà Nội & Sài Gòn". Thanh tìm kiếm nhanh tích hợp bộ lọc Thành phố + Quận + Khoảng giá.
- **Featured Grid**: Hiển thị 4 phòng nổi bật nhất (2 HN + 2 HCM) bằng các thẻ `PropertyCard.jsx` có micro-interaction: Khi hover, ảnh thu phóng mượt (`transform: scale(1.05)`), nút nhấn thụt nhẹ (`active: scale(0.98)`).
- **Bento Stats Grid**: Trực quan hóa dữ liệu thống kê số lượng phòng trống, số quận hỗ trợ (10 quận: 5 HN + 5 HCM), số trường ĐH lân cận, phản hồi tích cực. Bento Grid được thiết kế đa dạng màu nền (ít nhất 2 ô có màu nền ngọc lục bảo mờ).

### 2. Trang Tìm Kiếm Phòng Trọ (`src/pages/Search.jsx`)
- **Layout Thư Mục Bán Lẻ (Editorial Grid Layout)**: Giao diện danh bạ phòng trọ tối giản, dạng lưới trực quan và thoáng đãng (3 cột desktop, 2 tablet, 1 mobile).
- **Thanh tìm kiếm cố định (Header Filter)**: Bộ lọc nhanh theo **Thành phố** (Hà Nội / TP.HCM / Tất cả), **Quận**, **Giá trần**, **Loại phòng** (Studio, Duplex, Chung cư mini, Phòng trọ), và **Tiện ích** (Điều hòa, Máy giặt, Khóa vân tay, Giờ giấc tự do).
- **Micro-interactions**: Khi người dùng thay đổi bộ lọc, danh sách phòng trọ mờ dần và hiện ra mượt mà sử dụng hiệu ứng CSS fade-in.
- **Verified Badge**: Nhãn chứng nhận "Nhà thật, Giá thật, Vị trí thật" nổi bật trên từng thẻ phòng.

### 3. Chi Tiết Phòng Trọ (`src/pages/PropertyDetail.jsx`)
- **Image Carousel**: Bộ sưu tập ảnh trượt ngang mượt mà, hỗ trợ phóng to (Lightbox). Navigation dots + prev/next buttons.
- **Bảng Giá & Chi Phí**: Ghi nhận chi tiết tiền phòng, tiền điện (VND/kwh), tiền nước (VND/người), phí dịch vụ (VND/phòng).
- **Hệ Thống Thẻ Tiện Ích**: Hiển thị trực quan các tiện ích phòng bằng icon Phosphor sắc nét.
- **Liên Hệ Chủ Trọ (Contact Card)**: Panel chứa thông tin chủ trọ, nút gọi nhanh, nút nhắn tin Zalo, và Form gửi yêu cầu tư vấn/hẹn lịch xem phòng.
- **Bản Đồ Chỉ Đường (Leaflet + OSM)**: Tích hợp bản đồ tương tác hiển thị vị trí chính xác của phòng trọ ở dưới cùng trang chi tiết. Hoàn toàn miễn phí, không cần API key.

### 4. Hệ Điều Hành Quản Trị (`src/pages/Dashboard.jsx`)

#### A. Chủ Trọ (Landlord AMS Flow)
- **Sidebar**: Giao diện điều hướng bằng chất liệu kính mờ (Glassmorphism Sidebar) cao 100dvh.
- **Dashboard Tổng Quan**: Thẻ thống kê doanh thu tháng, tỷ lệ phòng trống, số tiền đã thu, số tiền còn nợ. Cảnh báo hợp đồng sắp hết hạn.
- **Quản Lý Phòng**: Bảng danh sách phòng trọ + Switch bật/tắt trạng thái Trống/Đang thuê. Form thêm/sửa phòng (tải ảnh, chọn tiện ích, nhập giá điện nước).
- **Hợp Đồng & Hóa Đơn**: Tạo hợp đồng điện tử cơ bản. Nhập số điện/nước tiêu thụ mới, hệ thống tự tính tổng hóa đơn.

#### B. Khách Thuê (Tenant Dashboard)
- **Saved Properties**: Danh sách các phòng trọ đã lưu yêu thích.
- **My Rental**: Thông tin phòng đang thuê, hợp đồng, lịch sử hóa đơn.
- **Yêu Cầu Hỗ Trợ & Danh Bạ Chủ Trọ**: Gửi phản hồi kỹ thuật (điều hòa hỏng, rò rỉ nước), theo dõi trạng thái xử lý. Bảng Hotline liên hệ trực tiếp chủ trọ + đội kỹ thuật.

---

## 📂 Tổ Chức Dự Án (Folder Directory Layout)

Dự án được xây dựng gọn gàng theo mô hình Single Page Application (SPA) hiện đại:

```
d:\TNCB
├── index.html
├── package.json
├── vite.config.js
└── src
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── index.css
    ├── assets
    │   ├── hero.png
    │   ├── react.svg
    │   └── vite.svg
    ├── styles
    │   ├── global.css
    │   ├── mobile.css
    │   └── variables.css      <-- Nơi chứa toàn bộ Token, Glassmorphism, Theme Variables
    ├── context
    │   └── AppContext.jsx     <-- Quản lý State chung (properties, contracts, savedProperties, userRole, OTP flow)
    ├── data
    │   ├── mockProperties.js  <-- 10 phòng trọ (5 HN + 5 HCM) kèm tọa độ GPS thực
    │   └── mockContracts.js   <-- Hợp đồng + hóa đơn mẫu
    ├── components
    │   ├── Header.jsx         <-- Sticky glass header, chiều cao <= 72px
    │   ├── Footer.jsx
    │   ├── PropertyCard.jsx   <-- Thẻ hiển thị phòng trọ có micro-interactions tactile
    │   ├── PropertyMap.jsx    <-- Tích hợp bản đồ Leaflet.js chân trang chi tiết
    │   ├── ImageCarousel.jsx  <-- Carousel ảnh + Lightbox phóng to
    │   ├── FloatingContact.jsx<-- Nút liên hệ nhanh (Zalo/Hotline) trôi nổi
    │   ├── ProfileModal.jsx   <-- Modal cập nhật thông tin cá nhân người dùng
    │   └── SearchableSelect.jsx<-- Ô chọn tìm kiếm quận/phường có hỗ trợ lọc text
    └── pages
        ├── Home.jsx           <-- Trang chủ: Hero + Featured Grid + Bento Stats
        ├── Search.jsx         <-- Danh bạ phòng trọ tối giản + bộ lọc Thành phố/Quận/Giá/Loại/Tiện ích
        ├── PropertyDetail.jsx <-- Chi tiết phòng, carousel ảnh, bản đồ dẫn đường chân trang
        └── Dashboard.jsx      <-- Hệ điều hành: Chủ trọ (AMS) + Khách thuê (Saved/Tickets/Hotline)
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
- [ ] Bản đồ Leaflet hiển thị đúng tọa độ cả Hà Nội và TP.HCM?
- [ ] Bộ lọc Thành phố hoạt động chính xác, quận tự cập nhật theo thành phố?
- [ ] Responsive layout hoạt động trên mobile/tablet/desktop?
- [ ] Dark mode tự động theo system preference?
- [ ] Đã đồng bộ cập nhật tệp README.md khớp với cấu trúc thư mục thực tế của dự án?

---

## 🌐 Tham Khảo Thiết Kế: HouseZy.vn

> [!IMPORTANT]
> **Website tham khảo chính:** https://www.housezy.vn/
> Đây là nền tảng proptech hàng đầu Việt Nam (since 2019) với slogan "Smart OS Real Estate Platform". TNCB Rent lấy cảm hứng từ HouseZy nhưng tập trung riêng vào phân khúc **phòng trọ sinh viên** thay vì bất động sản tổng hợp.

### Phân Tích Cấu Trúc HouseZy.vn

#### A. Kiến Trúc Kỹ Thuật (Để Tham Khảo, Không Clone)
- **Framework**: Next.js (App Router) trên Vercel
- **Styling**: Tailwind CSS + Shadcn/UI (Radix primitives)
- **Icons**: Lucide Icons
- **Storage**: Google Cloud Storage (Firebase)
- **Analytics**: Google Tag Manager + Sentry
- **SEO**: Structured Data (JSON-LD) cho RealEstateAgent schema
- **PWA**: Manifest, Apple Touch Icons, Splash Screens

#### B. Các UX Patterns Cần Học Hỏi & Áp Dụng

| Pattern trên HouseZy | Cách áp dụng cho TNCB Rent |
|:---|:---|
| **Sidebar Navigation** (collapsible, glassmorphism) | Áp dụng cho Dashboard chủ trọ. Dùng `data-state="collapsed"` pattern tương tự |
| **Sticky Header** với logo + CTA "Đăng nhập & Đăng tin miễn phí" | Áp dụng: Sticky glass header <= 72px, CTA "Tìm phòng ngay" |
| **Banner Carousel** (hero slider với ảnh full-width, auto-play) | Áp dụng: Featured Rentals carousel trên trang chủ |
| **Property Card** với hover scale(1.05), shadow-md, border-2 | Áp dụng trực tiếp cho PropertyCard.jsx |
| **Image lazy loading** (`loading="lazy"` cho ảnh ngoài viewport) | Áp dụng cho tất cả ảnh phòng trọ trong grid |
| **Category Grid** (Căn hộ 1PN, 2PN, 3PN, Shophouse...) | Điều chỉnh: Grid phân loại Studio / Duplex / Chung cư mini / Phòng trọ |
| **Khu vực Grid** (BĐS Bình Thạnh, Phú Nhuận, Q1, Gò Vấp...) | Mở rộng: Grid theo Quận cho cả HN và HCM |
| **Light/Dark Theme Toggle** (localStorage + system preference) | Áp dụng qua CSS `prefers-color-scheme` + manual toggle |
| **Command Palette** (Radix Dialog, search modal) | Tham khảo: Có thể thêm quick search modal trong tương lai |
| **Structured Data** (JSON-LD cho SEO) | Áp dụng schema.org/Residence cho từng phòng trọ |

#### C. Các Trang Chính Trên HouseZy Cần Tham Khảo

1. **Trang Chủ** (`/`):
   - Hero banner carousel (aspect-ratio banner, rounded-lg, shadow)
   - Grid danh mục bất động sản theo loại hình (ảnh + label)
   - Grid khu vực hot (ảnh + overlay text)
   - Section đối tác & dịch vụ liên kết
   - **Áp dụng TNCB**: Giữ cấu trúc Hero + Featured Grid + Bento Stats nhưng tối giản hơn, tập trung sinh viên

2. **Trang Tìm Kiếm / Bản Đồ** (`/ban-do`):
   - Split layout: Bản đồ + danh sách
   - Filter bar phía trên (loại hình, khu vực, giá)
   - Property cards trong list panel
   - **Áp dụng TNCB**: Dùng Editorial Grid Layout (theo chucnang.md) thay vì split map-list. Bản đồ chỉ hiển thị ở trang chi tiết

3. **Trang Chi Tiết** (`/[slug]`):
   - Carousel ảnh + gallery
   - Thông tin chi tiết (diện tích, phòng ngủ, WC, mặt tiền, chiều dài)
   - Thông tin chủ sở hữu + liên hệ
   - Bản đồ vị trí
   - **Áp dụng TNCB**: Giữ layout tương tự nhưng thêm Bảng giá điện/nước/dịch vụ + Thẻ tiện ích Phosphor Icons

4. **Dashboard AMS** (`/dashboard`):
   - Sidebar navigation (Overview, Quản lý BĐS, Giao dịch)
   - Widget thống kê
   - Bảng quản lý tài sản
   - **Áp dụng TNCB**: Tương tự nhưng thêm Quản lý hợp đồng & hóa đơn, và Tenant Dashboard

#### D. Điểm Khác Biệt Quan Trọng (TNCB vs HouseZy)

| Tiêu chí | HouseZy | TNCB Rent |
|:---|:---|:---|
| **Đối tượng** | Nhà đầu tư, người mua/bán BĐS | **Sinh viên** thuê phòng trọ |
| **Phạm vi giá** | Hàng trăm triệu - tỷ VND | **2-10 triệu VND/tháng** |
| **Loại hình** | Căn hộ, nhà phố, shophouse, đất nền | **Studio, Duplex, Chung cư mini, Phòng trọ** |
| **Tính năng đặc biệt** | Quy hoạch, định giá, Co-work | **Hóa đơn điện nước, hợp đồng thuê, ticket sửa chữa** |
| **Bản đồ** | Google Maps (trả phí) | **Leaflet.js + OSM (miễn phí)** |
| **Tech stack** | Next.js + Tailwind + Shadcn | **Vite + React + Vanilla CSS** |
| **Styling** | Tailwind utilities | **CSS Variables + Design Tokens (Taste Skill)** |
| **Typography** | System fonts | **Outfit + Geist Mono** |
| **Icons** | Lucide | **Phosphor** |
| **Vùng phục vụ** | Chủ yếu TP.HCM | **Hà Nội + TP.HCM** |

#### E. Lưu Ý Cho Agent Khi Tham Khảo

> [!WARNING]
> **KHÔNG clone trực tiếp** giao diện hay mã nguồn HouseZy. Chỉ tham khảo UX patterns và cấu trúc trang.

- **Giữ nguyên Taste Skill**: Dù tham khảo HouseZy, phải tuân thủ 100% quy tắc thiết kế trong file này (Emerald color lock, radius 12px, font Outfit, cấm em-dash, cấm AI-purple).
- **Không dùng Tailwind**: HouseZy dùng Tailwind nhưng TNCB dùng Vanilla CSS + CSS Variables.
- **Không dùng Shadcn/Radix**: Tự build components thuần CSS để giữ nhẹ và kiểm soát hoàn toàn.
- **Tối giản hóa**: HouseZy là platform phức tạp cho doanh nghiệp BĐS. TNCB cần đơn giản, thân thiện cho sinh viên.
- **Ưu tiên tốc độ**: Không dùng heavy framework. Vite + React + Leaflet là đủ.

---

## 🚀 Cập Nhật Bộ Lọc Giá & Sửa Lỗi Lệch Dropdown (Phase 2)

### 1. Thay thế bộ lọc thanh trượt (Price Slider) bằng nhập giá (Price Input Box)
- **Vấn đề**: Thanh trượt khoảng giá gây giật lag khi kéo và khó tinh chỉnh giá chính xác. Người dùng muốn nhập trực tiếp một con số cụ thể.
- **Giải pháp**:
  - Loại bỏ `<input type="range" />` trong `Search.jsx`.
  - Thay bằng một ô nhập liệu `<input type="text" />` thông minh với class `.input`.
  - Tự động định dạng số tiền dạng phân tách hàng nghìn tiếng Việt (`.toLocaleString('vi-VN')`) ngay khi người dùng gõ (ví dụ gõ `3000000` hiển thị `3.000.000` VNĐ).
  - Loại bỏ các ký tự không phải số (`replace(/\D/g, '')`) trước khi lưu vào trạng thái `maxPrice` để đảm bảo tính an toàn dữ liệu.
  - Hiển thị nút "Xóa nhanh (x)" khi có dữ liệu nhập.
  - Hiển thị dòng mô tả tiện ích dưới ô gõ: `≤ 3 triệu/tháng` (tự động dịch bằng hàm `formatPrice` có sẵn) để sinh viên không bị đếm nhầm số 0.
- **Logic Lọc**:
  - Trạng thái `maxPrice` mặc định khởi tạo là `""` (Tất cả giá).
  - Hàm `clearFilters` sẽ reset `maxPrice` về `""`.
  - Điều kiện lọc: `if (maxPrice && p.price > Number(maxPrice)) return false;` (chỉ lọc nếu `maxPrice` không rỗng).

### 2. Sửa lỗi lệch Dropdown trên giao diện (Dropdown Misalignment Fix)
- **Vấn đề**: Dropdown gợi ý tìm kiếm quận/huyện, thành phố trong `SearchableSelect` bị lệch sang bên trái và không khớp chiều rộng của ô chọn do cơ chế định vị tuyệt đối `position: absolute` bị ảnh hưởng bởi thanh sticky filter bar hoặc cơ chế render của `<style>` cục bộ trong component.
- **Giải pháp**:
  - Di chuyển toàn bộ khai báo CSS của `SearchableSelect` từ thẻ `<style>` nội bộ của component sang file CSS toàn cục `src/styles/global.css`.
  - Khai báo các thuộc tính căn chỉnh và định vị cốt lõi kèm cờ `!important` để chống ghi đè:
    - `.searchable-select-container { position: relative !important; width: 100% !important; display: block !important; }` thiết lập một ranh giới định vị (containing block) hoàn hảo cho absolute descendant.
    - `.searchable-select-dropdown { position: absolute !important; top: calc(100% + 4px) !important; left: 0 !important; right: 0 !important; width: 100% !important; z-index: 9999 !important; }` đảm bảo dropdown luôn căn lề hoàn hảo dưới ô chọn, khớp 100% chiều rộng của input và nằm đè lên mọi nội dung khác.
  - Loại bỏ phần `<style>` nội bộ thừa trong `SearchableSelect.jsx`.

---

## 🧪 Kế Hoạch Xác Minh Phase 2 (Verification Plan)

### Kiểm thử Thủ công (Manual Verification)
1. **Kiểm tra nhập giá**:
   - Truy cập trang tìm kiếm, click vào ô nhập giá và gõ `2500000`.
   - Xác nhận ô nhập hiển thị `2.500.000` và helper text bên dưới hiển thị `≤ 2.5 triệu/tháng`.
   - Xác nhận danh sách lọc chỉ hiển thị các phòng có giá nhỏ hơn hoặc bằng 2,5 triệu/tháng.
   - Nhấn nút `x` để xóa nhanh giá trị hoặc click nút "Xóa lọc", kiểm tra ô giá được reset về trống và danh sách phòng hiển thị đầy đủ trở lại.
2. **Kiểm tra Dropdown**:
   - Click vào ô lọc "Thành phố", "Quận / Huyện", "Phường / Xã", "Loại phòng".
   - Xác nhận menu xổ xuống (dropdown) được căn chỉnh **hoàn toàn cân xứng, thẳng hàng** ngay dưới input, không còn bị lệch sang trái hay co giãn sai kích thước.
   - Kiểm tra hiển thị tốt trên cả giao diện Responsive Mobile và Desktop.

### Kiểm thử Tự động (Automated Verification)
- Chạy `npm run build` để kiểm tra biên dịch dự án Vite hoàn tất không có lỗi JSX hay CSS.
- Đảm bảo đã cập nhật tệp README.md và các tài liệu khác phù hợp với cấu trúc dự án thực tế.

