# 🚀 从这里开始

## 两个关键问题的快速解答

---

## ❓ 问题 1：db 镜像没有 Dockerfile，是如何创建的？

### 简短回答
**db 服务使用 Docker Hub 官方镜像，不需要 Dockerfile。**

### 详细说明

在 `docker-compose.yml` 中：

```yaml
# ✅ 方式 1：使用官方镜像（无需 Dockerfile）
db:
  image: mysql:8.0  # 从 Docker Hub 下载官方镜像

# ✅ 方式 2：自定义构建（需要 Dockerfile）
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile  # 使用自定义 Dockerfile
```

**本项目的 4 个服务**：
- `db` → 使用官方 `mysql:8.0` 镜像 ✅
- `backend` → 使用 `backend/Dockerfile` 构建 ✅
- `frontend` → 使用 `frontend/Dockerfile` 构建 ✅
- `nginx` → 使用 `nginx/Dockerfile` 构建 ✅

📖 详细说明：查看 `DOCKER_EXPLAINED.md`

---

## ❓ 问题 2：这套程序在本地怎么启动？

### 快速选择

```
┌─────────────────────────────────────────────────────────┐
│  我想...                                                 │
├─────────────────────────────────────────────────────────┤
│  🐳 快速启动/演示  →  使用 Docker（推荐）                │
│  💻 日常开发/调试  →  使用本地环境                        │
└─────────────────────────────────────────────────────────┘
```

---

## 方式 A：Docker 启动（推荐，最简单）

### 1 分钟启动

```bash
# 1. 复制环境变量
cp .env.example .env

# 2. 一键启动
./deploy.sh

# 3. 访问应用
# http://localhost
```

### 详细步骤

```bash
# 检查项目完整性
./check_project.sh

# 配置环境变量
cp .env.example .env
# 可选：编辑 .env 修改密码

# 启动所有服务（数据库 + 后端 + 前端 + Nginx）
docker compose up -d

# 执行数据库迁移
docker compose exec backend python manage.py migrate

# 创建管理员账号
docker compose exec backend python manage.py createsuperuser

# 查看日志
docker compose logs -f
```

### 访问地址
- 🏠 前端首页：http://localhost
- 🔧 管理后台：http://localhost/admin/
- 📖 API 文档：http://localhost/api/docs/

### 常用命令
```bash
docker compose up -d      # 启动
docker compose down       # 停止
docker compose logs -f    # 查看日志
docker compose restart    # 重启
```

---

## 方式 B：本地启动（适合开发）

### 前提条件
- ✅ Python 3.11+
- ✅ Node.js 20+
- ✅ MySQL 8.0+

### 快速启动

#### 1️⃣ 启动数据库
```bash
# macOS
brew services start mysql

# Ubuntu
sudo systemctl start mysql

# 创建数据库
mysql -u root -p
CREATE DATABASE blcu_reading CHARACTER SET utf8mb4;
```

#### 2️⃣ 启动后端
```bash
cd backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 修改 config/settings.py 中的数据库配置
# DATABASES['default']['HOST'] = 'localhost'

# 执行迁移
python manage.py migrate

# 创建管理员
python manage.py createsuperuser

# 启动后端
python manage.py runserver
```
✅ 后端运行在：http://localhost:8000

#### 3️⃣ 启动前端（新终端窗口）
```bash
cd frontend

# 安装依赖
npm install

# 启动前端
npm run dev
```
✅ 前端运行在：http://localhost:5173

### 访问地址
- 🏠 前端首页：http://localhost:5173
- 🔧 管理后台：http://localhost:8000/admin/
- 📖 API 文档：http://localhost:8000/api/docs/

📖 详细说明：查看 `LOCAL_DEVELOPMENT.md`

---

## 📊 两种方式对比

| 对比项 | Docker 启动 | 本地启动 |
|--------|------------|---------|
| **启动难度** | ⭐ 极简单（一键） | ⭐⭐⭐ 需要配置 |
| **环境要求** | 只需 Docker | Python + Node + MySQL |
| **启动速度** | 稍慢（首次） | 快 |
| **代码调试** | 需进入容器 | ✅ 方便 |
| **环境隔离** | ✅ 完全隔离 | 使用本地环境 |
| **适合场景** | 快速演示、部署 | 日常开发 |

---

## 🎯 推荐使用场景

### 👉 选择 Docker（推荐新手）
- 快速查看效果
- 演示给他人
- 部署到服务器
- 不想配置环境

### 👉 选择本地启动
- 日常开发
- 需要频繁调试
- 修改代码即时生效
- 熟悉 Python/Node 环境

---

## 🆘 遇到问题？

### Docker 启动问题
```bash
# 端口被占用 → 修改 docker-compose.yml 端口
ports:
  - "8080:80"  # 改为 8080

# 数据库连接失败 → 等待数据库启动
docker compose logs db

# 查看所有服务状态
docker compose ps
```

### 本地启动问题
```bash
# MySQL 连接失败
brew services start mysql  # macOS
sudo systemctl start mysql # Linux

# 端口被占用
python manage.py runserver 8001  # 换端口
npm run dev -- --port 3000

# 依赖安装失败
pip install --upgrade pip
npm cache clean --force
```

---

## 📚 相关文档

- `README.md` - 完整项目文档
- `QUICKSTART.md` - 快速启动指南
- `LOCAL_DEVELOPMENT.md` - 本地开发详细说明
- `DOCKER_EXPLAINED.md` - Docker 镜像说明
- `PROJECT_SUMMARY.md` - 项目总结

---

## ✅ 验证启动成功

### Docker 方式
```bash
# 1. 检查所有容器运行
docker compose ps
# 应该看到 4 个容器都是 "Up" 状态

# 2. 访问前端
curl http://localhost
# 应该返回 HTML 内容

# 3. 访问 API
curl http://localhost/api/news/
# 应该返回 JSON 数据
```

### 本地方式
```bash
# 1. 检查后端
curl http://localhost:8000/api/news/

# 2. 检查前端
# 浏览器访问 http://localhost:5173

# 3. 检查数据库
mysql -u blcu_user -p blcu_reading -e "SHOW TABLES;"
```

---

## 🎉 成功启动后

1. **访问前端**：http://localhost（或 :5173）
2. **注册账号**：点击右上角"注册"
3. **登录后台**：http://localhost/admin/（或 :8000/admin/）
4. **创建竞赛**：在后台添加竞赛和组别
5. **提交作品**：前端登录选手账号，提交作品
6. **开始评审**：创建评委账号，分配评审任务

---

**快速开始 → 选择你喜欢的方式，立即启动！** 🚀
