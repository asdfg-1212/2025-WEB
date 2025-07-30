const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite');

console.log('查询activities表数据...');

db.all('SELECT * FROM activities', [], (err, rows) => {
  if (err) {
    console.error('查询activities错误:', err);
  } else {
    console.log('activities表数据:');
    console.log(JSON.stringify(rows, null, 2));

    if (rows.length > 0) {
      console.log('\n查找包含问号的活动...');
      const problematicActivities = rows.filter(
        activity =>
          (activity.title && activity.title.includes('?')) ||
          (activity.description && activity.description.includes('?')) ||
          (activity.venue_name && activity.venue_name.includes('?'))
      );

      if (problematicActivities.length > 0) {
        console.log('找到问题活动:');
        console.log(JSON.stringify(problematicActivities, null, 2));

        // 询问是否删除
        console.log('\n可以删除这些活动吗？(Y/N)');
      }
    }
  }
  db.close();
});
