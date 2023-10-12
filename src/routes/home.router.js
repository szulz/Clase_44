const express = require('express')
const homeRouter = express.Router()

homeRouter.get('/', (req, res) => { res.redirect('/auth/login') })

module.exports = homeRouter