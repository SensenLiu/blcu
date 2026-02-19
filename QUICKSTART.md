# 快速启动指南

## 🚀 5 分钟快速启动

### 前提条件
- 已安装 Docker 20.10+
- 已安装 Docker Compose 2.0+

### 步骤 1: 检查项目完整性
```bash
./check_project.sh
```
应该看到 "✅ 项目完整性检查通过！"

### 步骤 2: 配置环境变量
```bash
cp .env.example .env
```

**重要**: 编辑 `.env` 文件，至少修改以下内容：
```env
# 修改为安全的密钥（生产环境必须修改）
DJANGO_SECRET_KEY=your-random-secret-key-here

# 修改数据库密码（生产环境必须修改）
DB_PASSWORD=your-secure-password
DB_ROOT_PASSWORD=your-root-password
```

### 步骤 3: 一键部署
```bash
./deploy.sh
```

等待约 2-3 分钟，看到 "部署完成！" 即表示成功。

### 步骤 4: 创建管理员账号
```bash
docker compose exec backend python manage.py createsuperuser
```

按提示输入：
- 用户名（如：admin）
- 邮箱
- 密码（至少 8 位）

### 步骤 5: 访问应用
- **前端首页**: http://localhost
- **后台管理**: http://localhost/admin/
- **API 文档**: http://localhost/api/docs/

---

## 📝 初始化数据（可选）

### 1. 登录后台管理
访问 http://localhost/admin/
使用刚才创建的管理员账号登录

### 2. 创建新闻文章
1. 点击 "新闻文章" → "增加"
2. 填写标题、内容
3. 勾选 "是否发布"
4. 保存

### 3. 创建竞赛
1. 点击 "竞赛" → "增加"
2. 填写竞赛名称、说明
3. 设置开始时间、截止时间
4. 状态选择 "开放报名"
5. 在下方添加组别（如：小学组、初中组）
6. 保存

### 4. 创建评分维度
1. 点击 "评分维度" → "增加"
2. 选择竞赛
3. 设置维度名称（如：内容、创意、表达）
4. 设置满分和权重
5. 保存

### 5. 创建评委账号
1. 点击 "用户" → "增加"
2. 填写用户名、密码
3. **用户角色** 选择 "评委"
4. 保存

### 6. 创建测试选手账号（可选）
或者直接在前端注册：http://localhost/register

---

## 🎯 功能测试流程

### 测试选手流程
1. 访问 http://localhost/register
2. 注册选手账号
3. 登录后进入选手中心
4. 点击 "提交作品"
5. 选择竞赛和组别
6. 填写作品信息，上传文件
7. 提交

### 测试评委流程
1. 在后台创建评审分配：
   - 点击 "评审分配" → "增加"
   - 选择作品和评委
   - 保存
2. 使用评委账号登录前端
3. 进入评委中心
4. 点击 "开始评审"
5. 下载作品文件
6. 填写评分和意见
7. 提交评审

---

## 🛠️ 常用命令

### 查看日志
```bash
# 查看所有服务日志
docker compose logs -f

# 只查看后端日志
docker compose logs -f backend

# 只查看数据库日志
docker compose logs -f db
```

### 停止服务
```bash
docker compose down
```

### 重启服务
```bash
docker compose restart
```

### 进入后端容器
```bash
docker compose exec backend bash
```

### 执行数据库迁移
```bash
docker compose exec backend python manage.py migrate
```

### 创建新的管理员
```bash
docker compose exec backend python manage.py createsuperuser
```

---

## ❓ 常见问题

### 1. 端口冲突
如果 80 端口被占用，修改 `docker-compose.yml`：
```yaml
nginx:
  ports:
    - "8080:80"  # 改为 8080 端口
```
然后访问 http://localhost:8080

### 2. 数据库连接失败
等待数据库启动完成：
```bash
docker compose logs db
```
看到 "ready for connections" 表示数据库已就绪

### 3. 前端无法访问
检查所有服务是否运行：
```bash
docker compose ps
```
应该看到 4 个服务都是 "Up" 状态

### 4. 文件上传失败
检查 media 目录权限：
```bash
docker compose exec backend ls -la media/
```

### 5. 忘记管理员密码
重置密码：
```bash
docker compose exec backend python manage.py changepassword admin
```

---

## 📊 系统要求

### 最低配置
- CPU: 2 核
- 内存: 4GB
- 硬盘: 10GB 可用空间

### 推荐配置
- CPU: 4 核
- 内存: 8GB
- 硬盘: 20GB 可用空间

---

## 🔒 安全检查清单

在生产环境部署前，请确保：

- [ ] 修改了 DJANGO_SECRET_KEY
- [ ] 修改了数据库密码
- [ ] DEBUG 设置为 False
- [ ] 配置了正确的 ALLOWED_HOSTS
- [ ] 配置了 HTTPS（推荐使用 Let's Encrypt）
- [ ] 配置了防火墙规则
- [ ] 设置了定期数据库备份
- [ ] 限制了文件上传大小

---

## 📞 获取帮助

如遇到问题：
1. 查看 README.md 的故障排查部分
2. 查看容器日志：`docker compose logs`
3. 联系开发团队

---

**祝使用愉快！**
