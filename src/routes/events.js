const express = require('express');
const router = express.Router();
const passport = require('passport');
const appRootPath = require('app-root-path');
const db = require(appRootPath + '/db.js');
const config = require(appRootPath + '/config.js');
const multer = require(appRootPath + '/multer.js');
const co = require('co');
const errorHandler = require(appRootPath + '/errorHandler.js');

router.get('/', passport.authenticationMiddleware(), function (req, res) {
    db.getAllEvents()
        .then(function (events) {
            if (events) {
                res.render('events', {user: req.user, events: events});
            }
        })
        .catch(function (err) {
            errorHandler.serverError(err, req, res, 'Error getting events');
        });
});


router.get('/:id(\\d+)/', passport.authenticationMiddleware(), function (req, res) {
    db.getEventById(req.params.id)
        .then(function (event) {
            if (event) {
                res.render('event', {user: req.user, event: event[0]});
            }
        })
        .catch(function (err) {
            errorHandler.serverError(err, req, res, 'Error getting event');
        });
});

router.get('/createEvent', passport.authenticationMiddleware(), function (req, res) {
    db.getAllCities()
        .then(function (cities) {
            res.render('createEvent', {user: req.user, cities: cities.map((city) => { return city.name }) });
        })
        .catch(function (err) {
            errorHandler.serverError(err, req, res, 'Error gettings events');
        });     
});

router.post('/createEvent', passport.authenticationMiddleware(),
    multer.imageUpload.single('image'), function (req, res) {
    co(function* () {
        if (req.file) {
            db.createEvent(req.user.id, req.body.title, req.body.description, req.body.city, req.body.location, req.body.date, req.body.hour, config.media.public_destination + req.file.filename)
        } else {
            db.createEvent(req.user.id, req.body.title, req.body.description, req.body.city, req.body.location, req.body.date, req.body.hour)
        }
    }).then(() => {
            res.redirect('/');
        })
        .catch(function (err) {
            errorHandler.serverError(err, req, res, 'Error creating event');
        });
});

module.exports = router;