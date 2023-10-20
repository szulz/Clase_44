const passport = require('passport')
const local = require('passport-local')
const { isValidPassword, createHash } = require("../utils/utils.js");
const LocalStrategy = local.Strategy;
const GitHubStrategy = require('passport-github2')
const FacebookStrategy = require('passport-facebook')
const GoogleStrategy = require('passport-google-oauth2');
const CartManagerMongoose = require('../services/carts.service.js');
const { GITHUB_ID, GOOGLE_ID, FACEBOOK_ID, PORT, ADMIN_EMAIL, ADMIN_STATUS, URL } = require('./env.config.js');
const userModel = require('../model/schemas/users.model.js');
const CustomError = require('../services/errors/custom-error.js');
const EErrors = require('../services/errors/enums.js');
const GenerateErrorCauses = require('../services/errors/info.js');
const generateErrorCauses = new GenerateErrorCauses
const cartManagerMongoose = new CartManagerMongoose


async function startPassport() {

    passport.use(
        'github',
        new GitHubStrategy(
            {
                clientID: GITHUB_ID,
                clientSecret: 'db2a529ef55ff5f08af0e95f0a2836c7f4ac5de6',
                callbackURL: `/api/sessions/githubcallback`
            },
            async (accessTocken, _, profile, done) => {
                try {
                    let user = await userModel.findOne({ email: profile._json.email });
                    if (!user) {
                        const newUser = {
                            email: profile._json.email,
                            first_name: profile.username || profile._json.login || 'unspecified',
                            last_name: profile.displayName || 'unspecified',
                            password: 'unspecified',
                            age: 0
                        };
                        let cart = await cartManagerMongoose.createCart();
                        let cartId = cart._id.toString()
                        newUser.cart = cartId
                        let userCreated = await userModel.create(newUser);
                        //req.logger.info(userCreated)
                        return done(null, userCreated);
                    } else {
                        //req.logger.info('user already exist');
                        return done(null, user);
                    }
                } catch (e) {
                    console.log(e.message);
                    return done(e)
                }
            }
        )
    )

    passport.use(
        'login',
        new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
            try {
                const user = await userModel.findOne({ email: username });
                if (!user) {
                    CustomError.createError({
                        name: 'Incorrect Email',
                        message: 'Please check the email or if you dont have an account create it.',
                        cause: generateErrorCauses.invalidEmail(),
                        code: EErrors.INVALID_EMAIL_LOGIN,
                    })
                }
                if (!isValidPassword(password, user.password)) {
                    CustomError.createError({
                        name: 'Incorrect Password',
                        message: 'Please try again',
                        cause: generateErrorCauses.invalidPassword(),
                        code: EErrors.INVALID_PASSWORD_LOGIN,
                    })
                }
                if (ADMIN_STATUS == 'true') {
                    if (ADMIN_EMAIL == user.email) {
                        await userModel.findByIdAndUpdate(user._id, { role: 'admin' }, { new: true })
                        //req.logger.info('se actualizo el status a admin');
                    }
                } else {
                    user.role = 'user'
                }
                return done(null, user)
            } catch (err) {
                console.log(err.message);
                return done(err)
            }
        })
    );
    passport.use(
        'register',
        new LocalStrategy(
            {
                passReqToCallback: true,
                usernameField: 'email',
            },
            async (req, username, password, done) => {
                try {
                    const newUser = req.body;
                    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    if (!emailRegex.test(username)) {
                        CustomError.createError({
                            name: 'Registration email error',
                            message: 'Error trying to validate the email',
                            cause: generateErrorCauses.userEmail(username),
                            code: EErrors.INVALID_EMAIL,
                        })
                    }
                    let existingUser = await userModel.findOne({ email: username })
                    if (existingUser) {
                        //req.logger.info('user already exists')
                        CustomError.createError({
                            name: 'Email already Registered',
                            message: 'Please try again with another email',
                            cause: generateErrorCauses.duplicatedEmail(username),
                            code: EErrors.DUPLICATED_EMAIL,
                        })
                    }
                    let cart = await cartManagerMongoose.createCart();
                    let cartId = cart._id.toString()
                    newUser.cart = cartId
                    newUser.password = createHash(newUser.password)
                    let userCreated = await userModel.create(newUser);
                    if (ADMIN_STATUS == 'true') {
                        if (ADMIN_EMAIL == userCreated.email) {
                            await userModel.findByIdAndUpdate(userCreated._id, { role: 'admin' }, { new: true })
                        }
                    }
                    //req.logger.info(userCreated)
                    return done(null, userCreated)
                } catch (err) {
                    console.log(err);
                    return done(err)
                }
            }
        )
    )
    passport.serializeUser((user, done) => {
        done(null, user._id);
    })
    passport.deserializeUser(async (id, done) => {
        let user = await userModel.findById(id);
        done(null, user);
    })
}

module.exports = startPassport;
