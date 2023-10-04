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
const mailController = new MailController
const auth = new Auth

userRouter.get('/', async (req, res) => {
    let users = await userModel.find().lean()
    res.render('users', { users })
})

userRouter.delete('/', async (req, res) => {
    let users = await userModel.find()
    let lastConnection = users.map(x => x.last_connection)
    let id = users.map(x => x._id)
    const deletedUsers = []
    for (let i = 0; i < lastConnection.length; i++) {
        let timeDiference = Date.now() - lastConnection[i]
        const hourDiference = timeDiference / (60 * 60 * 1000)
        if (hourDiference > 2.5) {
            console.log(`se elimino el user con id ${id[i]}`);
            let response = await userModel.findByIdAndDelete(id[i]);
            await mailController.deletedAccountMail(response.email)
            deletedUsers.push(response)
        }
    }
    if (deletedUsers.length > 0) {
        return res.send({ message: 'the following users has been deleted:', payload: deletedUsers })
    }
    return res.send({ message: 'No users has been deleted!' })
})

userRouter.get('/admin', async (req, res) => {
    let users = await userModel.find().lean()
    res.render('apiUsersAdminGet', { users })
})

userRouter.get('/admin/:uid', async (req, res) => {
    let uid = req.params.uid
    let user = await userModel.findById(uid).lean()
    console.log(user._id);
    res.render('apiUsersAdminUid', { user })
})

userRouter.post('/admin/:uid', async (req, res) => {
    let user = req.params.uid
    console.log(user);
    let newRole = req.body.role
    let deleteUser = req.body.delete
    if (newRole) {
        if (newRole === 'PREMIUM' || newRole === 'ADMIN') {
            await userModel.findByIdAndUpdate(user, {
                role: newRole,
                documents:
                    [{
                        name: 'ADMIN',
                        reference: 'ADMIN',
                    }, {
                        name: 'ADMIN',
                        reference: 'ADMIN',
                    },
                    {
                        name: 'ADMIN',
                        reference: 'ADMIN',
                    }]
            }, { new: true })
            return res.send({ message: `The role has been updated to ${newRole}` })
        }
        await userModel.findByIdAndUpdate(user, { role: newRole, documents: [] }, { new: true })
        return res.send({ message: `The role has been updated to ${newRole}` })
    }
    if (deleteUser == 1) {
        await userModel.findByIdAndDelete(user)
        return res.send({ message: 'The role has been removed' })
    }
})

userRouter.get('/premium/:uid', auth.allowUsersInSession, async (req, res) => {
    try {
        let uid = await userModel.findById(req.params.uid)
        let userInSession = req.user
        if (userInSession.role != 'ADMIN') {
            if (uid._id.toString() === userInSession._id.toString()) {
                if (uid.role === 'USER') {
                    uid.show = true
                }
                if (uid.role === 'PREMIUM') {
                    uid.show = false
                }
            } else {
                return res.send({ message: 'You cant modify other users' })
            }
        } else {
            let allUsers = await userModel.find()
            let id = allUsers.map(x => x._id).toString().split(',')
            let email = allUsers.map(x => x.email)
            ///////////////////////////////////////FIX//////////////////////////////////////////////////////////////////
            return res.render('userRoleChangerAdmin', { mergedArray })
        }
        return res.render('userRoleChanger', uid)
    } catch {
        res.send({ message: 'something went wrong' })
    }
})

userRouter.post('/premium/:uid', auth.allowUsersInSession, async (req, res) => {
    try {
        let user = await userModel.findById(req.body.id)
        if (req.user.role != 'ADMIN') {
            if (user._id.toString() != req.user._id.toString()) {
                return res.send({ message: 'You do not have the permissions to perform this action' })
            }
        }
        let newRole = req.body.role
        if (newRole !== 'USER' && newRole !== 'PREMIUM') {
            req.logger.warn('NOT ALLOW TO CHANGE THE VALUES')
            return res.render('login')
        }
        if (user.role === 'PREMIUM' && newRole === 'USER') {
            return res.send({ message: 'To become an user again you should delete your credentials!' })
        }
        let name = user.documents.map(item => item.name)
        let reference = user.documents.map(item => item.reference)
        if (name[0] === 'account' && name[1] === 'adress' && name[2] === 'info') {
            let usercatualizado = await userModel.findByIdAndUpdate(req.body.id, { role: newRole }, { new: true })
            return res.send({ message: 'se actualizo el rol correctamente', payload: usercatualizado })
        } else {
            return res.send({ message: 'You have not uploaded your documents!' })
        }
    } catch {
        return res.redirect('/auth/login')
    }
})

