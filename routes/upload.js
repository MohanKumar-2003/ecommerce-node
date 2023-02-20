const router=require('express').Router()
const cloudinary=require('cloudinary')
const auth=require('../middleware/auth')
const authAdmin=require('../middleware/authAdmin')
const fs=require('fs')
const Products = require("../models/productModel")

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET,
})
router.post('/upload',auth,authAdmin,(req,res)=>{
    try{
        if(!req.files || Object.keys(req.files).length===0)
           return res.status(400).send("No files are Uploaded")
        const file=req.files.file;
        if(file.size>1024*1024) {
            removeTmp(file.tempFilePath)
            return res.status(400).json({msg:"Size too large"})}
        if(file.mimetype!=="image/jpeg" && file.mimetype!=='image/png'){
            removeTmp(file.tempFilePath)
        return res.status(400).json({msg:"File format is incorrect"})}
        cloudinary.v2.uploader.upload(file.tempFilePath,{folder:"test"},async(err,result)=>{
            if(err) throw err;
            removeTmp(file.tempFilePath)
            return res.json({public_id:result.public_id,url:result.secure_url})
        })
    }
    catch(err){
        res.status(500).json({msg:err.message})
    }
})
router.post('/destroy',auth,authAdmin,async(req,res)=>{
    try{
        const {id}=req.body;
        if(!id) return res.status(400).json({msg:"No images selected"})
        
        // cloudinary.v2.uploader.destroy(id,async(err,result)=>{
        //     if(err) throw err;
              
        
        // })
        await Products.findByIdAndDelete(id)
        res.json({msg:"Deleted a Product"})

    }
    catch(err){
        res.status(500).json({msg:err.message})
    }
})
router.post('/destroyPhoto',auth,authAdmin,async(req,res)=>{
    try{
      const {public_id}=req.body
      console.log(public_id)
      cloudinary.v2.uploader.destroy(public_id,async(err,result)=>{
            if(err) throw err;
            res.json({msg:"Deleted"})
        
        })
    }
    catch(err){
           if(err) res.status(500).json(err)
    }
})
const removeTmp=(path)=>{
     fs.unlink(path,err=>{
        if(err) throw err;
     })
}
module.exports=router