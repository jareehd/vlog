const express = require('express')
const router = express.Router()
const sharp = require('sharp')
const multer = require('multer')
const Vlog = require('../models/vlogModel')
const auth = require('./authRoutes')

router.get('/vlogs', auth , async(req,res)=>{
    try{
        await req.user.populate({
            path:'vlogs',
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip)
            }
        }).execPopulate()

        res.send(req.user.vlogs)
    }catch(e){
        res.status(400).send()
    }
})

router.get('/vlogs/:id', auth  , async(req,res)=>{
    try{    
        const vlog = await Vlog.findOne({_id:req.params.id,owner:req.user._id})
        if(!vlog) return res.status(400).send()
        res.send(vlog)
    }catch(e){
        res.status(400).send()
    }
})

router.post('/vlogs', auth , async (req,res)=>{
    try{
        const vlog = new Vlog({
            ...req.body,
            owner:req.user._id
        })
        await vlog.save()
        res.send(vlog)
    }catch(e){
        res.status(400).send()
    }
})

router.patch('/vlogs/:id', auth , async(req,res)=>{
    try{    
        const vlog = await Vlog.findOneAndUpdate(
            {_id:req.params.id,owner:req.user._id},
            req.body,
            {new:true ,runValidators:true}    
        ) 
        if(!vlog) return res.status(400).send()
        res.send()
    }catch(e){
        res.status(400).send()
    }
})

router.delete('/vlogs/:id', auth , async(req,res)=>{
    try{
        const vlog = await Vlog.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!vlog) res.status(400).send()
        res.send()
    }catch(e){
        res.status(400).send()
    }
})

// image related routes

const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error('Please upload a valid Image'))
        }
        cb(undefined,true)
    }
})

router.patch('/vlogs/:id/image', auth , upload.single('image') , async (req,res)=>{
    try{
    const buffer = await sharp(req.file.buffer)
                         .resize({width:250 , height:300}) .png() .toBuffer()
    const vlog = await Vlog.findOne({_id:req.params.id,owner:req.user._id})
    if(!vlog) return res.status(400).send()
    vlog.image = buffer
    await vlog.save()
    res.send()
    } catch(e){
        res.status(401).send()
    }
})

router.delete('/vlogs/:id/image',auth, async(req,res)=>{
    try{
        const vlog = await Vlog.findOne({_id:req.params.id,owner:req.user._id})
        if(!vlog) return res.status(400).send()
        vlog.image = undefined
        await vlog.save()
        res.send()
    } catch(e){
        res.status(400).send(e)
    }
})

module.exports = router