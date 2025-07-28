# 工具脚本说明

本目录包含用于开发和维护的工具脚本。

## 数据库相关脚本

### 清理脚本
- `clear-data.js` - 清理所有数据表中的数据
- `clear-comments.js` - 清理评论数据
- `cleanup-database.js` - 数据库清理工具
- `delete-problem-activities.js` - 删除有问题的活动数据

### 检查脚本
- `check-activity-status.js` - 检查活动状态
- `check-tables.js` - 检查数据表结构
- `check-venues-and-tables.js` - 检查场馆和数据表

### 查询脚本
- `query-activities.js` - 查询活动数据
- `verify-cleanup.js` - 验证清理结果

## 测试脚本
- `test-api.js` - API接口测试
- `test-venue.js` - 场馆功能测试

## 使用方法

```bash
# 在Backend目录下运行
node scripts/script-name.js
```

**注意：** 这些脚本主要用于开发环境，生产环境请谨慎使用清理脚本。
