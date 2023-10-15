const ticketsModel = require("../../schemas/tickets.schema")

class TicketsDao {
    async createTicket(ticket) {
        const createdTicket = await ticketsModel.create(ticket)
        console.log('created' + createdTicket);
        return await createdTicket.save()
    }

    async findById(ticket) {
        return await ticketsModel.findById(ticket)
    }

    async find() {
        return await ticketsModel.find()
    }

    async findOne(target) {
        return await ticketsModel.findOne(target)
    }

    async findFilter(filter) {
        return await ticketsModel.find(filter).lean()
    }
}

module.exports = TicketsDao