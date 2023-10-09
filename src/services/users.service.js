const MailController = require("../controllers/mail.controller")
const mailController = new MailController
const UsersDao = require("../model/DAOs/users/users.dao")
const usersDao = new UsersDao
const fs = require('fs')
const path = require("path")
const { logger } = require('../utils/logger.js')

class UserService {
    async cleanInactiveUsers() {
        try {
            let users = await usersDao.getAll()
            let lastConnection = users.map(x => x.last_connection)
            let id = users.map(x => x._id)
            const deletedUsers = []
            for (let i = 0; i < lastConnection.length; i++) {
                let timeDiference = Date.now() - lastConnection[i]
                const hourDiference = timeDiference / (60 * 60 * 1000)
                if (hourDiference > 48) {
                    console.log(`se elimino el user con id ${id[i]}`);
                    let response = await usersDao.findByIdAndDelete(id, i);
                    await mailController.deletedAccountMail(response.email)
                    deletedUsers.push(response)
                }
            }
            return deletedUsers
        } catch {
            throw new Error()
        }
    }


    async adminModifyUserRole(newRole, user) {
        if (newRole === 'PREMIUM' || newRole === 'ADMIN') {
            return await usersDao.updateToAdminOrPremium(newRole, user)
        }
        return await usersDao.updateToUser(newRole, user)
    }

    async roleChecker(targetUser, userInSession) {
        if (targetUser._id.toString() === userInSession._id.toString()) {
            if (targetUser.role === 'USER') {
                targetUser.show = true
            }
            if (targetUser.role === 'PREMIUM') {
                targetUser.show = false
            }
            return targetUser
        } else {
            throw new Error('You cant modify other users')
        }
    }

    async becomePremium(userInSession, id, newRole) {
        let user = await usersDao.findById(id)
        if (userInSession.role != 'ADMIN') {
            if (user._id.toString() != userInSession._id.toString()) {
                return res.send({ message: 'You do not have the permissions to perform this action' })
            }
        }
        if (newRole !== 'USER' && newRole !== 'PREMIUM') {
            logger.warn('NOT ALLOW TO CHANGE THE VALUES')
            throw new Error('You cannot modify the preset values!')
        }
        if (user.role === 'PREMIUM' && newRole === 'USER') {
            throw new Error('To become an user again you should delete your credentials!')
        }
        let name = user.documents.map(item => item.name)
        if (name[0] === 'account' && name[1] === 'adress' && name[2] === 'info') {
            console.log(newRole);
            let usercatualizado = await usersDao.findByIdAndUpdate(user._id, { role: newRole })
            return usercatualizado
        } else {
            throw new Error('You have not uploaded your documents!')
        }
    }

    async postDocuments(userId, sessionUser, account, adress, info) {
        let user = await usersDao.findById(userId)
        if (sessionUser.role != 'ADMIN') {
            if (user._id.toString() != sessionUser._id.toString()) {
                throw new Error('You do not have the permissions to perform this action')
            }
        }
        if (account == undefined || adress == undefined || info == undefined) {
            await usersDao.findByIdAndUpdate(userId, { documents: [] })
            if (account != undefined) {
                let filePath = account[0].path
                fs.unlink(filePath, (err) => {
                    if (err) {
                        logger.error(`Error deleting file: ${err}`);
                    } else {
                        logger.info('File deleted successfully.');
                    }
                });
            }
            if (adress != undefined) {
                let filePath = adress[0].path
                fs.unlink(filePath, (err) => {
                    if (err) {
                        logger.error(`Error deleting file: ${err}`);
                    } else {
                        logger.info('File deleted successfully.');
                    }
                });
            }
            if (info != undefined) {
                let filePath = filePath[0].path
                fs.unlink(filePath, (err) => {
                    if (err) {
                        logger.error(`Error deleting file: ${err}`);
                    } else {
                        logger.info('File deleted successfully.');
                    }
                });
            }
            throw new Error('You must upload all 3 files to sucessfully update your status')
        }
        let { _id } = await usersDao.findByIdAndUpdate(userId, {
            documents:
                [
                    { name: account[0].fieldname, reference: account[0].filename },
                    { name: adress[0].fieldname, reference: adress[0].filename },
                    { name: info[0].fieldname, reference: info[0].filename },
                ],
        })
        return _id
    }

    async uploaderView(user, currentUser) {
        let foundUser = await usersDao.findById(user)
        if (currentUser.role != 'ADMIN') {
            if (foundUser._id.toString() != currentUser._id.toString()) {
                throw new Error('You do not have the permissions to perform this action')
            }
        }
    }
}

module.exports = UserService