# 🏃‍♂️ 体育活动管理系统

一个完整的体育活动管理系统，包含前端Web应用和后端API服务。

## 📋 项目概述

本系统提供完整的体育活动管理解决方案，支持活动发布、用户报名、评论互动、场馆管理等功能。

### 主要功能
- 🏃‍♂️ **活动管理**：创建、编辑、删除体育活动
- 👥 **用户系统**：用户注册、登录、个人资料管理
- 📝 **报名系统**：活动报名、取消报名、报名状态管理
- 💬 **评论系统**：活动评论、实时互动
- 🏢 **场馆管理**：场馆信息维护
- 👑 **管理后台**：用户管理、数据统计、权限控制

## 🏗️ 技术架构

### 前端 (Frontend)
- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **路由**: React Router DOM v7
- **状态管理**: React Context + Hooks
- **样式**: CSS Modules

### 后端 (Backend)
- **框架**: Midway.js + TypeScript
- **数据库**: SQLite (开发) / MySQL (生产)
- **ORM**: TypeORM
- **认证**: JWT Token
- **API风格**: RESTful

## 🚀 快速开始

### 环境要求
- Docker >= 20.0.0
- Docker Compose >= 2.0.0

### 一键部署 (推荐)

#### Linux/Mac:
```bash
# 克隆项目
git clone https://github.com/your-username/2025-WEB.git
cd 2025-WEB

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入实际配置

# 一键部署
chmod +x deploy.sh
./deploy.sh
```

#### Windows:
```cmd
# 克隆项目
git clone https://github.com/your-username/2025-WEB.git
cd 2025-WEB

# 配置环境变量
copy .env.example .env
# 编辑 .env 文件，填入实际配置

# 一键部署
deploy.bat
```

### 本地开发模式

如果需要进行开发：

```bash
# 启动后端服务
cd Backend
npm install
npm run db:init
npm run dev

# 启动前端应用 (新终端)
cd ../Frontend
npm install
npm run dev
```

### 访问应用
- 前端应用: http://localhost (生产模式) 或 http://localhost:5173 (开发模式)
- 后端API: http://localhost:7001
- 数据库: localhost:3306 (MySQL)
- 缓存: localhost:6379 (Redis)

## 🚢 部署和运维

### 生产环境部署

项目已完全容器化，支持一键部署到生产环境：

1. **服务器要求**
   - Docker >= 20.0.0
   - Docker Compose >= 2.0.0
   - 2GB+ RAM
   - 10GB+ 磁盘空间

2. **部署步骤**
   ```bash
   # 1. 上传代码到服务器
   git clone https://github.com/your-username/2025-WEB.git
   cd 2025-WEB
   
   # 2. 配置环境变量
   cp .env.example .env
   # 编辑 .env 文件，设置生产环境配置
   
   # 3. 一键部署
   ./deploy.sh
   ```

3. **常用运维命令**
   ```bash
   ./deploy.sh status    # 查看服务状态
   ./deploy.sh restart   # 重启服务
   ./deploy.sh stop      # 停止服务
   ./deploy.sh health    # 健康检查
   ./deploy.sh cleanup   # 清理资源
   ```

### Docker镜像构成

- **Frontend**: Nginx + React生产构建
- **Backend**: Node.js + PM2进程管理
- **Database**: MySQL 8.0 with persistent storage
- **Cache**: Redis 7 for session and caching

### 安全特性

- ✅ 非root用户运行容器
- ✅ 安全HTTP头配置
- ✅ JWT Token认证
- ✅ 输入验证和SQL注入防护
- ✅ CORS跨域安全配置
- ✅ 生产环境密钥管理

## 📁 项目结构

```
2025-WEB/
├── Frontend/              # 前端应用
│   ├── src/
│   │   ├── components/    # 可复用组件
│   │   ├── pages/        # 页面组件
│   │   ├── services/     # API服务
│   │   ├── contexts/     # React Context
│   │   ├── types/        # TypeScript类型
│   │   └── utils/        # 工具函数
│   └── package.json
├── Backend/               # 后端API服务
│   ├── src/
│   │   ├── controller/   # 控制器
│   │   ├── service/      # 服务层
│   │   ├── entity/       # 数据实体
│   │   └── config/       # 配置文件
│   ├── scripts/          # 工具脚本
│   └── package.json
└── .github/workflows/    # CI/CD配置
```

## 🧪 测试

```bash
# 后端测试
cd Backend
npm test

# 前端测试
cd Frontend
npm test
```

## 🚢 部署

### 生产环境部署

1. **后端部署**
```bash
cd Backend
npm run build
npm start
```

2. **前端部署**
```bash
cd Frontend
npm run build
# 将dist目录部署到静态文件服务器
```

### 环境配置
- 复制 `Backend/.env.example` 为 `.env`
- 根据生产环境修改配置项
- 确保数据库连接和JWT密钥配置正确

## 📊 开发进度

- ✅ 用户认证系统
- ✅ 活动管理功能
- ✅ 报名系统
- ✅ 评论系统
- ✅ 场馆管理
- ✅ 管理后台
- ✅ 响应式设计
- ✅ API文档
- ✅ 单元测试
- ✅ CI/CD流程

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目使用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👥 团队

- 开发者：[Your Name]
- 项目类型：2025年Web开发项目

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 创建 Issue
- 发送邮件：your-email@example.com
