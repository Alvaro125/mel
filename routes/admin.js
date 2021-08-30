const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require("../models/Categoria")
const Categoria = mongoose.model('categorias')
require("../models/Postagem")
const Postagem = mongoose.model('postagens')
require("../models/Local")
const Local = mongoose.model('locais')
require("../models/Evento")
const Evento = mongoose.model('eventos')
require("../models/Usuario")
const Usuario = mongoose.model('usuarios')
const {eAdmin} = require("../helpers/eAdmin")
const {News} = require("../helpers/News")

router.get('/', eAdmin, (req, res) => {
    res.render('admin/index');;
});

router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().lean().sort({ date: "desc" }).then((categorias) => {
    var erros = [];
    res.render("admin/categorias/categorias", { categorias: categorias,erros: erros })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar categorias")
        res.redirect('/admin');
    })
});

router.get('/categorias/add', eAdmin, (req, res) => {
    var erros = [];
    res.render("admin/categorias/addcategorias", {erros: erros});
});


router.post('/categorias/nova', eAdmin, (req, res) => {

    var erros = [];
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({
            texto: "Nome Inválido"
        });
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({
            texto: "Slug Inválido"
        });
    }
    if (req.body.nome.length < 2) {
        erros.push({
            texto: "Nome da categoria muito pequeno"
        });
    }
    if (erros.length > 0) {
        res.render("admin/categorias/addcategorias", { erros: erros });
    }

    const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
    }

    new Categoria(novaCategoria).save().then(() => {
        req.flash("success_msg", "Categoria criada com sucesso!")
        res.redirect("/admin/categorias");
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar categoria, tente novamente.")
        res.redirect('/admin');
    });
});

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
    var erros = [];
    res.render("admin/categorias/editcategorias", { categoria: categoria,erros: erros });
    }).catch((err) => {
        req.flash("error_msg", "Categoria não existe")
        res.redirect('/admin/categorias');
    });
});

router.post('/categorias/edit', eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            var erros = [];
            if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
                erros.push({
                    texto: "Nome Inválido"
                });
            }
            if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
                erros.push({
                    texto: "Slug Inválido"
                });
            }
            if (erros.length > 0) {
                res.render("admin/categorias/addcategorias", { erros: erros });
            }
            req.flash("success_msg", "Categoria editada com sucesso!")
            res.redirect('/admin/categorias');
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar edição da categoria!")
            res.redirect('/admin/categorias');
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria!")
        res.redirect('/admin/categorias');
    })
});

router.post('/categorias/deletar', eAdmin, (req, res) => {
    Categoria.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect('/admin/categorias');
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao Deletar a categoria!")
        res.redirect('/admin/categorias');
    });

});










router.get('/postagens', News, (req, res) => {
    Postagem.find().lean().populate("categoria").populate("local").sort({ data: "desc" }).then((postagens) => {
        var erros = []
        res.render('admin/postagens/postagens', { postagens: postagens, erros: erros });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar postagem!")
        res.redirect('/admin')
    })
});

router.get('/postagens/add', News, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        Local.find().lean().then((locais)=>{
            var erros = []
            res.render('admin/postagens/addpostagem', { categorias: categorias,locais:locais,erros: erros });
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar formulario!")
            res.redirect('/admin')
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar formulario!")
        res.redirect('/admin')
    })
});

router.post('/postagens/nova', News, (req, res) => {
    var erros = []

    if (req.body.categoria == "0") {
        erros.push({ texto: "Categoria invalida, registre uma categoria" })
    }
    if (erros.length > 0) {
        res.render('admin/postagens/addpostagem', { erros: erros });
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            local: req.body.local,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect('/admin/postagens');
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem!")
            console.log(err)
            res.redirect('/admin/postagens');
        })
    }
});

router.get('/postagens/edit/:id', News, (req, res) => {

    Postagem.findOne({ _id: req.params.id }).lean().then((postagem) => {

        Categoria.find().lean().then((categorias)=>{
            Local.find().lean().then((locais)=>{
                var erros=[]
                res.render('admin/postagens/editpostagem', {categorias:categorias,postagem:postagem,locais:locais,erros:erros});
            }).catch((err)=>{
                req.flash("error_msg", "Houve um erro ao listar Locais!")
                res.redirect('/admin/postagens');
            })
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao listar categorias!")
            res.redirect('/admin/postagens');
        })
        
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulario de edição")
        res.redirect('/admin/postagens');
    })

});

