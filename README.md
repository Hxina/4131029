# 4131029 | 永恒星辰

> 当你倒着念出这串数字，便是我对你一生一世的告白。

## 💫 关于这个星空

在浩瀚的宇宙中，每一段爱情都值得成为一颗永恒的星辰。

这里是一片专属于爱情的星空，每一颗闪烁的星星都承载着一个独特的爱情故事。你可以点亮属于自己的那颗星，将心动的瞬间、相爱的点滴、未来的约定凝结成永恒的文字，让它在这片星河中永远闪耀。

### ✨ 星空魔法

- **点亮星辰**：记录下你们的故事，从相遇的那一刻，到心动的瞬间，再到对未来的美好憧憬。
- **专属编码**：每个故事都拥有独一无二的爱情编码，只有你们知道通往彼此故事的秘密路径。
- **星河漫游**：在璀璨的星空中徜徉，邂逅其他情侣的浪漫故事，见证爱情的千姿百态。
- **永恒见证**：时光会泛黄，记忆会模糊，但这里的文字会让爱意永存。

### 💝 每颗星星都包含

- 相遇的时间与地点；
- 最想说的那句话；
- 完整的爱情故事；
- 珍贵的照片记忆；
- 专属的爱情编码；
- 更多的惊喜等待着你。

## ❤️ 致谢

愿每一对恋人都能在这片星空中找到属于自己的永恒。

*时光会泛黄，但我们的爱意永存。*

访问 https://4131029.xyz/ 点亮属于你的那颗星吧！

---

## 🛠️ 部署指南

你好！欢迎部署 4131029 项目。本指南旨在帮助初次接触服务器部署的朋友，一步步将本项目成功上线。

> [!NOTE]  
> 本指南包含了大量基础步骤和详细注释，如果你是经验丰富的开发者，可以忽略。

我们将以创建一个名为 `Hxina` 的新用户为例进行操作。

### 第一步：服务器初始化与环境准备

在服务器上，我们需要先 `创建专门的用户（推荐）` 并安装必要的软件。

#### 1. 创建部署用户

> [!CAUTION]  
> **切勿直接使用 `root` 用户进行日常操作或部署应用！**  
> 为了服务器安全，强烈建议为本项目创建一个权限受控的专用用户，本例中为 `Hxina`。

```bash
# 创建一个名为 Hxina 的新用户
sudo adduser Hxina

# 赋予 Hxina 用户 sudo 权限，使其可以执行管理员命令
sudo usermod -aG sudo Hxina

# 切换到新创建的用户（后续所有操作都将以 Hxina 的身份执行）
su - Hxina
```

#### 2. 安装基础软件

> [!TIP]  
> 本指南中的所有命令都基于 Debian 系统，如果你的服务器是其它 Linux 发行版，请相应调整命令。

```bash
# 更新服务器软件包列表
sudo apt update

# 安装 Python 及其虚拟环境工具
sudo apt install -y python3 python3-pip python3-venv

# 安装 Node.js 和 npm
sudo apt install -y nodejs npm

# 安装 Git，用于从 GitHub 拉取代码
sudo apt install -y git

# 安装 Nginx (二选一)
sudo apt install -y nginx

# 安装 Caddy (二选一)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

### 第二步：获取项目

使用 `git` 从 GitHub 克隆项目代码。

```bash
# 使用 git 克隆项目代码到 /var/www/4131029 目录
sudo git clone https://github.com/Hxina/4131029.git /var/www/4131029
```

### 第三步：后端部署 (使用 Systemd + Gunicorn)

使用 `systemd` 来确保后端服务稳定运行，并使用 `Gunicorn` 来管理 `uvicorn` 进程。

#### 1. 设置 Python 虚拟环境

```bash
# 进入后端目录
cd /var/www/4131029/backend

# 创建一个名为 venv 的 Python 虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 安装 Gunicorn 和项目所需的所有 Python 依赖包
pip install gunicorn
pip install -r requirements.txt

# 完成安装后，退出虚拟环境
deactivate
```

#### 2. 创建 Systemd 服务文件

使用 `nano` 或其它编辑器创建一个服务配置文件。

```bash
sudo nano /etc/systemd/system/4131029-backend.service
```

在打开的文件中，输入以下内容：

```bash
[Unit]
# 简单描述服务，方便识别
Description=4131029 Gunicorn Backend Service

# 指定此服务应该在网络连接建立之后才启动
After=network.target

[Service]
# 使用新创建的 Hxina 用户来运行服务
User=Hxina

# 将进程归属到 www-data 组，方便与 Nginx/Caddy 协作处理文件
Group=www-data

# 设置服务的工作目录，即后端代码所在的目录
WorkingDirectory=/var/www/4131029/backend

