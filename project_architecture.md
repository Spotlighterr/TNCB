# Sơ Đồ Khối & Kiến Trúc Dự Án TNCB Rent (FTU Housing Bank)

Tài liệu này cung cấp cái nhìn tổng quan về kiến trúc hệ thống, sơ đồ khối, luồng dữ liệu và cấu trúc component của ứng dụng TNCB Rent, giúp định hình cấu trúc phát triển đồng bộ và tối ưu nhất.

---

## 1. Sơ Đồ Kiến Trúc Tổng Thể (System Architecture)

Dự án được xây dựng dưới dạng mô hình Client-Server. Frontend là ứng dụng SPA sử dụng React + Vite, giao tiếp qua REST APIs với Backend Node.js/Express (Modular Monolith) và lưu trữ bền vững tại cơ sở dữ liệu MongoDB. Caching được hỗ trợ qua Redis. Đồng bộ dữ liệu cũng hỗ trợ qua Google Sheets Sync (tự động, thủ công hoặc webhook tức thời).

```mermaid
graph TD
    %% Styling
    classDef storage fill:#f1f5f9,stroke:#94a3b8,stroke-width:2px;
    classDef context fill:#d1fae5,stroke:#10b981,stroke-width:2px;
    classDef page fill:#e0f2fe,stroke:#0284c7,stroke-width:2px;
    classDef comp fill:#fef3c7,stroke:#d97706,stroke-width:1px;

    %% Elements
    subgraph DataLayer ["Tầng Dữ Liệu & Lưu Trữ"]
        DB[("MongoDB Database <br> (Properties, Users, Settings)")]:::storage
        Cache[("Redis Caching <br> (Session caching)")]:::storage
        Sheet[("Google Sheets <br> (Bảng tính dữ liệu nguồn)")]:::storage
        Ctx["React AppContext <br> (State: properties, contracts, heroSlides, user)"]:::context
    end

    subgraph AppContainer ["Ứng Dụng Chính (App.jsx)"]
        Router{{"React Router <br> (SPA Routes)"}}
        Header["Header.jsx <br> (Theme Toggle, Role Switcher)"]:::comp
        Footer["Footer.jsx <br> (Bottom Mobile Nav)"]:::comp
    end

    subgraph Pages ["Tầng Trang (Pages)"]
        HomeP["Home.jsx <br> (Trang Chủ)"]:::page
        SearchP["Search.jsx <br> (Lọc & Tìm Kiếm)"]:::page
        DetailP["PropertyDetail.jsx <br> (Chi Tiết Phòng)"]:::page
        DashP["Dashboard.jsx <br> (Hệ Điều Hành Quản Trị & Sync Config)"]:::page
    end

    %% Relations
    Sheet -->|Sync Webhook / Cron| DB
    Ctx <-->|REST APIs| DB
    DB <-->|Cache| Cache
    
    AppContainer --> Ctx
    Router --> HomeP
    Router --> SearchP
    Router --> DetailP
    Router --> DashP

    Ctx -->|Cung cấp State & Actions| HomeP
    Ctx -->|Cung cấp State & Actions| SearchP
    Ctx -->|Cung cấp State & Actions| DetailP
    Ctx -->|Cung cấp State & Actions| DashP
```


## 2. Luồng Nghiệp Vụ Theo Vai Trò (User Role Journeys)

Người dùng có thể chuyển đổi linh hoạt giữa 2 vai trò **Khách Thuê (Tenant)** và **Chủ Trọ (Landlord)** thông qua nút chuyển đổi nhanh trên Header.

```mermaid
graph TD
    %% Styling
    classDef tenant fill:#ecfdf5,stroke:#059669,stroke-width:2px;
    classDef landlord fill:#fff7ed,stroke:#ea580c,stroke-width:2px;
    classDef admin fill:#faf5ff,stroke:#9333ea,stroke-width:2px;
    classDef shared fill:#f8fafc,stroke:#64748b,stroke-width:2px;

    %% Nodes
    RoleSelector{"User Role Switcher"}:::shared
    
    %% Tenant Flow
    Tenant["Khách Thuê (Tenant)"]:::tenant
    Home["Trang Chủ <br> (Featured Grid, Bento Stats)"]:::tenant
    Search["Trang Tìm Kiếm <br> (Editorial Grid, Price Input, Filter)"]:::tenant
    Detail["Chi Tiết Phòng <br> (Carousel, Utilities, Contact, Leaflet Map)"]:::tenant
    TDash["Tenant Dashboard"]:::tenant
    Saved["Saved Properties"]:::tenant
    MyRental["My Rental <br> (Phòng đang thuê)"]:::tenant
    Support["Support Tickets & <br> Hotline kỹ thuật chủ trọ"]:::tenant

    %% Landlord Flow
    Landlord["Chủ Trọ (Landlord)"]:::landlord
    LDash["Landlord Dashboard <br> (Glassmorphic Sidebar)"]:::landlord
    OverviewMgmt["Tổng Quan & Quản Lý <br> (Thống kê tin đăng + Lưới bài đăng, sửa/xóa/gỡ)"]:::landlord

    %% Admin Flow
    Admin["Quản Trị Viên (Admin)"]:::admin
    ADash["Admin Dashboard"]:::admin
    AOverviewMgmt["Tổng Quan & Quản Lý <br> (Thống kê hệ thống + Bài đăng toàn sàn, xác thực/sửa/xóa/gỡ)"]:::admin
    AReview["Kiểm Duyệt Tin Trùng <br> (Hàng chờ pending, Modal so sánh song song)"]:::admin

    %% Edges
    RoleSelector -->|Khách thuê| Tenant
    RoleSelector -->|Chủ trọ| Landlord
    RoleSelector -->|Admin| Admin

    Tenant --> Home
    Tenant --> Search
    Search --> Detail
    Tenant --> TDash
    TDash --> Saved
    TDash --> MyRental
    TDash --> Support

    Landlord --> LDash
    LDash --> OverviewMgmt

    Admin --> ADash
    ADash --> AOverviewMgmt
    ADash --> AReview
```

