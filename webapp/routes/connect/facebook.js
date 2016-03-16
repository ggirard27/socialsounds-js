var express = require('express');
var router = express.Router();

var facebookConnectRoutes = function (passport) {
    
    router.get('/connect/facebook', passport.authorize('facebook', {
        scope : ['email']
    }));
    
    router.get('/connect/facebook/callback', passport.authorize('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
    }));
    return router;
};

module.exports = facebookConnectRoutes;