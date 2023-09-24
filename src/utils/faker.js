const { faker } = require('@faker-js/faker')

faker.locate = 'es'

const generateProducts = () => {
    return {
        _id: faker.database.mongodbObjectId(),
        title: faker.commerce.product(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        stock: faker.string.numeric(2)
    }
}

module.exports = generateProducts