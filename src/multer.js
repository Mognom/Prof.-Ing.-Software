const appRootPath = require('app-root-path');
const config = require(appRootPath + '/config.js')
const multer = require('multer');

exports.imageUpload = multer({
    dest: config.multer.imgdest,
    rename: function (fieldname, filename) {
        return utils.hash(image.name);
    }
})