const { PORT } = require("../config/env.config.js");
const ProductDao = require("../model/DAOs/products/products.mongo.dao.js");
const productModel = require("../model/schemas/product.schema.js");
const productDao = new ProductDao
const ProductService = require("../services/product.service.js");
const productService = new ProductService
const ProductManagerMongoose = require('../services/product.service.js');
const userModel = require('../model/schemas/users.model.js')
const MailController = require('./mail.controller.js')
const mailController = new MailController

class ProductController {

    async createOne(req, res) {
        const picture_filename = req.file ? req.file.filename : null;
        let role = req.session.user.role ? req.session.user.role : 'ADMIN'
        let user = req.session.user.userID ? req.session.user.userID : null
        let newProd = await productDao.createProduct(req.body, role, user, picture_filename);
        return res.status(200).send({
            status: 'Product successfully added!',
            msg: `The following product has been added to the list:`,
            data: newProd
        });

    }

    async getAll(req, res) {
        let allProducts = await productService.getAll(req.query, req.originalUrl);
        return res.status(200).json({
            status: 'Success!',
            data: allProducts,
        })

    }

    async getIds(req, res) {
        let products = await productModel.find()
        let ids = products.map(x => x._id)
        let titles = products.map(y => y.title)
        let owner = products.flatMap(z => z.owner.map(p => p.status))
        let list = []
        for (let i = 0; i < ids.length; i++) {
            let test = `${titles[i]}=> ${owner[i]} => ${ids[i]}`
            list.push(test)
        }
        return res.status(200).json({
            status: 'Success!',
            amount: `Products => ${ids.length}`,
            data: list,
        })

    }

    async modifyProperties(req, res) {
        let updatedProduct = await productDao.updateProduct(req.params.id, req.body);
        return res.status(200).send({
            status: 'Product successfully updated!',
            msg: `The following product has been updated:`,
            data: updatedProduct
        });

    }

    async deleteById(req, res) {
        try {
            let userId = req.user._id
            let productId = req.params.pid
            let { status, message } = await productService.deleteById(userId, productId)
            return res.send({ status: status, message: message })
        } catch (error) {
            res.send(error.message)
        }
    }

    async returnStock(req, res) {
        let product = await productDao.findById(req.params.pid)
        return res.status(200).send({ data: product.stock });
    }

    async showAll(req, res) {
        let cartId = await req.session.user.cartID
        let getAll = await productService.getAll(req.query, req.originalUrl);
        let userID = req.session.user.userID
        const { payload } = getAll
        let products = payload.map((payload) => {
            return { title: payload.title, description: payload.description, price: payload.price, stock: payload.stock, _id: JSON.stringify(payload._id), picture_filename: payload.picture_filename }
        })
        return res.render("products", { products, getAll, cartId, PORT, userID })
    }

    async returnOne(req, res) {
        try {
            let productId = req.params.pid
            let product = await productService.findById(productId);
            return res.status(200).send({ message: 'product found', payload: product })
        } catch (error) {
            res.send(error.message)
        }
    }
}

module.exports = ProductController