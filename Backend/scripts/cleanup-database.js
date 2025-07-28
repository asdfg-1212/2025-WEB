const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite');

console.log('开始清理数据库...');

// 删除问题场馆
const problematicVenueIds = [210, 211];

console.log('1. 删除问题场馆...');
db.run('DELETE FROM venues WHERE id IN (210, 211)', [], function(err) {
  if (err) {
    console.error('删除问题场馆失败:', err);
  } else {
    console.log(`成功删除了 ${this.changes} 个问题场馆`);
  }
  
  // 删除单数表
  console.log('\n2. 删除单数表...');
  const singularTables = ['user', 'venue', 'activity', 'registration', 'comment'];
  
  let deletedTables = 0;
  
  function dropNextTable(index) {
    if (index >= singularTables.length) {
      console.log(`\n清理完成！删除了 ${deletedTables} 个单数表`);
      
      // 最后显示剩余的表
      console.log('\n3. 显示剩余的表...');
      db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
          console.error('查询表名错误:', err);
        } else {
          console.log('剩余的表:');
          tables.forEach(table => console.log('- ' + table.name));
        }
        db.close();
      });
      return;
    }
    
    const tableName = singularTables[index];
    console.log(`正在删除表: ${tableName}`);
    
    db.run(`DROP TABLE IF EXISTS ${tableName}`, [], function(err) {
      if (err) {
        console.error(`删除表 ${tableName} 失败:`, err);
      } else {
        console.log(`成功删除表: ${tableName}`);
        deletedTables++;
      }
      dropNextTable(index + 1);
    });
  }
  
  dropNextTable(0);
});
