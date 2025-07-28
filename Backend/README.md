# 体育活动管理系统 - 后端API服务

基于 Midway.js 框架构建的体育活动管理系统后端服务，提供活动管理、用户注册、评论系统等功能。

## 🚀 快速开始

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 本地开发

```bash
# 安装依赖
npm install

# 初始化数据库
npm run db:init

# 启动开发服务器
npm run dev

# 访问 http://localhost:7001/
```

### 生产部署

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

## 📁 项目结构

```
Backend/
├── src/
│   ├── controller/     # 控制器层
│   ├── service/        # 服务层
│   ├── entity/         # 数据实体
│   ├── config/         # 配置文件
│   ├── filter/         # 异常过滤器
│   └── middleware/     # 中间件
├── scripts/           # 工具脚本
├── config/            # 环境配置
├── test/              # 测试文件
└── logs/              # 日志文件
```

## 🛠️ 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm start` - 启动生产服务器
- `npm test` - 运行测试
- `npm run lint` - 代码检查
- `npm run db:init` - 初始化数据库
- `npm run scripts:clean` - 清理数据库数据

## 🔧 环境配置

1. 复制 `.env.example` 为 `.env`
2. 根据你的环境修改配置项
3. 生产环境请务必更换JWT密钥

## 📚 API文档

### 主要接口

- `GET /api/activities` - 获取活动列表
- `POST /api/activities` - 创建活动
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `POST /api/comments` - 发布评论

详细API文档请参考各控制器文件中的注释。

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run cov

# 监听模式运行测试
npm run test:watch
```

## 📝 开发规范

- 使用 TypeScript 进行开发
- 遵循 ESLint 代码规范
- 提交前请运行 `npm run lint` 检查代码
- 编写单元测试覆盖核心功能

更多详细信息请查看 [Midway.js 官方文档](https://midwayjs.org)
