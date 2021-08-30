const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Foto = new Schema({
    titulo:{
        type:String,
        required:true
    },
    foto:{
        type:Buffer
    },
    criador:{
        type:String,
        required:true
    },
    fotoid:{
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    data:{
        type:Date,
        default:Date.now()
    }
})

mongoose.model('fotos', Foto)