module.exports = {
    Client: function (req, res, next) {
        if (req.isAuthenticated() && req.user.eAdmin == 0 || req.user.eAdmin == 1) {
            return next();
        }

        req.flash("error_msg", "Você deve estar logado para entrar aqui")
        res.redirect('/');
    }
}