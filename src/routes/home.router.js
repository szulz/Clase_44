const express = require('express')
const homeRouter = express.Router()

homeRouter.get('/', (req, res) => { res.status(200).redirect('/auth/login') })

module.exports = homeRouter