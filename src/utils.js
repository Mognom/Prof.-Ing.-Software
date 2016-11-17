const crypto = require('crypto');

exports.hash = function (toHash) {
    var hash = crypto.createHash('sha256');
    hash.update(toHash);
    return hash.digest('hex');
};

exports.getImagesUrl = function (request) {
    return (request.protocol + '://' + request.get('host') + '/')
};