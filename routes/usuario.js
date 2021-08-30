const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');

require("../models/Categoria")
const Categoria = mongoose.model('categorias')
require("../models/Postagem")
const Postagem = mongoose.model('postagens')
require("../models/Usuario")
const Usuario = mongoose.model('usuarios')

router.get('/registro', (req, res) => {
    var erros = []
    res.render("usuarios/registro", { erros: erros });
});

router.post('/registro', (req, res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "nome inválido" })
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "email inválido" })
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "senha inválido" })
    }
    if (req.body.senha.length < 4) {
        erros.push({ texto: "Senha muito pequena" })
    }
    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: "senha errada" })
    }

    if (erros.length > 0) {
        res.render("usuarios/registro", { erros: erros });
    } else {
        Usuario.findOne({ email: req.body.email }).lean().then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Já existe uma conta com este Email no nosso sistema")
                res.redirect('/usuarios/registro');
            } else {

                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    tipo: req.body.tipo,
                    senha: req.body.senha,
                    eAdmin:0
                })
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuario")
                            res.redirect('/');
                        }

                        novoUsuario.senha = hash;

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuario criado com sucesso!")
                            res.redirect('/usuarios/login');
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao criar o usuário, tente novamente!")
                            res.redirect('/usuarios/registro');
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "houve um erro interno")
            res.redirect('usuarios/login');
        })
    }
});

router.get('/login', (req, res) => {
    res.render('usuarios/login');
});

router.post('/login', (req, res, next) => {

    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
});

router.get('/logout', (req, res) => {
    req.logout()
    req.flash("success_msg", "Deslogado com Sucesso!")
     res.redirect('/');
});


module.exports = router;