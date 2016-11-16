const appRootPath = require('app-root-path');
const config = require(appRootPath + '/config.js');
const utils = require(appRootPath + '/utils.js');
const multer = require('multer');
const fs = require('fs');

var imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dest = config.multer.imgdest;
        if (!fs.existsSync(dest)) { fs.mkdirSync(dest) }
        cb(null, dest)
    },
    filename: function (req, file, cb) {
        cb(null, (utils.hash(file.originalname) + '_' + Date.now() + '.jpg'))
    }
});

exports.imageUpload = multer({ storage: imageStorage })