---

## 3. Cấu Trúc Cây Component (Component Hierarchy)

Cây thư mục component được tổ chức tối giản để tái sử dụng tối đa và đảm bảo hiệu suất tải trang cao nhất:

```mermaid
graph TD
    App["App.jsx (Layout & Routes)"]
    
    %% Shared UI
    Header["Header.jsx (Glass Navbar & Auth Modal)"]
    Footer["Footer.jsx (Desktop Footer & Bottom Mobile Nav)"]
    Float["FloatingContact.jsx"]
    
    %% Home
    Home["Home.jsx (Page)"]
    Hero["Hero & Quick Filter"]
    Featured["Featured Grid"]
    Bento["Bento Stats Grid"]
    
    %% Search
    Search["Search.jsx (Page)"]
    FilterBar["Filter Bar (Price Input, City/District Select)"]
    SearchGrid["Editorial Property Grid"]
    
    %% Property Detail
    Detail["PropertyDetail.jsx (Page)"]
    Carousel["ImageCarousel.jsx (with Lightbox)"]
    ContactCard["Contact Card (Zalo & Call Actions)"]
    MapComp["PropertyMap.jsx (Leaflet + OpenStreetMap)"]
    
    %% Dashboard
    Dashboard["Dashboard.jsx (Page)"]
    Sidebar["Glassmorphism Sidebar (Collapsible)"]
    
    subgraph SharedComponents ["Components Tái Sử Dụng"]
        Card["PropertyCard.jsx <br> (Hover effects, Verified Badge)"]
    end

    %% Hierarchy Lines
    App --> Header
    App --> Footer
    App --> Float
    
    App --> Home
    Home --> Hero
    Home --> Featured
    Home --> Bento
    Featured --> Card
    
    App --> Search
    Search --> FilterBar
    Search --> SearchGrid
    SearchGrid --> Card
    
    App --> Detail
    Detail --> Carousel
    Detail --> ContactCard
    Detail --> MapComp
    
    App --> Dashboard
    Dashboard --> Sidebar
```

---

## 4. Luồng Đồng Bộ Trạng Thái & Dữ Liệu (State & Storage Sync Flow)

Cơ chế cập nhật dữ liệu tự động giữa client-side state và hệ thống Backend REST APIs/MongoDB được cấu trúc như sau:

1. **Khởi tạo & Đồng bộ Phiên (App Load & Session Sync):**
   - Trình duyệt đọc token JWT được lưu trữ trong `localStorage` để duy trì trạng thái đăng nhập.
   - Nếu tồn tại token, client gửi yêu cầu GET tới `/api/auth/me` để nạp thông tin tài khoản người dùng cùng các cấu hình bảo mật (`otpEnabled`, `mfaEnabled`).
   - Danh sách tin đăng trọ được fetch động thông qua API `/api/properties` kết nối trực tiếp với database MongoDB.

2. **Luồng Thách Thức Bảo Mật (MFA & Email OTP Challenge Flow):**
   - Khi gửi yêu cầu đăng nhập:
     - Nếu tài khoản đã kích hoạt **MFA** (ưu tiên cao nhất): Backend phản hồi trạng thái `requiresMfa` kèm token tạm thời, client chuyển modal sang luồng xác thực mã Authenticator.
     - Nếu tài khoản kích hoạt **Email OTP** (và không bật MFA, đồng thời không đăng nhập qua Google SSO): Backend gửi mã OTP về email đăng ký và phản hồi `requiresOtp`, client chuyển modal sang luồng điền mã xác thực OTP.
     - Sau khi người dùng điền đúng mã xác thực, backend cấp JWT session token chính thức để client lưu vào `localStorage`.

3. **Cập nhật & Lọc trùng (User Action & Deduplication Flow):**
   - Khi Chủ trọ thêm phòng trọ mới $\rightarrow$ API Backend chạy thuật toán lọc trùng tự động 3 lớp. Các bài viết trùng lặp cao sẽ được lưu dưới dạng `status: 'pending'` và chuyển vào hàng chờ duyệt của Admin.
   - Khi Khách thuê truy cập chi tiết phòng trọ $\rightarrow$ Client tự động cập nhật lịch sử xem tin vào `TNCB_VIEW_HISTORY` trong `localStorage` và tự động xóa các bản ghi đã quá 7 ngày để tránh phình dung lượng.
