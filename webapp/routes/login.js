var express = require('express');
var router = express.Router();

var loginRoutes = function (passport) {
    
    router.get('/login', function (req, res) {
        res.render('login', {
            title: 'Login'
        });
    });
    
    router.post('/login', getRoomid, passport.authenticate('local-login', {
        failureRedirect : '/login',
        failureFlash : true
        }), 
        function (req, res) {
            res.redirect('/player/channels/' + req.session.returnRoom)
        }
    );
    return router;
    
    function getRoomid(req, res, next) {
        if (typeof(req.session.returnRoom) === "undefined") {
            req.session.returnRoom = 'default-room';
        } 
        console.log('Set the req.session.returnRoom at ' + req.session.returnRoom);
        return next();
    }
};

module.exports = loginRoutes;