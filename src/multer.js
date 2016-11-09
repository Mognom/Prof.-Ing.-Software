const appRootPath = require('app-root-path');
const config = require(appRootPath + '/config.js')
const utils = require(appRootPath + '/utils.js');
const multer = require('multer');

var imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, config.multer.imgdest)
    },
    filename: function (req, file, cb) {
        cb(null, (utils.hash(file.fieldname) + '-' + Date.now()))
    }
})

exports.imageUpload = multer({ storage: imageStorage })
