const { faker } = require('@faker-js/faker')
const chai = require('chai')
const { Session } = require('express-session')
const supertest = require('supertest')

const expect = chai.expect
const requester = supertest('http://127.0.0.1:8080')

describe('API testing / E-commerce', () => {
    let cookie;
    let createdProduct;
    let user_in_session;
    describe('Testing - SESSIONS', () => {
        it('TEST 1 - Loggear user', async () => {
            let user = {
                email: 'test@t.com',
                password: 'test'
            }
            let result = await requester.post('/auth/login').send(user)
            let cookieResult = await result.header['set-cookie'][0].split(';')[0];
            cookie = {
                name: cookieResult.split('=')[0],
                value: cookieResult.split('=')[1]
            }
            expect(result.header).to.have.property('set-cookie')
        }).timeout(50000);
        it('TEST 2  - Get current user', async () => {
            let { _body } = await requester.get('/api/sessions/current').set('Cookie', [`${cookie.name}=${cookie.value}`]);
            user_in_session = _body.payload;
            expect(_body).to.have.property('payload').to.haveOwnProperty('email')
        }).timeout(50000)
        it('TEST 3 - ', async () => {
            expect(1).to.be.eql(1)
        }).timeout(50000)
    })
    describe('Testing - PRODUCTS', () => {
        it('TEST 1 - Get all products', async () => {
            let { ok, status, _body } = await requester.get('/products').set('Cookie', [`${cookie.name}=${cookie.value}`]);
            expect(status).to.be.eql(301)
        }).timeout(50000);
        it('TEST 2 - Create a new product', async () => {
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
        }).timeout(50000);
        it('TEST 3 - Return a product by ID(the one we just created)', async () => {
            let { _body, status } = await requester.get(`/products/get-one/${createdProduct}`).set('Cookie', [`${cookie.name}=${cookie.value}`]);
            expect(_body).to.haveOwnProperty('payload').to.haveOwnProperty('_id').to.be.eql(createdProduct)
            expect(status).to.be.eql(200)
        }).timeout(50000)
        it('TEST 4 - DELETE A PRODUCT', async () => {
            let { _body, status, ok } = await requester.delete(`/products/${createdProduct}`).set('Cookie', [`${cookie.name}=${cookie.value}`])
            expect(_body).to.haveOwnProperty('status').to.be.eql('Product successfully deleted!')
            expect(ok).to.be.eql(true)
            expect(status).to.be.eql(200)
        })
    })
    describe('Testing - CARTS', () => {
        it('TEST 1 - Add product to user cart', async () => {
            let prodToDelete = '650f571ce6bb574ebf0c56a0'
            let { _body, status } = await requester.post(`/carts/products/${prodToDelete}`).set('Cookie', [`${cookie.name}=${cookie.value}`]);
            expect(_body).to.haveOwnProperty('data').to.haveOwnProperty('cart')
            expect(status).to.be.eql(200)
        }).timeout(50000);
        it('TEST 2 - Show cart content', async () => {
            let response = await requester.get(`/carts/${user_in_session.cart}`).set('Cookie', [`${cookie.name}=${cookie.value}`]);
            expect(status).to.be.eql(200)
        }).timeout(50000)
        it('TEST 3 - Delete or decrease one product in user´s cart', async () => {
            let prodToDelete = '650f571ce6bb574ebf0c56a0'
            let { _body, status } = await requester.delete(`/carts/${user_in_session.cart}/products/${prodToDelete}`).set('Cookie', [`${cookie.name}=${cookie.value}`]);
            expect(_body).to.haveOwnProperty('data').to.haveOwnProperty('_id')
            expect(status).to.be.eql(200)
        }).timeout(50000)
    })
})