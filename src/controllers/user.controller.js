const { PORT } = require("../config/env.config")
const UsersDao = require("../model/DAOs/users/users.dao")
const userDao = new UsersDao
const userModel = require("../model/schemas/users.model")
const UserService = require("../services/users.service")
const userService = new UserService

class UserController {
    async getAll(req, res) {
        let users = await userDao.getAllLean()
        return res.status(200).render('users', { users })
    }

    async cleanInactiveUsers(req, res) {
        try {
            let { message, payload } = await userService.cleanInactiveUsers()
            return res.status(200).send({ stauts: 'Success', message: message, payload: payload })
        } catch {
            res.status(400).send({ status: 'Error', message: 'something went wrong' })
        }
    }

    async adminViewUsers(req, res) {
        let users = await userDao.getAllLean()
        return res.status(200).render('apiUsersAdminGet', { users })
    }

    async adminUserToModify(req, res) {
        let user = await userDao.findByIdLean(req.params.uid)
        return res.status(200).render('apiUsersAdminUid', { user })
    }

    async adminUserModified(req, res) {
        try {
            let user = req.params.uid
            let newRole = req.body.role
            let deleteUser = req.body.delete
            if (newRole) {
                await userService.adminModifyUserRole(newRole, user)
                return res.status(200).send({ status: 'Success', message: `The role has been updated to ${newRole}` })
            }
            if (deleteUser == 1) {
                let removed = await userDao.findByIdAndDelete(user)
                return res.status(200).send({ status: 'Success', message: 'The user has been removed', data: removed })
            }
        } catch (error) {
            res.status(400).send({ status: 'Error', message: error.message })
        }
    }

    async userPremiumView(req, res) {
        try {
            let userInSession = req.user
            let targetId = req.params.uid
            let targetUser = await userDao.findById(targetId)
            if (userInSession.role != 'ADMIN') {
                targetUser = await userService.roleChecker(targetUser, userInSession)
                return res.status(200).render('userRoleChanger', targetUser)
            }
            let allUsers = await userDao.findLean()
            return res.status(200).render('userRoleChangerAdmin', { allUsers })
        } catch (e) {
            return res.status(400).send({ status: 'Error', message: e.message })
        }
    }

    async becomePremium(req, res) {
        try {
            let id = req.body.id
            let newRole = req.body.role
            let userInSession = req.user
            let usercatualizado = await userService.becomePremium(userInSession, id, newRole)
            return res.status(200).send({ message: 'User rol successfully changed(Log out and sign in agin to see the changes)', payload: usercatualizado })
        } catch (error) {
            return res.status(400).send({ status: 'Error', message: error.message })
        }
    }

    async deleteDocumentsBecomeUser(req, res) {
        try {
            let currentUser = req.user
            let userId = req.params.uid
            let deletedDocuments = await userService.deleteDocumentsBecomeUser(currentUser, userId)
            res.status(200).send({ data: deletedDocuments, message: 'Documents deleted (Log out and sign in agin to see the changes)' })
        } catch (error) {
            res.status(400).send({ status: 'Error', message: error.message })
        }
    }

    async uploaderView(req, res) {
        try {
            let user = req.params.uid
            let currentUser = req.user
            await userService.uploaderView(user, currentUser)
            return res.status(200).render('documents_get', { user })
        } catch (error) {
            return res.status(200).send({ status: 'Error', message: error.message })
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
            return res.status(200).render('documents_post', { products, profiles, account, adress, info, _id })
        } catch (error) {
            return res.status(400).send({ status: 'Error', message: error.message })
        }
    }

    async showProfile(req, res) {
        let { user, ticket } = await userService.profile(req.session.user)
        return res.status(200).render('profile', { user, ticket, PORT })
    }
}


module.exports = UserController