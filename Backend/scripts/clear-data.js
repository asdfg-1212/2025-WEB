const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// 连接数据库
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('数据库连接错误:', err.message);
    return;
  }
  console.log('已连接到SQLite数据库');
});

// 辅助函数：安全删除表数据
async function safeDeleteFromTable(tableName) {
  return new Promise((resolve, reject) => {
    // 先检查表是否存在
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [tableName], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!row) {
        console.log(`⚠️  表 ${tableName} 不存在，跳过清理`);
        resolve();
        return;
      }
      
      // 表存在，执行删除
      db.run(`DELETE FROM ${tableName}`, (err) => {
        if (err) {
          console.log(`❌ 清理表 ${tableName} 失败:`, err.message);
          reject(err);
        } else {
          console.log(`✅ 已清空 ${tableName} 数据`);
          resolve();
        }
      });
    });
  });
}

async function clearDataAndCreateAdmin() {
  try {
    console.log('开始清理数据...');
    
    // 按照外键依赖顺序删除数据
    const tables = ['comment', 'registration', 'activity', 'venue', 'user'];
    
    for (const table of tables) {
      await safeDeleteFromTable(table);
    }

    // 重置自增ID
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM sqlite_sequence', (err) => {
        if (err) reject(err);
        else {
          console.log('✅ 已重置自增ID');
          resolve();
        }
      });
    });

    // 创建管理员用户
    console.log('正在创建管理员用户...');
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    await new Promise((resolve, reject) => {
      const sql = `INSERT INTO user (username, email, password, isActive, createdAt, updatedAt) 
                   VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))`;
      
      db.run(sql, ['asdfg_admin', 'admin@web.com', hashedPassword], function(err) {
        if (err) {
          reject(err);
        } else {
          console.log('✅ 管理员用户创建成功！');
          console.log('   用户名: asdfg_admin');
          console.log('   邮箱: admin@web.com');
          console.log('   密码: 123456');
          console.log('   用户ID:', this.lastID);
          resolve();
        }
      });
    });

    console.log('\n🎉 数据清理和管理员创建完成！');

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  } finally {
    // 关闭数据库连接
    db.close((err) => {
      if (err) {
        console.error('关闭数据库时出错:', err.message);
      } else {
        console.log('数据库连接已关闭');
      }
    });
  }
}

// 执行清理和创建
clearDataAndCreateAdmin();
