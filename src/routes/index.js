const express = require('express');
const router = express.Router();
const passport = require('passport');
const appRootPath = require('app-root-path');
const db = require(appRootPath + '/db.js');
const utils = require(appRootPath + '/utils.js');
const co = require('co');
const multer = require(appRootPath + '/multer.js');
const errorHandler = require(appRootPath + '/errorHandler.js');

router.get('/', function (req, res) {
    res.render('index', { user: req.user });
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
                yield db.createUser(req.body.username, req.body.password, req.body.age, req.body.gender, req.body.email, req.file.filename);
            } else {
                yield db.createUser(req.body.username, req.body.password, req.body.age, req.body.gender, req.body.email, undefined);
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

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/error'
}));

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;