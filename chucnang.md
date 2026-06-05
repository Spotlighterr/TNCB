# Đặc Tả Chức Năng Hệ Thống TNCB Rent (FTU Housing Bank)

Tài liệu này chi tiết hóa các tính năng nghiệp vụ, luồng trải nghiệm người dùng, và các giải pháp kỹ thuật cụ thể sẽ được hiện thực hóa trong mã nguồn của hệ thống. Đây là tài liệu gốc để theo dõi tiến độ lập trình các chức năng.

---

## 👥 1. Luồng Nghiệp Vụ Người Dùng (User Journeys)

### A. Trải Nghiệm Khách Thuê (Tenant Flow)
Khách thuê (sinh viên, người đi làm trẻ tuổi) có các điểm tương tác chính sau:

1. **Trang Chủ Tối Giản (Home Page)**
   - **Hero Section**: Hiển thị thông điệp cốt lõi, thanh tìm kiếm nhanh tích hợp bộ lọc theo Quận/Huyện và Khoảng giá. Giao diện thoáng đãng, tinh tế.
   - **Featured Rentals Grid**: Danh sách 4 phòng trọ nổi bật đã qua kiểm duyệt (Verified), có nhãn giá rõ ràng và hiệu ứng phóng to ảnh nhẹ khi hover.
   - **Bento Stats Grid**: Thống kê số lượng phòng trống thực tế, số lượng trường học xung quanh được hỗ trợ, và phản hồi tích cực.

2. **Tìm Kiếm Phòng Trọ Trực Quan & Tối Giản (Clean Property Search)**
   - **Layout Thư Mục Bán Lẻ (Editorial Grid Layout)**: Thay thế giao diện chia đôi màn hình phức tạp bằng giao diện danh bạ phòng trọ tối giản, dạng lưới trực quan và thoáng đãng giúp người dùng tập trung hoàn toàn vào thông tin phòng. Loại bỏ tính năng đồng bộ Map-List để tránh gây rối mắt và lộn xộn cho người xem.
   - **Bộ Lọc Thông Minh**: Bộ lọc nhanh theo Quận, Mức giá trần, Loại phòng (Studio, Duplex, Chung cư mini) và các tiện ích (Điều hòa, Máy giặt, Khóa vân tay, Giờ giấc tự do).
   - **Phòng Trọ Xác Thực (Verified Badge)**: Nhãn chứng nhận "Nhà thật, Giá thật, Vị trí thật" nổi bật trên từng thẻ phòng.

3. **Chi Tiết Phòng Trọ & Bản Đồ Chỉ Đường (Property Detail & Map)**
   - **Carousel Ảnh**: Bộ sưu tập ảnh trượt ngang mượt mà, hỗ trợ phóng to (Lightbox).
   - **Bảng Giá & Chi Phí**: Ghi nhận chi tiết tiền phòng, tiền điện (VND/kwh), tiền nước (VND/người hoặc m3), và phí dịch vụ (VND/phòng).
   - **Hệ Thống Thẻ Tiện Ích**: Hiển thị trực quan các tiện ích phòng bằng icon Phosphor sắc nét.
   - **Liên Hệ Chủ Trọ (Contact Card)**: Panel chứa thông tin chủ trọ, nút gọi nhanh, nút nhắn tin Zalo và Form gửi yêu cầu tư vấn/hẹn lịch xem phòng.
   - **Bản Đồ Chỉ Đường ở Chân Trang (Targeted Map Integration)**: Tích hợp bản đồ tương tác hiển thị vị trí chính xác của phòng trọ đó ở dưới cùng trang chi tiết. Bản đồ sử dụng **Google Maps Embed API** miễn phí hoặc **Leaflet.js kết hợp OpenStreetMap Việt Nam** (hoặc Goong Maps của Việt Nam), cho phép dẫn đường từ các địa điểm lân cận giúp khách thuê dễ dàng hình dung lộ trình di chuyển đến phòng trọ.

