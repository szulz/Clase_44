const express = require('express')
const homeRouter = express.Router()

homeRouter.get('/', (req, res) => { res.status(200).redirect('/auth/login') })
/*
homeRouter.get('/test', (req, res) => {
    res.render('test')
})

homeRouter.post('/test', (req, res) => {
    console.log(req.body);
})*/

module.exports = homeRouter