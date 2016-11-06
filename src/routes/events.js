const express = require('express');
const router = express.Router();
const passport = require('passport');
const appRootPath = require('app-root-path');
const db = require(appRootPath + '/db.js');
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const errorHandler = require(appRootPath + '/errorHandler.js');

router.get('/', passport.authenticationMiddleware(), function (req, res) {
    db.getAllEvents()
        .then(function (events) {
            if (events) {
                res.render('events', { base64img: events[0].image }); //TODO: This is an example to show an image from a base64 string, create events view
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

router.post('/createEvent', upload.single('image'), passport.authenticationMiddleware(), function (req, res) {
    var image = req.file

    if (image) {
        var base64img = new Buffer(image.buffer).toString("base64");
    }

    db.createEvent(req.user.id, req.body.title, req.body.description, req.body.city, req.body.location, req.body.date, req.body.hour, base64img)
        .then(() => {
            res.redirect('/');
        })
        .catch(function (err) {
            errorHandler.serverError(err, req, res, 'Error creating event');
        });
});

module.exports = router;