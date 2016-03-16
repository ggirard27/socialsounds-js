var express = require('express');
var router = express.Router();

var googleRoutes = function (passport) {
    
    router.get('/auth/google', passport.authenticate('google', {
        scope : ['profile', 'email']
    }));
    
    router.get('/auth/google/callback', passport.authenticate('google', {
        successRedirect : '/player',
        failureRedirect : '/'
    }));
    return router;
};

module.exports = googleRoutes;