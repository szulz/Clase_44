const express = require('express');
const { PORT } = require('../config/env.config');
const Auth = require('../middlewares/auth');
const auth = new Auth
const profileRouter = express.Router()



profileRouter.get('/', auth.allowUsersInSession, async (req, res) => {
    let user = req.session.user
    return res.render('profile', { user, PORT })
})

module.exports = profileRouter