# Sơ Đồ Khối & Kiến Trúc Dự Án TNCB Rent (FTU Housing Bank)

Tài liệu này cung cấp cái nhìn tổng quan về kiến trúc hệ thống, sơ đồ khối, luồng dữ liệu và cấu trúc component của ứng dụng TNCB Rent, giúp định hình cấu trúc phát triển đồng bộ và tối ưu nhất.

---

## 1. Sơ Đồ Kiến Trúc Tổng Thể (System Architecture)

Dự án được xây dựng dưới dạng ứng dụng SPA chạy phía Client sử dụng React + Vite. Dữ liệu được quản lý tập trung qua **React Context (AppContext)** và lưu trữ bền vững tại **LocalStorage Database Engine** ở trình duyệt.

```mermaid
graph TD
    %% Styling
    classDef storage fill:#f1f5f9,stroke:#94a3b8,stroke-width:2px;
    classDef context fill:#d1fae5,stroke:#10b981,stroke-width:2px;
    classDef page fill:#e0f2fe,stroke:#0284c7,stroke-width:2px;
    classDef comp fill:#fef3c7,stroke:#d97706,stroke-width:1px;

    %% Elements
    subgraph DataLayer ["Tầng Dữ Liệu & State"]
        LS[("LocalStorage <br> (TNCB_PROPERTIES, TNCB_CONTRACTS, etc.)")]:::storage
        Mock[("Mock Data Source <br> (mockProperties.js, mockContracts.js)")]:::storage
        Ctx["React AppContext <br> (State: properties, contracts, saved, user)"]:::context
    end

    subgraph AppContainer ["Ứng Dụng Chính (App.jsx)"]
        Router{{"React Router <br> (SPA Routes)"}}
        Header["Header.jsx <br> (Theme Toggle, Role Switcher)"]:::comp
        Footer["Footer.jsx <br> (Bottom Mobile Navigation)"]:::comp
        Float["FloatingContact.jsx <br> (Quick Zalo / Call)"]:::comp
    end

    subgraph Pages ["Tầng Trang (Pages)"]
        HomeP["Home.jsx <br> (Trang Chủ)"]:::page
        SearchP["Search.jsx <br> (Lọc & Tìm Kiếm)"]:::page
        DetailP["PropertyDetail.jsx <br> (Chi Tiết Phòng)"]:::page
        DashP["Dashboard.jsx <br> (Hệ Điều Hành Quản Trị)"]:::page
    end

    %% Relations
    Mock -.->|Khởi tạo lần đầu| Ctx
    Ctx <-->|Đồng bộ 2 chiều| LS
    
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

---

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

Cơ chế cập nhật dữ liệu tự động giữa client-side state và LocalStorage được cấu trúc để đảm bảo tính liên tục của dữ liệu mà không cần server database phức tạp:

1. **Khởi tạo (App Load):**
   - Trình duyệt đọc dữ liệu từ `localStorage` thông qua các key `TNCB_PROPERTIES`, `TNCB_CONTRACTS`, `TNCB_VIEW_HISTORY`, và `TNCB_USER`.
   - Nếu `localStorage` trống, hệ thống sẽ nạp dữ liệu mặc định từ `mockProperties.js` và `mockContracts.js`, sau đó lưu ngược lại vào `localStorage`.

2. **Cập nhật & Lọc trùng (User Action & Deduplication Flow):**
   - Khi Chủ trọ thêm phòng trọ mới $\rightarrow$ Hệ thống chạy thuật toán kiểm tra trùng lặp (Haversine khoảng cách GPS + Jaccard văn bản tiêu đề/mô tả).
     - Nếu trùng lặp cao ($\ge 50\%$), thuộc tính `status` được đặt thành `'pending'` và kèm `duplicateReport` chi tiết, bài viết bị ẩn khỏi tập hiển thị công khai và đưa vào hàng chờ duyệt của Admin.
     - Nếu không trùng lặp (hoặc do Admin đăng), bài viết được đặt là `status: 'active'`.
   - Khi Chủ trọ/Admin thay đổi trạng thái thuê phòng (Trống $\leftrightarrow$ Đang thuê) hoặc gỡ bài đăng (Unlist $\leftrightarrow$ Publish) $\rightarrow$ React State `properties` cập nhật $\rightarrow$ kích hoạt `useEffect` ghi đè xuống `TNCB_PROPERTIES` trong `localStorage`.
     - Bài đăng ở trạng thái `isUnlisted === true` hoặc `status === 'pending'` sẽ lập tức được ẩn khỏi danh sách tìm kiếm công khai và bản đồ Leaflet.
   - Khi Khách thuê truy cập chi tiết phòng trọ $\rightarrow$ React State lịch sử xem tin tự động ghi nhận lượt xem mới, lọc bỏ các bản ghi đã quá 7 ngày $\rightarrow$ ghi đè xuống `TNCB_VIEW_HISTORY` trong `localStorage`.
