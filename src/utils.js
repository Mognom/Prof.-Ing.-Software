const crypto = require('crypto');

exports.hash = function (toHash) {
    var hash = crypto.createHash('sha256');
    hash.update(toHash);
    return hash.digest('hex');
}