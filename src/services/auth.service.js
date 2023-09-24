const userModel = require("../model/schemas/users.model")
const { logger } = require("../utils/logger")
const { createHash } = require("../utils/utils")

class AuthService {
    async logOut(session) {
        return session.destroy()
    }

    async findUser(data) {
        const user = await userModel.findOne({ email: data })
        return user
    }
    /*
        async updateCode(id, code) {
            let user = await userModel.findByIdAndUpdate(id, { recovery_code: code }, { new: true })
            console.log(user);
            return user
        }
    */

    async updateCode(id, code) {
        let user = await userModel.findByIdAndUpdate(id, { recovery_code: { code: code, createdAt: new Date } }, { new: true })
        console.log(user);
        return user
    }

    async checkCode(data) {
        let user = await userModel.findOne({ recovery_code: { $elemMatch: { code: data } } })
        if (!user) {
            return null
        }
        const createdAt = user.recovery_code.map(recovery_code => recovery_code.createdAt);
        async function checkTime(createdAt, user) {
            const currentDate = new Date()
            let result = currentDate - createdAt[0]
            logger.warn('El tiempo de expiracion de codigo de de 30 segundos por motivos de checkear la funcionalidad')
            if (result >= 30000) {
                await userModel.findByIdAndUpdate(user._id, { recovery_code: [] }, { new: true })
                logger.info('el codigo expiro')
                return null
            }
            return user
        }
        return checkTime(createdAt, user)
    }

    async clearCode(user) {
        return await userModel.findByIdAndUpdate(user._id, { recovery_code: [] }, { new: true })
    }


    async updatePassword(id, password) {
        let newPassword = createHash(password)
        let user = await userModel.findOneAndUpdate(id, { password: newPassword }, { new: true })
        console.log(user);
        return user
    }
}

module.exports = AuthService