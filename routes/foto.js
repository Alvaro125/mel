const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment');
formidable = require('formidable')
util = require('util')
fs = require('fs')
require("../models/Foto")
const Foto = mongoose.model('fotos')
const { Client } = require("../helpers/Client")

router.get('/user', Client, (req, res) => {
    var response = []
	Foto.find({},function (err, fotos) {
		fotos.forEach(function(foto) {
			response.push({
				criador : foto.criador,
				foto : 'data:image/jpeg;base64,'+foto.foto.toString('base64')
			})
        })
        res.json(response || '')
	})
})
router.get('/', Client, (req, res) => {
    Foto.find().lean().sort({ data: "desc" }).then((fotos) => {
        var erros = []
        res.render('fotos/index', { fotos: fotos, erros: erros, });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar fotos!")
        console.log(err)
        res.redirect('/')
    })
});

router.get('/painel', Client, (req, res) => {
    Foto.find({fotoid: req.user._id}).lean().sort({ data: "desc" }).then((fotos) => {
        res.render('fotos/painelfotos', { fotos: fotos });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar fotos!")
        res.redirect('/')
    })
});

router.get('/add', Client, (req, res) => {
    var erros = [];
    res.render("fotos/addfotos", {erros: erros});
});

router.post('/nova', Client, (req, res) => {

    var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
    var img = files.foto;

     	fs.readFile(img.path, function(err, data){
	     	Foto.create({
                titulo: fields.titulo,
                fotoid: req.user._id,
                criador: req.user.nome,
                foto: 'data:image/jpeg;base64,'+data.toString('base64'),
                // fotoid: req.user._id
	     	},function(err, user) {
	     		if(err){
                     error = err;
                     console.log(err)
	     			res.redirect('/fotos/#erro');	
	     		} 
	     		if(user){
	     			error = null;
	     			res.redirect('/fotos');	     		
	     		} 
	     	});

	    });
    });
    // var erros = [];
    // if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
    //     erros.push({
    //         texto: "titulo Inválido"
    //     });
    // }
    // if (!req.body.link || typeof req.body.link == undefined || req.body.link == null) {
    //     erros.push({
    //         texto: "Link Inválido"
    //     });
    // }
    // if (req.body.titulo.length < 2) {
    //     erros.push({
    //         texto: "titulo da categoria muito pequeno"
    //     });
    // }
    // if (erros.length > 0) {
    //     res.render("/add", { erros: erros });
    // }else{
    // const novaFoto = {
    //     titulo: req.body.titulo,
    //     foto: req.file.foto,
    //     criador: req.user.nome,
    //     idfoto: req.user._id
    // }
// }

//     new Foto(novaFoto).save().then(() => {
//         req.flash("success_msg", "foto criada com sucesso!")
//         res.redirect("/");
//     }).catch((err) => {
//         req.flash("error_msg", "Houve um erro ao salvar foto, tente novamente.")
//         console.log(err)
//         res.redirect('/');
//     });
});



router.get('/edit/:id', Client, (req, res) => {
    Foto.findOne({ _id: req.params.id }).lean().then((foto) => {
    var erros = [];
    res.render("fotos/editfotos", { foto: foto,erros: erros });
    }).catch((err) => {
        req.flash("error_msg", "foto não existe")
        res.redirect('/');
    });
});

router.post('/edit', Client, (req, res) => {
    Foto.findOne({ _id: req.body.id }).then((foto) => {

        foto.titulo = req.body.titulo
        foto.link = req.body.link

        foto.save().then(() => {
            var erros = [];
            if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
                erros.push({
                    texto: "titulo Inválido"
                });
            }
            if (!req.body.link || typeof req.body.link == undefined || req.body.link == null) {
                erros.push({
                    texto: "link Inválido"
                });
            }
            if (erros.length > 0) {
                res.render("/edit/:id", { erros: erros });
            }
            req.flash("success_msg", "foto editada com sucesso!")
            res.redirect('/');
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar edição da foto!")
            res.redirect('/');
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a foto!")
        res.redirect('/');
    })
});

router.post('/deletar', Client, (req, res) => {
    Foto.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "foto deletada com sucesso!")
        res.redirect('/');
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao Deletar a foto!")
        res.redirect('/');
    });

});
module.exports = router;