4. **Trang Cá Nhân Khách Thuê (Tenant Dashboard)**
    - **Lịch Sử Xem Tin (View History)**: Tự động lưu vết các tin đăng khách thuê đã xem trong vòng 7 ngày gần nhất sử dụng bộ nhớ local của trình duyệt (localStorage), hỗ trợ làm sạch tự động để tránh làm phình dữ liệu.
    - **Tin Ở Ghép Của Tôi (My Listings)**: Hỗ trợ quản lý và chỉnh sửa bài đăng tìm người ở ghép của cá nhân.

---

### B. Trải Nghiệm Chủ Trọ & Quản Trị (Landlord AMS Flow)
Chủ trọ (Landlord) và Admin sử dụng hệ thống qua giao diện tích hợp:

1. **Tổng Quan & Quản Lý Bài Đăng (Overview & Management)**
   - **Thẻ thống kê:** Hiển thị tổng số **Tin đăng** (tập hợp bài viết) và số **Bài đang hoạt động** (các bài công khai không bị unlisted/pending) trên hệ thống.
   - **Thêm/Sửa Phòng:** Nút bấm thêm bài đăng ở thanh tiêu đề mở form điền thông tin phòng trọ (Ảnh mẫu, chọn tiện ích, nhập giá điện nước, tọa độ).
   - **Danh Sách Bài Đăng:** Bảng quản trị trực tiếp hiển thị thông tin bài viết, diện tích, giá thuê, công tắc gạt gỡ/hiển thị bài đăng (`isUnlisted`), và công tắc gạt trạng thái phòng trống/đang thuê (`isRented`).



---

## ⚙️ 2. Giải Pháp Kỹ Thuật Cốt Lõi (Core Technical Architectures)

### A. Tích Hợp Bản Đồ Dẫn Đường Tương Tác (Targeted Map Integration)
Hệ thống sử dụng bản đồ tích hợp ở chân trang Chi tiết phòng trọ để hiển thị chính xác vị trí của từng phòng. Sử dụng bản đồ **Google Maps Embed API** miễn phí hoặc giải pháp mã nguồn mở **Leaflet.js kết hợp OpenStreetMap Việt Nam** (hoặc Goong Maps của Việt Nam), cho phép hiển thị cực kỳ mượt mà và trực quan.

Khi sử dụng giải pháp Leaflet + OSM (hoàn toàn miễn phí và không cần khóa API), bản đồ sẽ được gắn vào một thẻ `div` trong component:
```javascript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export function PropertyMap({ lat, lng, address }) {
  return (
    <MapContainer center={[lat, lng]} zoom={15} style={{ height: '350px', borderRadius: 'var(--radius-main)' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <Marker position={[lat, lng]}>
        <Popup>{address}</Popup>
      </Marker>
    </MapContainer>
  );
}
```
Lợi thế lớn của giải pháp này là không phát sinh chi phí, tải nhanh, và tương thích 100% với môi trường Việt Nam.

### B. Cơ Chế Lưu Trữ Dữ Liệu Bền Vững (LocalStorage Database Engine)
Toàn bộ dữ liệu của hệ thống được khởi tạo ban đầu từ `mockProperties.js` và sau đó được quản lý hoàn toàn bằng React Context lưu vào `localStorage`. 

```javascript
// Cấu trúc React Context lưu trữ
export const AppProvider = ({ children }) => {
  const [properties, setProperties] = useState(() => {
    const saved = localStorage.getItem("TNCB_PROPERTIES");
    return saved ? JSON.parse(saved) : defaultProperties;
  });

  const [contracts, setContracts] = useState(() => {
    const saved = localStorage.getItem("TNCB_CONTRACTS");
    return saved ? JSON.parse(saved) : defaultContracts;
  });

  // Đồng bộ xuống LocalStorage mỗi khi state thay đổi
  useEffect(() => {
    localStorage.setItem("TNCB_PROPERTIES", JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem("TNCB_CONTRACTS", JSON.stringify(contracts));
  }, [contracts]);

  // Các hàm nghiệp vụ: addProperty, togglePropertyStatus, createContract, addBill...
  return (
    <AppContext.Provider value={{ properties, contracts, addProperty, togglePropertyStatus }}>
      {children}
    </AppContext.Provider>
  );
};
```
Nhờ cơ chế này, hệ thống **không cần cài đặt database cồng kềnh** nhưng vẫn đảm bảo:
- Thêm phòng trọ mới từ Dashboard sẽ lập tức hiển thị trên Bản đồ tìm kiếm ở trang ngoài.
- Bật/tắt trạng thái thuê phòng sẽ cập nhật marker tương ứng thời gian thực.
- Lịch sử xem tin của khách thuê được lưu trữ trong vòng 7 ngày và tự động dọn dẹp khi tải lại trang.

