# 2025-WEB-体育活动室
南京大学2025暑校web开发选修课作业——体育活动室，包含前端Web应用和后端API服务。  
本系统提供完整的体育活动管理解决方案，支持活动发布、用户报名、评论互动、场馆管理等功能。  
初次尝试、十分青涩、还望谅解、不值得也千万不要二创搬运抄袭，求求求求谢谢谢谢！  
>Github: https://github.com/asdfg-1212/2025-WEB  
>Wiki: https://github.com/asdfg-1212/2025-WEB/wiki/2025%E2%80%90WEB%E2%80%90Wiki  
>bilibili(功能描述)： https://www.bilibili.com/video/BV1bkhwznEe7/?spm_id_from=333.1387.homepage.video_card.click&vd_source=de252c3487db8b6334b8dd6450e948f7

## 🎯 主要功能
- 👥 **普通用户**：
>用户注册、登录、个人资料管理（功能1）  
活动列表查看、详情查看、活动搜索（功能5、6、8）  
活动报名（功能3）  
活动评论（功能7）  
- 👑 **管理员**：
>活动管理——发布删除（功能2）+ 活动订单（功能4）+ 普通用户功能
#### 附加功能
- 👥 **普通用户**：
>取消报名、更改头像、在“我的活动”中查看“待参与”和“已参与”的活动、按活动类型筛选报名中的活动
- 👑 **管理员**：
>场馆创建、更改已发布的活动、删除评论、按活动类型筛选报名中的活动
- 🗺 **界面特点**：
>管理员界面分为“活动大全”（报名中&已结束）、“创建发布”（活动发布&场馆创建）
>普通用户界面分为“活动大全”（报名中&已结束）、“我的活动”（待参与&已参与）
## 🏗️ 技术架构
### 前端技术栈
- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **路由**: React Router DOM v7
- **状态管理**: React Context + Hooks
- **样式**: CSS Modules
### 后端技术栈
- **框架**: Midway.js + TypeScript
- **数据库**: SQLite (开发) / MySQL (生产)
- **ORM**: TypeORM
- **认证**: JWT Token
- **API风格**: RESTful
## 📁 项目结构
```
2025-WEB/
├── Frontend/              # 前端应用
│   ├── src/
│   │   ├── components/    # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API服务
│   │   ├── contexts/      # React Context
│   │   ├── types/         # TypeScript类型
│   │   └── utils/         # 工具函数
│   └── package.json
├── Backend/               # 后端API服务
│   ├── src/
│   │   ├── controller/    # 控制器
│   │   ├── service/       # 服务层
│   │   ├── entity/        # 数据实体
│   │   └── config/        # 配置文件
│   ├── scripts/           # 工具脚本
│   └── package.json
└── .github/workflows/     # CI/CD配置
```
## 🚀 快速开始（本地开发 推荐！！！）
### 环境准备
- Node.js (建议版本18+)
- npm (建议版本9+)
- SQLite (用于开发环境数据库)
### 后端启动步骤
1. 进入后端目录，安装依赖并初始化数据库：
```bash
cd Backend
npm install
```
2. 启动后端开发服务器：
```bash
npm run dev
```
后端服务默认运行在 `http://localhost:7001`。
### 前端启动步骤
1. 进入前端目录，安装依赖：
```bash
cd ../Frontend
npm install
```
2. 启动前端开发服务器：
```bash
npm run dev
```
前端应用默认运行在 `http://localhost:5173`。
## 🚢 部署（初步实现、未经详细测试）
   ### 💻 平台支持
   本系统支持在以下平台部署运行：
   - **Windows**：通过 `deploy.bat` 脚本或 Docker 部署
   - **Linux/macOS**：通过 `deploy.sh` 脚本或 Docker 部署
   - **Docker 容器**：跨平台支持（需安装 Docker 环境）
### 生产环境部署（使用Docker Compose）
#### 环境要求
- Docker >= 20.0.0
- Docker Compose >= 2.0.0
#### 部署步骤

1. 克隆项目：
```bash
git clone https://github.com/your-username/2025-WEB.git
cd 2025-WEB
```
2. 配置环境变量：
```bash
cp .env.example .env
# 编辑.env文件，设置生产环境变量（如数据库密码、JWT密钥等）
```
3. 使用Docker Compose启动所有服务：
```bash
docker-compose up -d
```
4. 等待所有容器启动后，访问前端应用：`http://服务器IP`。
#### 常用运维命令
```bash
# 查看服务状态
docker-compose ps
# 重启服务
docker-compose restart
# 停止服务
docker-compose stop
# 清理资源（停止并移除容器）
docker-compose down
```
## 🧪 测试
### 后端测试
```bash
cd Backend
npm test
```
### 前端测试
```bash
cd Frontend
npm test
```
## 📊 开发进度
- ✔ 用户认证系统
- ✔ 活动管理功能
- ✔ 报名系统
- ✔ 评论系统
- ✔ 场馆管理
- ✔ 管理后台
- ✔ 响应式设计
- ✔ API文档
- ✔ 单元测试
- ✔ CI/CD流程

## 印象深刻的内容
对于项目最开始的搭建非常畏手畏脚，不知道该如何启动项目，所以拖了很久才着手编写  

编写过程中确实发觉AI的强大，单靠我个人肯定是无法实现这个项目的！ 

但是没有人类也不行，因为很多错误需要人类来找到发掘，再才可能交由AI修改之类的...比如由于个人能力的不足，我无法发现GithubAction测试中究竟为何无法通过，导致CI/CD测试有很多触目惊心的红叉叉，但这似乎也不影响前后端各自的运行（只是自动化测试无法通过...）  

还是很庆幸自己选择了这门课程，有机会体验逼着自己体验完成这次web开发的项目，如果单靠自驱力可能很难完成下去，看到网页被一步步搭建起来，在电脑上实现脑海中所想象的界面，满足感也的确越来越强，非常感谢！  

最后就是体会到想要搭建好网页，对于我来说还有非常多需要深入学习的内容，学无止境！

## 👥 鸣谢
- 老师
- Github Copilot（代码顾问）
---
