const express = require('express');
const router = express.Router();
const passport = require('passport');
const appRootPath = require('app-root-path');
const db = require(appRootPath + '/db.js');
const multer = require(appRootPath + '/multer.js');
const co = require('co');
const errorHandler = require(appRootPath + '/errorHandler.js');

router.get('/', passport.authenticationMiddleware(), function (req, res) {
    db.getAllEvents()
        .then(function (events) {
            if (events) {
                res.render('events', {events: events});
            }
        })
        .catch(function (err) {
            errorHandler.serverError(err, req, res, 'Error gettings events');
        });
});

router.get('/createEvent', passport.authenticationMiddleware(), function (req, res) {
    db.getAllCities()
        .then(function (cities) {
            res.render('createEvent', { cities: cities.map((city) => { return city.name }) });
        })
        .catch(function (err) {
            errorHandler.serverError(err, req, res, 'Error gettings events');
        });     
});

router.post('/createEvent', multer.imageUpload.single('image'),
    passport.authenticationMiddleware(), function (req, res) {
	(function* () {
		if (req.file) {
			db.createEvent(req.user.id, req.body.title, req.body.description, req.body.city, req.body.location, req.body.date, req.body.hour, req.file.filename)
		} else {
			db.createEvent(req.user.id, req.body.title, req.body.description, req.body.city, req.body.location, req.body.date, req.body.hour, undefined)
		}
	}).then(() => {
            res.redirect('/');
        })
        .catch(function (err) {
            errorHandler.serverError(err, req, res, 'Error creating event');
        });
});

module.exports = router;