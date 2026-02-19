# 本地开发环境启动指南

本文档提供两种启动方式：**Docker 启动**（推荐）和 **本地开发启动**（不用 Docker）

---

## 方式 1：Docker 启动（推荐）⭐

### 优势
- ✅ 环境一致，无需配置
- ✅ 一键启动所有服务
- ✅ 不污染本地环境
- ✅ 包含数据库、后端、前端、Nginx 全套服务

### 前提条件
- 已安装 Docker 20.10+
- 已安装 Docker Compose 2.0+

### 启动步骤

#### 1. 配置环境变量
```bash
cp .env.example .env
```

#### 2. 一键启动
```bash
./deploy.sh
```

**或者手动启动**：
```bash
# 启动所有服务
docker compose up -d

# 执行数据库迁移
docker compose exec backend python manage.py migrate

# 创建管理员账号
docker compose exec backend python manage.py createsuperuser
```

#### 3. 访问应用
- 前端：http://localhost
- 后台：http://localhost/admin/
- API 文档：http://localhost/api/docs/

#### 4. 查看日志
```bash
# 查看所有服务日志
docker compose logs -f

# 只看后端日志
docker compose logs -f backend

# 只看前端日志
docker compose logs -f frontend
```

#### 5. 停止服务
```bash
docker compose down
```

---

## 方式 2：本地开发启动（不用 Docker）

### 优势
- ✅ 代码修改即时生效
- ✅ 方便调试
- ✅ 更快的启动速度

### 前提条件
- Python 3.11+
- Node.js 20+
- MySQL 8.0+

---

### 步骤 1：安装系统依赖

#### macOS
```bash
# 安装 Homebrew（如果未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 MySQL
brew install mysql

# 启动 MySQL
brew services start mysql

# 安装 Python（如果未安装）
brew install python@3.11

# 安装 Node.js
brew install node@20
```

#### Ubuntu/Debian
```bash
# 安装 MySQL
sudo apt update
sudo apt install mysql-server mysql-client libmysqlclient-dev

# 启动 MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# 安装 Python
sudo apt install python3.11 python3.11-venv python3-pip

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Windows
```powershell
# 使用 Chocolatey 安装
choco install mysql python nodejs

# 或者手动下载安装
# MySQL: https://dev.mysql.com/downloads/installer/
# Python: https://www.python.org/downloads/
# Node.js: https://nodejs.org/
```

---

### 步骤 2：配置数据库

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库和用户
CREATE DATABASE blcu_reading CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'blcu_user'@'localhost' IDENTIFIED BY 'blcu_password';
GRANT ALL PRIVILEGES ON blcu_reading.* TO 'blcu_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### 步骤 3：启动后端（Django）

#### 3.1 创建虚拟环境并安装依赖
```bash
cd backend

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

#### 3.2 配置本地数据库连接

编辑 `backend/config/settings.py`，修改数据库配置：

```python
# 找到 DATABASES 配置，修改为本地配置
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'blcu_reading',
        'USER': 'blcu_user',
        'PASSWORD': 'blcu_password',
        'HOST': 'localhost',  # 改为 localhost
        'PORT': '3306',
        'OPTIONS': {
            'charset': 'utf8mb4',
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}
```

#### 3.3 执行数据库迁移
```bash
# 执行迁移
python manage.py migrate

# 创建超级用户
python manage.py createsuperuser

# 收集静态文件（可选）
python manage.py collectstatic --noinput
```

#### 3.4 启动 Django 开发服务器
```bash
# 启动后端（默认端口 8000）
python manage.py runserver

# 或指定端口
python manage.py runserver 0.0.0.0:8000
```

✅ 后端现在运行在：http://localhost:8000
- 管理后台：http://localhost:8000/admin/
- API 文档：http://localhost:8000/api/docs/

---

### 步骤 4：启动前端（React）

#### 4.1 安装依赖
```bash
# 在新的终端窗口
cd frontend

# 安装依赖
npm install
```

#### 4.2 配置 API 地址

编辑 `frontend/vite.config.js`，确保代理配置正确：

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',  // 后端地址
        changeOrigin: true,
      },
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

