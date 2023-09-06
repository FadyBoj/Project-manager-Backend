require('express-async-errors');
const express = require('express');
const app = express();
const path = require('path');
const createDbConnection = require('./db');
const db = require ('./db')
const cors = require('cors');
const  CustomAPIError  = require('./error/custom-error');
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
        db.all(`SELECT * FROM TASKS `,(err,table) =>{
            
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
                INSERT INTO TASKS (ID,NAME,COMPLETED) VALUES(?,?,?)
            `,[random_id,title,false],(err)=>{})
                }


        })
        res.status(200).json({msg:"Success",id:random_id})

    }

    generateId()    
    

})

app.get('/get-tasks',(req,res) =>{
    

   db.all('SELECT * FROM TASKS ORDER BY created_at',[],(err,rows) =>{

    const readyTasks =rows.map((row) =>{
        return row.CARDS ? {...row,CARDS:JSON.parse(row.CARDS)}:row
    })

    res.status(200).json(readyTasks)

    })
    
})


app.post('/add-card',(req,res) =>{
    const {value,id} = req.body
    
    db.each(`SELECT * FROM TASKS WHERE ID = ${id}`,(err,row) =>{
        if(err)
        return console.log(err);
        if(!row.CARDS)
        {
            const cardsArray = [{value:value,completed:false}];
            const buffer = Buffer.from(JSON.stringify(cardsArray),'utf-8');
            db.run(`
            UPDATE TASKS SET CARDS = ? WHERE ID = ?
            `,[buffer,id],(err)=>{console.log(err)})
        }
        else
        {
            const cardsArray = [...JSON.parse(row.CARDS),{value:value,completed:false}];
            const buffer = Buffer.from(JSON.stringify(cardsArray));
            db.run(`
            UPDATE TASKS SET CARDS = ? WHERE ID = ?
            `,[buffer,id],(err)=>{console.log(err)})
        }
    })


    setTimeout(() =>{
        db.each(`SELECT * FROM TASKS`,(err,row) =>{
            if(err)
            return console.log(err);
            
        })
    },300)

    res.status(200).json({msg:"Success"});

    
})

// DELETE TASK

app.put('/delete-task',(req,res) =>{
    const {id,title} = req.body;

    try {
        db.run(`DELETE FROM TASKS WHERE ID = ?`,
        [id],(err)=>{});
        res.status(200).json({msg:`Task with the name '${title}' has been deleted`})
    } catch (error) {
        res.status(500).json({msg:"Something went wrong"})
    }
   

})


app.get('/get-single-card/:taskId/:cardId',(req,res) =>{
    const { taskId , cardId } = req.params;
    db.all(`SELECT CARDS FROM TASKS WHERE ID = ?`,[taskId],(err,row) =>{
        const card = JSON.parse(row[0].CARDS)[Number(cardId)];
        res.status(200).json({card:card}); 
    })
    
})


app.put('/update-card',(req,res) =>{
    const {value,taskId,cardId} = req.body
    let valid = true;
    db.all(`SELECT CARDS FROM TASKS WHERE ID = ?`,[taskId],(err,row)=>{
       const cards = JSON.parse(row[0].CARDS);
       const cardValue = cards[Number(cardId)].value;

       if(cardValue === value)
       {
          return res.status(400).json({msg:"Nothing new to be changed"});
       }
       if(!value)
       {
        return res.status(400).json({msg:"Can't assign the card value to nothing "});
       }

       const newCards = cards.map((card,index) =>{
        return index === cardId ? {...card,value:value} : card
       })

       const bufferValue = Buffer.from(JSON.stringify(newCards),'utf-8')

       db.run(`UPDATE TASKS SET CARDS = ? WHERE ID = ?`,[bufferValue,taskId],(err)=>{
        if(err)
        {
            
        }
       })


       res.status(200).json({msg:"Success"})

    })
})


app.put('/delete-card',(req,res) =>{
    const { taskId,cardId } = req.body

    db.all(`SELECT CARDS FROM TASKS WHERE ID = ?`,[taskId],(err,row) =>{
        const cards = JSON.parse(row[0].CARDS);
        const newCards = cards.map((card,index) =>{
            return index === cardId ? null : card
        }).filter((card) => card !=null)

        const bufferValue = Buffer.from(JSON.stringify(newCards),'utf-8');

        db.run(`UPDATE TASKS SET CARDS = ? WHERE ID = ?`,[bufferValue,taskId],(err)=>{});

        res.status(200).json({msg:"Success"})
    })
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


