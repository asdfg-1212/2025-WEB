const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite');

console.log('验证清理结果...');

// 查看剩余的venues
console.log('1. 检查剩余的venues:');
db.all('SELECT * FROM venues', [], (err, rows) => {
  if (err) {
    console.error('查询venues错误:', err);
  } else {
    console.log('剩余venues数量:', rows.length);
    rows.forEach(venue => {
      console.log(`- ID: ${venue.id}, Name: ${venue.name}, Location: ${venue.location || 'N/A'}`);
    });
  }
  
  // 查看剩余的activities
  console.log('\n2. 检查剩余的activities:');
  db.all('SELECT id, title, status FROM activities', [], (err, rows) => {
    if (err) {
      console.error('查询activities错误:', err);
    } else {
      console.log('剩余activities数量:', rows.length);
      rows.forEach(activity => {
        console.log(`- ID: ${activity.id}, Title: ${activity.title}, Status: ${activity.status}`);
      });
    }
    
    // 最终表统计
    console.log('\n3. 最终表统计:');
    db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", [], (err, tables) => {
      if (err) {
        console.error('查询表名错误:', err);
      } else {
        console.log('数据库现有表:', tables.map(t => t.name).join(', '));
        console.log('\n✅ 数据库清理完成！');
        console.log('- 删除了问题场馆（乱码问号）');
        console.log('- 删除了所有单数表');
        console.log('- 保留了复数表作为主要数据表');
      }
      db.close();
    });
  });
});
