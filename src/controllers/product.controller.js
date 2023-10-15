const { PORT } = require("../config/env.config.js");
const ProductDao = require("../model/DAOs/products/products.mongo.dao.js");
const productDao = new ProductDao
const ProductService = require("../services/product.service.js");
const productService = new ProductService

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
        try {
            let { ids, list } = await productService.getIds()
            return res.status(200).json({
                status: 'Success!',
                amount: `Products => ${ids.length}`,
                data: list,
            })
        } catch (error) {
            res.status(400).send({ status: 'Error', message: error.message })
        }

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
            return res.status(200).send({ status: status, message: message })
        } catch (error) {
            res.status(400).send({ status: 'Error', message: error.message })
        }
    }

    async returnStock(req, res) {
        let product = await productDao.findById(req.params.pid)
        return res.status(200).send({ status: 'Success', data: product.stock });
    }

    async showAll(req, res) {
        let cartId = await req.session.user.cartID
        let userID = await req.session.user.userID
        let { products, getAll } = await productService.showAll(req.query, req.originalUrl)
        return res.status(200).render("products", { products, getAll, cartId, PORT, userID })
    }

    async returnOne(req, res) {
        try {
            let productId = req.params.pid
            let product = await productService.findById(productId);
            return res.status(200).send({ status: 'Success', message: 'product found', payload: product })
        } catch (error) {
            res.status(400).send({ status: 'Error', message: error.message })
        }
    }
}

module.exports = ProductController