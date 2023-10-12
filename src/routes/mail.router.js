const express = require('express')
const mailRouter = express.Router();
const MailController = require('../controllers/mail.controller');
const Auth = require('../middlewares/auth');
const auth = new Auth
const mailController = new MailController



mailRouter.get('/', mailController.view)

mailRouter.post('/', mailController.sentMail)

module.exports = mailRouter;