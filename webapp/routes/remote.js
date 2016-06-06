var express = require('express');
var router = express.Router();

router.get('/remote/channels/:roomid', isLoggedIn, function (req, res) {
    res.render('remote.jade', {
        title: 'Remote',
        user : req.user,
        room : req.session.returnRoom
    });
});

function isLoggedIn(req, res, next) {
    if (typeof req.params.roomid === "undefined") {
        req.session.returnRoom = 'default-room';
    } else {
        req.session.returnRoom = req.params.roomid;
    }
    console.log('Set the req.session.returnRoom at ' + req.session.returnRoom);
    if (req.isAuthenticated())
        return next();
    
    res.redirect('/');
}

module.exports = router;