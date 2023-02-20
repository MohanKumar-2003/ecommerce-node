const mongoose=require('mongoose')

const Purchase=mongoose.Schema({
    productID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})
module.export=mongoose.model("Purchase",Purchase)