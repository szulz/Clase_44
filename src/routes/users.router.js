const express = require('express');
const userModel = require('../model/schemas/users.model');
const userRouter = express.Router()
const uploader = require('../middlewares/multer.js');
const products_uploader = require('../middlewares/multer_products');

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


userRouter.post('/:uid/documents', uploader.fields([{ name: 'profiles', maxCount: 5 }, { name: 'products', maxCount: 5 }, { name: 'account', maxCount: 5 }, { name: 'adress', maxCount: 5 }, { name: 'info', maxCount: 5 }]), async (req, res) => {
    let account = req.files.account
    let adress = req.files.adress
    let info = req.files.info
    let products = req.files.products
    let profiles = req.files.profiles
    let documents = req.files.documents
    //SOLO FUNCIONA CUANDO LOS 3 ARCHIVOS SE MANDAN
    let user = await userModel.findByIdAndUpdate(req.params.uid,
        { documents: { name: account[0].fieldname + '/' + adress[0].fieldname + '/' + info[0].fieldname, reference: account[0].filename + '/' + adress[0].filename + '/' + info[0].filename } }, { new: true })
    console.log(user);
    res.render('documents_post', { products, profiles, /*user,*/ account, adress, info })
})



module.exports = userRouter