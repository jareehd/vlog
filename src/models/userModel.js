const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const Vlog = require('./vlogModel')

const userSchema = new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Please type a valid email Id')
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:8,
        trim:true
    },
    age:{
        type:Number,
        validate(value){
            if(value <0 ){
                throw new Error("Age can't be negative")
            }
        }
    },
    about:{
        type:String
    },
    avatar:{
        type:Buffer
    },
    tokens:[
        {
            token:{
                type:String
            }
        }
    ]
},{
    timestamps:true
})


userSchema.virtual('vlogs',{
    ref:'Vlog',
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}

// generate jwt token
userSchema.methods.generateToken = async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString()}, process.env.JWT_SECRET)
    user.tokens.push({token})
    await user.save()
    return token
}

// search user by email , password
userSchema.statics.findByCredential = async function(email ,password){
    
    const user = await User.findOne({email})
    if(!user) throw new Error('something is wrong either email or password')

    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch) throw new Error('something is wrong either email or password')

    return user
}

// we have to hash password before save
userSchema.pre('save', async function(next){
    const user = this
    if(user.isModified('password'))
     user.password = await bcrypt.hash(user.password ,8)
    next()
})

// Deleting all the vlogs related to user
userSchema.pre('remove', async function (next){
    const user = this
    await Vlog.deleteMany({owner:user._id})
    next()
})

const User = mongoose.model('User' , userSchema)

module.exports = User