const express = require('express');
const CartsController = require('../controllers/carts.controller.js');
const Auth = require('../middlewares/auth.js');
const auth = new Auth
const cartsController = new CartsController
const CartManagerMongoose = require('../services/carts.service.js');
const cartManagerMongoose = new CartManagerMongoose
const cartsRouter = express.Router();

cartsRouter.get('/:cid', auth.isUserCart, cartsController.userCart)

cartsRouter.post('/products/:pid', auth.blockAdmin, cartsController.addProduct);

cartsRouter.delete('/:cid/products/:pid', cartsController.deleteProduct)

cartsRouter.get('/:cid/purchase', auth.isUserCart, cartsController.ticketView)

cartsRouter.post('/:cid/purchase', auth.isUserCart, cartsController.generateTicket)

cartsRouter.get('/:cid/checkout', auth.isUserCart, cartsController.showTicket)

module.exports = cartsRouter