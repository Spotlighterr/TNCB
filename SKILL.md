---
name: tncb-design-persistence
description: Hướng dẫn duy trì ngữ cảnh và đồng bộ hóa các quyết định thiết kế (thietke.md) & chức năng nghiệp vụ (chucnang.md) nhằm phục vụ liên thông giữa các session làm việc khác nhau của AI Agent.
---

# 🛡️ Quy Tắc Duy Trì Dự Án TNCB Rent (Design & Function Persistence)

Tệp chỉ dẫn này thiết lập quy trình bắt buộc dành cho **mọi AI Coding Agent** khi làm việc trong workspace `d:\FTUhousingbank\TNCB`. Mục tiêu là đảm bảo tính nhất quán về thẩm mỹ (Taste Skill) và duy trì đầy đủ ngữ cảnh tính năng nghiệp vụ khi người dùng mở phiên làm việc (session) mới.

---

## 🔑 1. ĐỌC ĐẦU TIÊN (Read First Protocol)

Mỗi khi bắt đầu một phiên làm việc mới hoặc tiếp nhận một yêu cầu lập trình liên quan đến giao diện/chức năng:
1. **Đọc tệp [thietke.md](file:///d:/FTUhousingbank/TNCB/thietke.md)** để nắm rõ:
   - Bản thiết kế chung (**Design Read**).
   - Trạng thái 3 bộ xoay độ động (**Core Dials**): `DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`.
   - Hệ thống CSS Tokens đang áp dụng (Màu Emerald nhấn, Bo góc 12px, Glassmorphism).
2. **Đọc tệp [chucnang.md](file:///d:/FTUhousingbank/TNCB/chucnang.md)** để nắm rõ:
   - Các luồng nghiệp vụ người dùng (**Tenant Journey** & **Landlord AMS Flow**).
   - Sơ đồ cấu trúc dữ liệu giả lập (**Mock Data Structure**).
   - Cơ chế kỹ thuật (Đồng bộ Map-List bằng React State, lưu trữ bền vững qua LocalStorage Context, CSS Spring Micro-interactions).
3. **Không tự ý thay đổi** các nguyên tắc cốt lõi trừ khi có yêu cầu rõ ràng từ người dùng.

---

## 💾 2. ĐỒNG BỘ CẬP NHẬT (Double-Sync Protocol)

> [!IMPORTANT]
> **Single Sources of Truth:** Tệp `thietke.md` là nguồn dữ liệu chính xác duy nhất của thiết kế, và `chucnang.md` là nguồn dữ liệu chính xác duy nhất của chức năng & logic nghiệp vụ.

Sau **bất kỳ thay đổi, nâng cấp hay sửa đổi nào** liên quan đến giao diện hoặc nghiệp vụ hệ thống:
- **Cập nhật Thiết kế**: Ghi nhận ngay các thay đổi (bảng màu, font, bo góc, layout) vào tệp [thietke.md](file:///d:/FTUhousingbank/TNCB/thietke.md).
- **Cập nhật Chức năng**: Ghi nhận ngay các thay đổi (luồng nghiệp vụ, cấu trúc dữ liệu Mock Data, logic React State, cơ chế lưu trữ) vào tệp [chucnang.md](file:///d:/FTUhousingbank/TNCB/chucnang.md).
- Trình bày chi tiết lý do và cấu trúc mã nguồn mới của sự thay đổi đó trong tệp tương ứng để Agent ở các session tiếp theo luôn hiểu đúng 100% hiện trạng dự án.

---

## 🚫 3. TUÂN THỦ TIGHT TASTE SKILL (Strict Compliance)

Tuyệt đối tuân thủ ma trận kiểm soát chất lượng (Pre-Flight Check) trong `thietke.md`:
- Cấm tuyệt đối dấu gạch ngang em-dash (`—`).
- Khóa góc bo nhất quán trên toàn hệ thống.
- Đảm bảo độ tương phản an toàn thiết kế WCAG AA (tối thiểu 4.5:1).
- Tránh rập khuôn AI (không sử dụng gradient tím AI mặc định, không sử dụng font Inter mặc định nếu đã cam kết dùng font **Outfit**).
