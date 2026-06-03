# 🚀 Hướng Dẫn Thiết Lập Ubuntu Server & Triển Khai FindX (TNCB Rent) Bằng Docker

Tài liệu này hướng dẫn từng bước từ việc chuẩn bị một máy chủ Ubuntu sạch (On-premise hoặc VPS) đến việc đóng gói và khởi chạy toàn bộ hệ thống bằng Docker Compose một cách an toàn và bảo mật.

---

## 🛠️ Phần 1: Cài Đặt Hệ Điều Hành Ubuntu Server

Nếu bạn đang bắt đầu với một máy chủ Ubuntu Server (khuyến nghị bản **Ubuntu 22.04 LTS** hoặc **24.04 LTS**):

### 1. Cập nhật hệ thống
Mở Terminal trên server và chạy lệnh sau để cập nhật toàn bộ thư viện hệ thống:
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Thiết lập Tường lửa cơ bản (UFW)
Chỉ mở cổng SSH (port 22) và cổng HTTP (port 80) / HTTPS (port 443). Nếu sử dụng Cloudflare Tunnel, bạn **thậm chí không cần mở cổng 80/443**, giúp bảo mật tuyệt đối.
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```
*Gõ `y` và nhấn Enter để xác nhận kích hoạt tường lửa.*

---

## 📦 Phần 2: Cài Đặt Docker & Docker Compose

Để cài đặt Docker phiên bản mới nhất chính thức từ Docker Repository trên Ubuntu:

### 1. Cài đặt các package hỗ trợ qua HTTPS
```bash
sudo apt install -y ca-certificates curl gnupg lsb-release
```

### 2. Thêm khóa GPG chính thức của Docker
```bash
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

### 3. Thiết lập Docker Repository ổn định
```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 4. Cài đặt Docker Engine & Docker Compose
```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 5. Kiểm tra cài đặt thành công
```bash
docker --version
docker compose version
```

### 6. Cấu hình chạy Docker không cần quyền Root (Tùy chọn)
Chạy lệnh này giúp bạn có thể chạy lệnh `docker` mà không cần thêm tiền tố `sudo` phía trước:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

## 🚀 Phần 3: Triển Khai Dự Án FindX Lên Server

### 1. Đưa mã nguồn lên Server
Bạn có thể clone mã nguồn dự án bằng Git:
```bash
git clone <URL_REPO_CỦA_BẠN> tncb-project
cd tncb-project
```

### 2. Cấu hình biến môi trường cho Backend
Trong tệp `deploy/docker-compose.yml`, hãy điều chỉnh các biến môi trường của service `backend` trước khi khởi chạy:
- `JWT_SECRET`: Đổi thành chuỗi ký tự ngẫu nhiên, dài và bảo mật cao.
- `GOOGLE_CLIENT_ID`: OAuth Client ID thật của bạn đã đăng ký trên Google Cloud Console (để Google SSO chạy thật).

### 3. Khởi chạy toàn bộ hệ thống
Tại thư mục gốc của dự án (`/home/username/tncb-project`), chạy lệnh sau để build các Dockerfile và khởi chạy các container:
```bash
docker compose -f deploy/docker-compose.yml up --build -d
```

### 4. Kiểm tra trạng thái hoạt động
```bash
docker ps
```
Bạn sẽ nhìn thấy 5 container đang chạy (`tncb-frontend`, `tncb-backend`, `tncb-mongodb`, `tncb-redis`, và `tncb-cf-tunnel`).

Kiểm tra log của API Backend để xem có kết nối database thành công không:
```bash
docker logs -f tncb-backend
```

---

## 🔒 Phần 4: Cấu Hình Cloudflare Tunnel (Zero Trust)

Giải pháp này giúp máy chủ của bạn kết nối an toàn ra Internet thông qua đường hầm mã hóa của Cloudflare mà không cần cấu hình NAT port trên Modem nhà mạng, không cần IP tĩnh.

### 1. Tạo Đường hầm trên Cloudflare
1. Đăng nhập vào [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/).
2. Điều hướng tới **Networks** -> **Tunnels** -> Chọn **Create a Tunnel**.
3. Chọn **Cloudflared** -> Đặt tên đường hầm (ví dụ: `tncb-rent-server`) -> Click **Save Tunnel**.

### 2. Lấy Tunnel Token
Tại màn hình cài đặt Connector, chọn hệ điều hành là **Docker**. Cloudflare sẽ cung cấp câu lệnh dạng:
```bash
docker run cloudflare/cloudflared:latest tunnel --no-autoupdate run --token eyJ...
```
Hãy copy chuỗi Token dài phía sau tham số `--token` (bắt đầu bằng `eyJ...`).

