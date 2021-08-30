const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Evento = new Schema({
    titulo: {
        type: String,
        required: true
    },
    nome:{
        type: String,
        required: true
    },
    ativo:{
        type: Boolean,
        default:true
    },
    descricao: {
        type: String,
        required: true
    },
    inicio: {
        type: Date,
        required: true
    },
    final: {
        type: Date,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "categorias",
        required: true
    },
    local: {
        type: Schema.Types.ObjectId,
        ref: "locais",
        required: true
    },
    identificador: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    participantes:[{
        type: Schema.Types.ObjectId,
        ref: "usuarios",
        required: true
    }],
    chat:[{
        user:String,
        cont:String
    }],
    limeteParticipantes:{
        type:Number,
        required: true
    },
    atualParticipantes:{
        type:Number,
        default:0
    },
    data: {
        type: Date,
        default: Date.now()
    }
});

mongoose.model("eventos", Evento);