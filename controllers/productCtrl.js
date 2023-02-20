
const Products=require('../models/productModel')
class APIfeatures{
     constructor(query,queryString){
        this.query=query;
        this.queryString=queryString;
        
    }
     filtering(){
        const queryObj={...this.queryString}
        const excludedFields=['page','sort','limit']
        excludedFields.forEach(e1=>delete(queryObj[e1]))
        let queryStr=JSON.stringify(queryObj)
        
        queryStr=queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g,match=>"$"+match)
        this.query.find(JSON.parse(queryStr))
        return this;
    
     }
     sorting(){
        if(this.queryString.sort){
            const sortBy=this.queryString.sort.split(',').join(' ')
            this.query=this.query.sort(sortBy)
        }else{
            this.query=this.query.sort('-createdAt')
        }
        return this;
     }
     pagination(){
          const page=this.queryString.page*1||1
          const limit=this.queryString.limit*1||9
          const skip=(page-1)*limit;
          this.query=this.query.skip(skip).limit(limit)
          return this;
     }
}

const productCtrl={
    getProducts:async(req,res)=>{
        try{
            const features=new APIfeatures(Products.find(),req.query).filtering().sorting().pagination()
            const products=await features.query
            res.json({
                status:'success',
                result:products.length,
                products:products
            })
            // res.json(products)
        }
        catch(err){
            return res.status(500).json({msg:err.message})
        }
    },
    
    createProducts:async(req,res)=>{
        try{
            const {product_id,title,price,description,content,images,visited,category}=req.body
            if(!images) return res.status(400).json({msg:'No images uploaded'})
            const product=await Products.findOne({product_id})
            if(product)
               return res.status(400).json({msg:'the product already exists'})
            const newProduct=new Products({
                product_id,title:title.toLowerCase(),price,description,content,images,visited,category
            })
            await newProduct.save()
            res.json({msg:"Created a Product"})
        }
        catch(err){
            return res.status(500).json({msg:err.message})
        }
    },
    deleteProduct:async(req,res)=>{
        try{
         await Products.findByIdAndDelete(req.body.id)
         res.json({msg:"Deleted a Product"})
        }
        catch(err){
            return res.status(500).json({msg:err.message})
        }
    },
    updateProduct:async(req,res)=>{
        try{
            const {product_id,title,price,description,content,images,category,visited}=req.body;
            if(!images) return res.status(400).json({msg:"No Image Upload"})
            await Products.findOneAndUpdate({_id: req.params.id},{
                title:title.toLowerCase(),price,description,content,images,category,visited

            })
            res.json({msg:"Updated a Product"})
        }
        catch(err){
            return res.status(500).json({msg:err.message})
        }
    },
    incrementView:async(req,res) => {
        try {
            await Products.findOneAndUpdate({_id: req.params.id}, {
                $inc : { 'visited' : 1 }
            }).then(() => console.log("View incremented"))
            res.send()
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    createSome:async(req,res)=>{
        res.json({msg:"Hello"})
    }
    // incVisited:async(req,res)=>{
    //     const {product_id}=req.body;
    //     try{
    //      const product=await Products.findById(product_id)
    //      product.visited++;
    //      await product.save()
    //      console.log(product.visited)
    //     }
    //     catch(err){
    //         return res.status(500).json({msg:err.message})
    //     }
    // }
}
module.exports=productCtrl