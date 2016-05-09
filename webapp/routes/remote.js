var express = require('express');
var router = express.Router();

router.get('/remote', isLoggedIn, function (req, res) {
    res.render('remote.jade', {
        title: 'Remote',
        user : req.user
    });
});

function isLoggedIn(req, res, next) {
    
    if (req.isAuthenticated())
        return next();
    
    res.redirect('/');
}

module.exports = router;