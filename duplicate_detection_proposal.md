# Đề Xuất Giải Pháp & Thuật Toán Lọc Bài Đăng Trùng Lặp (Anti-Spam Deduplication Engine)

Tài liệu này trình bày phân tích đối chiếu giải pháp chống trùng lặp bài đăng giữa **Claude** và **Antigravity (Google DeepMind)**, chỉ rõ ưu/nhược điểm thực tế, các lỗi nghiêm trọng (Critical Flaws) trong code của Claude khi áp dụng tại Việt Nam, và đề xuất thuật toán tối ưu nhất cho hệ thống **TNCB Rent**.

---

## 1. Bảng So Sánh Giải Pháp (Claude vs Antigravity)

| Tiêu chí | Giải pháp của Claude | Giải pháp của Antigravity |
| :--- | :--- | :--- |
| **Kiến trúc dữ liệu** | **Bảng phẳng (Flat Table):** Mỗi bài đăng là 1 dòng độc lập trong DB. | **Quan hệ 1-Nhiều (1-to-Many):** Tách biệt *Tòa nhà vật lý (Property)* và *Các loại phòng trọ bên trong (Room Units)*. |
| **Cơ chế lọc cứng** | Dùng `Composite Key = hash(user_id + address + room_type)` làm khóa `UNIQUE`. | Không dùng Composite Key cứng. Sử dụng so khớp khóa ngoại kết hợp kiểm tra bộ thông số phòng. |
| **So khớp Địa điểm** | Chuẩn hóa text địa chỉ bằng Python $\rightarrow$ Tính điểm số bằng `SequenceMatcher`. | Chuẩn hóa địa lý bằng tọa độ GPS `[lat, lng]` $\rightarrow$ Tính khoảng cách vật lý bằng **Haversine Formula**. |
| **So khớp Nội dung** | Sử dụng TF-IDF + Cosine Similarity (văn bản) & Perceptual Hash (hình ảnh). | Sử dụng Jaccard Similarity (văn bản) & Perceptual Hash (hình ảnh) chạy bất đồng bộ (Async Worker). |
| **Hành vi lạm dụng** | Đếm số bài bị từ chối/gắn cờ trong 24h/7 ngày để khóa tài khoản. | Đếm bài trùng + Theo dõi fingerprint thiết bị/IP của chủ trọ spam. |

---

## 2. Phân Tích Lỗ Hổng Thực Tế Trong Giải Pháp Của Claude

Mã nguồn của Claude đề xuất có **3 điểm yếu nghiêm trọng** có thể làm hỏng trải nghiệm người dùng hoặc gây lỗi hệ thống tại Việt Nam:

### Lỗ hổng 1: Lỗi chặn đăng nhiều phòng cùng loại (Composite Key Flaw)
* **Vấn đề của Claude:** Khóa `composite_key` của Claude được định nghĩa là:
  `raw = f"{user_id}|{address_normalized}|{room_type}"` với thuộc tính `UNIQUE` trong database.
* **Hậu quả:** Nếu chủ trọ có một tòa nhà gồm **10 phòng Studio độc lập** (ví dụ phòng 101, 102, 103 đều là loại phòng "Studio" tại cùng một địa chỉ), họ **chỉ có thể đăng duy nhất 1 phòng**. Kể từ phòng thứ 2, hệ thống sẽ báo lỗi trùng Composite Key và từ chối lưu vào DB. Điều này vi phạm nghiêm trọng thực tế vận hành của các nhà cho thuê.
* **Cách khắc phục của Antigravity:** Loại bỏ `composite_key` cứng ở bảng cha. Lọc trùng dựa trên bộ thuộc tính động: `[Loại phòng + Diện tích + Giá + Số phòng]`.

### Lỗ hổng 2: Lỗi phân tích địa chỉ tiếng Việt (Vietnamese Address Parse Flaw)
* **Vấn đề của Claude:** Claude dùng regex `\b\d+[a-z]?\b` để lấy số nhà đầu tiên làm số nhà định danh, đồng thời xóa các từ khóa `đường, ngõ, hẻm, số`.
* **Hậu quả:** Tại Việt Nam, cấu trúc địa chỉ ngõ hẻm rất phức tạp:
  * Địa chỉ A: *"Số 10 ngõ 5 hẻm 2 Nguyễn Trãi"* $\rightarrow$ Claude normalize thành: `"10 5 2 nguyễn trãi"`, số nhà nhận dạng là `"10"`.
  * Địa chỉ B: *"Số 10 ngõ 2 hẻm 5 Nguyễn Trãi"* $\rightarrow$ Claude normalize thành: `"10 2 5 nguyễn trãi"`, số nhà nhận dạng là `"10"`.
  * Khi so sánh bằng `SequenceMatcher`, hai chuỗi này sẽ đạt độ tương đồng rất cao (> 90%) và số nhà đều là `"10"`, dẫn đến hệ thống **chặn nhầm bài** vì tưởng chung một nhà, trong khi thực tế chúng nằm ở hai con ngõ hoàn toàn khác nhau.
* **Cách khắc phục của Antigravity:** Bắt buộc chuẩn hóa địa chỉ đầu vào qua GPS API để lấy tọa độ `[lat, lng]`, tính khoảng cách vật lý bằng công thức **Haversine** (chính xác đến từng mét).

