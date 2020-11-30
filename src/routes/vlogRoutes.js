const express = require('express')
const router = express.Router()
const Vlog = require('../models/vlogModel')

router.get('/vlogs', async(req,res)=>{
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

router.get('/vlogs/:id', async(req,res)=>{
    try{    
        const vlog = await Vlog.findOne({_id:req.params.id,owner:req.user._id})
        if(!vlog) return res.status(400).send()
        res.send(vlog)
    }catch(e){
        res.status(400).send()
    }
})

router.post('/vlogs', async (req,res)=>{
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

router.patch('/vlogs/:id', async(req,res)=>{
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

router.delete('/vlogs/:id', async(req,res)=>{
    try{
        const vlog = await Vlog.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!vlog) res.status(400).send()
        res.send()
    }catch(e){
        res.status(400).send()
    }
})

module.exports = router