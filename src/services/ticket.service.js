const TicketsDao = require("../model/DAOs/tickets/tickets.mongo.doa");
const ticketsDao = new TicketsDao
const ticketsModel = require("../model/schemas/tickets.schema");
const CartService = require("./carts.service.js");
const cartService = new CartService

class TicketService {
    async purchase(user) {
        try {
            let user_code = Math.floor(Math.random() * 100000000)
            let user_purchase_datetime = new Date();
            let { result } = await cartService.userCart(user.cartID)
            let user_purchaser = user.email
            let ticket = {
                code: user_code,
                purchase_datetime: user_purchase_datetime,
                amount: result,
                purchaser: user_purchaser,
            }
            let createdTicket = await ticketsDao.createTicket(ticket)
            return await createdTicket.save()
        } catch (error) {
           throw new Error(error.message)
        }
    }

    async find() {
        return await ticketsDao.find()
    }

    async findTicketById(ticketId) {
        return await ticketsDao.findById(ticketId)
    }
}

module.exports = TicketService