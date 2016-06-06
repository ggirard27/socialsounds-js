var express = require('express');
var router = express.Router();

var googleRoutes = function (passport) {
    
    router.get('/auth/google', passport.authenticate('google', {
        scope : ['profile', 'email']
    }));
    
    router.get('/auth/google/callback', getRoomid,  passport.authenticate('google', {
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
            req.session.returnRoom = 'default-room';
        }
        console.log('Set the req.session.returnRoom at ' + req.session.returnRoom);
        return next();
    }
};

module.exports = googleRoutes;