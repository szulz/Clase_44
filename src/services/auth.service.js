const AuthDao = require("../model/DAOs/auth/auth.mongo.dao")
const authDao = new AuthDao
const userModel = require("../model/schemas/users.model")
const UsersDao = require('../model/DAOs/users/users.dao.js')
const usersDao = new UsersDao
const { logger } = require("../utils/logger")
const { createHash, generateCode, isValidPassword } = require("../utils/utils")
const MailController = require("../controllers/mail.controller")
const mailController = new MailController

class AuthService {
    async logOut(session) {
        await usersDao.findByIdAndUpdate(session.user.userID, { last_connection: Date.now() })
        return await session.destroy()
    }
    /*
        async updateCode(id, code) {
            let user = await userModel.findByIdAndUpdate(id, { recovery_code: code }, { new: true })
            console.log(user);
            return user
        }
    */

    async recovery(userEmail) {
        const userFound = await usersDao.findOne({ email: userEmail })
        if (userFound == null) {
            throw new Error('Email not found!')
        }
        const { code } = generateCode();
        await usersDao.findByIdAndUpdate(userFound._id, { recovery_code: { code: code, createdAt: new Date } })
        await mailController.sentRecoveryMail(userEmail, code);
        return userFound
    }


    async checkCode(data) {
        let user = await usersDao.findOne({ recovery_code: { $elemMatch: { code: data } } })
        if (!user) {
            return null
        }
        const createdAt = user.recovery_code.map(recovery_code => recovery_code.createdAt);
        async function checkTime(createdAt, user) {
            const currentDate = new Date()
            let result = currentDate - createdAt[0]
            logger.warn('El tiempo de expiracion de codigo de de 30 segundos por motivos de checkear la funcionalidad')
            if (result >= 30000) {
                await usersDao.findByIdAndUpdate(user._id, { recovery_code: [] })
                logger.info('el codigo expiro')
                return null
            }
            return user
        }
        return checkTime(createdAt, user)
    }

    async clearCode(user) {
        return await usersDao.findByIdAndUpdate(user._id, { recovery_code: [] })
    }

    async updatePassword(id, password) {
        let newPassword = createHash(password)
        let user = await usersDao.findByIdAndUpdate(id, { password: newPassword })
        return user
    }

    async passwordReset(data, password) {
        let user = await usersDao.findOne({ email: data })
        if (isValidPassword(password, user.password)) {
            throw new Error('The password cannot be the same as before')
        }
        let newPassword = createHash(password)
        user = await usersDao.findByIdAndUpdate(user._id, { password: newPassword })
        return user
    }

}

module.exports = AuthService