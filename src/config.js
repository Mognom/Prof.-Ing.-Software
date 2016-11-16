const config = {};

config.media = {
    public_destination: 'media/',
    multer_destination: '/public/media/'
};

config.multer = {
    imgdest: (require('app-root-path') + config.media.multer_destination)
};

config.sqlite3 = {
    filename: (require('app-root-path') + '/database.sqlite3')
};

module.exports = config;
