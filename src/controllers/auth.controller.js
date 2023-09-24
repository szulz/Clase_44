const { logger } = require("handlebars")
const { PORT, ADMIN_EMAIL } = require("../config/env.config.js")
const SessionDTO = require("../model/DTO/session.dto.js")
const userModel = require("../model/schemas/users.model.js")
const AuthService = require("../services/auth.service.js")
const CustomError = require("../services/errors/custom-error.js")
const EErrors = require("../services/errors/enums.js")
const GenerateErrorCauses = require("../services/errors/info.js")
const { generateCode, isValidPassword } = require("../utils/utils.js")
const MailController = require("./mail.controller.js")
const mailController = new MailController
const generateErrorCauses = new GenerateErrorCauses
const authService = new AuthService

class AuthController {
    async logOut(req, res, next) {
        await userModel.findByIdAndUpdate(req.session.user.userID, ({ last_connection: Date.now() }), { new: true })
        authService.logOut(req.session)
        res.redirect('/auth/login')
        next()
    }

    async logInGet(req, res) {
        return res.render('login', {})
    }

    async login(req, res) {
        let clearUser = new SessionDTO(await req.user)
        req.session.user = clearUser
        await userModel.findByIdAndUpdate(clearUser.userID, ({ last_connection: Date.now() }), { new: true })
        return res.redirect('/products')
    }

    async registerGet(req, res) {
        return res.render('register', {})
    }

    async register(req, res) {
        let user = req.user.first_name
        return res.render('welcome', { user, PORT })
        //podria agregar una vista de registrado successfull
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
        const email = req.body.email
        const userFound = await authService.findUser(email)
        if (userFound == null) {
            return res.render('recoveryEmailNotFound')
        }
        const { code } = generateCode();
        await authService.updateCode(userFound._id, code)
        await mailController.sentRecoveryMail(email, code);
        return res.render('recoveryEmailFound', userFound)
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
        let { password, email } = req.body
        let user = await authService.findUser(email)
        if (isValidPassword(password, user.password)) {
            res.send({ message: 'The password cannot be the same as before' })
        }
        await authService.updatePassword(user._id, password)
        res.render('recoverySuccessful')
    }
}

module.exports = AuthController