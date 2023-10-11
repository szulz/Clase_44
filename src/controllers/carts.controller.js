const CartService = require("../services/carts.service.js");
const cartService = new CartService
const CartManagerMongoose = require("../services/carts.service.js");
const TicketService = require("../services/ticket.service.js");
const ticketService = new TicketService
const cartManagerMongoose = new CartManagerMongoose

class CartsController {

    async userCart(req, res) {
        let cartId = req.params.cid
        let { products, result } = await cartService.userCart(cartId);
        return res.render("carts", { products, result })
    }

    async addProduct(req, res) {
        try {
            let { status, message, payload } = await cartService.addToCart(req.session.user.cartID, req.params.pid, req.session.user.userID);
            return res.send({ status: status, message: message, payload: payload })
        } catch (e) {
            return res.send(e.message)
        }
    }

    async deleteProduct(req, res) {
        try {
            let { message, response } = await cartService.deleteProduct(req.params.cid, req.params.pid);
            return res.status(200).send({ message: message, payload: response })
        } catch (error) {
            res.status(400).send({ msg: error.message });
        }
    }

    async ticketView(req, res) {
        const cartid = req.session.user.cartID
        let { products, result } = await cartService.userCart(cartid)
        return res.render("ticketsView", { products, result, cartid })
    }

    async generateTicket(req, res) {
        let user = req.session.user
        return await ticketService.purchase(user)
    }

    async showTicket(req, res) {
        let cartId = req.session.user.cartID
        let userEmail = req.user.email
        let ticket = await cartService.emptyCart(cartId, userEmail)
        req.logger.info(ticket);
        res.render('checkout', ticket)
    }

    async returnCartStock(req, res, next) {
        let cartId = req.session.user.cartID
        await cartService.returnAndClear(cartId)
        next()
    }


}

module.exports = CartsController