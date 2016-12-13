const express = require('express');
const router = express.Router();
const passport = require('passport');
const appRootPath = require('app-root-path');
const db = require(appRootPath + '/db.js');
const utils = require(appRootPath + '/utils.js');
const co = require('co');
const multer = require(appRootPath + '/multer.js');
const config = require(appRootPath + '/config.js');
const errorHandler = require(appRootPath + '/errorHandler.js');

router.get('/', function (req, res) {
    res.render('index', { user: req.user });
});

router.get('/chat', function (req, res) {
    res.render('chat', { user: req.user });
});

router.post('/signup', multer.imageUpload.single('image'), function (req, res) {
    co(function* () {
        var user = yield db.getUserByName(req.body.username);
        if (user) {
            res.render('error', { //TODO: Handle this error properly
                message: 'User name already in use',
                error: { status: 400 }
            });
        } else {
            if (req.file) {
                var image = config.media.public_destination + req.file.filename;
                yield db.createUser(req.body.username, req.body.password, req.body.age, req.body.gender, req.body.email, image);
            } else {
                yield db.createUser(req.body.username, req.body.password, req.body.age, req.body.gender, req.body.email);
            }
        }
    }).then(() => {
        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    }).catch(function (err) {
        errorHandler.serverError(err, req, res, 'Error during user sign up');
    });
});

router.get('/auth/facebook',
    passport.authenticate('facebook'),
    function (req, res) {}
);

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/error' }),
    function (req, res) {
        res.redirect('/');
});

router.get('/auth/twitter',
    passport.authenticate('twitter'),
    function(req, res){}
);

router.get('/auth/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/error' }),
    function(req, res) {
        res.redirect('/');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/error'
}));

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/profile', passport.authenticationMiddleware(),
    multer.imageUpload.single("image"), function (req,res) {
        if (!req.user){
            res.render('error', {
                message: 'Unknown user',
                error: { status: 400 }
            });
        }
        db.getUserByName(req.user.username).then(function (user) {
            user.image =
            res.render('profile', {user:user});
        }).catch(function (err) {
            res.render('error', {
                message: 'Unable to render user profile',
                log: err,
                error: { status: 400 }
            });
        })
});

router.post('/profile', passport.authenticationMiddleware(),
    multer.imageUpload.single("image"), function (req,res) {
        if (!req.user){
            res.render('error', {
                message: 'Unknown user',
                error: { status: 400 }
            });
        }
        var image = req.file ? config.media.public_destination + req.file.filename : null;

        db.modifyUserByIDIfDefined(req.user.id, req.body.password, req.body.age,
            req.body.gender, req.body.email, image).then(function () {
            req.flash('success', 'Your profile was updated');
            return res.redirect('/profile');
        }).catch(function (err) {
            return errorHandler.serverError(err, req, res, 'User was not modified');
        })
    });

module.exports = router;
