# Sơ Đồ Thuật Toán Khối Các Luồng Xử Lý (Project Algorithms)

Tài liệu này chi tiết hóa các thuật toán xử lý logic cốt lõi trong hệ thống TNCB Rent bằng các sơ đồ khối (Flowcharts), phục vụ việc hiện thực hóa mã nguồn chính xác nhất.

---

## 1. Thuật Toán Lọc & Tìm Kiếm Phòng Trọ (Search & Filter Logic)

Thuật toán này xử lý bộ lọc đa tiêu chí tại trang Tìm Kiếm (`Search.jsx`) dựa trên các thông số đầu vào từ người dùng mà không gây lag giao diện.

```mermaid
flowchart TD
    %% Styling
    classDef startEnd fill:#f43f5e,stroke:#be123c,stroke-width:2px,color:#fff;
    classDef process fill:#e0f2fe,stroke:#0284c7,stroke-width:2px;
    classDef decision fill:#fef3c7,stroke:#d97706,stroke-width:2px;

    %% Nodes
    Start([Bắt đầu lọc danh sách phòng]):::startEnd
    GetInputs[Đọc danh sách properties từ Context <br> & Đọc các bộ lọc active từ State]:::process
    LoopStart{Duyệt qua từng phòng P trong danh sách}:::decision
    
    CheckCity{Thành phố của P == City chọn <br> HOẶC City chọn == 'Tất cả'?}:::decision
    CheckDistrict{Quận của P == District chọn <br> HOẶC District chọn == 'Tất cả'?}:::decision
    CheckPrice{Giá của P <= maxPrice <br> HOẶC maxPrice trống?}:::decision
    CheckType{Loại phòng của P == Type chọn <br> HOẶC Type chọn == 'Tất cả'?}:::decision
    CheckAmen{P chứa tất cả các tiện ích <br> được chọn trong bộ lọc?}:::decision
    
    AddToFiltered[Thêm P vào danh sách kết quả hiển thị]:::process
    SkipProp[Bỏ qua phòng P]:::process
    
    HasNext{Còn phòng chưa duyệt?}:::decision
    End([Trả về danh sách kết quả lọc & <br> Render giao diện fade-in]):::startEnd

    %% Connections
    Start --> GetInputs
    GetInputs --> LoopStart
    
    LoopStart -->|Có| CheckCity
    CheckCity -->|Đúng| CheckDistrict
    CheckCity -->|Sai| SkipProp
    
    CheckDistrict -->|Đúng| CheckPrice
    CheckDistrict -->|Sai| SkipProp
    
    CheckPrice -->|Đúng| CheckType
    CheckPrice -->|Sai| SkipProp
    
    CheckType -->|Đúng| CheckAmen
    CheckType -->|Sai| SkipProp
    
    CheckAmen -->|Đúng| AddToFiltered
    CheckAmen -->|Sai| SkipProp
    
    AddToFiltered --> HasNext
    SkipProp --> HasNext
    
    HasNext -->|Có| LoopStart
    HasNext -->|Không| End
```

---

## 2. Thuật Toán Tính Hóa Đơn Điện Nước (Monthly Billing Calculation)

Dành cho Chủ trọ tại Dashboard (`Dashboard.jsx`), hệ thống tự động tính toán tổng số tiền dựa trên chỉ số điện nước tiêu thụ thực tế.

```mermaid
flowchart TD
    %% Styling
    classDef startEnd fill:#f43f5e,stroke:#be123c,stroke-width:2px,color:#fff;
    classDef process fill:#e0f2fe,stroke:#0284c7,stroke-width:2px;
    classDef decision fill:#fef3c7,stroke:#d97706,stroke-width:2px;

    %% Nodes
    Start([Yêu cầu tạo hóa đơn phòng]):::startEnd
    GetContract[Lấy hợp đồng đang hoạt động của phòng]:::process
    InputIndices[Nhập chỉ số Điện mới & Nước mới <br> từ form nhập liệu]:::process
    
    CheckIndices{Chỉ số mới >= Chỉ số cũ <br> trong hóa đơn gần nhất?}:::decision
    AlertError[Hiển thị cảnh báo lỗi nhập liệu <br> Chỉ số mới không hợp lệ]:::process
    
    CalcElec[Tính tiền điện: <br> Số kwh = Mới - Cũ <br> Tiền điện = Số kwh * Đơn giá điện]:::process
    CalcWater[Tính tiền nước: <br> Nếu tính theo đầu người: Nước = Số khách * Đơn giá nước <br> Nếu tính theo khối: Nước = Khối tiêu thụ * Đơn giá nước]:::process
    
    CalcTotal[Tổng hóa đơn = Tiền phòng + Tiền điện + Tiền nước + Phí dịch vụ]:::process
    CreateBill[Tạo đối tượng Bill: ID, Tháng, Chi tiết số liệu, Tổng tiền, Trạng thái: Chưa đóng]:::process
    
    SaveDB[Cập nhật mảng contracts trong Context <br> & Đồng bộ tự động xuống LocalStorage]:::process
    Notify[Gửi thông báo hóa đơn tới Dashboard Khách thuê]:::process
    End([Hoàn thành tạo hóa đơn]):::startEnd

    %% Connections
    Start --> GetContract
    GetContract --> InputIndices
    InputIndices --> CheckIndices
    
    CheckIndices -->|Sai| AlertError
    AlertError --> InputIndices
    
    CheckIndices -->|Đúng| CalcElec
    CalcElec --> CalcWater
    CalcWater --> CalcTotal
    CalcTotal --> CreateBill
    CreateBill --> SaveDB
    SaveDB --> Notify
    Notify --> End
```

