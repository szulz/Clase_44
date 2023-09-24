const multer = require('multer')
const path = require('path');
const { SERVER_URL } = require('../config/env.config');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'account' || file.fieldname === 'adress' || file.fieldname === 'info') {
            cb(null, path.join(__dirname, '..', `/public/documents/${file.fieldname}`))
        } else {
            cb(null, path.join(__dirname, '..', `/public/${file.fieldname}`))
        }
    },
    filename: function (req, file, cb) {
        cb(null, req.params.uid + '_' + Date.now() + '-' + file.originalname);
    },
})

/*const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'account') {
            cb(null, path.join(__dirname, '..', `/public/documents/account`))
        } else {
            if (file.fieldname === 'adress') {
                cb(null, path.join(__dirname, '..', `/public/documents/adress`))
            } else {
                if (file.fieldname === 'info') {
                    cb(null, path.join(__dirname, '..', `/public/documents/info`))
                } else {
                    cb(null, path.join(__dirname, '..', `/public/${file.fieldname}`))
                }
            }
        }

    },
    filename: function (req, file, cb) {
        cb(null, req.params.uid + '_' + Date.now() + '-' + file.originalname);
    },
});*/

const uploader = multer({ storage })

module.exports = uploader