module.exports = {
    News: function (req, res, next) {
        if (req.isAuthenticated() && req.user.eAdmin == 2 || req.user.eAdmin == 1) {
            return next();
        }

        req.flash("error_msg", "Você deve estar logado para entrar aqui")
        res.redirect('/');
    }
}