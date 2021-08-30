const http = require('http');
const path = require('path');
const express = require('express');
const app = express();
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio.listen(server);

const crypto =  require('crypto');
const multer  = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
var Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const formidable = require('formidable');
util = require('util')
const fs = require('fs');

const admin = require('./routes/admin')
const home = require('./routes/home')
const usuario = require('./routes/usuario')
const foto = require('./routes/foto')
const evento = require('./routes/evento')

var bodyParser = require('body-parser')
const bcrypt = require('bcryptjs');
const moment = require('moment');
const mongoose= require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
require("./config/auth")(passport)
// Configurações
    // Sessão
        app.use(session({
            secret: 'password',
            resave: false,
            saveUninitialized: true
        }))

        app.use(passport.initialize());
        app.use(passport.session());

        app.use(flash());
    // Middleware
        app.use((req,res,next)=>{
            res.locals.success_msg = req.flash("success_msg");
            res.locals.error_msg = req.flash("error_msg");
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null;
            next();
        });
    // Body-Parse
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
    // ejs
        app.engine('html', require('ejs').renderFile);
        app.set('views', __dirname + '/views');
        app.set('view engine', 'ejs');
    // mongoose
    //mongodb://452db352e428a404e8e4cffd22a81af7:password@9a.mongo.evennode.com:27017,9b.mongo.evennode.com:27017/452db352e428a404e8e4cffd22a81af7?replicaSet=eu-9
     //mongodb+srv://melon:melonline@cluster0.3curh.mongodb.net/test?retryWrites=true&w=majority   
    mongoose.connect("mongodb+srv://alvaro:tTUBfx4QwDrzpmV@cluster0.oycw3.mongodb.net/mel?retryWrites=true&w=majority").then(() => {
            console.log("Conectado ao mongoDB...");
        }).catch((err) => {
            console.log("Erro ao se conectar:"+err);
        });
        // mongoose.connect("mongodb://localhost/test").then(() => {
        //     console.log("Conectado ao mongoDB...");
        // }).catch((err) => {
        //     console.log("Erro ao se conectar:"+err);
        // });
    // Public
        app.use(express.static(path.join(__dirname,"public")));

        app.use((req,res,next)=>{
            console.log("Oi eu sou um middleware!")
            
            next();
        });
// ROTAS
    app.use('/', home);

    app.use('/usuarios', usuario);

    app.use('/admin', admin);

    app.use('/fotos', foto);

    app.use('/eventos', evento);
// Outros
app.set('port', process.env.PORT || 3000);
  require('./config/sockets')(io);

  server.listen(app.get('port'), () => {
    console.log('server on port ', app.get('port'));
   });

//  const PORT = 3000
//  app.listen(PORT,() => {
//      console.log('O servidor rodando...', );
//  });