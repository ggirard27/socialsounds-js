var express = require('express');
var router = express.Router();

var signupRoutes = function (passport) {

    router.get('/signup', function (req, res) {
        res.render('signup', {
            title: 'Signup'
        });
    });
    
    router.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/player',
        failureRedirect : '/signup',
        failureFlash : true
    }));
    return router;
};

module.exports = signupRoutes;