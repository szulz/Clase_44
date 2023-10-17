const ticketsModel = require("../../schemas/tickets.schema")

class TicketsDao {
    async createTicket(ticket) {
        const createdTicket = await ticketsModel.create(ticket)
        return await createdTicket.save()
    }

    async findById(ticket) {
        return await ticketsModel.findById(ticket)
    }

    async find(filter) {
        if (!filter) return await ticketsModel.find()
        return await ticketsModel.find(filter).lean()
    }

    async findOne(target) {
        return await ticketsModel.findOne(target)
    }

    async findFilter(filter) {
        return await ticketsModel.find(filter).lean()
    }

    async deleteTickets(filter) {
        return await ticketsModel.deleteMany(filter)
    }
}

module.exports = TicketsDao