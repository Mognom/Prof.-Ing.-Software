/**
 * Created by gabriel on 15/11/16.
 */
var expect = require('expect.js');
var fs = require('fs');
var proxyquire =  require('proxyquire');
const config_test = require('../config.js');
config_test.sqlite3.filename = './database.test.sqlite3';
var db = proxyquire('../db', { './config.js': config_test});


describe('Database TestSuite', function () {
    before(function(done) {
        db.init(function(err){
            if (err){
                console.error(err);
            }
            done();
        });
    });

    after(function() {
        fs.unlinkSync(config_test.sqlite3.filename);
    });
    describe('User', function () {
        it('should create user',function(done) {
            db.createUser("foo", "foopass", 18, "Male", "foo@foo.com").then(function () {
                done()
            }).catch(function (err) {
                console.log(err);
            });
        });
        it('should login by credentials', function(done) {
            db.getUserByCredentials("foo", "foopass").then(function(u){
                expect(u.username).to.equal('foo');
                return db.getUserByID(u.id);
            }).then(function(u){
                expect(u.username).to.equal('foo');
                return db.getUserByName(u.username);
            }).then(function(u){
                expect(u.username).to.equal('foo');
                expect(u.email).to.equal('foo@foo.com');
                done()
            }).catch(function (err) {
                console.error(err);
            });
        })
    });

    describe('Cities', function () {
        it('should list cities',function(done) {
            db.getAllCities().then(function (cities) {
                expect(cities.length).to.be.within(0, Infinity);
                done()
            }).catch(function (err) {
                console.error(err);
            });
        });
        it('should get city: Madrid',function(done) {
            db.getCity('Madrid').then(function (city) {
                expect(city.name).to.be('Madrid');
                done()
            }).catch(function (err) {
                console.error(err);
            });
        });
        it('should get city: Paris',function(done) {
            db.getCity('Paris').then(function (city) {
                expect(city.name).to.be('Paris');
                done()
            }).catch(function (err) {
                console.error(err);
            });
        });
        it('should get city: Rome',function(done) {
            db.getCity('Rome').then(function (city) {
                expect(city.name).to.be('Rome');
                done()
            }).catch(function (err) {
                console.error(err);
            });
        });
    });

    describe('Events', function () {
        it('should create event', function (done) {
            db.getUserByCredentials("foo", "foopass").then(function(u){
                expect(u.username).to.equal('foo');
                return db.getUserByID(u.id);
            }).then(function(id){
                return db.createEvent(id, "EventTitle1", "EventDescription1", "Madrid",
                    "Location1", new Date(), "10:00", "")
            }).then(function (event) {
                done();
            }).catch(function (err) {
                console.error(err);
            });
        });
        it('should list all events', function (done) {
            db.getAllEvents().then(function (events) {
                expect(events.length).to.be.within(1,Infinity);
                done()
            }).catch(function (err) {
                console.error(err);
            })
        });
        it('should get event by city and id', function (done) {
            db.getEventByCity("Madrid").then(function (event) {
                expect(event.length).to.be(1);
                expect(event[0].location).to.be('Location1');
                return db.getEventById(event[0].id);
            }).then(function (event) {
                expect(event[0].location).to.be('Location1');
                done()
            }).catch(function (err) {
                console.error(err);
            })
        });
    })
});