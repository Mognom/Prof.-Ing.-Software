const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const multer = require('multer');
const express = require('express')
const passport = require('passport')
const session = require('express-session')
const appRootPath = require('app-root-path');
const db = require(appRootPath + '/db.js');
const authentication = require(appRootPath + '/authentication.js')
const config = require(appRootPath + '/config.js')
const errorHandler = require(appRootPath + '/errorHandler.js');
const flash = require('connect-flash');
const app = express()

app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(function(req, res, next){
    res.locals.success = req.flash('success');
    res.locals.errors = req.flash('error');
    next();
});

app.use(passport.initialize());
app.use(passport.session());

authentication.init(app);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));
app.use('/events', require('./routes/events'), express.static(path.join(__dirname, 'public')));
app.use('/api/events', require('./routes/api/events'));
app.use('/api/cities', require('./routes/api/cities'));
app.use('/api/user', require('./routes/api/user'));

errorHandler.init(app);

db.init(function (err) {
    if (err) {
        console.log("Error loading db", err);
    }
});

module.exports = app;
