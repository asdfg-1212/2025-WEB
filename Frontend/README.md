# 体育活动管理系统 - 前端应用

基于 React 19 + TypeScript + Vite 构建的现代化体育活动管理系统前端应用。

## ✨ 功能特性

- 🏃‍♂️ 活动管理：浏览、报名、取消报名体育活动
- 👥 用户系统：注册、登录、个人资料管理
- 💬 评论系统：活动评论、实时互动
- 👑 管理功能：活动创建、用户管理、数据统计
- 📱 响应式设计：支持桌面端和移动端
- 🎨 现代UI：美观的用户界面和交互体验

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173/
```

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📁 项目结构

```
Frontend/src/
├── components/        # 可复用组件
│   ├── ActivityCard.tsx
│   ├── ActivityDetailModal.tsx
│   ├── CreateActivityModal.tsx
│   └── ...
├── pages/            # 页面组件
│   ├── Dashboard.tsx
│   ├── RegistrationOpen.tsx
│   └── ...
├── services/         # API服务层
│   ├── activity.ts
│   ├── auth.ts
│   └── ...
├── contexts/         # React Context
│   ├── UserContext.tsx
│   └── AuthContext.tsx
├── types/           # TypeScript类型定义
├── utils/           # 工具函数
├── styles/          # 样式文件
└── router/          # 路由配置
```

## 🛠️ 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览构建结果
- `npm run lint` - 代码检查
- `npm run lint:fix` - 自动修复代码问题
- `npm run type-check` - TypeScript类型检查

## 🎯 技术栈

- **框架**: React 19
- **语言**: TypeScript
- **构建工具**: Vite
- **路由**: React Router DOM v7
- **状态管理**: React Context + Hooks
- **样式**: CSS Modules + 现代CSS
- **代码规范**: ESLint + TypeScript

## 🔧 开发规范

### 组件开发
- 使用函数组件和Hooks
- 组件文件使用PascalCase命名
- 每个组件对应一个CSS文件

### 样式规范
- 使用CSS Modules避免样式冲突
- 遵循BEM命名规范
- 支持响应式设计

### TypeScript
- 严格的类型检查
- 定义清晰的接口和类型
- 避免使用any类型

## 🔗 相关链接

- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vite 官方文档](https://vitejs.dev/)

## 📊 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
