require('dotenv').config()
const express=require('express')
const mongoose=require('mongoose')
const cors=require('cors')
const fileUp=require('express-fileupload')
const cookieParser = require('cookie-parser')

const testObj = {
    "test1": {
        "1": "Hello there"
   }
}

const app=express()
app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(fileUp({
    useTempFiles:true
}))
app.get('/hello',async(req,res)=>{
    res.json({string:"Hello"})
})

app.use('/user',require('./routes/userRouter'))
app.use('/api',require('./routes/categoryRouter'))
app.use('/api',require('./routes/upload'))
app.use('/api',require('./routes/productRouter'))

const URLI=process.env.MONGODB_URL
mongoose.connect(URLI,{
   useNewUrlParser: true,
   useUnifiedTopology: true
},err=>{
    if(err) throw err;
    console.log('Connected')
})
if(process.env.NODE_ENV==='production'){
    app.use(express.static('client/build'))
    app.get("*",(req,res)=>{
        res.sendFile(path.join(_dirname,'client','build','index.html'))
    })
}
const PORT=process.env.port || 5000
app.listen(PORT, ()=>{
    console.log('Server is running on port', PORT)
})