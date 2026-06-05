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

---

## 🔓 Phần 7: Cấu Hình SSH Qua Cloudflare Tunnel Để Quản Trị Từ Xa (Khi Không Ở Nhà)

Khi đi ra ngoài, máy tính cá nhân của bạn và server Ubuntu không còn chung dải mạng LAN nên không thể kết nối qua IP nội bộ `192.168.1.211`. Bạn có thể dễ dàng thiết lập định tuyến SSH bảo mật qua chính Cloudflare Tunnel đang có.

### 1. Cấu hình trên Cloudflare Zero Trust Dashboard

1. **Thêm ứng dụng SSH Client (Access Application)**:
   - Truy cập vào **Cloudflare Zero Trust Dashboard** -> **Access** -> **Applications** -> Click **Add an Application**.
   - Chọn loại ứng dụng: **Self-Hosted**.
   - Thiết lập các thông số:
     - **Application Name**: `SSH Server`
     - **Application Domain**: Điền Subdomain mong muốn (Ví dụ: `ssh.findx.id.vn`).
     - **Session Duration**: Chọn thời hạn phiên (ví dụ: `24 Hours`).
   - Thiết lập chính sách bảo mật (**Policies**):
     - Đặt tên Policy: `Allow Admin`.
     - Ở phần **Configure rules**, mục **Include**: Chọn **Selector** là `Emails` và điền địa chỉ email của bạn (Ví dụ: `your_email@gmail.com`). Chỉ địa chỉ email này mới có quyền đăng nhập SSH từ xa (Cloudflare sẽ gửi mã OTP qua email để xác thực trước khi cho phép SSH kết nối).
     - Click **Next** -> Click **Save Application**.

2. **Định tuyến cổng SSH của Host trong Tunnel (Public Hostname)**:
   - Vào **Networks** -> **Tunnels** -> Click chọn chỉnh sửa Tunnel của dự án `tncb`.
   - Chọn tab **Public Hostname** -> Click **Add a public hostname**.
   - Thiết lập thông số định tuyến:
     - **Subdomain**: Điền `ssh` (hoặc subdomain bạn đã thiết lập ở bước trên).
     - **Domain**: Chọn `findx.id.vn` (hoặc domain của bạn).
     - **Service**:
       - **Type**: Chọn `SSH`.
       - **URL**: Điền `host.docker.internal:22`. *(Đây là địa chỉ trỏ ngược từ container `cloudflare-tunnel` về cổng SSH của máy chủ Ubuntu vật lý).*
   - Click **Save Hostname**.
   - Sau khi hoàn thành, khởi động lại container tunnel trên Server để cập nhật:
     ```bash
     docker compose -f deploy/docker-compose.yml up -d cloudflare-tunnel
     ```

---

### 2. Cấu hình trên Máy Tính Cá Nhân (Client Windows) của bạn

Để kết nối qua đường hầm mã hóa của Cloudflare, máy tính cá nhân của bạn cần cài đặt client `cloudflared`.

