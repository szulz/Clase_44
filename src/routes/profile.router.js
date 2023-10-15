const express = require('express');
const { PORT } = require('../config/env.config');
const Auth = require('../middlewares/auth');
const auth = new Auth
const profileRouter = express.Router()



profileRouter.get('/', async (req, res) => {
    let user = req.session.user
    if (user.role === 'USER') {
        user.view = 0
    } else if (user.role === 'PREMIUM') {
        user.view = 1
    } else {
        user.admin = 1
    }
    return res.status(200).render('profile', { user, PORT })
})

module.exports = profileRouter