# 核心启动命令！
# -w 4: 启动 4 个工作进程 (推荐值为 2 * CPU核心数 + 1)
# -k uvicorn.workers.UvicornWorker: 让 Gunicorn 使用 Uvicorn 作为工作引擎
# --bind: 监听本地的 8000 端口
ExecStart=/var/www/4131029/backend/venv/bin/gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 127.0.0.1:8000

# 配置服务在意外退出后总是自动重启
Restart=always

[Install]
# 定义该服务所属的目标，multi-user.target 表示在多用户模式下（即正常启动）都应该启用
WantedBy=multi-user.target
```

保存并关闭文件。

在 `nano` 中，按 `Ctrl + O` 组合键保存文件，然后按 `Ctrl + X` 组合键退出。

> [!TIP]  
> 按 `Ctrl + X` 组合键，然后按 `Y`，最后按 `Enter` 也可保存并退出。

#### 3. 启动并管理后端服务

```bash
# 重新加载 systemd 管理器，使其识别新创建的服务
sudo systemctl daemon-reload

# 启用服务，使其在服务器开机时自动启动
sudo systemctl enable 4131029-backend.service

# 立刻启动服务
sudo systemctl start 4131029-backend.service

# 检查服务状态，确保显示 "active (running)"
sudo systemctl status 4131029-backend.service
```

### 第四步：前端部署 (Vue)

```bash
# 进入前端目录
cd /var/www/4131029/frontend

# 安装所有 JavaScript 依赖包
npm install

# 编译打包前端代码，生成生产环境的静态文件
npm run build
```
构建完成后，所有用于部署的静态文件都会在 `frontend/dist` 目录中。

### 第五步：设置文件权限

确保 Web 服务器有权访问创建的文件。

```bash
# 将整个项目目录的所有权，递归地交给 Hxina 用户和 www-data 用户组
sudo chown -R Hxina:www-data /var/www/4131029

