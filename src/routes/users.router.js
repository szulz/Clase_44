const express = require('express');
const userModel = require('../model/schemas/users.model');
const userRouter = express.Router()
const uploader = require('../middlewares/multer.js')

userRouter.get('/premium/:uid', async (req, res) => {
    let user = await userModel.findById(req.params.uid)
    res.render('userRoleChanger', user)
})

userRouter.post('/premium/:uid', async (req, res) => {
    let newRole = req.body.role
    if (newRole !== 'USER' && newRole !== 'PREMIUM') {
        req.logger.warn('NOT ALLOW TO CHANGE THE VALUES')
        return res.render('welcome')
    }
    let usercatualizado = await userModel.findByIdAndUpdate(req.body.id, { role: newRole }, { new: true })
    res.send({ message: 'se actualizo el rol correctamente', payload: usercatualizado })
})

userRouter.get('/:uid/documents', async (req, res) => {
    let user = req.params.uid
    return res.render('documents_get', { user })
})


userRouter.post('/:uid/documents', uploader.fields([{ name: 'profiles', maxCount: 5 }, { name: 'products', maxCount: 5 }, { name: 'documents', maxCount: 5 }]), (req, res) => {
    let products = req.files.products
    let profiles = req.files.profiles
    let documents = req.files.documents
    let user = req.params.uid
    res.render('documents_post', { products, profiles, documents, user })
})



module.exports = userRouter