#!/bin/bash

echo "======================================"
echo "北京语言大学读写研究中心官网部署脚本"
echo "======================================"

# 检查 Docker 和 Docker Compose
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "错误: Docker Compose V2 未安装，请先安装 Docker Compose V2"
    exit 1
fi

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "警告: .env 文件不存在，将使用 .env.example 创建"
    cp .env.example .env
    echo "请编辑 .env 文件配置您的环境变量"
    read -p "按回车键继续..."
fi

# 停止现有容器
echo "停止现有容器..."
docker compose down

# 构建镜像
echo "构建 Docker 镜像..."
docker compose build

# 启动服务
echo "启动服务..."
docker compose up -d

# 等待数据库就绪
echo "等待数据库启动..."
sleep 10

# 执行数据库迁移
echo "执行数据库迁移..."
docker compose exec -T backend python manage.py migrate

# 创建超级用户（可选）
read -p "是否创建超级用户？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose exec backend python manage.py createsuperuser
fi

echo "======================================"
echo "部署完成！"
echo "======================================"
echo "前端地址: http://localhost"
echo "后台管理: http://localhost/admin/"
echo "API 文档: http://localhost/api/docs/"
echo ""
echo "查看日志: docker compose logs -f"
echo "停止服务: docker compose down"
echo "======================================"
