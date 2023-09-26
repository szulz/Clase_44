const express = require('express');
const userModel = require('../model/schemas/users.model');
const userRouter = express.Router()
const uploader = require('../middlewares/multer.js');
const products_uploader = require('../middlewares/multer_products');
const DocumentDTO = require('../model/DTO/documents.dto');
const fs = require('fs');
const path = require('path');

userRouter.get('/premium/:uid', async (req, res) => {
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
            return res.render('userRoleChangerAdmin', uid)
        }
        return res.render('userRoleChanger', uid)
    } catch {
        res.send({ message: 'try with another uid' })
    }
})

userRouter.post('/premium/:uid', async (req, res) => {
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

userRouter.post('/premium/:uid/clear', async (req, res) => {
    let user = await userModel.findById(req.params.uid)
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

userRouter.get('/:uid/documents', async (req, res) => {
    try {
        let user = req.params.uid
        let foundUser = await userModel.findById(req.params.uid)
        /*
        if (foundUser.role === 'PREMIUM') {
            return res.send({ message: 'You are already a premium user, dont need to upload documents' })
        }
        */
        return res.render('documents_get', { user })
    } catch {
        res.send({ message: 'try with another uid!' })
    }
})


userRouter.post('/:uid/documents', uploader.fields([{ name: 'profiles', maxCount: 5 }, { name: 'products', maxCount: 5 }, { name: 'account', maxCount: 5 }, { name: 'adress', maxCount: 5 }, { name: 'info', maxCount: 5 }]), async (req, res) => {
    let account = req.files.account
    let adress = req.files.adress
    let info = req.files.info
    let products = req.files.products
    let profiles = req.files.profiles
    let documents = req.files.documents
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