### C. Tactile Physics & Spring Motion (Micro-interactions)
Toàn bộ các chuyển dịch giao diện (như mở popup trên bản đồ, thẻ hover phóng to, chuyển trang) sẽ sử dụng CSS Transition định nghĩa ở `global.css`:
```css
/* Hiệu ứng chuyển động mượt mà phản hồi vật lý */
.transition-tactile {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.button-tactile:active {
  transform: scale(0.96);
}

.card-hover:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: var(--glass-shadow), 0 12px 40px rgba(0, 0, 0, 0.08);
}
```
Quy tắc này giúp loại bỏ hoàn toàn cảm giác chuyển động tuyến tính thô cứng, nâng tầm trải nghiệm người dùng đạt chất lượng Awwwards cao cấp.

### D. Hệ Thống Kiểm Tra & Lọc Tin Đăng Trùng Lặp (Anti-Spam Deduplication Engine)

Để loại bỏ các tin đăng rác, trùng lặp nội dung gây loãng dữ liệu, nhưng vẫn bảo đảm quyền lợi đăng tin nhiều loại phòng trong cùng một tòa nhà của chủ nhà, hệ thống áp dụng thuật toán lọc trùng phân tầng:

1. **Bộ so khớp khoảng cách GPS (Haversine Formula):** Đo khoảng cách thực tế giữa tin đăng mới và tập bài viết cũ. Khoảng cách $\Delta < 15\text{m}$ bằng GPS được coi là nằm chung một tòa nhà vật lý, tránh sai số do cách viết địa chỉ khác nhau.
2. **Bộ kiểm tra thông số phòng:** So sánh tổ hợp `[Loại phòng + Diện tích + Giá thuê]`. Nếu trùng vị trí địa lý nhưng khác một trong ba thông số này, bài đăng được xác định là phòng khác trong cùng tòa nhà và được tự động duyệt.
3. **So khớp văn bản (Jaccard Similarity) & Ảnh:** Tính độ tương đồng tiêu đề và mô tả. Nếu chỉ số tin cậy (Confidence Score) $\ge 80\%$, bài viết bị chặn đăng và hiển thị cảnh báo chi tiết. Nếu chỉ số từ $50\% \to 79\%$, hệ thống tự động lưu dưới dạng trạng thái chờ duyệt `status: 'pending'` và chuyển tiếp hồ sơ báo cáo trùng lặp tới Admin.

---

## 🔑 3. Quyền Hạn Quản Trị Hệ Thống (Admin Powers & Control Flows)

Tài khoản Admin (`admin@tncb.vn` / mật khẩu: `admin`) được cấp quyền hạn đặc biệt để giám sát toàn bộ hoạt động của ứng dụng:

1. **Kiểm Duyệt Tin Trùng Lặp Thủ Công (Admin Review Queue):**
   - Các bài đăng bị phát hiện trùng lặp từ $50\% \to 79\%$ sẽ bị tạm khóa ở trạng thái `pending` và hiển thị trong danh mục **"Kiểm duyệt tin"** trên Sidebar của Admin.
   - Admin truy cập để mở **Modal Đối Chiếu Song Song (Double-sided Comparison Modal)**: xem chi tiết so sánh trực quan giữa Tin mới đăng và Tin cũ gốc bị trùng khớp kèm lý do hệ thống phát hiện.
   - Admin có hai hành động quyết định trực tiếp: **"Duyệt & Công khai"** (chuyển sang `status: 'active'`, tự động kích hoạt `verified: true`) hoặc **"Từ chối & Xóa tin"** (loại bỏ hoàn toàn khỏi hệ thống).

