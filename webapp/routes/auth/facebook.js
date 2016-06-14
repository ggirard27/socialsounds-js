var express = require('express');
var router = express.Router();

var facebookRoutes = function (passport) {
    
    router.get('/auth/facebook', passport.authenticate('facebook', {
        scope : ['email']
    }));
    
    router.get('/auth/facebook/callback', getRoomid, passport.authenticate('facebook', {
        failureRedirect : '/',
        failureFlash : true
        }), 
        function (req, res) {
            res.redirect('/player/channels/' + req.session.returnRoom)
        }
    );
    return router;
    
    function getRoomid(req, res, next) {
        if (typeof (req.session.returnRoom) === "undefined") {
            req.session.returnRoom = 'Home-channel';
        }
        console.log('Set the req.session.returnRoom at ' + req.session.returnRoom);
        return next();
    }
};

module.exports = facebookRoutes;