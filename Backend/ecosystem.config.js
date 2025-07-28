module.exports = {
  apps: [
    {
      name: 'sports-activity-backend',
      script: './bootstrap.js',
      instances: 'max', // 使用所有CPU核心
      exec_mode: 'cluster', // 集群模式
      env: {
        NODE_ENV: 'production',
        PORT: 7001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 7001
      },
      // 日志配置
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // 重启策略
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      
      // 监控配置
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      
      // 进程配置
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000,
      
      // 自动重启条件
      autorestart: true,
      restart_delay: 4000
    }
  ],
  
  // 部署配置
  deploy: {
    production: {
      user: 'nodejs',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/2025-WEB.git',
      path: '/var/www/sports-activity',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