1. **Tải và cài đặt `cloudflared` trên Windows**:
   - Tải file thực thi `cloudflared-windows-amd64.msi` từ trang phát hành chính thức của Cloudflare: [https://github.com/cloudflare/cloudflared/releases](https://github.com/cloudflare/cloudflared/releases).
   - Tiến hành cài đặt. Cài đặt này sẽ tạo file thực thi tại `C:\Program Files (x86)\cloudflared\cloudflared.exe` (hoặc một thư mục khác, hãy kiểm tra chính xác đường dẫn).

2. **Cấu hình SSH client**:
   - Mở PowerShell (hoặc Command Prompt) trên Windows.
   - Tạo hoặc chỉnh sửa tệp tin cấu hình SSH cá nhân bằng cách chạy lệnh:
     ```powershell
     notepad $HOME\.ssh\config
     ```
   - Dán cấu hình sau vào tệp tin (hãy chắc chắn đường dẫn `cloudflared.exe` là chính xác):
     ```text
     Host ssh.findx.id.vn
         ProxyCommand "C:\Program Files (x86)\cloudflared\cloudflared.exe" access ssh --hostname %h
     ```
   - Lưu và đóng tệp tin lại.

3. **Kết nối SSH thử nghiệm**:
   - Tại Terminal ở máy tính cá nhân của bạn, hãy chạy lệnh SSH:
     ```bash
     ssh spotlighter@ssh.findx.id.vn
     ```
   - **Xác thực**: Lần đầu kết nối, một cửa sổ trình duyệt Web sẽ tự động bật lên yêu cầu bạn đăng nhập Cloudflare Zero Trust. Nhập địa chỉ email đăng ký để nhận mã OTP. Sau khi xác thực thành công trên trình duyệt, phiên kết nối SSH tại Terminal sẽ tự động hoạt động và bạn nhập mật khẩu SSH của server Ubuntu (`382489`) để đăng nhập và điều khiển từ xa bình thường!

---

## 🌐 Phần 8: Cấu Hình Tailscale VPN Để SSH Từ Xa (Phương Án Thay Thế / Bổ Sung)

Tailscale là giải pháp VPN dựa trên giao thức **WireGuard**, tạo một mạng riêng ảo (tailnet) giữa các thiết bị của bạn. So với Cloudflare Tunnel SSH, Tailscale có ưu điểm:
- **Kết nối trực tiếp (peer-to-peer)**: Tốc độ nhanh hơn, độ trễ thấp hơn vì không đi qua proxy trung gian.
- **Không cần cấu hình ProxyCommand** phức tạp trên client.
- **Dùng được cho mọi dịch vụ** (SSH, HTTP, RDP, truy cập database,...) chứ không chỉ SSH.
- **Miễn phí cho cá nhân** (lên tới 100 thiết bị, 3 người dùng).

### Bước 1: Tạo tài khoản Tailscale

1. Truy cập [https://login.tailscale.com](https://login.tailscale.com) và đăng ký tài khoản bằng Google, Microsoft, hoặc GitHub.
2. Sau khi đăng nhập, bạn sẽ vào **Tailscale Admin Console** - nơi quản lý toàn bộ thiết bị trong tailnet của bạn.

---

### Bước 2: Cài đặt Tailscale trên Ubuntu Server

SSH vào server Ubuntu (qua IP nội bộ `192.168.1.211` nếu đang ở nhà, hoặc qua Cloudflare Tunnel `ssh.findx.id.vn` nếu ở ngoài), sau đó chạy các lệnh sau:

#### 1. Cài đặt Tailscale bằng script chính thức
```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

#### 2. Khởi động và đăng nhập Tailscale
```bash
sudo tailscale up
```
Lệnh này sẽ in ra một **URL đăng nhập**. Copy URL đó và dán vào trình duyệt web trên máy tính cá nhân của bạn để xác thực và phê duyệt server vào tailnet.

#### 3. Kiểm tra Tailscale IP của server
```bash
tailscale ip -4
```
Server sẽ được gán một IP riêng dạng `100.x.x.x` - đây là IP cố định trong mạng Tailscale, dùng để kết nối từ bất kỳ đâu.

#### 4. Bật tính năng Tailscale SSH (Tùy chọn nâng cao)
Tailscale SSH cho phép xác thực SSH thông qua tài khoản Tailscale, **không cần quản lý SSH key thủ công**:
```bash
sudo tailscale set --ssh
```
> **Lưu ý**: Khi bật Tailscale SSH, bạn cần cấu hình thêm Access Control trên Admin Console (xem Bước 4 bên dưới).

#### 5. Tắt hết hạn key cho server (Quan trọng)
Mặc định, node key của Tailscale sẽ hết hạn sau 180 ngày, khiến server bị ngắt khỏi tailnet. Để tránh điều này cho máy chủ headless:
1. Vào [Tailscale Admin Console](https://login.tailscale.com/admin/machines).
2. Tìm máy chủ Ubuntu trong danh sách **Machines**.
3. Click biểu tượng `⋯` (ba chấm) → Chọn **Disable key expiry**.

---

### Bước 3: Cài đặt Tailscale trên Windows (Client)

#### 1. Tải và cài đặt
- Truy cập [https://tailscale.com/download](https://tailscale.com/download) và tải bản cài **Tailscale cho Windows**.
- Chạy file `.exe` và cài đặt theo hướng dẫn.

#### 2. Đăng nhập
- Sau khi cài xong, biểu tượng Tailscale sẽ xuất hiện ở **System Tray** (góc phải dưới thanh Taskbar, gần đồng hồ).
- Click vào biểu tượng → Chọn **Log in** → Đăng nhập bằng **cùng tài khoản** đã dùng trên server.

#### 3. Kiểm tra kết nối
Mở PowerShell và kiểm tra trạng thái:
```powershell
tailscale status
```
Bạn sẽ thấy danh sách tất cả thiết bị trong tailnet, bao gồm cả server Ubuntu.

---

### Bước 4: Cấu hình Access Control cho Tailscale SSH (Nếu đã bật ở Bước 2.4)

Nếu bạn đã bật `tailscale set --ssh` trên server, cần thêm quy tắc SSH vào chính sách truy cập:

1. Vào [Tailscale Admin Console](https://login.tailscale.com/admin/acls) → Mục **Access Controls**.
2. Thêm đoạn sau vào policy file JSON:
```json
"ssh": [
  {
    "action": "accept",
    "src":    ["autogroup:member"],
    "dst":    ["autogroup:self"],
    "users":  ["autogroup:nonroot", "root"]
  }
]
```
> Quy tắc trên cho phép tất cả thành viên trong tailnet SSH vào mọi máy của mình với bất kỳ user nào. Bạn có thể tùy chỉnh chặt hơn nếu cần.

3. Click **Save** để áp dụng.

---

### Bước 5: Kết nối SSH vào Server qua Tailscale

Từ máy tính Windows, mở PowerShell hoặc Terminal và chạy:

#### Cách 1: SSH bằng Tailscale IP
```bash
ssh spotlighter@100.x.x.x
```
*(Thay `100.x.x.x` bằng Tailscale IP thực tế của server, lấy từ lệnh `tailscale ip -4` ở Bước 2.3)*

#### Cách 2: SSH bằng MagicDNS hostname (Khuyên dùng)
Tailscale tự động bật **MagicDNS**, cho phép bạn SSH bằng tên máy thay vì IP:
```bash
ssh spotlighter@ubuntu-server
```
*(Tên máy là hostname Ubuntu Server của bạn - kiểm tra trong Admin Console hoặc chạy `hostname` trên server)*

#### Cách 3: SSH bằng Tailscale SSH (Nếu đã bật ở Bước 2.4)
Khi dùng Tailscale SSH, bạn **không cần nhập mật khẩu** - Tailscale tự xác thực qua tài khoản:
```bash
ssh spotlighter@ubuntu-server
```

---

### Bước 6: Cấu hình VS Code Remote SSH qua Tailscale (Bonus)

Để code trực tiếp trên server từ VS Code:

1. Cài extension **Remote - SSH** trên VS Code.
2. Nhấn `Ctrl+Shift+P` → Gõ `Remote-SSH: Connect to Host...`.
3. Nhập `spotlighter@ubuntu-server` (MagicDNS hostname) hoặc `spotlighter@100.x.x.x` (Tailscale IP).
4. VS Code sẽ kết nối và mở môi trường phát triển từ xa trên server!

---

### So sánh: Cloudflare Tunnel SSH vs Tailscale SSH

| Tiêu chí | Cloudflare Tunnel SSH | Tailscale SSH |
|---|---|---|
| **Kiểu kết nối** | Proxy qua Cloudflare Edge | Peer-to-peer (WireGuard) |
| **Độ trễ** | Cao hơn (đi qua trung gian) | Thấp hơn (kết nối trực tiếp) |
| **Cài đặt client** | Cần `cloudflared` + cấu hình ProxyCommand | Chỉ cần cài Tailscale app |
| **Xác thực** | Email OTP qua Cloudflare Access | Tài khoản Tailscale (SSO) |
| **Phạm vi sử dụng** | Chỉ SSH (hoặc HTTP) | Mọi dịch vụ mạng (SSH, HTTP, DB,...) |
| **Yêu cầu domain** | Cần domain + Cloudflare DNS | Không cần domain |
| **Phù hợp với** | Expose dịch vụ public + SSH | SSH nội bộ + truy cập dịch vụ private |

> **💡 Khuyến nghị**: Sử dụng **Tailscale** làm phương thức SSH chính (nhanh, tiện) và giữ **Cloudflare Tunnel SSH** làm phương thức dự phòng khi Tailscale gặp sự cố.

