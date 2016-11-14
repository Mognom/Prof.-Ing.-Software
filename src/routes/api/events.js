const express = require('express');
const router = express.Router();
const passport = require('passport');
const appRootPath = require('app-root-path');
const db = require(appRootPath + '/db.js');
const errorHandler = require(appRootPath + '/errorHandler.js');
const utils = require(appRootPath + '/utils.js');

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
            rows.map((event) => { event.image = utils.getImagesUrl(req) + event.image });
            res.send(rows);
        })
        .catch(function (err) {
            errorHandler.serverError(err, req, res, 'Error gettings events');
        });
});

router.get('/:id', passport.authenticationMiddleware(), (req,res)=>{
    let id = req.params.id;
    res.contentType('application/json');

    return db.getEventById(id).then(
        (event)=>{
            res.send(event);
        }).catch((err)=>{
            errorHandler.serverError(err,req,res, 'Error getting the event');
        })

});

module.exports = router;