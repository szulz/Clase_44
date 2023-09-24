const ticketsModel = require("../../schemas/tickets.schema")


class TicketsDao {
    async createTicket(ticket) {
        const createdTicket = await ticketsModel.create(ticket)
        return createdTicket
    }

    async findById(ticket) {
        return await ticketsModel.findById(ticket)
    }

    async find() {
        return await ticketsModel.find()
    }
}

module.exports = TicketsDao