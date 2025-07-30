const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// 连接数据库
const db = new sqlite3.Database('./database.sqlite', err => {
  if (err) {
    console.error('数据库连接错误:', err.message);
    return;
  }
  console.log('已连接到SQLite数据库');
});

async function createTablesAndAdmin() {
  try {
    console.log('开始创建表结构...');

    // 创建用户表
    await new Promise((resolve, reject) => {
      const userTableSQL = `
        CREATE TABLE IF NOT EXISTS user (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          isActive BOOLEAN DEFAULT 1,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      db.run(userTableSQL, err => {
        if (err) reject(err);
        else {
          console.log('✅ 用户表创建成功');
          resolve();
        }
      });
    });

    // 创建场馆表
    await new Promise((resolve, reject) => {
      const venueTableSQL = `
        CREATE TABLE IF NOT EXISTS venue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(100) NOT NULL,
          location VARCHAR(255) NOT NULL,
          capacity INTEGER NOT NULL,
          description TEXT,
          isActive BOOLEAN DEFAULT 1,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      db.run(venueTableSQL, err => {
        if (err) reject(err);
        else {
          console.log('✅ 场馆表创建成功');
          resolve();
        }
      });
    });

    // 创建活动表
    await new Promise((resolve, reject) => {
      const activityTableSQL = `
        CREATE TABLE IF NOT EXISTS activity (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          startTime DATETIME NOT NULL,
          endTime DATETIME NOT NULL,
          maxParticipants INTEGER NOT NULL,
          currentParticipants INTEGER DEFAULT 0,
          venueId INTEGER NOT NULL,
          organizerId INTEGER NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (venueId) REFERENCES venue(id),
          FOREIGN KEY (organizerId) REFERENCES user(id)
        )
      `;

      db.run(activityTableSQL, err => {
        if (err) reject(err);
        else {
          console.log('✅ 活动表创建成功');
          resolve();
        }
      });
    });

    // 创建报名表
    await new Promise((resolve, reject) => {
      const registrationTableSQL = `
        CREATE TABLE IF NOT EXISTS registration (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          activityId INTEGER NOT NULL,
          status VARCHAR(20) DEFAULT 'registered',
          registeredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          cancelledAt DATETIME NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES user(id),
          FOREIGN KEY (activityId) REFERENCES activity(id),
          UNIQUE(userId, activityId)
        )
      `;

      db.run(registrationTableSQL, err => {
        if (err) reject(err);
        else {
          console.log('✅ 报名表创建成功');
          resolve();
        }
      });
    });

    // 创建评论表
    await new Promise((resolve, reject) => {
      const commentTableSQL = `
        CREATE TABLE IF NOT EXISTS comment (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT NOT NULL,
          userId INTEGER NOT NULL,
          activityId INTEGER NOT NULL,
          parentId INTEGER NULL,
          isDeleted BOOLEAN DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES user(id),
          FOREIGN KEY (activityId) REFERENCES activity(id),
          FOREIGN KEY (parentId) REFERENCES comment(id)
        )
      `;

      db.run(commentTableSQL, err => {
        if (err) reject(err);
        else {
          console.log('✅ 评论表创建成功');
          resolve();
        }
      });
    });

    // 清空所有数据
    console.log('\n开始清理数据...');
    const tables = ['comment', 'registration', 'activity', 'venue', 'user'];

    for (const table of tables) {
      await new Promise((resolve, reject) => {
        db.run(`DELETE FROM ${table}`, err => {
          if (err) reject(err);
          else {
            console.log(`✅ 已清空 ${table} 数据`);
            resolve();
          }
        });
      });
    }

    // 重置自增ID
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM sqlite_sequence', err => {
        if (err) reject(err);
        else {
          console.log('✅ 已重置自增ID');
          resolve();
        }
      });
    });

    // 创建管理员用户
    console.log('\n正在创建管理员用户...');
    const hashedPassword = await bcrypt.hash('123456', 10);

    await new Promise((resolve, reject) => {
      const sql = `INSERT INTO user (username, email, password, isActive, createdAt, updatedAt) 
                   VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))`;

      db.run(
        sql,
        ['asdfg_admin', 'admin@web.com', hashedPassword],
        function (err) {
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
        }
      );
    });

    console.log('\n🎉 数据库初始化完成！');
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  } finally {
    // 关闭数据库连接
    db.close(err => {
      if (err) {
        console.error('关闭数据库时出错:', err.message);
      } else {
        console.log('数据库连接已关闭');
      }
    });
  }
}

// 执行初始化
createTablesAndAdmin();
