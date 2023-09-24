const express = require('express')
const smsRouter = express.Router()
const SmsController = require('../controllers/sms.controller')
const Auth = require('../middlewares/auth')
const smsController = new SmsController
const auth = new Auth

smsRouter.get('/', auth.allowUsersInSession, smsController.view)

smsRouter.post('/', auth.allowUsersInSession, smsController.send)

module.exports = smsRouter