# GitHub Actions 工作流说明

## 问题解决记录

### 依赖缓存错误修复

**问题**: `Dependencies lock file is not found in /home/runner/work/2025-WEB/2025-WEB`

**原因**: 
- GitHub Actions 的 `setup-node@v4` 配置了根目录缓存
- 但项目的 `package-lock.json` 文件在子目录中

**解决方案**:
1. 移除 `setup-node` 的全局缓存配置
2. 为每个子项目单独配置缓存
3. 使用 `actions/cache@v3` 精确控制缓存路径

## 工作流结构

### 1. Test 作业
- **矩阵构建**: Node.js 18.x 和 20.x
- **依赖缓存**: 分别缓存 Backend 和 Frontend 依赖
- **质量检查**: ESLint + TypeScript 类型检查
- **测试执行**: 单元测试 + 构建验证

### 2. Docker 作业
- **触发条件**: 仅在主分支推送时运行
- **依赖关系**: 需要 test 作业成功完成
- **功能**: Docker 镜像构建测试 + docker-compose 配置验证

## 缓存策略

```yaml
# Backend 缓存
key: ${{ runner.os }}-backend-${{ matrix.cache-suffix }}-${{ hashFiles('Backend/package-lock.json') }}

# Frontend 缓存  
key: ${{ runner.os }}-frontend-${{ matrix.cache-suffix }}-${{ hashFiles('Frontend/package-lock.json') }}
```

## 性能优化

- ✅ 使用 `npm ci --prefer-offline --no-audit` 加速安装
- ✅ 多级缓存降级策略
- ✅ Docker Buildx 缓存
- ✅ 条件执行减少不必要的构建

## 安全配置

- ✅ 仅在主分支执行 Docker 构建
- ✅ 不推送测试镜像到仓库
- ✅ 环境变量隔离
