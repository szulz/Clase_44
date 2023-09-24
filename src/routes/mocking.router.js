const express = require('express')
const generateProducts = require('../utils/faker')
//const { generateProduct, generateUser } = require('../utils/faker')

const mockingRouter = express.Router()

mockingRouter.get('/', (req, res) => {
    const products = []
    for (let i = 0; i < 100; i++) {
        products.push(generateProducts())
    }
    res.send({ status: 'sucess', payload: products })
})

module.exports = mockingRouter