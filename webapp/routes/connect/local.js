var express = require('express');
var router = express.Router();

var localConnectRoutes = function (passport) {
    
    router.get('/connect/local', function(req, res) {
        res.render('connect/local', {
            message: res.locals.error_messages
        });
    });

    router.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect : '/profile',
        failureRedirect : '/connect/local',
        failureFlash : true
    }));
    return router;
};

module.exports = localConnectRoutes;