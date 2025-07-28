#!/bin/bash

# 体育活动管理系统部署脚本
# 使用方法: ./deploy.sh [environment]
# 例如: ./deploy.sh production

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    log_info "Docker 环境检查通过"
}

# 检查环境变量文件
check_env() {
    if [ ! -f .env ]; then
        log_warn ".env 文件不存在，正在从 .env.example 创建..."
        cp .env.example .env
        log_warn "请编辑 .env 文件并填入正确的配置，然后重新运行部署脚本"
        exit 1
    fi
    log_info "环境变量文件检查通过"
}

# 构建镜像
build_images() {
    log_info "开始构建 Docker 镜像..."
    
    # 构建后端镜像
    log_info "构建后端镜像..."
    docker-compose build backend
    
    # 构建前端镜像
    log_info "构建前端镜像..."
    docker-compose build frontend
    
    log_info "镜像构建完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    # 首先启动数据库
    log_info "启动数据库服务..."
    docker-compose up -d database redis
    
    # 等待数据库启动
    log_info "等待数据库启动..."
    sleep 30
    
    # 启动后端服务
    log_info "启动后端服务..."
    docker-compose up -d backend
    
    # 等待后端启动
    log_info "等待后端服务启动..."
    sleep 20
    
    # 启动前端服务
    log_info "启动前端服务..."
    docker-compose up -d frontend
    
    log_info "所有服务已启动"
}

# 检查服务健康状态
check_health() {
    log_info "检查服务健康状态..."
    
    # 检查数据库
    if docker-compose exec -T database mysqladmin ping -h localhost --silent; then
        log_info "数据库服务正常"
    else
        log_error "数据库服务异常"
        return 1
    fi
    
    # 检查后端API
    sleep 10
    if curl -f http://localhost:7001/api/health > /dev/null 2>&1; then
        log_info "后端API服务正常"
    else
        log_error "后端API服务异常"
        return 1
    fi
    
    # 检查前端
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_info "前端服务正常"
    else
        log_error "前端服务异常"
        return 1
    fi
    
    log_info "所有服务健康检查通过"
}

# 显示服务状态
show_status() {
    log_info "服务状态:"
    docker-compose ps
    
    echo ""
    log_info "服务访问地址:"
    echo "前端应用: http://localhost"
    echo "后端API: http://localhost:7001"
    echo "数据库: localhost:3306"
    echo "Redis: localhost:6379"
}

# 停止服务
stop_services() {
    log_info "停止所有服务..."
    docker-compose down
    log_info "服务已停止"
}

# 清理资源
cleanup() {
    log_info "清理 Docker 资源..."
    docker-compose down -v --rmi all
    docker system prune -f
    log_info "清理完成"
}

# 主函数
main() {
    local command=${1:-deploy}
    
    case $command in
        deploy)
            log_info "开始部署体育活动管理系统..."
            check_docker
            check_env
            build_images
            start_services
            check_health
            show_status
            log_info "部署完成！"
            ;;
        start)
            log_info "启动服务..."
            start_services
            show_status
            ;;
        stop)
            stop_services
            ;;
        restart)
            stop_services
            start_services
            show_status
            ;;
        status)
            show_status
            ;;
        health)
            check_health
            ;;
        cleanup)
            cleanup
            ;;
        *)
            echo "使用方法: $0 {deploy|start|stop|restart|status|health|cleanup}"
            echo ""
            echo "命令说明:"
            echo "  deploy   - 完整部署（默认）"
            echo "  start    - 启动服务"
            echo "  stop     - 停止服务"
            echo "  restart  - 重启服务"
            echo "  status   - 查看服务状态"
            echo "  health   - 检查服务健康状态"
            echo "  cleanup  - 清理所有Docker资源"
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
