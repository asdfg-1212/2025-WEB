@echo off
REM 体育活动管理系统部署脚本 (Windows版本)
REM 使用方法: deploy.bat [command]

setlocal enabledelayedexpansion

set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "NC=[0m"

REM 检查参数
if "%1"=="" (
    set "COMMAND=deploy"
) else (
    set "COMMAND=%1"
)

REM 主程序
if "%COMMAND%"=="deploy" (
    call :deploy
) else if "%COMMAND%"=="start" (
    call :start_services
) else if "%COMMAND%"=="stop" (
    call :stop_services
) else if "%COMMAND%"=="restart" (
    call :restart_services
) else if "%COMMAND%"=="status" (
    call :show_status
) else if "%COMMAND%"=="health" (
    call :check_health
) else if "%COMMAND%"=="cleanup" (
    call :cleanup
) else (
    call :show_help
)

goto :eof

:log_info
echo %GREEN%[INFO]%NC% %~1
goto :eof

:log_warn
echo %YELLOW%[WARN]%NC% %~1
goto :eof

:log_error
echo %RED%[ERROR]%NC% %~1
goto :eof

:check_docker
call :log_info "检查 Docker 环境..."
docker --version >nul 2>&1
if errorlevel 1 (
    call :log_error "Docker 未安装，请先安装 Docker Desktop"
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    call :log_error "Docker Compose 未安装，请先安装 Docker Compose"
    exit /b 1
)

call :log_info "Docker 环境检查通过"
goto :eof

:check_env
if not exist ".env" (
    call :log_warn ".env 文件不存在，正在从 .env.example 创建..."
    copy ".env.example" ".env" >nul
    call :log_warn "请编辑 .env 文件并填入正确的配置，然后重新运行部署脚本"
    exit /b 1
)
call :log_info "环境变量文件检查通过"
goto :eof

:build_images
call :log_info "开始构建 Docker 镜像..."
call :log_info "构建后端镜像..."
docker-compose build backend
if errorlevel 1 (
    call :log_error "后端镜像构建失败"
    exit /b 1
)

call :log_info "构建前端镜像..."
docker-compose build frontend
if errorlevel 1 (
    call :log_error "前端镜像构建失败"
    exit /b 1
)

call :log_info "镜像构建完成"
goto :eof

:start_services
call :log_info "启动服务..."
call :log_info "启动数据库服务..."
docker-compose up -d database redis

call :log_info "等待数据库启动..."
timeout /t 30 /nobreak >nul

call :log_info "启动后端服务..."
docker-compose up -d backend

call :log_info "等待后端服务启动..."
timeout /t 20 /nobreak >nul

call :log_info "启动前端服务..."
docker-compose up -d frontend

call :log_info "所有服务已启动"
goto :eof

:check_health
call :log_info "检查服务健康状态..."

REM 检查后端API
timeout /t 10 /nobreak >nul
curl -f http://localhost:7001/api/health >nul 2>&1
if errorlevel 1 (
    call :log_error "后端API服务异常"
    goto :eof
) else (
    call :log_info "后端API服务正常"
)

REM 检查前端
curl -f http://localhost/health >nul 2>&1
if errorlevel 1 (
    call :log_error "前端服务异常"
    goto :eof
) else (
    call :log_info "前端服务正常"
)

call :log_info "所有服务健康检查通过"
goto :eof

:show_status
call :log_info "服务状态:"
docker-compose ps

echo.
call :log_info "服务访问地址:"
echo 前端应用: http://localhost
echo 后端API: http://localhost:7001
echo 数据库: localhost:3306
echo Redis: localhost:6379
goto :eof

:stop_services
call :log_info "停止所有服务..."
docker-compose down
call :log_info "服务已停止"
goto :eof

:restart_services
call :stop_services
call :start_services
call :show_status
goto :eof

:cleanup
call :log_info "清理 Docker 资源..."
docker-compose down -v --rmi all
docker system prune -f
call :log_info "清理完成"
goto :eof

:deploy
call :log_info "开始部署体育活动管理系统..."
call :check_docker
if errorlevel 1 goto :eof

call :check_env
if errorlevel 1 goto :eof

call :build_images
if errorlevel 1 goto :eof

call :start_services
call :check_health
call :show_status
call :log_info "部署完成！"
goto :eof

:show_help
echo 使用方法: %0 [command]
echo.
echo 命令说明:
echo   deploy   - 完整部署 (默认)
echo   start    - 启动服务
echo   stop     - 停止服务
echo   restart  - 重启服务
echo   status   - 查看服务状态
echo   health   - 检查服务健康状态
echo   cleanup  - 清理所有Docker资源
goto :eof
