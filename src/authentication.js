const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const appRootPath = require('app-root-path');
const db = require(appRootPath + '/db.js');
const co = require('co');
const config = require('./config.js');

exports.init = function () {
    passport.use(new LocalStrategy(
        function (username, password, done) {
            db.getUserByCredentials(username, password)
                .then(function (user) {
                    return user ? done(null, user) : done(null, false);
                })
                .catch(function (err) {
                    return done(err)
                });
        }
    ));

    passport.use(new FacebookStrategy({
        clientID: config.oauth.facebook.clientID,
        clientSecret: config.oauth.facebook.clientSecret,
        callbackURL: config.oauth.facebook.callbackURL
    },
        function (accessToken, refreshToken, profile, done) {
            co(function* () {
                var user = yield db.getOauthUserByID(profile.id);

                if (!user) {
                    user = {
                        id: profile.id,
                        username: profile.displayName,
                    };

                    yield db.createOauthUser(user.id, user.username)
                }

                return user;
            }).then((user) => {
                return done(null, user);
            }).catch(function (err) {
                return done(err);
            });
        }
    ));

    passport.use(new TwitterStrategy({
        consumerKey: config.oauth.twitter.consumerKey,
        consumerSecret: config.oauth.twitter.consumerSecret,
        callbackURL: config.oauth.twitter.callbackURL
    },
        function (accessToken, refreshToken, profile, done) {
            co(function* () {
                var user = yield db.getOauthUserByID(profile.id);

                if (!user) {
                    user = {
                        id: profile.id,
                        username: profile.displayName,
                    };

                    yield db.createOauthUser(user.id, user.username)
                }

                return user;
            }).then((user) => {
                return done(null, user);
            }).catch(function (err) {
                return done(err);
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        co(function* () {
            var user = yield db.getOauthUserByID(id);

            if (!user) {
                user = yield db.getUserByID(id);
            }

            return user;
        }).then(function (user) {
            return user ? done(null, user) : done(null, false);
        }).catch(function (err) {
            return done(err, null);
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
