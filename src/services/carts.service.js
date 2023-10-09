
const CartsDao = require("../model/DAOs/carts/carts.mongo.dao.js");
const ProductDao = require("../model/DAOs/products/products.mongo.dao.js");
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
            return products
        }
        let products = cartCountent.cart.map((cart) => {
            return { title: cart.product.title, description: cart.product.description, price: cart.product.price, stock: cart.product.stock, quantity: cart.quantity }
        })
        return products
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
            return response
        } catch (e) {
            logger.error('something went wrong in addToCart')
            throw new Error(e.message)
        }
    }

    async deleteProduct(cartId, productId) {
        try {
            return await cartsDao.deleteById(cartId, productId)
        } catch (e) {
            throw new Error(e.message)
        }
    }

    async getTotalAmount(products) {
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
        return result
    }

    async returnAndClear(cartId) {
        let cartFound = await cartsDao.findById(cartId)
        if (cartFound.cart == '') {
            console.log('EL CARRITO ESTÁ VACIO');
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
        return cartData.save()
    }
}



module.exports = CartService;