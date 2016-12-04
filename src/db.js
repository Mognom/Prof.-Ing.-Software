const appRootPath = require('app-root-path');
const utils = require(appRootPath + '/utils.js');
const sqlite3 = require('sqlite3');
const config = require('./config.js');
const async = require('async');
const db = new sqlite3.Database(config.sqlite3.filename);

exports.getAllCities = function () {
    return all(db, 'SELECT name FROM city')
};

exports.getCity = function (name) {
    return get(db, 'SELECT name FROM city WHERE name = $name', {
        $name: name
    })
};

exports.getUserByCredentials = function (username, password) {
    var hash = utils.hash(password);

    return get(db, 'SELECT username, id FROM user WHERE username=$username AND password=$hash', {
        $username: username,
        $hash: hash
    })
};

exports.getAllUsers = function () {
    return all(db, 'SELECT id, username FROM user')
};

exports.getUserByID = function (id) {
    return get(db, 'SELECT id, username FROM user WHERE id=$id', {
        $id: id
    })
};

exports.getUserByName = function (username) {
    return get(db, 'SELECT * FROM user WHERE username=$username', {
        $username: username
    })
};

exports.modifyUserByIDIfDefined = function (id, password, age, gender, email, image) {
    var SQL = 'UPDATE user SET ';
    var SQL_OBJ = {$id: id};
    if (password) {
        SQL += 'password=$password, ';
        SQL_OBJ.$password = utils.hash(password);
    }
    if (age) {
        SQL += 'age=$age, ';
        SQL_OBJ.$age = age;
    }
    if (gender) {
        SQL += 'gender=$gender, ';
        SQL_OBJ.$gender = gender;
    }
    if (email) {
        SQL += 'email=$email, ';
        SQL_OBJ.$email = email;
    }
    if (image){
        SQL += 'image=$image, ';
        SQL_OBJ.$image = image;
    }

    SQL = SQL.substring(0, SQL.length - 2)+" WHERE id=$id"; //remove trailing comma
    return get(db, SQL, SQL_OBJ)
};

exports.createUser = function (username, password, age, gender, email, image) {
    var hash = utils.hash(password);

    return run(db, 'INSERT INTO user (username, password, age, gender, email, image) VALUES ($username, $hash, $age, $gender, $email, $image)', {
        $username: username,
        $hash: hash,
        $age: age,
        $gender: gender,
        $email: email,
        $image: image
    })
};

exports.getOauthUserByID = function (id) {
    return get(db, 'SELECT id, username FROM oauth WHERE id=$id', {
        $id: id
    })
};

exports.createOauthUser = function (id, username) {
    return run(db, 'INSERT INTO oauth (id, username) VALUES ($id, $username)', {
        $id: id,
        $username: username
    })
};

exports.createEvent = function (ownerID, title, description, city, location, date, hour, image) {

    return run(db, 'INSERT INTO event (ownerID, title, description, city, location, date, hour, image) \
        VALUES ($ownerID, $title, $description, $city, $location, $date, $hour, $image)', {
        $ownerID: ownerID,
        $title: title,
        $description: description,
        $city: city,
        $location: location || null,
        $date: date,
        $hour: hour,
        $image: image || null
    })
};

exports.getAllEvents = function () {
    return all(db, 'SELECT * FROM event')
};

exports.getEventByCity = function (city) {
    return all(db, 'SELECT * FROM event WHERE city = $city', {
        $city: city
    })
};

exports.getEventByDate = function (date) {
    return all(db, 'SELECT * FROM event WHERE date = $date', {
        $date: date
    })
};

exports.getEventByOwner = function (owner) {
    return all(db, 'SELECT * FROM event JOIN (SELECT id FROM user WHERE user.username = $owner) as owner ON event.ownerID = owner.id', {
        $owner: owner
    })
};

exports.getEventByOwnerAndDate = function (owner, date) {
    return all(db, 'SELECT * FROM event JOIN (SELECT id FROM user WHERE user.username = $owner) as owner ON event.ownerID = owner.id where event.date = $date', {
        $owner: owner,
        $date: date
    })
};

exports.getEventById = function (id) {
    "use strict";
    return all(db, 'SELECT * FROM event WHERE id = $id', {
        $id: id
    })
};

exports.init = function (callback) {
    async.series([
        function (callback) {
            db.run('CREATE TABLE IF NOT EXISTS city ( \
                        name            TEXT PRIMARY KEY\
                    )', callback);
        },
        function (callback) {
            db.run('CREATE TABLE IF NOT EXISTS user ( \
                        id              INTEGER PRIMARY KEY AUTOINCREMENT, \
                        username        TEXT, \
                        password        TEXT, \
                        age             INTEGER, \
                        gender          TEXT, \
                        email           TEXT, \
                        image           TEXT \
                    )', callback);
        },
        function (callback) {
            db.run('CREATE TABLE IF NOT EXISTS event ( \
                        id              INTEGER PRIMARY KEY AUTOINCREMENT, \
                        ownerID         INTEGER, \
                        title           TEXT, \
                        description     TEXT, \
                        city            TEXT, \
                        location        TEXT, \
                        date            DATE, \
                        hour            TIME, \
                        image           TEXT, \
                        FOREIGN KEY (city) REFERENCES city (name) ON DELETE CASCADE, \
                        FOREIGN KEY (ownerID) REFERENCES user (id) ON DELETE CASCADE\
                    )', callback);
        },
        function (callback) {
            db.run('CREATE TABLE IF NOT EXISTS participate ( \
                        userID          INTEGER, \
                        activityID      INTEGER, \
                        PRIMARY KEY (userID, activityID), \
                        FOREIGN KEY (userID) REFERENCES user (id) ON DELETE CASCADE,\
                        FOREIGN KEY (activityID) REFERENCES event (id) ON DELETE CASCADE\
                    )', callback)
        },
        function (callback) {
            db.run('CREATE TABLE IF NOT EXISTS oauth ( \
                        id              TEXT PRIMARY KEY, \
                        username        TEXT \
                    )', callback)
        },
        function (callback) {
            db.all('SELECT * FROM city', function (err, city) {
                if (err) {
                    callback(err);
                } else if (city.length == 0) {
                    db.run('INSERT INTO city VALUES ("Madrid"), ("Paris"), ("Rome")', callback);
                } else {
                    callback(null);
                }
            });
        }
    ], callback);
};

function all(database, sql, params) {
    return new Promise((resolve, reject) => {
        database.all(sql, params, (err, rows) => {
            if (err) {
                return reject(err)
            }

            return resolve(rows)
        })
    })
}

function run(database, sql, params) {
    return new Promise((resolve, reject) => {
        database.run(sql, params, (err, rows) => {
            if (err) {
                return reject(err)
            }

            return resolve(rows)
        })
    })
}

function get(database, sql, params) {
    return new Promise((resolve, reject) => {
        database.get(sql, params, (err, rows) => {
            if (err) {
                return reject(err)
            }

            return resolve(rows)
        })
    })
}
