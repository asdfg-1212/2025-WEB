# 多阶段构建 - 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖（包含开发依赖用于构建）
RUN npm ci && npm cache clean --force

# 复制源代码
COPY . .

# 构建应用 - 使用备用构建方案
RUN echo "Starting build process..." && \
    npm list mwtsc || echo "mwtsc not found, checking global..." && \
    npx mwtsc --version || echo "mwtsc version check failed" && \
    (npm run build || (echo "mwtsc failed, trying standard tsc..." && npx tsc)) && \
    echo "Build completed successfully" && \
    ls -la dist/ || echo "dist directory not found"

# 生产阶段
FROM node:18-alpine AS production

# 安装PM2
RUN npm install -g pm2

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 复制构建产物和必要文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/bootstrap.js ./
COPY --from=builder /app/init-database.js ./
COPY ecosystem.config.js ./

# 创建必要目录
RUN mkdir -p logs data

# 设置文件权限
RUN chown -R nodejs:nodejs /app
USER nodejs

# 暴露端口
EXPOSE 7001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7001/api/health || exit 1

# 启动命令
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
