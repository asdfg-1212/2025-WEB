const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite');

console.log('查询venues表数据...');

db.all('SELECT * FROM venues', [], (err, rows) => {
  if (err) {
    console.error('查询venues错误:', err);
  } else {
    console.log('venues表数据:');
    console.log(JSON.stringify(rows, null, 2));

    if (rows.length > 0) {
      console.log('\n查找包含问号或有问题的场馆...');
      const problematicVenues = rows.filter(
        venue =>
          (venue.name && venue.name.includes('?')) ||
          (venue.address && venue.address.includes('?')) ||
          (venue.description && venue.description.includes('?'))
      );

      if (problematicVenues.length > 0) {
        console.log('找到问题场馆:');
        console.log(JSON.stringify(problematicVenues, null, 2));
      } else {
        console.log('未找到明显的问题场馆，显示所有场馆供检查:');
        console.log(JSON.stringify(rows, null, 2));
      }
    }

    // 查看所有表
    console.log('\n查询所有表名...');
    db.all(
      "SELECT name FROM sqlite_master WHERE type='table'",
      [],
      (err, tables) => {
        if (err) {
          console.error('查询表名错误:', err);
        } else {
          console.log('所有表:');
          tables.forEach(table => console.log('- ' + table.name));

          const singularTables = tables.filter(t =>
            ['user', 'venue', 'activity', 'registration', 'comment'].includes(
              t.name
            )
          );

          console.log(
            '\n单数表:',
            singularTables.map(t => t.name)
          );
        }
        db.close();
      }
    );
  }
});
