/**
 * Created by gabriel on 28/11/16.
 */
const express = require('express');
const router = express.Router();
const passport = require('passport');
const appRootPath = require('app-root-path');
const db = require(appRootPath + '/db.js');
const errorHandler = require(appRootPath + '/errorHandler.js');
const config = require(appRootPath + '/config.js');
const multer = require(appRootPath + '/multer.js');

router.get('/', passport.authenticationMiddleware(), function(req, res){

    res.contentType('application/json');
    if(!req.user){
        return errorHandler.notFoundError("Unexistent user", req, res);
    }

    db.getUserByName(req.user.username).then(function (user) {
        delete user["password"];
        res.send(user);
    }).catch(function (err) {
        return errorHandler.serverError(err, req, res, 'User was not present in request');
    })


});

/**
 * Available params for editting in req.body
 *
 *{ id: id,
 *  password: password,
 *  age: age,
 *  gender: gender,
 *  email: email,
 *  image: image
 *  }
 *
 */
router.put('/', passport.authenticationMiddleware(),  multer.imageUpload.single('image'), function(req, res){

    res.contentType('application/json');
    if(!req.user){
        return errorHandler.notFoundError("Unexistent user", req, res);
    }

    var image = req.file ? config.media.public_destination + req.file.filename : null;

    db.modifyUserByIDIfDefined(req.user.id, req.body.password, req.body.age,
        req.body.gender, req.body.email, image).then(function (user) {
        return db.getUserByName(req.user.username);
    }).then(function (user) {
        delete user["password"];
        res.send(user);
    }).catch(function (err) {
        return errorHandler.serverError(err, req, res, 'User was not modified');
    })
});

module.exports = router;