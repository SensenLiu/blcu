# Docker 镜像说明

## 问题：db 服务没有 Dockerfile，是如何创建的？

### 答案：使用 Docker Hub 官方镜像

在 `docker-compose.yml` 中，有两种方式指定镜像：

### 方式 1：使用官方镜像（不需要 Dockerfile）
```yaml
db:
  image: mysql:8.0  # 直接使用 Docker Hub 官方镜像
```

- Docker 会自动从 **Docker Hub** 下载 `mysql:8.0` 官方镜像
- 这是 MySQL 官方维护的镜像，无需我们自己构建
- 类似于 `npm install` 从 npm 仓库下载包

### 方式 2：自定义构建（需要 Dockerfile）
```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile  # 使用自定义 Dockerfile 构建
```

- 需要提供 Dockerfile 文件
- Docker 会根据 Dockerfile 指令构建自定义镜像
- 我们的 backend、frontend、nginx 都使用这种方式

## 本项目的镜像来源

### 1. db (MySQL) - 官方镜像
- **来源**: Docker Hub 官方
- **镜像**: `mysql:8.0`
- **大小**: 约 500MB
- **无需 Dockerfile**

### 2. backend (Django) - 自定义构建
- **基础镜像**: `python:3.11-slim`
- **Dockerfile**: `backend/Dockerfile`
- **构建过程**:
  1. 从 Docker Hub 拉取 `python:3.11-slim`
  2. 安装系统依赖（gcc, mysql-client）
  3. 安装 Python 依赖（requirements.txt）
  4. 复制应用代码

### 3. frontend (React) - 自定义构建（多阶段）
- **阶段1 - 构建**: `node:20-alpine`
- **阶段2 - 运行**: `nginx:alpine`
- **Dockerfile**: `frontend/Dockerfile`
- **构建过程**:
  1. 使用 Node.js 构建 React 应用
  2. 将构建产物复制到 Nginx 镜像
  3. 最终镜像只包含静态文件和 Nginx

### 4. nginx (反向代理) - 自定义构建
- **基础镜像**: `nginx:alpine`
- **Dockerfile**: `nginx/Dockerfile`
- **构建过程**:
  1. 从 Docker Hub 拉取 `nginx:alpine`
  2. 复制自定义配置文件

## Docker Hub 常用官方镜像

以下镜像都可以直接使用，无需 Dockerfile：

```yaml
# 数据库
image: mysql:8.0
image: postgres:15
image: redis:7

# 应用服务器
image: nginx:alpine
image: node:20-alpine
image: python:3.11-slim

# 其他
image: mongo:6
image: rabbitmq:3
```

## 如何查看镜像信息

```bash
# 查看本地已有的镜像
docker images

# 查看容器使用的镜像
docker compose images

# 拉取官方镜像（不启动容器）
docker pull mysql:8.0

# 查看镜像详细信息
docker inspect mysql:8.0
```

## 总结

- **db 服务**：使用 Docker Hub 官方 MySQL 镜像，无需 Dockerfile
- **其他服务**：使用自定义 Dockerfile 构建，基于官方基础镜像
- **优势**：
  - 官方镜像：稳定、安全、更新及时
  - 自定义镜像：满足特定需求、包含应用代码