router.post('/postagens/edit', News, (req, res) => {
    Postagem.findOne({ _id: req.body.id }).then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.conteudo = req.body.conteudo
        postagem.descricao = req.body.descricao
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect('/admin/postagens');
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar edição da postagem!")
            res.redirect('/admin/postagens');
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a postagem!")
        res.redirect('/admin/postagens');
    })
});

router.post('/postagens/deletar', News, (req, res) => {
    Postagem.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect('/admin/postagens');
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao Deletar a postagem!")
        res.redirect('/admin/postagens');
    });

});













router.get('/locais', eAdmin, (req, res) => {
    Local.find().lean().sort({ date: "desc" }).then((locais) => {
        var erros=[]
        res.render("admin/locais/local", { locais: locais , erros:erros})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar locais")
        res.redirect('/admin');
    })
});

router.get('/locais/add', eAdmin, (req, res) => {
    var erros=[]
    res.render("admin/locais/addlocal", {erros: erros});
});


router.post('/locais/nova', eAdmin, (req, res) => {

    var erros = [];
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({
            texto: "Nome Inválido"
        });
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({
            texto: "Slug Inválido"
        });
    }
    if (req.body.nome.length < 2) {
        erros.push({
            texto: "Nome do Local muito pequeno"
        });
    }
    if (erros.length > 0) {
        res.render("admin/addlocal", { erros: erros });
    }

    const novoLocal = {
        nome: req.body.nome,
        slug: req.body.slug
    }

    new Local(novoLocal).save().then(() => {
        req.flash("success_msg", "Local criada com sucesso!")
        res.redirect("/admin/locais");
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar local, tente novamente.")
        res.redirect('/admin');
    });
});

router.get('/locais/edit/:id', eAdmin, (req, res) => {
    Local.findOne({ _id: req.params.id }).lean().then((local) => {
        var erros=[]
        res.render("admin/locais/editlocal", { local: local , erros: erros});
    }).catch((err) => {
        req.flash("error_msg", "Local não existe")
        res.redirect('/admin/locais');
    });
});

router.post('/locais/edit', eAdmin, (req, res) => {
    Local.findOne({ _id: req.body.id }).then((local) => {

        local.nome = req.body.nome
        local.slug = req.body.slug

        local.save().then(() => {
            var erros = [];
            if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
                erros.push({
                    texto: "Nome Inválido"
                });
            }
            if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
                erros.push({
                    texto: "Slug Inválido"
                });
            }
            if (erros.length > 0) {
                res.render("admin/locais/addlocal", { erros: erros });
            }
            req.flash("success_msg", "Local editada com sucesso!")
            res.redirect('/admin/locais');
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar edição do local!")
            res.redirect('/admin/locais');
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar o local!")
        res.redirect('/admin/locais');
    })
});

router.post('/locais/deletar', eAdmin, (req, res) => {
    Local.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Local deletado com sucesso!")
        res.redirect('/admin/locais');
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao Deletar o local!")
        res.redirect('/admin/locais');
    });

});














router.get('/eventos', eAdmin, (req, res) => {
    Evento.find().lean().populate("categoria").populate("local").sort({ data: "desc" }).then((eventos) => {
        var erros=[]
        res.render('admin/eventos/evento', { eventos: eventos , erros:erros});
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar Eventos!")
        res.redirect('/admin')
    })
});

router.get('/eventos/add', eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        Local.find().lean().then((locais) => {
            var erros=[]
            res.render('admin/eventos/addevento', { categorias: categorias, locais: locais, erros: erros });
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar formulario!")
            res.redirect('/admin')
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar formulario!")
        res.redirect('/')
    })
});

