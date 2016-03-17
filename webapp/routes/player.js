var express = require('express');
var router = express.Router();

router.get('/player', isLoggedIn, function (req, res) {
    res.render('player.jade', {
        title: 'Player',
        user : req.user
    });
});

function isLoggedIn(req, res, next) {
    
    if (req.isAuthenticated())
        return next();
    
    res.redirect('/');
}

module.exports = router;