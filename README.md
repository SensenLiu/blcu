# 北京语言大学读写研究中心官网

北京语言大学读写研究中心官方网站，提供新闻发布和学术竞赛管理功能。

## 📚 快速导航

**新手必读**：
- 🚀 [START_HERE.md](START_HERE.md) - **从这里开始**（回答常见问题）
- ⚡ [QUICKSTART.md](QUICKSTART.md) - 快速启动指南（5 分钟上手）

**详细文档**：
- 💻 [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) - 本地开发环境配置
- 🐳 [DOCKER_EXPLAINED.md](DOCKER_EXPLAINED.md) - Docker 镜像说明
- 📋 [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - 项目完整总结
- 📦 [DELIVERY.md](DELIVERY.md) - 项目交付清单

**常见问题**：
- ❓ db 镜像没有 Dockerfile？ → 查看 [DOCKER_EXPLAINED.md](DOCKER_EXPLAINED.md)
- ❓ 如何本地启动？ → 查看 [START_HERE.md](START_HERE.md)

---

## 项目简介

本项目是一个功能完整的学术竞赛管理平台，包含以下核心功能：

- **新闻展示模块** - 发布中心动态、活动通知、学术成果
- **参赛选手系统** - 注册、登录、提交作品、查看状态
- **评委评审系统** - 登录、查看作品、在线评分、提交意见
- **响应式设计** - 适配 PC 和移动端
- **Docker 部署** - 一键容器化部署

## 技术栈

### 后端
- Django 5.0 + Django REST Framework
- MySQL 8.0
- JWT 认证
- Gunicorn

### 前端
- React 18
- Ant Design 5
- React Router v6
- Axios

### 部署
- Docker + Docker Compose
- Nginx

## 快速开始

### 环境要求

- Docker 20.10+
- Docker Compose 2.0+

### 部署步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd blcu-reading-center
```

2. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，修改数据库密码、Django Secret Key 等
vim .env
```

3. **一键部署**
```bash
chmod +x deploy.sh
./deploy.sh
```

4. **访问应用**
- 前端首页: http://localhost
- 后台管理: http://localhost/admin/
- API 文档: http://localhost/api/docs/

### 手动部署

如果不使用 deploy.sh，可以手动执行以下命令：

```bash
# 启动服务
docker compose up -d

# 执行数据库迁移
docker compose exec backend python manage.py migrate

# 创建超级用户
docker compose exec backend python manage.py createsuperuser

# 查看日志
docker compose logs -f
```

## 目录结构

```
/app/
├── backend/                 # Django 后端
│   ├── config/              # 项目配置
│   ├── apps/
│   │   ├── users/           # 用户管理
│   │   ├── news/            # 新闻模块
│   │   ├── contests/        # 竞赛管理
│   │   └── reviews/         # 评审模块
│   ├── media/               # 上传文件
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                # React 前端
│   ├── src/
│   │   ├── components/      # 公共组件
│   │   ├── pages/           # 页面组件
│   │   ├── services/        # API 服务
│   │   └── utils/           # 工具函数
│   ├── package.json
│   └── Dockerfile
│
├── nginx/                   # Nginx 配置
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml       # 容器编排
├── .env.example             # 环境变量模板
├── deploy.sh                # 部署脚本
└── README.md
```

## 用户角色

### 1. 参赛选手 (Contestant)
- 注册账号
- 提交参赛作品
- 查看提交状态

### 2. 评委 (Judge)
- 查看分配的作品
- 多维度评分
- 提交评审意见

### 3. 管理员 (Admin)
- 管理新闻文章
- 创建竞赛活动
- 分配评审任务
- 查看评审结果

## 数据库设计

### 核心表结构
- `users_customuser` - 用户表
- `news_article` - 新闻文章表
- `contests_contest` - 竞赛配置表
- `contests_category` - 竞赛组别表
- `contests_submission` - 参赛作品表
- `reviews_scoredimension` - 评分维度表
- `reviews_assignment` - 评审分配表
- `reviews_score` - 评分表
- `reviews_review` - 评审意见表

## API 接口

### 用户认证
- `POST /api/users/register/` - 用户注册
- `POST /api/users/login/` - 用户登录
- `GET /api/users/me/` - 获取当前用户信息
- `PUT /api/users/profile/` - 更新用户资料

### 新闻模块
- `GET /api/news/` - 新闻列表
- `GET /api/news/{id}/` - 新闻详情
- `GET /api/news/categories/` - 新闻分类

### 竞赛模块
- `GET /api/contests/` - 竞赛列表
- `GET /api/contests/{id}/` - 竞赛详情
- `POST /api/contests/submissions/` - 提交作品
- `GET /api/contests/my-submissions/` - 我的作品

### 评审模块
- `GET /api/reviews/my-assignments/` - 我的评审任务
- `POST /api/reviews/submit/` - 提交评审

完整 API 文档: http://localhost/api/docs/

## 开发指南

### 本地开发 - 后端

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置数据库（确保 MySQL 已运行）
# 编辑 config/settings.py 中的 DATABASES 配置

# 执行迁移
python manage.py migrate

# 创建超级用户
python manage.py createsuperuser

# 启动开发服务器
python manage.py runserver
```

### 本地开发 - 前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

## 常用命令

### Docker 操作
```bash
# 启动所有服务
docker compose up -d

# 停止所有服务
docker compose down

# 查看日志
docker compose logs -f

# 重启服务
docker compose restart

# 进入后端容器
docker compose exec backend bash

# 执行 Django 命令
docker compose exec backend python manage.py <command>
```

### 数据库操作
```bash
# 创建迁移文件
docker compose exec backend python manage.py makemigrations

# 执行迁移
docker compose exec backend python manage.py migrate

# 导出数据
docker compose exec db mysqldump -u root -p blcu_reading > backup.sql

# 导入数据
docker compose exec -T db mysql -u root -p blcu_reading < backup.sql
```

## 安全建议

### 生产环境部署

1. **修改默认密码**
   - 修改 `.env` 中的数据库密码
   - 修改 Django Secret Key

2. **启用 HTTPS**
   - 配置 SSL 证书
   - 更新 Nginx 配置

3. **防火墙配置**
   - 只开放 80/443 端口
   - 限制数据库访问

4. **定期备份**
   - 数据库定期备份
   - 上传文件备份

## 故障排查

### 常见问题

1. **数据库连接失败**
   - 检查 MySQL 容器是否运行: `docker compose ps`
   - 检查 .env 中的数据库配置

2. **前端无法访问后端 API**
   - 检查 Nginx 配置
   - 查看 Nginx 日志: `docker compose logs nginx`

3. **文件上传失败**
   - 检查文件大小限制
   - 检查 media 目录权限

## 许可证

本项目仅供北京语言大学读写研究中心使用。

## 联系方式

如有问题，请联系开发团队。
