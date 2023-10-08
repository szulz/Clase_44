const MailController = require("../controllers/mail.controller")
const mailController = new MailController
const UsersDao = require("../model/DAOs/users/users.dao")
const usersDao = new UsersDao



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

    async becomePremium(userInSession, user, newRole) {
        if (userInSession.role != 'ADMIN') {
            if (user._id.toString() != userInSession._id.toString()) {
                return res.send({ message: 'You do not have the permissions to perform this action' })
            }
        }
        if (newRole !== 'USER' && newRole !== 'PREMIUM') {
            req.logger.warn('NOT ALLOW TO CHANGE THE VALUES')
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
}

module.exports = UserService