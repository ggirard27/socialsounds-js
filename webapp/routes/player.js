var express = require('express');
var router = express.Router();

router.get('/player/rooms/:roomid', isLoggedIn, function (req, res) {
    res.render('player.jade', {
        title: 'Player',
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