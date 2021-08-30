const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Usuario = new Schema({
    eAdmin: {
        type: Number,
        default: 0
    },
    local:{
        nome:String,
        email:String,
        senha:String,
        tipo:String
    },
    google:{
        id: String,
        token: String,
        email:String,
        nome:String
    },
    Isgoogle:{
        type:Boolean,
        default: false
    },
    Islocal:{
        type:Boolean,
        default: false
    }
})

mongoose.model("usuarios", Usuario)