router.post('/eventos/nova', eAdmin, (req, res) => {
    var erros = []

    if (req.body.categoria == "0") {
        erros.push({ texto: "Categoria invalida, registre uma categoria" })
    }
    if (req.body.local == "0") {
        erros.push({ texto: "Localidade invalida, registre uma categoria" })
    }
    if (erros.length > 0) {
        res.render('admin/eventos/addevento', { erros: erros });
    } else {
        const novoEvento = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            nome: req.body.nome,
            horaInicial: req.body.horaInicial,
            horaFinal: req.body.horaFinal,
            categoria: req.body.categoria,
            local: req.body.local,
            identificador: req.user.id
        }

        new Evento(novoEvento).save().then(() => {
            req.flash("success_msg", "Evento criada com sucesso!")
            res.redirect('/admin/eventos');
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem!")
            console.log(err)
            res.redirect('/admin/eventos');
        })
    }
});

router.get('/eventos/edit/:id', eAdmin, (req, res) => {

    Evento.findOne({ _id: req.params.id }).lean().then((evento) => {

        Categoria.find().lean().then((categorias) => {
            Local.find().lean().then((locais) => {
                var erros=[]
                res.render('admin/eventos/editevento', { categorias: categorias, locais: locais, evento: evento, erros: erros });
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao listar locais!")
                res.redirect('/admin/eventos');
            })

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar categorias!")
            res.redirect('/admin/eventos');
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulario de edição")
        res.redirect('/admin/eventos');
    })

})

router.post('/eventos/edit', eAdmin, (req, res) => {
    Evento.findOne({ _id: req.body.id }).then((evento) => {

        evento.titulo = req.body.titulo
        evento.nome = req.body.nome
        evento.horaFinal = req.body.horaFinal
        evento.horaInicial = req.body.horaInicial
        evento.descricao = req.body.descricao
        evento.categoria = req.body.categoria
        evento.local = req.body.local

        evento.save().then(() => {
            req.flash("success_msg", "Evento editada com sucesso!")
            res.redirect('/admin/eventos');
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar edição do evento!")
            console.log(err)
            res.redirect('/admin/eventos');
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar o evento!")
        console.log(err)
        res.redirect('/admin/eventos');
    })
});

router.post('/eventos/deletar', eAdmin, (req, res) => {
    Evento.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Evento deletada com sucesso!")
        res.redirect('/admin/eventos');
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao Deletar a evento!")
        res.redirect('/admin/eventos');
    });
});










router.get('/contas', eAdmin, (req, res) => {
    Usuario.find().lean().then((usuarios) => {
        res.render('admin/usuarios/usuario', { usuarios: usuarios });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar usuarios!")
        res.redirect('/admin')
    })
});

router.post('/contas/deletar', eAdmin, (req, res) => {
    Usuario.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Conta deletada com sucesso!")
        res.redirect('/admin/contas');
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao Deletar a Conta!")
        res.redirect('/admin/contas');
    });
});

router.post('/contas/client', eAdmin, (req, res) => {
    Usuario.findOne({ _id: req.body.idc }).then((usuarioc) => {
        usuarioc.eAdmin = 0

        usuarioc.save().then(() => {
            req.flash("success_msg", "Usuario se tornou cliente com sucesso!")
            res.redirect('/admin/contas');
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar edição do usuario!")
            console.log(err)
            res.redirect('/admin/contas');
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao Deletar a Conta!")
        console.log(err)
        res.redirect('/admin/contas');
    });
});

router.post('/contas/admin', eAdmin, (req, res) => {
    Usuario.findOne({ _id: req.body.ida }).then((usuario) => {
        usuario.eAdmin = 1

        usuario.save().then(() => {
            req.flash("success_msg", "Usuario se tornou admin com sucesso!")
            res.redirect('/admin/contas');
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar edição do usuario!")
            console.log(err)
            res.redirect('/admin/contas');
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao Deletar a Conta!")
        console.log(err)
        res.redirect('/admin/contas');
    });
});
router.post('/contas/news', eAdmin, (req, res) => {
    Usuario.findOne({ _id: req.body.idn }).then((usuario) => {
        usuario.eAdmin = 2

        usuario.save().then(() => {
            req.flash("success_msg", "Usuario se tornou admin com sucesso!")
            res.redirect('/admin/contas');
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar edição do usuario!")
            console.log(err)
            res.redirect('/admin/contas');
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao Deletar a Conta!")
        console.log(err)
        res.redirect('/admin/contas');
    });
});
module.exports = router;