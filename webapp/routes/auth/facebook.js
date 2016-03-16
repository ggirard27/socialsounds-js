var express = require('express');
var router = express.Router();

var facebookRoutes = function (passport) {
    
    router.get('/auth/facebook', passport.authenticate('facebook', {
        scope : ['email']
    }));
    
    router.get('/auth/facebook/callback', passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
    }));
    return router;
};

module.exports = facebookRoutes;