### Lỗ hổng 3: Nghẽn luồng xử lý (Blocking Performance Flaw)
* **Vấn đề của Claude:** Claude gọi trực tiếp hàm so sánh TF-IDF và Perceptual Hash ảnh một cách đồng bộ (Synchronous) trong hàm `evaluate_post` khi người dùng nhấn Đăng bài.
* **Hậu quả:** Việc tính toán TF-IDF trên toàn bộ tập dữ liệu cũ và mở các tệp ảnh để tính mã băm (imagehash) tốn rất nhiều CPU và RAM. Nếu hàng trăm người cùng đăng bài, server sẽ bị quá tải, gây nghẽn (block) luồng HTTP request khiến người dùng bị xoay vòng tròn chờ đợi.
* **Cách khắc phục của Antigravity:** Đăng bài qua 2 bước. Bước 1: Kiểm tra nhanh vị trí + loại phòng (Sync). Bước 2: Lưu bài tạm ở trạng thái `Pending` và đẩy tác vụ nặng (TF-IDF + Image Hashing) vào hàng đợi bất đồng bộ **Async Background Worker** (sử dụng Redis Queue / Celery) để xử lý ngầm.

---

## 3. Thuật Toán Lọc Trùng Phân Tầng Tối Ưu Cho TNCB Rent

Dưới đây là sơ đồ kiến trúc thuật toán kết hợp ưu điểm của cả hai bên, khắc phục triệt để các lỗ hổng trên:

```mermaid
flowchart TD
    %% Styling
    classDef startEnd fill:#f43f5e,stroke:#be123c,stroke-width:2px,color:#fff;
    classDef process fill:#e0f2fe,stroke:#0284c7,stroke-width:2px;
    classDef check fill:#fef3c7,stroke:#d97706,stroke-width:2px;
    classDef action fill:#ecfdf5,stroke:#10b981,stroke-width:2px;
    classDef queue fill:#faf5ff,stroke:#d8b4fe,stroke-width:2px;

    %% Nodes
    Start([Chủ trọ gửi bài đăng mới P_new]):::startEnd
    
    %% Tầng 1: Lọc Nhanh (Sync Path)
    subgraph Layer1 ["Tầng 1: Kiểm tra nhanh (Thời gian thực)"]
        GetCoords[Lấy tọa độ GPS [lat, lng] của P_new]:::process
        FilterGeo[Lọc nhanh các bài đăng cũ có khoảng cách GPS < 50m của cùng Owner]:::process
        CheckSpecs{Trùng khớp hoàn toàn: <br> Loại phòng VÀ Giá thuê VÀ Diện tích?}:::check
    end
    
    %% Tầng 2: Hàng đợi Bất đồng bộ (Async Path)
    subgraph Layer2 ["Tầng 2: Phân tích sâu (Background Worker)"]
        PushQueue[Đẩy P_new vào Queue kiểm tra ngầm]:::queue
        CalcText["Tính Jaccard/Cosine Similarity mô tả <br> (Nếu Text Sim > 85% -> +40 điểm)"]:::process
        CalcImage["Tính Perceptual Hash ảnh <br> (Nếu Hamming Dist <= 10 -> +40 điểm)"]:::process
        SumScore{Tổng điểm tin cậy >= 80?}:::check
    end

    %% Kết quả
    SavePending[Lưu bài tạm ở trạng thái Pending]:::process
    Approve[Duyệt bài đăng công khai]:::action
    Reject[Chuyển bài viết sang Trạng thái chờ Duyệt thủ công]:::action

    %% Connections
    Start --> GetCoords
    GetCoords --> FilterGeo
    FilterGeo --> CheckSpecs
    
    CheckSpecs -->|Không trùng bộ thông số| Approve
    CheckSpecs -->|Trùng bộ thông số| SavePending
    
    SavePending --> PushQueue
    PushQueue --> CalcText
    PushQueue --> CalcImage
    CalcText --> CalcImage
    CalcImage --> SumScore
    
    SumScore -->|Đúng| Reject
    SumScore -->|Sai| Approve
```

### Mã giả thuật toán đề xuất (Python/Javascript Hybrid):
```javascript
// Tính khoảng cách GPS giữa 2 tọa độ (Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Bán kính Trái Đất theo mét
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // mét
}

// Hàm kiểm tra trùng lặp thời gian thực (Đăng bài nhanh)
function evaluatePostSync(newPost, existingPosts) {
  // 1. Chỉ lọc các bài đăng đang hoạt động của cùng chủ nhà
  const ownerPosts = existingPosts.filter(p => p.ownerId === newPost.ownerId && p.status === 'active');
  
  for (let oldPost of ownerPosts) {
    const distance = calculateDistance(
      newPost.coords[0], newPost.coords[1], 
      oldPost.coords[0], oldPost.coords[1]
    );
    
    // Nếu nằm trong cùng một tòa nhà (< 15 mét)
    if (distance < 15) {
      // Nếu trùng cả Loại phòng, Giá và Diện tích -> Nghi ngờ trùng lặp cao
      if (newPost.type === oldPost.type && 
          newPost.price === oldPost.price && 
          newPost.area === oldPost.area) {
        return { action: "PROCEED_TO_ASYNC_CHECK", matchedPostId: oldPost.id };
      }
    }
  }
  
  return { action: "APPROVE_IMMEDIATELY" };
}
```

---

## 4. Kết Luận & Khuyến Nghị

* **Nếu hệ thống của bạn có thể tái cấu trúc cơ sở dữ liệu:** Khuyên nghị sử dụng giải pháp **Quan hệ 1-Nhiều (1-to-Many)** của Antigravity. Đây là giải pháp triệt để nhất, giải quyết bài toán tận gốc rễ từ mô hình dữ liệu (Data Model), giống như cách các hệ thống lớn (Agoda, Booking, HouseZy) đang vận hành.
* **Nếu bắt buộc giữ bảng phẳng (Flat Table) không thể sửa DB:** Áp dụng thuật toán **Lọc trùng phân tầng** của Antigravity để thay thế giải pháp Composite Key của Claude, nhằm tránh lỗi chặn đăng phòng của người dùng và tăng tốc độ xử lý của Server.
