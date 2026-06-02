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

## 2. Thuật Toán Gỡ & Đăng Lại Bài Viết (Unlist & Publish Property Logic)

Thuật toán xử lý trạng thái ẩn/hiện tin đăng của chủ nhà hoặc Admin (`isUnlisted`) để tạm ẩn tin khỏi bộ tìm kiếm và bản đồ mà không xóa bài.

```mermaid
flowchart TD
    %% Styling
    classDef startEnd fill:#f43f5e,stroke:#be123c,stroke-width:2px,color:#fff;
    classDef process fill:#e0f2fe,stroke:#0284c7,stroke-width:2px;
    classDef decision fill:#fef3c7,stroke:#d97706,stroke-width:2px;

    %% Nodes
    Start([Click nút 'Gỡ bài' hoặc 'Đăng lại' ở Dashboard]):::startEnd
    GetProp[Xác định ID phòng trọ & trạng thái isUnlisted hiện tại]:::process
    ToggleUnlist[Đảo ngược trạng thái: isUnlisted = !isUnlisted]:::process
    UpdateContext[Cập nhật phòng trọ trong State properties của AppContext]:::process
    WriteStorage[Ghi mảng properties mới xuống LocalStorage TNCB_PROPERTIES]:::process
    
    CheckUnlist{Trạng thái isUnlisted mới là gì?}:::decision
    HideProp[Ẩn phòng khỏi trang Tìm kiếm công khai <br> & Bỏ qua phòng trong so khớp trùng lặp]:::process
    ShowProp[Hiển thị lại phòng trên trang Tìm kiếm công khai <br> & Đưa phòng vào danh sách so khớp trùng lặp]:::process
    
    End([Giao diện và cơ sở dữ liệu cập nhật lập tức]):::startEnd

    %% Connections
    Start --> GetProp
    GetProp --> ToggleUnlist
    ToggleUnlist --> UpdateContext
    UpdateContext --> WriteStorage
    WriteStorage --> CheckUnlist
    CheckUnlist -->|Đúng - Đã gỡ| HideProp
    CheckUnlist -->|Sai - Công khai| ShowProp
    HideProp --> End
    ShowProp --> End
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

---

## 5. Thuật Toán Lọc Trùng Tin Tự Động & Hàng Chờ Duyệt Trực Quan Của Admin (Deduplication & Admin Review Queue)

Quy trình lọc trùng 3 lớp tự động kết hợp xét duyệt thủ công trực quan bằng màn hình so sánh của Admin.

```mermaid
flowchart TD
    %% Styling
    classDef startEnd fill:#f43f5e,stroke:#be123c,stroke-width:2px,color:#fff;
    classDef process fill:#e0f2fe,stroke:#0284c7,stroke-width:2px;
    classDef decision fill:#fef3c7,stroke:#d97706,stroke-width:2px;

    %% Nodes
    Start([Chủ trọ gửi Form đăng tin phòng mới]):::startEnd
    CheckUser{Người đăng là Admin?}:::decision
    BypassCheck[Bỏ qua lọc trùng <br> & Đặt status = 'active', verified = true]:::process
    
    GeoCheck[1. Tính khoảng cách GPS với tin cũ của chủ trọ <br> dùng công thức Haversine]:::process
    CheckDist{Khoảng cách < 15 mét?}:::decision
    
    RoomCompare[2. Đối chiếu: Loại phòng, Diện tích, Giá thuê]:::process
    CheckRoomDiff{Khác biệt ít nhất 1 thông số?}:::decision
    
    TextCompare[3. Tính độ tương đồng văn bản Jaccard <br> tiêu đề và mô tả]:::process
    CheckScore{Độ trùng lặp >= 80%?}:::decision
    CheckPending{Độ trùng lặp từ 50% đến 79%?}:::decision
    
    BlockPost[Từ chối đăng bài <br> Hiển thị cảnh báo Spam lập tức]:::process
    PendingPost[Đặt status = 'pending' <br> Lưu báo cáo trùng lặp duplicateReport]:::process
    NormalPost[Đặt status = 'active' <br> Công khai bài đăng]:::process
    
    NotifyAdmin[Đưa tin vào Hàng chờ Duyệt của Admin]:::process
    AdminAction{Admin xem so sánh song song <br> & Quyết định duyệt?}:::decision
    
    ApprovePost[Duyệt & Công khai tin <br> Đổi status = 'active', verified = true]:::process
    RejectPost[Từ chối & Xóa tin <br> Gọi hàm deleteProperty]:::process
    
    End([Kết thúc quy trình]):::startEnd

    %% Connections
    Start --> CheckUser
    CheckUser -->|Có| BypassCheck
    CheckUser -->|Không| GeoCheck
    
    GeoCheck --> CheckDist
    CheckDist -->|Không trùng vị trí| NormalPost
    CheckDist -->|Trùng vị trí| RoomCompare
    
    RoomCompare --> CheckRoomDiff
    CheckRoomDiff -->|Có khác biệt - Phòng khác cùng nhà| NormalPost
    CheckRoomDiff -->|Giống hệt thông số phòng| TextCompare
    
    TextCompare --> CheckScore
    CheckScore -->|Có| BlockPost
    CheckScore -->|Không| CheckPending
    
    CheckPending -->|Đúng| PendingPost
    CheckPending -->|Sai| NormalPost
    
    PendingPost --> NotifyAdmin
    NotifyAdmin --> AdminAction
    AdminAction -->|Đồng ý duyệt| ApprovePost
    AdminAction -->|Từ chối xóa| RejectPost
    
    BypassCheck --> End
    NormalPost --> End
    BlockPost --> End
    ApprovePost --> End
    RejectPost --> End
```

