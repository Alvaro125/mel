const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment');
require("../models/Categoria")
const Categoria = mongoose.model('categorias')
require("../models/Postagem")
const Postagem = mongoose.model('postagens')
require("../models/Local")
const Local = mongoose.model('locais')
require("../models/Usuario")
const Usuario = mongoose.model('usuarios')
require("../models/Evento")
const Evento = mongoose.model('eventos')
require("../models/Foto")
const Foto = mongoose.model('fotos')
const { Client } = require("../helpers/Client")

router.get('/', (req, res) => {
    Postagem.find().lean().populate("categoria").sort({ data: "desc" }).then((postagens) => {
        Usuario.find().lean().then((usuario) => {
            Foto.find().lean().then((fotos) => {
                Evento.find().lean().populate("categoria").populate("usuarios").populate("local").sort({ data: "desc" }).then((eventos) => {
                    // { "ativo": true }
                    eventos.forEach(evt => {
                        var i = evt.inicio
                        var f = evt.final
                        evt.inicio = moment(i).format("DD/MM/YYYY HH:mm")
                        evt.final = moment(f).format("DD/MM/YYYY HH:mm")
                        box = []
                        evt.participantes.forEach(a => {
                            box.push(a.toString())
                        })
                        evt.participantes = box
                    });
                    console.log(req.user)
                    res.render("index", { postagens: postagens, usuario: usuario, fotos: fotos, eventos: eventos });
                })
            })
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        console.log(err)
        res.redirect('/404')
    })
});

router.get('/404', (req, res) => {
    res.send("Erro 404");
});

router.get('/chat', Client, (req, res) => {
    Evento.find().lean().sort('nome').then((eventos) => {
        res.render('chat/chat', { eventos: eventos });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar Eventos!")
        res.redirect('/')
    })
});

router.get('/sala', Client, (req, res) => {
    res.render("chat/sala");
});
router.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({ slug: req.params.slug }).lean().then((postagem) => {
        if (postagem) {
            res.render("postagem/index", { postagem: postagem });
        } else {
            req.flash("error_msg", "Esta postagem não existe")
            res.redirect('/');
        }
    }).catch((err) => {
        req.flash("error_msg", "houve um erro interno")
        res.redirect('/');
    })
});

router.get('/categorias', (req, res) => {
    Categoria.find().lean().sort('nome').then((categorias) => {
        res.render("categorias/index", { categorias: categorias });
    }).catch((err) => {
        req.flash("error_msg", "houve um erro interno ao listar categorias")
        res.redirect('/');
    })
});

router.get('/categorias/:slug', Client, (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).lean().then((categoria) => {
        if (categoria) {
            Evento.find({ categoria: categoria._id }).populate('local').populate('categoria').lean().then((eventos) => {
                var erros = []
                eventos.forEach(evt => {
                    var i = evt.inicio
                    var f = evt.final
                    evt.inicio = moment(i).format("DD/MM/YYYY HH:mm")
                    evt.final = moment(f).format("DD/MM/YYYY HH:mm")
                    box = []
                    evt.participantes.forEach(a => {
                        box.push(a.toString())
                    })
                    evt.participantes = box
                });
                res.render('categorias/postagens', { eventos: eventos, categoria: categoria });
            }).catch((err) => {
                req.flash("error_msg", "houve um erro ao listar os eventos")
                res.redirect('/');
            })
        } else {
            req.flash("error_msg", "Esta categoria não existe")
            res.redirect('/');
        }
    }).catch((err) => {
        req.flash("error_msg", "houve um erro interno ao carregar pagina desta categoria")
        res.redirect('/');
    })
});

module.exports = router;