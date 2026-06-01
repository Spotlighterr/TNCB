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
   - **Saved Properties**: Danh sách các phòng trọ đã lưu yêu thích để so sánh.
   - **My Rental**: Thông tin phòng trọ đang thuê hiện tại, thời hạn hợp đồng, lịch sử các hóa đơn điện nước đã đóng.
   - **Yêu Cầu Hỗ Trợ & Danh Bạ Chủ Trọ (Support Ticket & Direct Contact)**: 
     - Gửi phản hồi kỹ thuật trực tiếp tới chủ trọ (VD: điều hòa hỏng, rò rỉ nước) và theo dõi trạng thái xử lý của ticket.
     - **Bảng Danh Bạ Hotline Liên Hệ**: Bổ sung một bảng thông tin liên hệ trực tiếp của chủ trọ và đội ngũ kỹ thuật sửa chữa (Hotline, số Zalo kỹ thuật, email hỗ trợ) bên cạnh form gửi ticket để khách thuê nhanh chóng liên lạc trực tiếp trong các trường hợp sự cố khẩn cấp.

---

### B. Trải Nghiệm Chủ Trọ & Quản Trị (Landlord AMS Flow)
Chủ trọ (Landlord) sử dụng hệ thống như một "Hệ điều hành mini" quản trị tài sản:

1. **Dashboard Tổng Quan (Overview)**
   - Thẻ thống kê: Tổng doanh thu dự kiến tháng này, tỷ lệ phòng đang trống, số tiền đã thu và số tiền còn nợ từ khách thuê.
   - Hoạt động gần đây: Cảnh báo hợp đồng sắp hết hạn hoặc yêu cầu sửa chữa mới từ khách thuê.

2. **Quản Lý Phòng Trọ (Room Management)**
   - **Danh Sách Phòng**: Bảng quản lý tất cả phòng trọ thuộc sở hữu, hiển thị mã phòng, diện tích, giá thuê, trạng thái trống/đang thuê.
   - **Thêm/Sửa Phòng**: Form điền thông tin chi tiết phòng trọ (Tải ảnh mẫu, chọn tiện ích, nhập giá điện nước, định vị tọa độ mẫu trên bản đồ).
   - **Bật Tắt Trạng Thái Nhanh**: Chuyển trạng thái phòng Trống sang Đang thuê bằng một nút gạt Switch mượt mà, lập tức thay đổi hiển thị của phòng trên bản đồ tìm kiếm.

3. **Quản Lý Hợp Đồng & Hóa Đơn (Contract & Billing)**
   - **Quản Lý Hợp Đồng**: Tạo hợp đồng điện tử cơ bản cho phòng trọ, lưu trữ thông tin khách thuê (Họ tên, SĐT, Ngày bắt đầu, Ngày kết thúc).
   - **Tạo Hóa Đơn Hàng Tháng**: Nhập số điện/nước tiêu thụ mới, hệ thống tự động tính toán tổng hóa đơn phòng kèm nút gửi cảnh báo đóng tiền nhà.

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
- Khách thuê lưu phòng yêu thích sẽ được ghi nhớ vĩnh viễn khi tải lại trang.

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
