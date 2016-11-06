const express = require('express');
const router = express.Router();
const passport = require('passport');
const appRootPath = require('app-root-path');
const db = require(appRootPath + '/db.js');
const errorHandler = require(appRootPath + '/errorHandler.js');

router.get('/', passport.authenticationMiddleware(), function (req, res) {

    res.contentType('application/json');

    var city = req.query.city;

    (function () {
        if (!city) {
            return db.getAllEvents();
        } else {
            return db.getEventByCity(city);
        }
    })().then(function (rows) {
            res.send(rows);
        })
        .catch(function (err) {
            errorHandler.serverError(err, req, res, 'Error gettings events');
        });
});

module.exports = router;