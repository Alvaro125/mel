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

router.get('/painel', Client, (req, res) => {
    Evento.find({ identificador: req.user._id }).lean().populate("categoria").populate("usuarios").populate("local").sort({ data: "desc" }).then((eventos) => {
        eventos.forEach(evt => {
            var i = evt.inicio
            var f = evt.final
            evt.inicio = moment(i).format("DD/MM/YYYY HH:mm")
            evt.final = moment(f).format("DD/MM/YYYY HH:mm")
        });
        res.render('eventos/painelevento', { eventos: eventos });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar Eventos!")
        res.redirect('/')
    })
});


router.get('/', Client, (req, res) => {
    Evento.find().lean().populate("categoria").populate("local").sort({ data: "desc" }).then((eventos) => {
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
        res.render('eventos/evento', { eventos: eventos, erros: erros, });

        let current = moment().subtract(1, 'days');
        current = moment.utc(current).format();
        Evento.update({ final: { $lte: current } }, { "ativo": false }, { safe: true, multi: true }, function (err, obj) {
            console.log(err)
        });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar Eventos!")
        console.log(err)
        res.redirect('/')
    })
});

router.get('/add', Client, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        Local.find().lean().then((locais) => {
            var erros = []
            res.render('eventos/addevento', { categorias: categorias, locais: locais, erros: erros });
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar formulario!")
            res.redirect('/')
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar formulario!")
        res.redirect('/')
    })
});

router.post('/nova', Client, (req, res) => {
    var erros = []

    if (req.body.categoria == "0") {
        erros.push({ texto: "Categoria invalida, registre uma categoria" })
    }
    if (req.body.local == "0") {
        erros.push({ texto: "Localidade invalida, registre uma categoria" })
    }
    if (erros.length > 0) {
        res.render('eventos/addevento', { erros: erros });
    } else {
        if (req.user.Islocal) {
            var username = req.user.local.nome
        }
        if (req.user.Isgoogle) {
            var username = req.user.google.nome
        }
        const novoEvento = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            nome: username,
            inicio: req.body.inicio,
            final: req.body.final,
            categoria: req.body.categoria,
            local: req.body.local,
            ativo: true,
            limeteParticipantes: req.body.limeteParticipantes,
            identificador: req.user.id
        }

        new Evento(novoEvento).save().then(() => {
            req.flash("success_msg", "Evento criada com sucesso!")
            res.redirect('/eventos');
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem!")
            console.log(err)
            res.redirect('/eventos');
        })
    }
});

router.get('/edit/:id', Client, (req, res) => {

    Evento.findOne({ _id: req.params.id }).lean().then((evento) => {


        Categoria.find().lean().then((categorias) => {
            Local.find().lean().then((locais) => {
                var i = evento.inicio
                var f = evento.final
                evento.inicio = moment(i).format("YYYY-MM-DDTHH:mm")
                evento.final = moment(f).format("YYYY-MM-DDTHH:mm")
                var erros = []
                res.render('eventos/editevento', { categorias: categorias, locais: locais, evento: evento, erros: erros });
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao listar locais!")
                res.redirect('/eventos');
            })

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar categorias!")
            res.redirect('/eventos');
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulario de edição")
        res.redirect('/eventos');
    })

})

router.post('/edit', Client, (req, res) => {
    Evento.findOne({ _id: req.body.id }).then((evento) => {

        evento.titulo = req.body.titulo
        evento.final = req.body.final
        evento.inicio = req.body.inicio
        evento.descricao = req.body.descricao
        evento.categoria = req.body.categoria
        evento.local = req.body.local

        evento.save().then(() => {
            req.flash("success_msg", "Evento editada com sucesso!")
            res.redirect('/eventos');
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar edição do evento!")
            console.log(err)
            res.redirect('/eventos');
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar o evento!")
        console.log(err)
        res.redirect('/eventos');
    })
});

router.post('/deletar', Client, (req, res) => {
    Evento.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Evento deletada com sucesso!")
        res.redirect('/eventos');
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao Deletar a evento!")
        res.redirect('/eventos');
    });

});
router.post('/participar', Client, (req, res) => {
    Evento.findOne({ _id: req.body.id }).then((evento) => {
        evento.participantes.push(req.user._id)
        evento.atualParticipantes += 1

        evento.save().then(() => {
            req.flash("success_msg", "cadastro de participação com sucesso!")
            res.redirect('/eventos');
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar participação do evento!")
            console.log(err)
            res.redirect('/eventos');
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao participar do evento!")
        console.log(err)
        res.redirect('/eventos');
    })

});
router.post('/sair', Client, (req, res) => {
    Evento.update({ _id: req.body.idsair }, { "$pull": { "participantes": req.user.id } }, { safe: true, multi: true }, function (err, obj) {
        console.log(err)
    });
    Evento.findOne({ _id: req.body.idsair }).then((evento) => {

        // var i = evento.idParticipantes.indexOf({id:req.user._id})
        // evento.participantes = evento.participantes.splice(i, 1)
        // evento.idParticipantes = evento.idParticipantes.splice(i, 1)
        // evento.atualParticipantes -= 1

        // evento.idParticipantes.pull({id: req.user._id})
        // evento.participantes.pull({nome:req.user.nome})
        evento.atualParticipantes -= 1

        evento.save().then(() => {
            req.flash("success_msg", "cadastro de participação com sucesso!")
            res.redirect('/eventos');
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar participação do evento!")
            console.log(err)
            res.redirect('/eventos');
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao participar do evento!")
        console.log(err)
        res.redirect('/eventos');
    })

});

module.exports = router;