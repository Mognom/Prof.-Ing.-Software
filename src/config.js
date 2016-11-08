const config = {}

config.multer = {
    imgdest: (require('app-root-path') + '/public/images/')
}

config.sqlite3 = {
    filename: (require('app-root-path') + '/database.sqlite3')
}

module.exports = config