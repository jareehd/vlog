const mongoose = require('mongoose')

const vlogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    image:{
        type:Buffer
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
},{
    timestamps:true
})


const Vlog = mongoose.model('Vlog',vlogSchema)

module.exports = Vlog