const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite');

console.log('检查活动状态值...');

// 查看所有活动的状态
db.all(
  'SELECT id, title, status FROM activities ORDER BY id',
  [],
  (err, rows) => {
    if (err) {
      console.error('查询活动状态错误:', err);
    } else {
      console.log('所有活动的状态:');
      rows.forEach(activity => {
        console.log(
          `- ID: ${activity.id}, Title: ${activity.title}, Status: ${activity.status}`
        );
      });

      // 统计状态分布
      const statusCounts = {};
      rows.forEach(activity => {
        statusCounts[activity.status] =
          (statusCounts[activity.status] || 0) + 1;
      });

      console.log('\n状态分布统计:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`- ${status}: ${count} 个活动`);
      });
    }
    db.close();
  }
);
