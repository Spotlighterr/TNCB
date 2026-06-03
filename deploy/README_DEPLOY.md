# 🚀 Hướng Dẫn Vận Hành & Triển Khai Hệ Thống An Toàn TNCB Rent

Tài liệu này tổng hợp giải pháp kết hợp giữa **Kiến trúc Scale tải cao** và **Bảo mật biên bằng Cloudflare Tunnel** của bạn và tôi. Đồng thời hướng dẫn bạn chạy thử nghiệm toàn bộ cụm hạ tầng này trên máy cục bộ bằng Docker.

---

## 🛠️ 1. Giải Pháp Tổng Hợp (Synthesized Architecture)

Kiến trúc này giải quyết triệt để 3 bài toán: **Bảo mật tuyệt đối (Zero Inbound Ports)**, **Chống DDoS mạnh mẽ**, và **Khả năng chịu tải cực cao**.

1.  **Frontend (React SPA):** Được tối ưu hóa bằng NGINX trong Docker. Ở môi trường sản xuất thật, Frontend tĩnh có thể đưa trực tiếp lên **Cloudflare Pages** (miễn phí, phân tán CDN toàn cầu, tự động chống DDoS tầng Layer 3/4/7).
2.  **Đường hầm Cloudflare Tunnel (`cloudflared`):** Tạo kết nối mã hóa chiều đi ra (Outbound-only) từ server của bạn tới Cloudflare. Server của bạn **không cần IP tĩnh, không cần mở bất kỳ port nào trên modem (Port 80/443 đóng hoàn toàn)**. Loại bỏ hoàn toàn nguy cơ bị hacker scan IP gốc.
3.  **Bộ đệm Redis (Caching Layer):** RAM caching phục vụ lưu trữ session và lưu bộ lọc kết quả tìm kiếm phòng trọ hot, giảm 90% tải truy vấn cơ sở dữ liệu khi lượng sinh viên F5 đột biến mùa nhập học.
4.  **Cân bằng tải & Header Bảo mật (NGINX Reverse Proxy):** Tích hợp các bộ lọc nén Gzip tăng tốc độ phản hồi tài nguyên tĩnh và áp dụng các Header bảo mật chuẩn OWASP nâng cao (CSP, CORS, HSTS, X-Frame-Options).

---

## 📂 2. Cấu Trúc Các Tệp Triển Khai Đã Tạo

Chúng ta đã thiết lập các tệp cấu hình cần thiết nằm trong thư mục `deploy/`:
*   `deploy/Dockerfile`: Dockerfile đa tầng (Multi-stage) tối ưu hóa kích thước image, tự động build mã nguồn Vite và chuyển giao sản phẩm cho NGINX.
*   `deploy/nginx.conf`: File cấu hình máy chủ web NGINX với đầy đủ các header bảo mật và bộ nén tốc độ.
*   `deploy/docker-compose.yml`: File kịch bản khởi chạy toàn bộ 4 container: Frontend Web, API Server, Redis Cache, và Cloudflare Tunnel Agent.

---

## 🚀 3. Hướng Dẫn Chạy Thử Nghiệm Bằng Docker

Để chạy thử nghiệm mô hình này ngay trên máy tính của bạn, hãy thực hiện theo các bước sau:

### Bước 1: Cài đặt Docker
Đảm bảo máy tính của bạn đã cài đặt **Docker Desktop** (Tải về từ: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)).

### Bước 2: Khởi chạy cụm dịch vụ
Mở Terminal tại thư mục gốc của dự án (`d:\TNCB`) và chạy lệnh sau để tự động xây dựng hình ảnh (build image) và khởi chạy cụm container:

```bash
docker-compose -f deploy/docker-compose.yml up --build -d
```

*   **Giải thích:** Lệnh này sẽ tải các image cần thiết, chạy build Stage 1 (React) và Stage 2 (NGINX), sau đó khởi động ngầm toàn bộ cụm dịch vụ.
*   **Kiểm tra trạng thái:** Bạn chạy lệnh `docker ps` để xem 4 container (`tncb-frontend`, `tncb-api`, `tncb-redis`, và `tncb-cf-tunnel`) đã ở trạng thái `Up` chưa.
*   **Trải nghiệm local:** Truy cập ngay `http://localhost` trên trình duyệt để trải nghiệm website được phục vụ qua máy chủ NGINX bảo mật.

---

## 🔒 4. Hướng Dẫn Cấu Hình Cloudflare Tunnel Thực Tế

Để kết nối máy chủ thử nghiệm cục bộ này ra Internet thông qua đường hầm Cloudflare mà không cần mở port:

1.  **Tạo Tunnel trên Cloudflare:**
    *   Truy cập vào trang quản trị [Cloudflare Zero Trust](https://one.dash.cloudflare.com/).
    *   Vào mục **Networks** -> **Tunnels** -> Click **Create a Tunnel**.
    *   Đặt tên đường hầm (VD: `tncb-rent-tunnel`) -> Click **Save**.
2.  **Lấy Token:**
    *   Tại màn hình cấu hình, Cloudflare sẽ cung cấp cho bạn một đoạn mã Token dài ở mục cài đặt (VD ở cuối câu lệnh dạng: `--token eyJ...`).
    *   Hãy copy chuỗi Token này.
3.  **Cập nhật Token vào Docker-Compose:**
    *   Mở tệp `deploy/docker-compose.yml`.
    *   Tìm tới cấu hình của dịch vụ `cloudflare-tunnel` ở dòng 53 và dán Token vào:
    ```yaml
    environment:
      - TUNNEL_TOKEN=DÁN_TOKEN_CLOUDFLARE_CỦA_BẠN_VÀO_ĐÂY
    ```
4.  **Cấu hình Route dẫn tên miền (Public Hostname):**
    *   Trên giao diện web Cloudflare Zero Trust, chọn tab **Public Hostname** -> Click **Add a public hostname**.
    *   Điền Subdomain/Domain của bạn (VD: `thuetro.yourdomain.com`).
    *   Phần **Service**, chọn loại giao thức là `HTTP` và URL là `frontend:80` (Tên service frontend trong mạng nội bộ docker).
    *   Click **Save Hostname**.
5.  **Restart lại Tunnel Container:**
    *   Chạy lệnh `docker-compose -f deploy/docker-compose.yml restart cloudflare-tunnel` để cập nhật token mới.
    *   **Thành quả:** Ngay lập tức, bạn có thể truy cập vào tên miền `https://thuetro.yourdomain.com` từ bất kỳ đâu trên thế giới để vào website TNCB Rent chạy dưới máy tính cục bộ của bạn, có sẵn HTTPS mà không cần mở bất kỳ cổng firewall nào!
