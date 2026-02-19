#!/bin/bash

echo "======================================"
echo "项目完整性检查"
echo "======================================"

# 检查目录结构
echo "检查目录结构..."
errors=0

directories=(
    "backend/config"
    "backend/apps/users"
    "backend/apps/news"
    "backend/apps/contests"
    "backend/apps/reviews"
    "frontend/src/components"
    "frontend/src/pages/Home"
    "frontend/src/pages/Auth"
    "frontend/src/pages/Contestant"
    "frontend/src/pages/Judge"
    "frontend/src/services"
    "nginx"
)

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        echo "  ✅ $dir"
    else
        echo "  ❌ $dir (缺失)"
        ((errors++))
    fi
done

# 检查关键文件
echo ""
echo "检查关键文件..."

files=(
    "backend/manage.py"
    "backend/requirements.txt"
    "backend/Dockerfile"
    "frontend/package.json"
    "frontend/vite.config.js"
    "frontend/Dockerfile"
    "nginx/nginx.conf"
    "docker-compose.yml"
    ".env.example"
    "deploy.sh"
    "README.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (缺失)"
        ((errors++))
    fi
done

# 检查 Python 模块文件
echo ""
echo "检查后端模块..."

backend_modules=(
    "backend/apps/users/models.py"
    "backend/apps/users/views.py"
    "backend/apps/users/serializers.py"
    "backend/apps/news/models.py"
    "backend/apps/news/views.py"
    "backend/apps/contests/models.py"
    "backend/apps/contests/views.py"
    "backend/apps/reviews/models.py"
    "backend/apps/reviews/views.py"
)

for module in "${backend_modules[@]}"; do
    if [ -f "$module" ]; then
        echo "  ✅ $module"
    else
        echo "  ❌ $module (缺失)"
        ((errors++))
    fi
done

# 检查前端页面
echo ""
echo "检查前端页面..."

frontend_pages=(
    "frontend/src/App.jsx"
    "frontend/src/main.jsx"
    "frontend/src/pages/Home/Home.jsx"
    "frontend/src/pages/Auth/Login.jsx"
    "frontend/src/pages/Auth/Register.jsx"
    "frontend/src/pages/Contestant/Dashboard.jsx"
    "frontend/src/pages/Judge/Dashboard.jsx"
)

for page in "${frontend_pages[@]}"; do
    if [ -f "$page" ]; then
        echo "  ✅ $page"
    else
        echo "  ❌ $page (缺失)"
        ((errors++))
    fi
done

# 统计结果
echo ""
echo "======================================"
if [ $errors -eq 0 ]; then
    echo "✅ 项目完整性检查通过！"
    echo "您可以运行 ./deploy.sh 开始部署"
else
    echo "❌ 发现 $errors 个问题"
    echo "请检查缺失的文件或目录"
fi
echo "======================================"
