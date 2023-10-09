const { PORT, ADMIN_EMAIL } = require("../config/env.config.js")
const UsersDao = require("../model/DAOs/users/users.dao.js")
const usersDao = new UsersDao
const SessionDTO = require("../model/DTO/session.dto.js")
const AuthService = require("../services/auth.service.js")
const CustomError = require("../services/errors/custom-error.js")
const EErrors = require("../services/errors/enums.js")
const GenerateErrorCauses = require("../services/errors/info.js")
const generateErrorCauses = new GenerateErrorCauses
const authService = new AuthService

class AuthController {
    async logOut(req, res, next) {
        let session = req.session
        await authService.logOut(session)
        return res.redirect('/auth/login')
    }

    async logInGet(req, res) {
        return res.render('login', {})
    }

    async login(req, res) {
        let clearUser = new SessionDTO(await req.user)
        req.session.user = clearUser
        await usersDao.findByIdAndUpdate(clearUser.userID, { last_connection: Date.now() })
        return res.redirect('/products')
    }

    async registerGet(req, res) {
        return res.render('register', {})
    }

    async register(req, res) {
        let user = req.user.first_name
        return res.render('welcome', { user, PORT })
    }

    authFailure(req, res) {
        CustomError.createError({
            name: 'Unexpected Authentication Error',
            message: 'Please refresh the page and try again',
            cause: generateErrorCauses.authFailure(),
            code: EErrors.AUTH_FAILURE,
        })
    }

    async recovery(req, res) {
        try {
            const email = req.body.email
            let userFound = await authService.recovery(email)
            return res.render('recoveryEmailFound', userFound)
        } catch (error) {
            res.send(error.message)
        }

    }

    async passwordResetVerification(req, res) {
        let { code } = req.body
        let user = await authService.checkCode(code)
        if (user == null || user == '' || null) {
            return res.render('recoveryWrongCode')
        }
        await authService.clearCode(user)
        res.render('recoveryPassword', user)
    }

    async passwordReset(req, res) {
        try {
            let { password, email } = req.body
            await authService.passwordReset(email, password)
            res.render('recoverySuccessful')
        } catch (error) {
            res.send(error.message)
        }
    }
}

module.exports = AuthController