2. **Quản Lý Toàn Bộ Bài Đăng Trong Hệ Thống:**
   - Admin có quyền chỉnh sửa, xóa hoặc gỡ xuống (Unlist/Publish) bất kỳ bài viết nào của tất cả các chủ trọ trong hệ thống (không bị giới hạn bởi quyền sở hữu bài đăng).
   - Tại bảng quản lý phòng trọ, Admin được trang bị thêm nút chuyển đổi **"Xác thực"** để nhanh chóng gắn hoặc gỡ nhãn chứng nhận uy tín (Verified Badge) của bất kỳ bài viết nào.

3. **Khả Năng Gỡ Tin Đăng (Unlist / Publish):**
   - Chủ nhà (hoặc Admin) có quyền tạm gỡ bài đăng khỏi trạng thái hiển thị công khai (`isUnlisted: true`).
   - Bài đăng bị gỡ sẽ lập tức biến mất khỏi trang tìm kiếm công khai và bản đồ, đồng thời **hoàn toàn bị loại trừ** khỏi tập so sánh của thuật toán phát hiện trùng lặp, tạo không gian cho việc cập nhật hoặc tái bản sau này mà không bị đánh dấu spam.

4. **Quản Lý Slide Quảng Cáo & Bản Tin Trang Chủ (Hero Banner Management):**
   - Admin có quyền truy cập tab **"Quản lý Bản tin"** trên Dashboard để theo dõi toàn bộ các slide hiển thị trên trang chủ.
   - Hỗ trợ CRUD đầy đủ: thêm slide mới, sửa đổi thông tin (Thẻ, Huy hiệu, Tiêu đề, Mô tả, Liên kết, Thứ tự) và tải lên tệp ảnh trực tiếp từ máy tính.
   - Tự động tối ưu hóa ảnh tải lên (nén sang định dạng WebP) và dọn dẹp các file ảnh cũ trên ổ đĩa máy chủ khi xóa hoặc thay đổi ảnh slide.


---

## 🔒 4. Cơ Chế Xác Thực Kép & Bảo Mật (MFA & Email OTP Coexistence)

Hệ thống hỗ trợ cơ chế bảo vệ tài khoản nhiều lớp có khả năng cấu hình linh hoạt thông qua trang Hồ sơ cá nhân:

1. **Xác thực qua Email OTP (Email OTP Challenge):**
   - **Đăng ký tài khoản mới**: Bắt buộc người dùng phải xác minh địa chỉ Email qua mã OTP 6 số để kích hoạt tài khoản.
   - **Khi đăng nhập**: Người dùng có tùy chọn bật "Xác thực qua Email OTP" trong Hồ sơ. Khi bật, mỗi lượt đăng nhập bằng mật khẩu thông thường sẽ yêu cầu nhập mã OTP gửi về Email.
   - **Miễn trừ**: Tự động bỏ qua Email OTP khi người dùng đăng nhập thông qua Google SSO để duy trì tính tiện lợi.

2. **Xác thực qua Ứng dụng Authenticator (MFA / 2FA):**
   - Hỗ trợ kết nối các ứng dụng Authenticator (như Google/Microsoft Authenticator) qua chuẩn TOTP.
   - Khi bật, mỗi lượt đăng nhập (gồm cả mật khẩu và Google SSO) đều yêu cầu nhập mã 6 số từ ứng dụng để hoàn tất.

3. **Cơ chế Đồng tồn tại & Thứ tự Ưu tiên (Priority Matrix):**
   - Khi người dùng bật cả hai chế độ (Email OTP & MFA): Hệ thống tự động phân cấp ưu tiên cho **MFA** (độ bảo mật cao hơn) và bỏ qua bước Email OTP trong luồng xác thực đăng nhập.
