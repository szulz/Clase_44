const multer = require('multer')
const path = require('path');
const { SERVER_URL } = require('../config/env.config');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', `/public/${file.fieldname}`))
    },
    filename: function (req, file, cb) {
        cb(null, req.params.uid + '_' + Date.now() + '-' + file.originalname);
    },
});

const uploader = multer({ storage })

module.exports = uploader