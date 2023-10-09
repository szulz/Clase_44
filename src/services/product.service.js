const { query } = require("express");
const { PORT, SERVER_URL } = require("../config/env.config");
const productModel = require("../model/schemas/product.schema");
const { checkParams } = require("../utils/utils");
const UsersDao = require('../model/DAOs/users/users.dao.js');
const ProductDao = require("../model/DAOs/products/products.mongo.dao");
const MailController = require("../controllers/mail.controller");
const mailController = new MailController
const productDao = new ProductDao
const usersDao = new UsersDao



class ProductService {

    async getAll(queryParams, currentUrl) {
        try {
            let query = await checkParams(queryParams);
            let options = {}
            options.limit = queryParams.limit ? queryParams.limit : 10
            options.page = queryParams.page ? queryParams.page : 1
            options.sort = queryParams.sort ? { price: queryParams.sort } : { createdAt: 1 };
            let res = await productModel.paginate(query, options)
            let respose = {
                status: 'success',
                payload: res.docs,
                totalPages: res.totalPages,
                prevPage: res.prevPage,
                nextPage: res.nextPage,
                page: res.page,
                hasPrevPage: res.hasPrevPage,
                hasNextPage: res.hasNextPage,
                prevLink: res.hasPrevPage ? await prevLinkFunction(res.prevPage) : null,
                nextLink: res.hasNextPage ? await nextLinkFunction(res.nextPage) : null,
            }
            async function prevLinkFunction(prevPage) {
                let prevUrl = `${SERVER_URL}${currentUrl}`
                const pUrl = new URL(prevUrl);
                const pageParam = new URLSearchParams(pUrl.search);
                pageParam.set("page", prevPage);
                pUrl.search = pageParam.toString();
                return pUrl.href
            }
            async function nextLinkFunction(nextPage) {
                let nextUrl = `${SERVER_URL}${currentUrl}`
                const nUrl = new URL(nextUrl);
                const pageParam = new URLSearchParams(nUrl.search);
                pageParam.set("page", nextPage);
                nUrl.search = pageParam.toString();
                return nUrl.href
            }
            return respose

        } catch (e) {
            throw new Error(e.message);
        };
    };

    async findById(productId) {
        try {
            let product = await productModel.findById(productId)
            return product
        } catch {
            throw new Error('Product not found!')
        }
    }

    async deleteById(userId, productId) {
        let user = await usersDao.findById(userId)
        let product = await productModel.findById(productId)
        let product_createdBy = product.owner.map(x => x.createdBy)
        let productCreatedBy = product.owner.map(product => product.createdBy).toString()
        let productsOwner = await usersDao.findById(product_createdBy)
        if (user.role == 'PREMIUM') {
            if (productCreatedBy == userId) {
                console.log('primium borro su producto');
                await productDao.deleteProduct(productId)
                return { status: 'Success', message: 'Product successfully deleted!' }
            } else {
                throw new Error('You have to own the product or be admin to delete this product')
            }
        }
        if (user.role == 'ADMIN') {
            console.log('admin borro producto');
            await productDao.deleteProduct(productId)
            await mailController.deletePremiumUsersProduct(productsOwner.email, user.email, product.title, user.role)
            return { status: 'Product successfully deleted!', message: `We sent the product owner an email to notify his product being removed!` }
        }
    }
};


module.exports = ProductService;