const localStrategy = require("passport-local").Strategy
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

require("../models/Usuario")
const Usuario = mongoose.model('usuarios')

module.exports = function (passport) {
    passport.use(new localStrategy({ usernameField: 'email', passwordField: "senha" }, (email, senha, done) => {

        Usuario.findOne({ 'local.email': email}).then((usuario) => {
            if (!usuario) {
                return done(null, false, { message: "Esta conta não existe" })
            }
            bcrypt.compare(senha, usuario.local.senha, (erro, batem) => {
                if (batem) {
                    return done(null, usuario)
                } else {
                    return done(null, false, { message: "senha incorreta" })
                }
            })
        })

    }));
    passport.use(new GoogleStrategy({

        clientID: '983255394790-g29nn8lajmj1vb4vr9jcgkr4audfm8tr.apps.googleusercontent.com',
        clientSecret: 'K-2e9_SV9k8pN8ck92KHHun3',
        callbackURL: 'https://melonline.herokuapp.com/usuarios/auth/google/callback',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
        function (req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function () {

                // check if the user is already logged in
                if (!req.user) {

                    Usuario.findOne({ 'google.id': profile.id }, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.google.token) {
                                user.google.token = token;
                                user.google.nome = profile.displayName;
                                user.google.email = profile.emails[0].value; // pull the first email

                                user.save(function (err) {
                                    if (err)
                                        throw err;
                                    return done(null, user);
                                });
                            }

                            return done(null, user);
                        } else {
                            var newUser = new Usuario();

                            newUser.google.id = profile.id;
                            newUser.google.token = token;
                            newUser.google.nome = profile.displayName;
                            newUser.google.email = profile.emails[0].value; // pull the first email
                            newUser.Isgoogle = true; // pull the first email


                            newUser.save(function (err) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session

                    user.google.id = profile.id;
                    user.google.token = token;
                    user.google.nome = profile.displayName;
                    user.google.email = profile.emails[0].value; // pull the first email

                    user.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, user);
                    });

                }

            });

        }));

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })

    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, usuario) => {
            done(err, usuario)
        })
    })
}
