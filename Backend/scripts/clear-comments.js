const sqlite3 = require('sqlite3').verbose();

// 连接数据库
const db = new sqlite3.Database('./database.sqlite', err => {
  if (err) {
    console.error('数据库连接错误:', err.message);
    return;
  }
  console.log('已连接到SQLite数据库');
});

async function clearComments() {
  return new Promise((resolve, reject) => {
    // 清理所有评论数据
    db.run('DELETE FROM comments', err => {
      if (err) {
        console.log('❌ 清理评论失败:', err.message);
        reject(err);
      } else {
        console.log('✅ 已清空所有评论数据');
        resolve();
      }
    });
  });
}

async function main() {
  try {
    console.log('开始清理评论数据...');
    await clearComments();
    console.log('✅ 评论数据清理完成！');
  } catch (error) {
    console.error('清理过程中出现错误:', error);
  } finally {
    db.close(err => {
      if (err) {
        console.error('关闭数据库连接时出错:', err.message);
      } else {
        console.log('数据库连接已关闭');
      }
    });
  }
}

main();
