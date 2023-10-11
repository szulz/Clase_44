const userModel = require("../../schemas/users.model")


class UsersDao {
    async getAllLean() {
        return await userModel.find().lean()
    }

    async getAll() {
        return await userModel.find()
    }

    async findByIdAndDelete(id, index) {
        if (index) {
            return await userModel.findByIdAndDelete(id[index])
        }
        return await userModel.findByIdAndDelete(id)
    }

    async findByIdLean(id) {
        return await userModel.findById(id).lean()
    }

    async findById(id) {
        return await userModel.findById(id)
    }

    async updateToAdminOrPremium(newRole, user) {
        return await userModel.findByIdAndUpdate(user, {
            role: newRole,
            documents:
                [{
                    name: 'ADMIN',
                    reference: 'ADMIN',
                }, {
                    name: 'ADMIN',
                    reference: 'ADMIN',
                },
                {
                    name: 'ADMIN',
                    reference: 'ADMIN',
                }]
        }, { new: true })
    }

    async updateToUser(newRole, user) {
        return await userModel.findByIdAndUpdate(user, { role: newRole, documents: [] }, { new: true })
    }

    async findByIdAndUpdate(id, update) {
        return await userModel.findByIdAndUpdate(id, update, { new: true })
    }

    async findOne(data) {
        return await userModel.findOne(data)
    }

    async findLean() {
        return await userModel.find().lean()
    }
}

module.exports = UsersDao