const db = require('./db');


db.exec(`
    DELETE FROM TASKS
`)

db.each(`
    SELECT * FROM TASKS
`,(err,row) =>{
    console.log(row);
})