# 确保目录权限为 775 (所有者和同组用户可写)，文件权限为 644 (只有所有者可写)
sudo chmod -R 775 /var/www/4131029
```

### 第六步：配置 Web 服务器

#### 方案 A：使用 Caddy（自动 HTTPS）

##### 1. 编辑 Caddyfile

```bash
sudo nano /etc/caddy/Caddyfile
```

在打开的文件中输入以下内容：

```caddy
# 将 4131029.xyz 替换为你的实际域名
4131029.xyz {
    # 开启 Gzip 压缩，提升加载速度
    encode gzip

    # 设置网站根目录
    root * /var/www/4131029/frontend/dist
    
    # 将所有 /api/ 开头的请求，反向代理到我们正在运行的后端服务
    reverse_proxy /api/* 127.0.0.1:8000

    # 对于所有不是 API 的请求，尝试作为文件提供，否则回退到 index.html
    @notApi {
        not path /api/*
    }
    try_files {path} {path}/ /index.html

    # 启动文件服务器
    file_server
}
```
##### 2. 重启 Caddy

```bash
sudo systemctl restart caddy
```

#### 方案 B：使用 Nginx

> [!TIP]  
> HTTPS 提示：对于 Nginx，可以使用 Certbot 来获取免费的 SSL 证书。安装 Certbot 后，运行 `sudo certbot --nginx` 并按照提示操作即可，它会自动更新 `ssl_certificate` 和 `ssl_certificate_key` 的路径。

##### 1. 创建 Nginx 配置文件

Nginx 推荐将自定义配置文件放在 /etc/nginx/conf.d/ 目录下。

```bash
sudo nano /etc/nginx/conf.d/4131029.conf
```

在打开的文件中输入以下内容：

```nginx
# ===================================================================
#  HTTP (端口 80) -> HTTPS (端口 443) 永久重定向
# ===================================================================
server {
    # 监听所有 IPv4 和 IPv6 地址的 80 端口
    listen 80;
    listen [::]:80;

    # 将 4131029.xyz www.4131029.xyz 替换为你的实际域名
    server_name 4131029.xyz www.4131029.xyz;

    # 使用 Certbot (Let's Encrypt) 进行域名验证
    location /.well-known/acme-challenge/ {
        # Certbot 会在这里放置临时文件进行验证
        root /var/www/certbot;
    }

    # 将所有 HTTP 请求重定向到 HTTPS
    # http://4131029.xyz -> https://4131029.xyz
    location / {
        return 301 https://$host$request_uri;
    }
}

# ===================================================================
#  主服务配置 (包含 HTTPS, HTTP/2, QUIC 等)
# ===================================================================
server {
    # -------------------------------------------------------------
    #  监听端口与协议
    #
    #  监听所有 IPv4 和 IPv6 地址的 443 端口
    #  同时启用 SSL、HTTP/2 和 QUIC
    # -------------------------------------------------------------
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    listen 443 quic reuseport;
    listen [::]:443 quic reuseport;

    # -------------------------------------------------------------
    #  服务器名称
    #
    #  将 4131029.xyz www.4131029.xyz 替换为你的实际域名
    # -------------------------------------------------------------
    server_name 4131029.xyz www.4131029.xyz;

    # -------------------------------------------------------------
    #  SSL 证书路径
    #
    #  推荐使用 Certbot (Let's Encrypt) 来自动管理 SSL 证书
    #  运行 `sudo certbot --nginx` 后，Certbot 会自动填充以下两行
    # -------------------------------------------------------------
    ssl_certificate /etc/letsencrypt/live/4131029.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/4131029.xyz/privkey.pem;

    # -------------------------------------------------------------
    #  SSL/TLS 协议与加密套件
    #
    #  启用 TLSv1.3 和 TLSv1.2，并使用推荐的现代加密套件
    # -------------------------------------------------------------
    ssl_protocols TLSv1.3 TLSv1.2;
    ssl_conf_command Ciphersuites TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
    # 设为 off，让客户端选择其支持的最优加密套件
    ssl_prefer_server_ciphers off;

    # -------------------------------------------------------------
    #  SSL 性能优化
    #
    #  开启共享会话缓存，会话超时时间 1 天，启用会话票据
    # -------------------------------------------------------------
    ssl_session_cache shared:MozSSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets on;
    
    # -------------------------------------------------------------
    #  OCSP Stapling (证书状态在线查询协议)
    #
    #  启用 OCSP Stapling，加速证书验证，减少客户端延迟
    #  验证 OCSP 响应的有效性
    # -------------------------------------------------------------
    ssl_stapling on;
    ssl_stapling_verify on;
    # 指向包含完整证书链（域名证书 + 中间 CA 证书）的文件
    # Certbot 通常会生成 fullchain.pem 文件，其中包含了完整链
    ssl_trusted_certificate /etc/letsencrypt/live/4131029.xyz/fullchain.pem;

    # -------------------------------------------------------------
    #  安全与性能头部
    #
    #  HSTS 头部：强制浏览器在后续访问中始终使用 HTTPS
    #  防止网站被嵌入到 <iframe> 中，避免点击劫持
    #  防止浏览器对内容类型进行嗅探，避免 MIME 类型混淆攻击
    #  控制 Referer 头的发送策略，增强隐私性
    # -------------------------------------------------------------
    add_header Strict-Transport-Security "max-age=63072000; includeSubdomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    #  网站根目录
    root /var/www/4131029/frontend/dist;
    index index.html;

    # 专门处理网站图标请求，不记录 404 错误，保持日志干净
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }

    # 匹配 JS, CSS, 图片等静态资源，设置长期缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 专门匹配字体文件，同样设置长期缓存
    # "Access-Control-Allow-Origin" 允许字体被其他网站引用
    location ~* \.(eot|ttf|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        access_log off;
    }
    
    # API 反向代理
    location /api/ {
        # 将所有 /api/ 开头的请求转发给在 8000 端口运行的后端服务
        proxy_pass http://127.0.0.1:8000;
        
        # 使用 HTTP/1.1 与后端通信
        proxy_http_version 1.1;

        # 传递必要的头部给后端
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 核心路由规则
    location / {
        # 定义默认的索引文件
        index index.html;
        
        # 尝试按顺序查找文件 ($uri)、目录 ($uri/)，如果都找不到，则回退到 index.html
        try_files $uri $uri/ /index.html;
        
        # 禁止缓存 index.html，确保用户总能获取到最新的应用入口，从而加载最新的 JS/CSS
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # 禁止访问所有以点开头的文件和目录
    location ~ /\. {
        deny all;
    }
}
```

##### 2. 检查并重新加载 Nginx
```bash
# 检查 Nginx 配置文件是否有语法错误
sudo nginx -t

# 重启 Nginx 服务使配置生效
sudo systemctl restart nginx
```

### 第七步：维护与更新

当代码有更新时，可以按照以下流程操作：

```bash
# 进入项目目录
cd /var/www/4131029

# 拉取最新的代码
sudo git pull

# 更新后端
cd backend
source venv/bin/activate
pip install -r requirements.txt
deactivate
# 重启后端服务以应用代码和依赖的更新
sudo systemctl restart 4131029-backend.service

# 更新前端
cd ../frontend
npm install
npm run build

# 确保文件权限始终正确
sudo chown -R Hxina:www-data /var/www/4131029
sudo chmod -R 775 /var/www/4131029
```