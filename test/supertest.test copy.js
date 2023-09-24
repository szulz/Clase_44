const { faker } = require('@faker-js/faker')
const chai = require('chai')
const supertest = require('supertest')

const expect = chai.expect
const requester = supertest('http://127.0.0.1:8080')

describe('API testing / E-commerce', async () => {
    let cookie;
    let createdProduct;
    //-------------TESTING SESSIONS----------
    describe('Testing - SESSIONS', async () => {
        it('TEST 1 - Loggeo y devuelvo el user en session', async () => {
            let user = {
                email: 'test@admin.com',
                password: '123'
            }
            let result = await requester.post('/auth/login').send(user)
            let cookieResult = await result.header['set-cookie'][0].split(';')[0];
            cookie = {
                name: cookieResult.split('=')[0],
                value: cookieResult.split('=')[1]
            }
            let { _body } = await requester.get('/api/sessions/current').set('Cookie', [`${cookie.name}=${cookie.value}`]);
            expect(_body).to.have.property('payload').to.haveOwnProperty('email').to.be.eql(user.email)
        })
    })

    describe('Testing - PRODUCTS', async () => {
        it('TEST 1 - Devuelvo todos los productos', async () => {
            let { ok, status, _body } = await requester.get('/products').set('Cookie', [`${cookie.name}=${cookie.value}`]);
            expect(ok).to.be.eql(true)
            expect(status).to.be.eql(200)
        })

        it('TEST 2 - Creo producto', async () => {
            let newProduct = {
                title: faker.commerce.product(),
                description: faker.commerce.productDescription(),
                price: faker.commerce.price(),
                stock: faker.number.int(10),
            }
            let { _body, status } = await requester.post('/products/create').send(newProduct).set('Cookie', [`${cookie.name}=${cookie.value}`]);
            expect(_body).to.haveOwnProperty('data').to.haveOwnProperty('_id')
            createdProduct = _body.data._id
            expect(status).to.be.eql(200)
        })
        /*
        it('TEST 3 - PROXIMO. AGREGAR DELETE PRODUCT', async () => {
            // let newProduct = {
            //     title: faker.commerce.product(),
            //     description: faker.commerce.productDescription(),
            //     price: faker.commerce.price(),
            //     stock: faker.number.int(10),
            // }
            // let { _body, status } = await requester.post('/products/create').send(newProduct).set('Cookie', [`${cookie.name}=${cookie.value}`]);
            // expect(_body).to.haveOwnProperty('data').to.haveOwnProperty('_id')
            // expect(status).to.be.eql(200)
        })*/
    })

    describe('Testing - CARTS', async () => {
        it('TEST 1 -', async () => {
            let { _body, status } = await requester.post(`/carts/products/${createdProduct}`).set('Cookie', [`${cookie.name}=${cookie.value}`]);
            expect(_body).to.haveOwnProperty('data').to.haveOwnProperty('cart')
            expect(status).to.be.eql(200)
        })
    })
})