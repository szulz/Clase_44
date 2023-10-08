const express = require('express');
const userModel = require('../model/schemas/users.model');
const userRouter = express.Router()
const uploader = require('../middlewares/multer.js');
const products_uploader = require('../middlewares/multer_products');
const DocumentDTO = require('../model/DTO/documents.dto');
const fs = require('fs');
const path = require('path');
const Auth = require('../middlewares/auth.js');
const { listIndexes } = require('../model/schemas/users.model');
const MailController = require('../controllers/mail.controller');
const UserController = require('../controllers/user.controller');
const userController = new UserController
const mailController = new MailController
const auth = new Auth

userRouter.get('/', auth.allowAdmin, userController.getAll)

userRouter.delete('/', userController.cleanInactiveUsers)

userRouter.get('/admin', userController.adminViewUsers)

userRouter.get('/admin/:uid', userController.adminUserToModify)

userRouter.post('/admin/:uid', userController.adminUserModified)

userRouter.get('/premium/:uid', auth.allowUsersInSession, userController.userPremiumView)

userRouter.post('/premium/:uid', auth.allowUsersInSession, userController.becomePremium)

userRouter.post('/premium/:uid/clear', auth.allowUsersInSession, userController.deleteDocumentsBecomeUser)

userRouter.get('/:uid/documents', auth.allowUsersInSession, userController.uploaderView)

userRouter.post('/:uid/documents', auth.allowUsersInSession, uploader.fields([
    { name: 'profiles', maxCount: 5 }, { name: 'products', maxCount: 5 }, { name: 'account', maxCount: 5 },
    { name: 'adress', maxCount: 5 }, { name: 'info', maxCount: 5 }]),
    userController.postDocuments)

module.exports = userRouter