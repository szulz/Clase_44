const UsersDao = require("../model/DAOs/users/users.dao")
const userDAo = new UsersDao
const userModel = require("../model/schemas/users.model")
const UserService = require("../services/users.service")
const userService = new UserService
const path = require('path');
const fs = require('fs');


class UserController {
    async getAll(req, res) {
        let users = await userDAo.getAllLean()
        return res.render('users', { users })
    }

    async cleanInactiveUsers(req, res) {
        try {
            let deletedUsers = await userService.cleanInactiveUsers()
            if (deletedUsers.length > 0) {
                return res.send({ message: 'the following users has been deleted:', payload: deletedUsers })
            }
            return res.send({ message: 'No users has been deleted!' })
        } catch {
            res.send({ message: 'something went wrong' })
        }
    }

    async adminViewUsers(req, res) {
        let users = await userDAo.getAllLean()
        return res.render('apiUsersAdminGet', { users })
    }

    async adminUserToModify(req, res) {
        let user = await userDAo.findByIdLean(req.params.uid)
        return res.render('apiUsersAdminUid', { user })
    }

    async adminUserModified(req, res) {
        let user = req.params.uid
        let newRole = req.body.role
        let deleteUser = req.body.delete
        if (newRole) {
            await userService.adminModifyUserRole(newRole, user)
            return res.send({ message: `The role has been updated to ${newRole}` })
        }
        if (deleteUser == 1) {
            await userModel.findByIdAndDelete(user)
            return res.send({ message: 'The role has been removed' })
        }
    }

    ///////////////POR ACÁ
    async userPremiumView(req, res) {
        try {
            let userInSession = req.user
            let targetId = req.params.uid
            //puedo meted el target en el service
            let targetUser = await userDAo.findById(targetId)
            if (userInSession.role != 'ADMIN') {
                targetUser = await userService.roleChecker(targetUser, userInSession)
                return res.render('userRoleChanger', targetUser)
            }
            let allUsers = await userModel.find().lean()
            return res.render('userRoleChangerAdmin', { allUsers })
        } catch (e) {
            return res.send({ message: e.message })
        }
    }
    /*
        async userPremiumView(req, res) {
            try {
                let targetUser = await userModel.findById(req.params.uid)
                let userInSession = req.user
                if (userInSession.role != 'ADMIN') {
                    if (targetUser._id.toString() === userInSession._id.toString()) {
                        if (targetUser.role === 'USER') {
                            targetUser.show = true
                        }
                        if (targetUser.role === 'PREMIUM') {
                            targetUser.show = false
                        }
                    } else {
                        return res.send({ message: 'You cant modify other users' })
                    }
                } else {
                    let allUsers = await userModel.find().lean()
                    let id = allUsers.map(x => x._id).toString().split(',')
                    let email = allUsers.map(x => x.email)
                    return res.render('userRoleChangerAdmin', { allUsers })
                }
                return res.render('userRoleChanger', targetUser)
            } catch {
                return res.send({ message: 'something went wrong' })
            }
        }
    */


    async becomePremium(req, res) {
        try {
            let id = req.body.id
            let newRole = req.body.role
            let userInSession = req.user
            let usercatualizado = await userService.becomePremium(userInSession, id, newRole)
            return res.send({ message: 'se actualizo el rol correctamente', payload: usercatualizado })
        } catch (error) {
            return res.send(error.message)
        }
    }

    async deleteDocumentsBecomeUser(req, res) {
        let user = await userModel.findById(req.params.uid)
        if (req.user.role != 'ADMIN') {
            if (user._id.toString() != req.user._id.toString()) {
                return res.send({ message: 'You do not have the permissions to perform this action' })
            }
        }
        let name = user.documents.map(item => item.name)
        let reference = user.documents.map(item => item.reference)
        for (let i = 0; i < name.length; i++) {
            let pathToDelete = path.join(__dirname, '..', `./public/documents/${name[i]}/${reference[i]}`)
            fs.unlink(pathToDelete, (err) => {
                if (err) {
                    req.logger.error(`Error deleting file: ${err}`);
                } else {
                    req.logger.info('File deleted successfully.');
                }
            })
        }
        let deletedDocuments = await userModel.findByIdAndUpdate(req.params.uid, { documents: [], role: 'USER' }, { new: true })

        res.send({ data: deletedDocuments, message: 'documents deleted' })
    }

    async uploaderView(req, res) {
        try {
            let user = req.params.uid
            let currentUser = req.user
            await userService.uploaderView(user, currentUser)
            return res.render('documents_get', { user })
        } catch (error) {
            return res.send(error.message)
        }
    }

    async postDocuments(req, res) {
        try {
            let account = req.files.account
            let adress = req.files.adress
            let info = req.files.info
            let products = req.files.products
            let profiles = req.files.profiles
            let sessionUser = req.user
            let userId = req.params.uid
            let _id = await userService.postDocuments(userId, sessionUser, account, adress, info)
            return res.render('documents_post', { products, profiles, account, adress, info, _id })
        } catch (error) {
            return res.send(error.message)
        }
    }
}

module.exports = UserController