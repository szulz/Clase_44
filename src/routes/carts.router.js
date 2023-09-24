const express = require('express');
const CartsController = require('../controllers/carts.controller.js');
const Auth = require('../middlewares/auth.js');
const auth = new Auth
const cartsController = new CartsController
const CartManagerMongoose = require('../services/carts.service.js');
const cartManagerMongoose = new CartManagerMongoose
const cartsRouter = express.Router();

//LOCALHOST8080/CARTS/ ->>>>

//busco el carro x id
cartsRouter.get('/:cid', auth.allowUsersInSession, auth.isUserCart, cartsController.userCart)

//agrego prod al carro
cartsRouter.post('/products/:pid', auth.allowUsersInSession, auth.blockAdmin, cartsController.addProduct);

//agregar boton para eliminar prod / decrementar la quantity
cartsRouter.delete('/:cid/products/:pid', auth.allowUsersInSession, cartsController.deleteProduct)

//ticket view
cartsRouter.get('/:cid/purchase', auth.allowUsersInSession, auth.isUserCart, cartsController.ticketView)

cartsRouter.post('/:cid/purchase', auth.allowUsersInSession, auth.isUserCart, cartsController.generateTicket)
//
cartsRouter.get('/:cid/checkout', auth.allowUsersInSession, auth.isUserCart, cartsController.showTicket)

module.exports = cartsRouter