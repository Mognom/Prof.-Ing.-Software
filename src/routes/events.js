const express = require('express');
const router = express.Router();
const passport = require('passport');
const appRootPath = require('app-root-path');
const db = require(appRootPath + '/db.js');
const config = require(appRootPath + '/config.js');
const multer = require(appRootPath + '/multer.js');
const co = require('co');
const errorHandler = require(appRootPath + '/errorHandler.js');
const querystring = require('querystring');

router.get('/', passport.authenticationMiddleware(), function (req, res) {

    var date = req.query.date;
    var owner = req.query.owner == 'All' ? null : req.query.owner;

    co(function* () {
        var events

        if(owner && date)
        {
            events = yield db.getEventByOwnerAndDate(owner, date)
        }
        else if(owner)
        {
            events = yield db.getEventByOwner(owner)
        }
        else if(date)
        {
            events = yield db.getEventByDate(date)
        }
        else
        {
            events = yield db.getAllEvents();
        }

        var users = yield db.getAllUsers();

        users = users.map((user) => { return user.username })
        users.unshift("All");

        return {
            events: events,
            users: users
        };
    }).then((result) => {
            res.render('events', {user: req.user, events: result.events, users: result.users});
        })
        .catch(function (err) {
            errorHandler.serverError(err, req, res, 'Error getting events');
        });
});

router.post('/filter', passport.authenticationMiddleware(), function (req, res) {
    res.redirect('/events?' + querystring.stringify(req.body));
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
            errorHandler.serverError(err, req, res, 'Error getting events');
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
