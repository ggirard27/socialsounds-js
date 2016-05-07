var express = require('express');
var router = express.Router();

var loginRoutes = function (passport) {
    
    router.get('/login', function (req, res) {
        res.render('login', {
            title: 'Login'
        });
    });
    
    router.post('/login', passport.authenticate('local-login', {
        successRedirect : '/player',
        failureRedirect : '/login',
        failureFlash : true
    }));
    return router;
};

module.exports = loginRoutes;