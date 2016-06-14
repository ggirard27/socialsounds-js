var express = require('express');
var router = express.Router();

var googleConnectRoutes = function (passport) {
    
    router.get('/connect/google', passport.authorize('google', {
        scope : ['profile', 'email']
    }));
    
    router.get('/connect/google/callback', passport.authorize('google', {
        successRedirect : '/player/channels/',
        failureRedirect : '/'
    }));
    return router;
};

module.exports = googleConnectRoutes;