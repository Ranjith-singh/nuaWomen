import express from 'express';
import connectDB from './db/DbConnect.js';
import app from './app.js'

// const app = express();
import 'dotenv/config'

connectDB().then(()=>{
    app.listen(process.env.PORT,(req, res)=>{
        console.log("Server listening on port:", process.env.PORT);
    })
})
.catch((error)=>{
    console.log("Couldn't connect to the Database");
})

app.get("/neo",(req, res)=>{
    res.send({
        key: "neo"
    })
})