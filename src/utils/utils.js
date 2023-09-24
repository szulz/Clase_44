//  --------------MONGOOSE--------------
const { MONGO_URL } = require("../config/env.config");
const { connect } = require("mongoose")

async function connectMongo() {
    try {
        await connect(
            MONGO_URL
        );
        //console.log('plug to mongo');
    } catch (e) {
        console.log(e);
        throw "can not connect"
    }
}

//--------checkquery------
//Cree esta funcion para que no sea tan engorroso el otro archivo, ya que no sabía como hacerlo de otra forma
async function checkQuery(queryParams) {
    let query = {}
    if (queryParams.title || queryParams.description || queryParams.price) {
        query.title = queryParams.title ? queryParams.title : undefined
        query.description = queryParams.description ? queryParams.description : undefined
        query.price = queryParams.price ? queryParams.price : undefined
        if (query.title === undefined) {
            delete query.title
        }
        if (query.description === undefined) {
            delete query.description
        }
        if (query.price === undefined) {
            delete query.price
        }
        return query
    }
}

//--------bcrypt------------
const bcrypt = require('bcrypt');
const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10))
const isValidPassword = (password, hashPassword) => bcrypt.compareSync(password, hashPassword)


//------EmailRecoveryCodes------

const { faker } = require('@faker-js/faker')
faker.locate = 'es'

const generateCode = () => {
    return {
        code: faker.string.alphanumeric({ length: 6 })
    }
}


// -----------EXPORTS-----------------

module.exports = {
    mongo: connectMongo,
    checkParams: checkQuery,
    createHash: createHash,
    isValidPassword: isValidPassword,
    generateCode: generateCode,
};