userRouter.post('/premium/:uid/clear', auth.allowUsersInSession, async (req, res) => {
    let user = await userModel.findById(req.params.uid)
    if (req.user.role != 'ADMIN') {
        if (user._id.toString() != req.user._id.toString()) {
            return res.send({ message: 'You do not have the permissions to perform this action' })
        }
    }
    let name = user.documents.map(item => item.name)
    let reference = user.documents.map(item => item.reference)
    for (let i = 0; i < name.length; i++) {
        let pathToDelete = path.join(__dirname, '..', `./public/documents/${name[i]}/${reference[i]}`)
        fs.unlink(pathToDelete, (err) => {
            if (err) {
                req.logger.error(`Error deleting file: ${err}`);
            } else {
                req.logger.info('File deleted successfully.');
            }
        })
    }
    let deletedDocuments = await userModel.findByIdAndUpdate(req.params.uid, { documents: [], role: 'USER' }, { new: true })

    res.send({ data: deletedDocuments, message: 'documents deleted' })
})

userRouter.get('/:uid/documents', auth.allowUsersInSession, async (req, res) => {
    try {
        let user = req.params.uid
        let foundUser = await userModel.findById(req.params.uid)
        if (req.user.role != 'ADMIN') {
            if (foundUser._id.toString() != req.user._id.toString()) {
                return res.send({ message: 'You do not have the permissions to perform this action' })
            }
        }
        return res.render('documents_get', { user })
    } catch {
        res.send({ message: 'try with another uid!' })
    }
})


userRouter.post('/:uid/documents', auth.allowUsersInSession, uploader.fields([{ name: 'profiles', maxCount: 5 }, { name: 'products', maxCount: 5 }, { name: 'account', maxCount: 5 }, { name: 'adress', maxCount: 5 }, { name: 'info', maxCount: 5 }]), async (req, res) => {
    let account = req.files.account
    let adress = req.files.adress
    let info = req.files.info
    let products = req.files.products
    let profiles = req.files.profiles
    let documents = req.files.documents
    let user = await userModel.findById(req.params.uid)
    if (req.user.role != 'ADMIN') {
        if (user._id.toString() != req.user._id.toString()) {
            return res.send({ message: 'You do not have the permissions to perform this action' })
        }
    }
    if (account == undefined || adress == undefined || info == undefined) {
        await userModel.findByIdAndUpdate(req.params.uid, { documents: [] }, { new: true })
        if (account != undefined) {
            let filePath = account[0].path
            fs.unlink(filePath, (err) => {
                if (err) {
                    req.logger.error(`Error deleting file: ${err}`);
                } else {
                    req.logger.info('File deleted successfully.');
                }
            });
        }
        if (adress != undefined) {
            let filePath = adress[0].path
            fs.unlink(filePath, (err) => {
                if (err) {
                    req.logger.error(`Error deleting file: ${err}`);
                } else {
                    req.logger.info('File deleted successfully.');
                }
            });
        }
        if (info != undefined) {
            let filePath = filePath[0].path
            fs.unlink(filePath, (err) => {
                if (err) {
                    req.logger.error(`Error deleting file: ${err}`);
                } else {
                    req.logger.info('File deleted successfully.');
                }
            });
        }
        return res.send({ message: 'You must upload all 3 files to sucessfully update your status' })
    }
    let { _id } = await userModel.findByIdAndUpdate(req.params.uid, {
        documents:
            [
                { name: account[0].fieldname, reference: account[0].filename },
                { name: adress[0].fieldname, reference: adress[0].filename },
                { name: info[0].fieldname, reference: info[0].filename },
            ],
    }, { new: true })
    //let cleanUser = new DocumentDTO(user)
    res.render('documents_post', { products, profiles, account, adress, info, _id })

})

/*
   let user = await userModel.findByIdAndUpdate(req.params.uid,
        { documents: { name: account[0].fieldname + '/' + adress[0].fieldname + '/' + info[0].fieldname, reference: account[0].filename + '/' + adress[0].filename + '/' + info[0].filename } }, { new: true })
    console.log(user);
*/


module.exports = userRouter