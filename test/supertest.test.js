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
    let newUser;
    let recoveryCode;
    describe('Testing - SESSIONS', () => {
        it('TEST 0 - Create user', async () => {
            newUser = {
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                email: faker.internet.email(),
                password: '123',
            }
            let { statusCode, ok } = await requester.post('/auth/register').send(newUser)
            expect(statusCode).to.be.eql(200)
            expect(ok).to.be.eql(true)
        }).timeout(50000);
        it('TEST 1 - Loggear user', async () => {
            let user = { email: newUser.email, password: newUser.password }
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
        
    })
})