var express = require('express');
var router = express.Router();

var twitterRoutes = function (passport) {
    
    router.get('/auth/twitter', passport.authenticate('twitter'));
    
    router.get('/auth/twitter/callback', passport.authenticate('twitter', {
        successRedirect : '/player',
        failureRedirect : '/'
    }));
    return router;
};

module.exports = twitterRoutes;