const CartsDao = require("../model/DAOs/carts/carts.mongo.dao.js");
const ProductDao = require("../model/DAOs/products/products.mongo.dao.js");
const TicketsDao = require("../model/DAOs/tickets/tickets.mongo.doa.js");
const ticketsDao = new TicketsDao
const cartsModel = require("../model/schemas/carts.schema.js");
const productModel = require("../model/schemas/product.schema.js");
const logger = require("../utils/logger.js");
const productDao = new ProductDao
const cartsDao = new CartsDao

class CartService {
    async createCart() {
        let newcart = await cartsDao.create()
        return newcart
    }

    async userCart(id) {
        let cartCountent = await cartsDao.findById(id)
        if (cartCountent.cart == '') {
            let products = { empty: 'You have not added anything to the cart yet!' }
            console.log(products);
            return { products }
        }
        let products = cartCountent.cart.map((cart) => {
            return { title: cart.product.title, description: cart.product.description, price: cart.product.price, stock: cart.product.stock, quantity: cart.quantity }
        })
        let totalAmount = []
        let result = 0
        let price = await products.map(product => {
            return product.price
        })
        let amount = products.map(x => {
            return x.quantity
        })
        for (let i = 0; i < products.length; i++) {
            let value = price[i] * amount[i]
            totalAmount.push(value)
        }
        for (let i = 0; i < totalAmount.length; i++) {
            result += totalAmount[i]
        }
        return { products, result }
    }

    async addToCart(cartId, productId, userId) {
        try {
            let product = await productDao.findById(productId)
            let checkOwner = product.owner.find((prop) => prop.createdBy)
            if (checkOwner.createdBy.toJSON() == userId) {
                return null
            }
            let foundCart = await cartsDao.addProduct(cartId)
            let foundProduct = await foundCart.cart.find((item) => item.product._id == productId);
            let response = await productDao.decreaseStock(productId, foundProduct, foundCart)
            if (response === null) {
                return {
                    status: 'not allowed',
                    message: 'You cannot add to the cart a product that you created'
                }
            }
            return {
                status: 'success',
                message: `A new product has been added to the cart with the id ${cartId}`,
                payload: response
            }
        } catch (e) {
            logger.error('something went wrong in addToCart')
            throw new Error(e.message)
        }
    }

    async deleteProduct(cartId, productId) {
        try {
            let response = await cartsDao.deleteById(cartId, productId)
            if (response) {
                return { message: 'The desired product quantity has been decreased by 1', response }
            };
            return { message: 'the product has been removed from the cart successfully!' }
        } catch (e) {
            throw new Error(e.message)
        }
    }

    async returnAndClear(cartId) {
        let cartFound = await cartsDao.findById(cartId)
        if (cartFound.cart == '') {
            return
        }
        const productOnCart = cartFound.cart.map(item => item.product._id)
        const quantitiesOnCart = cartFound.cart.map(item => item.quantity)
        for (let i = 0; productOnCart.length > i; i++) {
            let product = await productModel.findById(productOnCart[i])
            console.log(product);
            product.stock += quantitiesOnCart[i]
            product.save()
        }
        cartFound.cart = []
        return await cartFound.save()
    }

    async emptyCart(id) {
        let cartData = await cartsDao.findById(id)
        cartData.cart = []
        await cartData.save()
        let tickets = await ticketsDao.find()
        let purchaser = tickets.map(ticket => ticket.purchaser)
        let actualPurchaser = purchaser.length - 1
        let actualTicketId = tickets[actualPurchaser]._id
        let ticket = await ticketsDao.findById(actualTicketId)
        return ticket
    }
}



module.exports = CartService;