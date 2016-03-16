var express = require('express');
var router = express.Router();

var twitterConnectRoutes = function (passport) {
    
    router.get('/connect/twitter', passport.authorize('twitter'));
    
    router.get('/connect/twitter/callback', passport.authorize('twitter', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));
    return router;
};

module.exports = twitterConnectRoutes;