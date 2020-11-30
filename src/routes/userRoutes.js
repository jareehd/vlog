const express = require('express')
const router = express.Router()
const User = require('../models/userModel')
const multer = require('multer')
const sharp = require('sharp')
const auth = require('./authRoutes')

router.get('/',(req,res)=>{
    res.send(' Welcome to vlog')
})

router.get('/users/me', auth , (req,res)=>{
    res.send(req.user)
})

router.post('/users', async (req,res)=>{
    try{
        const newUser = new User(req.body)
        await newUser.save()
        const token = await newUser.generateToken()
        res.send({newUser,token})
    }
    catch(e) {
        res.status(400).send()
    }
})

router.post('/users/login' ,async( req,res)=>{
    try{
        const user = await User.findByCredential(req.body.email,req.body.password)
        const token  = await user.generateToken()
        
        res.status(200).send({user,token})

    } catch(e){
        res.status(401).send(e)
    }
})

router.post('/users/logout', auth , async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token   // here token is field of token object in tokens array
        })
        await req.user.save()
        res.send()
    }catch(err){
        res.status(401).send(err)
    }
})

router.patch('/users' , auth , async (req,res)=>{
    const updates = Object.keys(req.body) 
    
    try{
        updates.forEach((update)=> req.user[update] = req.body[update])
        await req.user.save()
        res.send()
    }catch(e){
        res.status(401).send()
    }
})

router.delete('/users' , auth ,async (req,res)=>{
    try{
        await req.user.remove()
        res.send()
    }catch(e){
        res.status(400).send()
    }
})

// images related routes

const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error('Please upload an image'))
        }
        cb(undefined,true)
    }
})

router.patch('/users/avatar' , auth , upload.single('avatar') , async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({
        width:200,
        height:200
    }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send('success , ok')
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.delete('/users/avatar' ,auth , async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send('deleted')
})


module.exports = router