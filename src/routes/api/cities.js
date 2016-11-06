const express = require('express');
const router = express.Router();
const passport = require('passport');
const appRootPath = require('app-root-path');
const db = require(appRootPath + '/db.js');
const errorHandler = require(appRootPath + '/errorHandler.js');

router.get('/', passport.authenticationMiddleware(), function (req, res) {

    res.contentType('application/json');

    var name = req.query.name;

    (function () {
        if (!name) {
            return db.getAllCities();
        } else {
            return db.getCity(name);
        }
    })().then(function (rows) {
            res.send(rows);
        })
        .catch(function (err) {
            errorHandler.serverError(err, req, res, 'Error gettings cities');
        });
});

module.exports = router;