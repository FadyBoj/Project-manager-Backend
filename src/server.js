require('express-async-errors');
const express = require('express');
const app = express();
const path = require('path');
const createDbConnection = require('./db');
const db = require ('./db')
const cors = require('cors');

const port = 8000;

//middleware requires

const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());
app.use(express.static(path.join(__dirname,'dist')))
app.use(cors());

app.get('/',(req,res)=>{
    
    res.status(200).sendFile(path.resolve(__dirname,'index.html'));
})

app.post('/',(req,res) =>{
    const {title} = req.body;

    function generateId()
    {
        const random_id = Math.floor(Math.random() * 999999999);
        let valid = true;
        db.all(`SELECT * FROM TASKS`,(err,table) =>{
            
            table.forEach((row) =>{
                if(row.ID === random_id)
                {
                    valid = false;
                     generateId();
                }
            })

            if(valid)
            {
            db.run(`
                INSERT INTO TASKS (ID,NAME,COMPLETED) VALUES(
                    ${random_id},
                    '${title}',
                    false
                )
            `)
                }


        })
    }

    generateId()    
    

    res.status(200).json({msg:"Success"})
})

app.get('/get-tasks',(req,res) =>{
    
    let data = [];

   db.all('SELECT * FROM TASKS',[],(err,rows) =>{
    res.status(200).json(rows)

    })
    
})

console.log("Hi")

app.post('/add-card',(req,res) =>{
    const {value,id} = req.body
    
    db.each(`SELECT * FROM TASKS WHERE ID = ${id}`,(err,row) =>{
        if(err)
        return console.log(err);
        if(!row.CARDS)
        {
            const cardsArray = "[value]";
            const buffer = Buffer.from(cardsArray,'utf-8');
            db.run(`
            UPDATE TASKS SET CARDS = ? WHERE ID = ?
            `,[buffer,id],(err)=>{console.log(err)})
        }
        else
        {
            const cardsArray = [...row.CARDS ,value];
            const buffer = Buffer.from(JSON.stringify(cardsArray));
            db.run(`
            UPDATE TASKS SET CARDS = ? WHERE ID = ?
            `,[buffer,id],(err)=>{console.log(err)})
        }
        console.log(row)
    })


    setTimeout(() =>{
        db.each(`SELECT * FROM TASKS`,(err,row) =>{
            if(err)
            return console.log(err);
            
            console.log(row)
        })
    },300)

    res.status(200).json({msg:"Success"});

    
})

app.use(errorHandlerMiddleware)











const start = ()=>{
    try {
        app.listen(port,()=>{
            console.log(`App in Running on port ${port}...`)
        })

    } catch (error) {
        console.log(error)
    }
}

start()


