var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var flash = require('express-flash');
var mongoose = require('mongoose');

var databaseConfig = require('./config/database');
mongoose.connect(databaseConfig.url);
require('./middlewares/passport')(passport);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// session
app.use(session({
    genid: function (req) {
        return require('crypto').randomBytes(48).toString('hex');
    },
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

// auth provider setup
app.use(passport.initialize());
app.use(passport.session());

// flash messages setup
app.use(flash());
app.use(require('./middlewares/flash.js'));


// routes files setup
var routes = require('./routes/index');
var login = require('./routes/login')(passport);
var logout = require('./routes/logout');
var signup = require('./routes/signup')(passport);
var profile = require('./routes/profile');
var facebookAuth = require('./routes/auth/facebook')(passport);
var googleAuth = require('./routes/auth/google')(passport);
var twitterAuth = require('./routes/auth/twitter')(passport);
var facebookConnect = require('./routes/connect/facebook')(passport);
var googleConnect = require('./routes/connect/google')(passport);
var localConnect = require('./routes/connect/local')(passport);
var twitterConnect = require('./routes/connect/twitter')(passport);


// routes
app.use('/', routes);

app.post('/login', login);
app.get('/login', login);
app.get('/logout', logout);
app.get('/profile', profile);
app.get('/signup', signup)
app.post('/signup', signup);
app.get('/auth/facebook', facebookAuth);
app.get('/auth/facebook/callback', facebookAuth);
app.get('/auth/google', googleAuth);
app.get('/auth/google/callback', googleAuth);
app.get('/auth/twitter', twitterAuth);
app.get('/auth/twitter/callback', twitterAuth);
app.get('/connect/facebook', facebookConnect);
app.get('/connect/facebook/callback', facebookConnect);
app.get('/connect/google', googleConnect);
app.get('/connect/google/callback', googleConnect);
app.get('/connect/local', localConnect);
app.get('/connect/local/callback', localConnect);
app.get('/connect/twitter', twitterConnect);
app.get('/connect/twitter/callback', twitterConnect);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();
    
    // if they aren't redirect them to the home page
    res.redirect('/');
}



module.exports = app;
