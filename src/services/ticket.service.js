const TicketsDao = require("../model/DAOs/tickets/tickets.mongo.doa");
const ticketsDao = new TicketsDao
const ticketsModel = require("../model/schemas/tickets.schema");
const CartService = require("./carts.service");
const cartService = new CartService


class TicketService {
    async purchase(user) {
        let user_code = Math.floor(Math.random() * 100000000)
        let user_purchase_datetime = new Date();
        let user_productsInCart = await cartService.userCart(user.cartID)
        let user_amount = await cartService.getTotalAmount(user_productsInCart)
        let user_purchaser = user.email
        let ticket = {
            code: user_code,
            purchase_datetime: user_purchase_datetime,
            amount: user_amount,
            purchaser: user_purchaser,
        }
        let createdTicket = await ticketsDao.createTicket(ticket)
        console.log(createdTicket);
        return createdTicket
    }

    async find() {
        return await ticketsDao.find()
    }

    async findTicketById(ticketId) {
        return await ticketsDao.findById(ticketId)
    }
}

module.exports = TicketService