### 3. Cập nhật Token vào Docker Compose
Mở tệp `deploy/docker-compose.yml`, tìm tới service `cloudflare-tunnel` và thay thế giá trị token của bạn:
```yaml
  cloudflare-tunnel:
    image: cloudflare/cloudflared:latest
    ...
    environment:
      - TUNNEL_TOKEN=DÁN_TOKEN_CLOUDFLARE_CỦA_BẠN_VÀO_ĐÂY
```

### 4. Định tuyến Tên miền (Public Hostname)
1. Trên Cloudflare Dashboard của Tunnel vừa tạo, chọn tab **Public Hostname** -> Click **Add a public hostname**.
2. Nhập Domain hoặc Subdomain bạn muốn gán (ví dụ: `findx.yourdomain.com`).
3. Phần **Service**:
   - **Type**: Chọn `HTTP`
   - **URL**: Điền `frontend:80` (Đây là tên dịch vụ và cổng của frontend Nginx trong mạng nội bộ Docker).
4. Click **Save Hostname**.

### 5. Khởi động lại Tunnel Container
```bash
docker compose -f deploy/docker-compose.yml restart cloudflare-tunnel
```
*Ngay lập tức, bạn có thể truy cập `https://findx.yourdomain.com` từ bất kỳ đâu. Cloudflare sẽ tự động cấp chứng chỉ SSL và bảo vệ trang web khỏi DDoS.*

---

## 💾 Phần 5: Sao Lưu Cơ Sở Dữ Liệu Tự Động (Auto Backup MongoDB)

Dữ liệu MongoDB được lưu trữ an toàn trong volume có tên là `mongodb_data` của Docker trên ổ cứng máy chủ. Để đề phòng sự cố phần cứng, nên lập lịch sao lưu dữ liệu tự động hàng ngày:

### 1. Tạo Script sao lưu
Tạo file script sao lưu trên server:
```bash
mkdir -p ~/backups
nano ~/backup_mongodb.sh
```

Dán nội dung script sau vào:
```bash
#!/bin/bash
BACKUP_DIR="/home/$(whoami)/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="tncb_mongo_backup_$TIMESTAMP"

# Chạy lệnh mongodump trực tiếp bên trong container để xuất file
docker exec tncb-mongodb mongodump --db tncb --out /data/db/backup_tmp

# Copy file backup từ container ra ổ đĩa của Server Host
docker cp tncb-mongodb:/data/db/backup_tmp $BACKUP_DIR/$BACKUP_NAME

# Xóa thư mục tạm trong container
docker exec tncb-mongodb rm -rf /data/db/backup_tmp

# Nén thư mục backup lại thành file .tar.gz
cd $BACKUP_DIR
tar -czf $BACKUP_NAME.tar.gz $BACKUP_NAME
rm -rf $BACKUP_NAME

# Tự động xóa các bản sao lưu cũ hơn 30 ngày để tiết kiệm dung lượng
find $BACKUP_DIR -type f -name "*.tar.gz" -mtime +30 -delete

echo "✅ Backup MongoDB successfully at $(date): $BACKUP_NAME.tar.gz"
```

### 2. Cấp quyền thực thi cho Script
```bash
chmod +x ~/backup_mongodb.sh
```

### 3. Cấu hình lập lịch Cronjob chạy hàng ngày
Mở trình chỉnh sửa cronjob:
```bash
crontab -e
```

Thêm dòng sau vào cuối tệp để chạy backup tự động vào lúc **02:00 sáng hàng ngày**:
```text
0 2 * * * /home/username/backup_mongodb.sh >> /home/username/backups/backup.log 2>&1
```
*(Thay thế `username` bằng tên tài khoản đăng nhập trên Ubuntu Server của bạn).*

---

## 🧹 Phần 6: Các Lệnh Quản Trị Hữu Ích khi Vận Hành

- **Xem log thời gian thực của toàn bộ hệ thống:**
  ```bash
  docker compose -f deploy/docker-compose.yml logs -f
  ```
- **Khởi động lại toàn bộ cụm dịch vụ:**
  ```bash
  docker compose -f deploy/docker-compose.yml restart
  ```
- **Dừng toàn bộ container:**
  ```bash
  docker compose -f deploy/docker-compose.yml down
  ```
- **Khôi phục dữ liệu từ file backup (Restore):**
  Giải nén file `.tar.gz` thu được thư mục dump (ví dụ: chứa folder `tncb/`), copy nó vào container và chạy `mongorestore`:
  ```bash
  tar -xzf tncb_mongo_backup_xxxxxxxx.tar.gz
  docker cp tncb_mongo_backup_xxxxxxxx/tncb tncb-mongodb:/data/db/restore_tmp
  docker exec tncb-mongodb mongorestore --db tncb /data/db/restore_tmp
  docker exec tncb-mongodb rm -rf /data/db/restore_tmp
  ```
