const express = require('express')
const mongoose =require('mongoose')
const userRoutes = require('./routes/userRoutes')
const vlogRoutes = require('./routes/vlogRoutes')
const authRoutes = require('./routes/authRoutes')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//  managing all middlewares
app.use(userRoutes)
app.use(vlogRoutes)
app.use('view engine','ejs')


// set database
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology : true,
    useCreateIndex : true,
    useFindAndModify:false
})

app.get('/*',(req,res)=>{
    res.render('error ,Wrong URL')
})

app.listen(process.env.PORT ,()=> console.log('Server is running on port ', process.env.PORT))