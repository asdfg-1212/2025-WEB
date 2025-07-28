const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('数据库连接错误:', err.message);
    return;
  }
  console.log('已连接到SQLite数据库');
});

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log('数据库表:', rows.map(r => r.name));
  }
  db.close();
});
