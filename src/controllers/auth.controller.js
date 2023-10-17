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
        return res.status(200).redirect('/auth/login')
    }

    async logInGet(req, res) {
        return res.status(200).render('login', {})
    }

    async login(req, res) {
        let clearUser = new SessionDTO(await req.user)
        req.session.user = clearUser
        await usersDao.findByIdAndUpdate(clearUser.userID, { last_connection: Date.now() })
        return res.status(200).redirect('/products')
    }

    async registerGet(req, res) {
        return res.status(200).render('register', {})
    }

    async register(req, res) {
        let user = req.user.first_name
        return res.status(200).render('welcome', { user, PORT })
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
            let { userFound, code } = await authService.recovery(email)
            return res.status(200).render('recoveryEmailFound', { userFound, code })
        } catch (error) {
            res.status(400).send({ status: 'Error', message: error.message })
        }

    }

    async passwordResetVerification(req, res) {
        try {
            let { code } = req.body
            let user = await authService.checkCode(code)
            await authService.clearCode(user)
            res.status(200).render('recoveryPassword', user)
        } catch (error) {
            return res.status(400).send({ status: 'Error', message: error.message })
        }
    }

    async passwordReset(req, res) {
        try {
            let { password, email } = req.body
            await authService.passwordReset(email, password)
            res.status(200).render('recoverySuccessful')
        } catch (error) {
            res.status(400).send({ status: 'Error', message: error.message })
        }
    }
}

module.exports = AuthController