const CartService = require("../services/carts.service.js");
const cartService = new CartService
const CartManagerMongoose = require("../services/carts.service.js");
const TicketService = require("../services/ticket.service.js");
const ticketService = new TicketService
const cartManagerMongoose = new CartManagerMongoose

class CartsController {

    async userCart(req, res) {
        try {
            let cartId = req.params.cid
            let { products, result } = await cartService.userCart(cartId);
            return res.status(200).render("carts", { products, result })
        } catch (e) {
            res.status(400).render('cartsError')
        }
    }

    async addProduct(req, res) {
        try {
            let { status, message, payload } = await cartService.addToCart(req.session.user.cartID, req.params.pid, req.session.user.userID);
            return res.status(200).send({ status: status, message: message, payload: payload })
        } catch (e) {
            return res.status(400).send({ status: 'Error', message: e.message })
        }
    }

    async deleteProduct(req, res) {
        try {
            let { message, response } = await cartService.deleteProduct(req.params.cid, req.params.pid);
            return res.status(200).send({ message: message, payload: response })
        } catch (error) {
            res.status(400).send({ status: 'Error', message: error.message });
        }
    }

    async ticketView(req, res) {
        try {
            const cartid = req.session.user.cartID
            let { products, result } = await cartService.userCart(cartid)
            return res.status(200).render("ticketsView", { products, result, cartid })
        } catch (e) {
            res.status(400).send(e.message)
        }
    }

    async generateTicket(req, res) {
        let user = req.session.user
        return await ticketService.purchase(user)
    }

    async showTicket(req, res) {
        try {
            let cartId = req.session.user.cartID
            let userEmail = req.user.email
            let ticket = await cartService.emptyCart(cartId, userEmail)
            req.logger.info(ticket);
            res.status(200).render('checkout', ticket)
        } catch (error) {
            res.status(400).send(error.message)
        }
    }

    async returnCartStock(req, res, next) {
        let cartId = req.session.user.cartID
        await cartService.returnAndClear(cartId)
        next()
    }


}

module.exports = CartsController