const express = require('express');
const router = express.Router();
const passport = require('passport');
const appRootPath = require('app-root-path');
const db = require(appRootPath + '/db.js');
const errorHandler = require(appRootPath + '/errorHandler.js');
const utils = require(appRootPath + '/utils.js');
const querystring = require('querystring');

router.get('/', passport.authenticationMiddleware(), function (req, res) {

    res.contentType('application/json');

    var city = req.query.city;

    (function () {
        return city ? db.getEventByCity(city) : db.getAllEvents();
    })().then(function (events) {
            events.map((event) => { if(event.image) { event.image = utils.getHostUrl(req) + event.image } });
            res.send(events);
        })
        .catch(function (err) {
            errorHandler.serverError(err, req, res, 'Error gettings events');
        });
});

router.get('/:id', passport.authenticationMiddleware(), (req,res) => {
    var id = req.params.id;
    res.contentType('application/json');

    return db.getEventById(id).then(
        (event) => {
            if(event[0].image) { event[0].image = utils.getHostUrl(req) + event[0].image };
            res.send(event);
        }).catch((err)=>{
            errorHandler.serverError(err,req,res, 'Error getting the event');
        })

});

module.exports = router;
