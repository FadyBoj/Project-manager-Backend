const sqlite3 = require("sqlite3");
const filepath = "./Tasks.db";
const fs = require('fs');

const createTable = (db) =>{
  db.exec(`
    CREATE TABLE TASKS (
      ID INTEGER PRIMARY KEY ,
      NAME VARCHAR(50),
      CARDS VARCHAR(100),
      COMPLETED BOOLEAN
    )
   `)
}

function createDbConnection() {
  if(fs.existsSync(filepath))
  {
    console.log("Connection with SQLite has been established");
    return new sqlite3.Database(filepath);
  }
  else
  {
    const db = new sqlite3.Database(filepath,(err) =>{
      if(err)
      return console.log(err);

      createTable(db)

    });
    console.log("Connection with SQLite has been established");
    return db
  }
}




module.exports = createDbConnection()