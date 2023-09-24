const { query } = require("express");
const { PORT, SERVER_URL } = require("../config/env.config");
const productModel = require("../model/schemas/product.schema");
const { checkParams } = require("../utils/utils");



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
            let product = 'not found'
            return product
        }

    }
};


module.exports = ProductService;