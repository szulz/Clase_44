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

userRouter.delete('/', auth.allowAdmin, userController.cleanInactiveUsers)

userRouter.get('/profile', userController.showProfile)

userRouter.get('/admin', auth.allowAdmin, userController.adminViewUsers)

userRouter.get('/admin/:uid', auth.allowAdmin, userController.adminUserToModify)

userRouter.post('/admin/:uid', auth.allowAdmin, userController.adminUserModified)

userRouter.get('/premium/:uid', userController.userPremiumView)

userRouter.post('/premium/:uid', userController.becomePremium)

userRouter.post('/premium/:uid/clear', userController.deleteDocumentsBecomeUser)

userRouter.get('/:uid/documents', userController.uploaderView)

userRouter.post('/:uid/documents', uploader.fields([{ name: 'account', maxCount: 5 }, { name: 'adress', maxCount: 5 }, { name: 'info', maxCount: 5 }]), userController.postDocuments)

module.exports = userRouter