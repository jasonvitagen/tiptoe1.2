var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var homeRoutes = require('./routes/home');

var app = express();
 
var favicon = require('serve-favicon'); 

// passport dependencies
var session  = require('express-session');
var passport = require('passport');
var flash    = require('connect-flash');
var mongoose = require('mongoose');

// passport setup
require('./config/passport.js')(passport);
mongoose.connect('mongodb://localhost:27017/tiptoe2');
var authRoutes = require('./routes/authRoutes.js')(passport);


// ejs view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// passport middlewares setup
app.use(session({secret : 'iLoveAnn'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', routes);
app.use('/users', users);
app.use('/auth', authRoutes);

// routes
app.use('/home', homeRoutes); // home

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
