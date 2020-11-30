const express = require('express')
const router = express.Router()
const User = require('../models/userModel')
const multer = require('multer')

router.get('/',(req,res)=>{
    res.send(' Welcome to vlog')
})

router.get('/users/me', (req,res)=>{
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

router.post('/users/login' ,async(req,res)=>{
    try{
        const user = await User.findByCredential(req.body.email,req.body.password)
        const token  = await user.generateAuthToken()
        
        res.status(200).send({user,token})

    } catch(e){
        res.status(401).send(e)
    }
})

router.post('/users/logout', async(req,res)=>{
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

router.patch('/users' , async (req,res)=>{
    const updates = Object.keys(req.body) 
    
    try{
        updates.forEach((update)=> req.user[update] = req.body[update])
        await req.user.save()
        res.send()
    }catch(e){
        res.status(401).send()
    }
})

router.delete('/users' , async (req,res)=>{
    try{
        await req.user.remove()
        res.send()
    }catch(e){
        res.status(400).send()
    }
})

module.exports = router