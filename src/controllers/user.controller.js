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
            let user = await userModel.findById(req.body.id)
            let newRole = req.body.role
            let userInSession = req.user
            let usercatualizado = await userService.becomePremium(userInSession, user, newRole)
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
            let foundUser = await userModel.findById(req.params.uid)
            if (req.user.role != 'ADMIN') {
                if (foundUser._id.toString() != req.user._id.toString()) {
                    return res.send({ message: 'You do not have the permissions to perform this action' })
                }
            }
            return res.render('documents_get', { user })
        } catch {
            res.send({ message: 'try with another uid!' })
        }
    }

    async postDocuments(req, res) {
        let account = req.files.account
        let adress = req.files.adress
        let info = req.files.info
        let products = req.files.products
        let profiles = req.files.profiles
        let documents = req.files.documents
        let user = await userModel.findById(req.params.uid)
        if (req.user.role != 'ADMIN') {
            if (user._id.toString() != req.user._id.toString()) {
                return res.send({ message: 'You do not have the permissions to perform this action' })
            }
        }
        if (account == undefined || adress == undefined || info == undefined) {
            await userModel.findByIdAndUpdate(req.params.uid, { documents: [] }, { new: true })
            if (account != undefined) {
                let filePath = account[0].path
                fs.unlink(filePath, (err) => {
                    if (err) {
                        req.logger.error(`Error deleting file: ${err}`);
                    } else {
                        req.logger.info('File deleted successfully.');
                    }
                });
            }
            if (adress != undefined) {
                let filePath = adress[0].path
                fs.unlink(filePath, (err) => {
                    if (err) {
                        req.logger.error(`Error deleting file: ${err}`);
                    } else {
                        req.logger.info('File deleted successfully.');
                    }
                });
            }
            if (info != undefined) {
                let filePath = filePath[0].path
                fs.unlink(filePath, (err) => {
                    if (err) {
                        req.logger.error(`Error deleting file: ${err}`);
                    } else {
                        req.logger.info('File deleted successfully.');
                    }
                });
            }
            return res.send({ message: 'You must upload all 3 files to sucessfully update your status' })
        }
        let { _id } = await userModel.findByIdAndUpdate(req.params.uid, {
            documents:
                [
                    { name: account[0].fieldname, reference: account[0].filename },
                    { name: adress[0].fieldname, reference: adress[0].filename },
                    { name: info[0].fieldname, reference: info[0].filename },
                ],
        }, { new: true })
        //let cleanUser = new DocumentDTO(user)
        res.render('documents_post', { products, profiles, account, adress, info, _id })

    }
}

module.exports = UserController