#### 4.3 启动开发服务器
```bash
# 启动前端（默认端口 5173）
npm run dev
```

✅ 前端现在运行在：http://localhost:5173

---

### 步骤 5：验证启动

#### 检查服务状态

**后端检查**：
```bash
# 访问 API
curl http://localhost:8000/api/news/

# 应该返回 JSON 响应
```

**前端检查**：
- 浏览器访问：http://localhost:5173
- 应该看到网站首页

**数据库检查**：
```bash
# 登录 MySQL
mysql -u blcu_user -p blcu_reading

# 查看表
SHOW TABLES;

# 应该看到所有迁移后的表
```

---

## 开发工作流

### 修改后端代码
1. 修改 Python 代码
2. Django 开发服务器自动重载
3. 刷新浏览器查看效果

### 修改前端代码
1. 修改 React 代码
2. Vite 热更新（HMR）自动生效
3. 浏览器自动刷新

### 修改数据库模型
```bash
# 1. 修改 models.py
# 2. 生成迁移文件
cd backend
python manage.py makemigrations

# 3. 执行迁移
python manage.py migrate
```

---

## 常见问题

### 问题 1：MySQL 连接失败
```
django.db.utils.OperationalError: (2002, "Can't connect to local MySQL server")
```

**解决方案**：
```bash
# 检查 MySQL 是否运行
# macOS:
brew services list | grep mysql

# Ubuntu:
sudo systemctl status mysql

# 启动 MySQL
# macOS:
brew services start mysql

# Ubuntu:
sudo systemctl start mysql
```

### 问题 2：端口被占用
```
Error: address already in use
```

**解决方案**：
```bash
# 查找占用端口的进程
# macOS/Linux:
lsof -i :8000
lsof -i :5173

# Windows:
netstat -ano | findstr :8000

# 杀死进程或使用其他端口
python manage.py runserver 8001
npm run dev -- --port 3000
```

### 问题 3：Python 依赖安装失败
```
error: command 'gcc' failed
```

**解决方案**：
```bash
# macOS:
xcode-select --install

# Ubuntu:
sudo apt install build-essential python3-dev libmysqlclient-dev

# Windows:
# 安装 Microsoft C++ Build Tools
```

### 问题 4：前端 API 请求失败（CORS）
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**解决方案**：
确保后端 `settings.py` 中配置了 CORS：
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
```

---

## 两种方式对比

| 特性 | Docker 启动 | 本地启动 |
|------|------------|---------|
| 环境配置 | ✅ 无需配置 | ❌ 需要安装各种依赖 |
| 启动速度 | ⚡ 稍慢（首次拉取镜像） | ⚡ 快 |
| 代码调试 | ⚠️ 需要进入容器 | ✅ 方便 |
| 环境隔离 | ✅ 完全隔离 | ❌ 使用本地环境 |
| 生产一致性 | ✅ 完全一致 | ⚠️ 可能有差异 |
| 推荐场景 | 快速启动、演示、部署 | 日常开发、调试 |

---

## 推荐开发流程

### 日常开发（推荐）
```bash
# 使用本地启动，方便调试
cd backend && source venv/bin/activate && python manage.py runserver
cd frontend && npm run dev
```

### 测试部署
```bash
# 使用 Docker 测试生产环境
docker compose up -d
```

### 生产部署
```bash
# 使用 Docker 部署到服务器
./deploy.sh
```

---

## 快速命令参考

### Docker 方式
```bash
docker compose up -d          # 启动
docker compose logs -f        # 查看日志
docker compose down           # 停止
docker compose restart        # 重启
```

### 本地方式
```bash
# 后端（在 backend/ 目录）
source venv/bin/activate      # 激活虚拟环境
python manage.py runserver    # 启动后端

# 前端（在 frontend/ 目录）
npm run dev                   # 启动前端

# 数据库
mysql.server start            # macOS 启动 MySQL
sudo systemctl start mysql    # Linux 启动 MySQL
```

---

**推荐**：日常开发使用本地启动，部署测试使用 Docker！
