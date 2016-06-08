var express = require('express');
var router = express.Router();

var twitterRoutes = function (passport) {
    
    router.get('/auth/twitter', passport.authenticate('twitter'));
    
    router.get('/auth/twitter/callback', getRoomid,  passport.authenticate('twitter', {
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

module.exports = twitterRoutes;