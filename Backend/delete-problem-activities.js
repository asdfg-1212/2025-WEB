const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite');

console.log('准备删除问题活动...');

const activityIds = [47, 48]; // 包含问号的活动ID

// 首先删除相关的报名记录
console.log('删除相关的报名记录...');
db.run('DELETE FROM registrations WHERE activity_id IN (47, 48)', [], function(err) {
  if (err) {
    console.error('删除报名记录失败:', err);
    db.close();
    return;
  }
  console.log(`删除了 ${this.changes} 个报名记录`);
  
  // 删除相关的评论
  console.log('删除相关的评论...');
  db.run('DELETE FROM comments WHERE activity_id IN (47, 48)', [], function(err) {
    if (err) {
      console.error('删除评论失败:', err);
      db.close();
      return;
    }
    console.log(`删除了 ${this.changes} 个评论`);
    
    // 最后删除活动本身
    console.log('删除活动...');
    db.run('DELETE FROM activities WHERE id IN (47, 48)', [], function(err) {
      if (err) {
        console.error('删除活动失败:', err);
      } else {
        console.log(`成功删除了 ${this.changes} 个活动`);
        console.log('问题活动删除完成！');
      }
      db.close();
    });
  });
});
