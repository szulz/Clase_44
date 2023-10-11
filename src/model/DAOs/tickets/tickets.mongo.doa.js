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
        await ticketsModel.findOne(target)
    }
}

module.exports = TicketsDao