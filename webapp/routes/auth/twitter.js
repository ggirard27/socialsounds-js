var express = require('express');
var router = express.Router();

var twitterRoutes = function (passport) {
    
    router.get('/auth/twitter', passport.authenticate('twitter'));
    
    router.get('/auth/twitter/callback', passport.authenticate('twitter', {
        successRedirect : '/profile',
        failureFlash : true
        }), 
        function (req, res) {
        res.redirect('/player/rooms/' + req.session.returnRoom)
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

module.exports = twitterRoutes;