---

## 3. Thuật Toán Đồng Bộ Trạng Thái Phòng & Bản Đồ (Status Switch & Map Sync)

Khi chủ trọ thay đổi trạng thái trống của phòng trọ bằng Switch gạt trên bảng quản trị, hệ thống sẽ tự động cập nhật bản đồ chỉ dẫn để đảm bảo khách thuê không tìm thấy phòng đã cho thuê.

```mermaid
flowchart TD
    %% Styling
    classDef startEnd fill:#f43f5e,stroke:#be123c,stroke-width:2px,color:#fff;
    classDef process fill:#e0f2fe,stroke:#0284c7,stroke-width:2px;
    classDef decision fill:#fef3c7,stroke:#d97706,stroke-width:2px;

    %% Nodes
    Start([Click nút gạt Switch Trạng thái phòng]):::startEnd
    GetProp[Xác định ID phòng trọ tương ứng]:::process
    ToggleStatus[Đảo ngược trạng thái: Trống <--> Đã thuê]:::process
    UpdateContext[Cập nhật thuộc tính của phòng trong State properties]:::process
    WriteLocalStorage[Ghi đè danh sách properties mới xuống LocalStorage]:::process
    
    CheckStatus{Trạng thái mới là gì?}:::decision
    HideMap[Ẩn phòng khỏi trang Tìm kiếm <br> & Xóa Marker trên bản đồ tìm kiếm]:::process
    ShowMap[Hiện phòng trên trang Tìm kiếm <br> & Vẽ lại Marker với popup chính xác]:::process
    
    End([Giao diện hiển thị thay đổi lập tức]):::startEnd

    %% Connections
    Start --> GetProp
    GetProp --> ToggleStatus
    ToggleStatus --> UpdateContext
    UpdateContext --> WriteLocalStorage
    WriteLocalStorage --> CheckStatus
    CheckStatus -->|Đã thuê| HideMap
    CheckStatus -->|Còn trống| ShowMap
    HideMap --> End
    ShowMap --> End
```

---

## 4. Thuật Toán Lưu Phòng Yêu Thích (Saved Properties Engine)

Cho phép Khách thuê lưu trữ các phòng trọ quan tâm để so sánh hoặc liên hệ sau.

```mermaid
flowchart TD
    %% Styling
    classDef startEnd fill:#f43f5e,stroke:#be123c,stroke-width:2px,color:#fff;
    classDef process fill:#e0f2fe,stroke:#0284c7,stroke-width:2px;
    classDef decision fill:#fef3c7,stroke:#d97706,stroke-width:2px;

    %% Nodes
    Start([Click Icon Tim trên PropertyCard]):::startEnd
    GetSaved[Đọc danh sách savedProperties hiện tại từ Context]:::process
    CheckSaved{ID phòng đã tồn tại <br> trong savedProperties?}:::decision
    
    RemoveSaved[Xóa ID phòng khỏi mảng savedProperties <br> Đổi màu tim thành viền xám]:::process
    AddSaved[Thêm ID phòng vào mảng savedProperties <br> Đổi màu tim thành Emerald đầy]:::process
    
    SyncStorage[Ghi mảng savedProperties mới xuống LocalStorage TNCB_SAVED]:::process
    UpdateUI[Cập nhật số lượng hiển thị trên Badge Saved ở Header]:::process
    End([Hoàn thành thao tác lưu]):::startEnd

    %% Connections
    Start --> GetSaved
    GetSaved --> CheckSaved
    CheckSaved -->|Đã tồn tại| RemoveSaved
    CheckSaved -->|Chưa tồn tại| AddSaved
    RemoveSaved --> SyncStorage
    AddSaved --> SyncStorage
    SyncStorage --> UpdateUI
    UpdateUI --> End
```
