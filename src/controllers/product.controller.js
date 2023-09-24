const { PORT } = require("../config/env.config.js");
const ProductDao = require("../model/DAOs/products/products.mongo.dao.js");
const productModel = require("../model/schemas/product.schema.js");
const productDao = new ProductDao
const ProductService = require("../services/product.service.js");
const productService = new ProductService
const ProductManagerMongoose = require('../services/product.service.js');
const userModel = require('../model/schemas/users.model.js')

class ProductController {

    async createOne(req, res) {
        //TODO: SEGUIR MEJORANDO EL CODIGO REPETITIVO!!!!!!!!
        const picture_filename = req.file ? req.file.filename : null;
        console.log(picture_filename);
        if (!req.session.user) {
            let fakeUser = { role: 'ADMIN', userID: null }
            let role = fakeUser.role
            let user = fakeUser.userID
            let newProd = await productDao.createProduct(req.body, role, user, picture_filename);
            return res.status(200).send({
                status: 'Product successfully added!',
                msg: `The following product has been added to the list:`,
                data: newProd
            });
        }
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

    async modifyProperties(req, res) {
        //cree algunas de las funciones directamente en el modelo ya que no veia necesario usar el service 
        //para llamar unicamente a una funcion que directamente lo puedo hacer acá
        let updatedProduct = await productDao.updateProduct(req.params.id, req.body);
        return res.status(200).send({
            status: 'Product successfully updated!',
            msg: `The following product has been updated:`,
            data: updatedProduct
        });

    }

    async deleteById(req, res) {
        let userId = req.user._id
        console.log(req.user);
        let user = await userModel.findById(userId)
        let productId = req.params.pid
        let product = await productModel.findById(productId)
        let productCreatedBy = product.owner.map(product => product.createdBy).toString()
        if (user.role == 'PREMIUM') {
            if (productCreatedBy == userId) {
                console.log('primium borro su producto');
                await productDao.deleteProduct(productId)
                return res.status(200).send({
                    status: 'Product successfully deleted!',
                });
            } else {
                res.status(400).send({ message: 'You have to own the product or be admin to delete this product' })
            }
        }
        if (user.role == 'ADMIN') {
            console.log('admin borro producto');
            await productDao.deleteProduct(productId)
            return res.status(200).send({
                status: 'Product successfully deleted!',
            })
        }
    }

    async returnStock(req, res) {
        let product = await productDao.findById(req.params.pid)
        return res.status(200).send({ data: product.stock });
    }

    async showAll(req, res) {
        let cartId = await req.session.user.cartID
        let getAll = await productService.getAll(req.query, req.originalUrl);
        const { payload } = getAll
        let products = payload.map((payload) => {
            return { title: payload.title, description: payload.description, price: payload.price, stock: payload.stock, _id: JSON.stringify(payload._id), picture_filename: payload.picture_filename }
        })
        return res.render("products", { products, getAll, cartId, PORT })
    }

    async returnOne(req, res) {
        let productId = req.params.pid
        let product = await productService.findById(productId);
        if (product == 'not found') {
            return res.status(400).send({ message: product })
        }
        return res.status(200).send({ message: 'product found', payload: product })
    }
}

module.exports = ProductController