const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const appRootPath = require('app-root-path');
const db = require(appRootPath + '/db.js');

exports.init = function () {
    passport.use(new LocalStrategy(
        function (username, password, done) {
            db.getUserByCredentials(username, password)
                .then(function (row) {
                    if (!row) {
                        return done(null, false)
                    } else {
                        return done(null, row)
                    }
                })
                .catch(function (err) {
                    return done(err)
                });
        }
    ))

    passport.serializeUser(function (user, done) {
        return done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        db.getUserByID(id)
            .then(function (user) {
                if (!user) {
                    return done(null, false)
                } else {
                    return done(null, user)
                }
            })
            .catch(function (err) {
                return done(err)
            });
    });

    passport.authenticationMiddleware = function () {
        return function (req, res, next) {
            if (req.isAuthenticated()) {
                return next()
            }
            res.redirect('/')
        }
    }
};