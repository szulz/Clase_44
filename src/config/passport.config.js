const passport = require('passport')
const local = require('passport-local')
const { isValidPassword, createHash } = require("../utils/utils.js");
const LocalStrategy = local.Strategy;
const GitHubStrategy = require('passport-github2')
const FacebookStrategy = require('passport-facebook')
const GoogleStrategy = require('passport-google-oauth2');
const CartManagerMongoose = require('../services/carts.service.js');
const { GITHUB_ID, GOOGLE_ID, FACEBOOK_ID, PORT, ADMIN_EMAIL, ADMIN_STATUS } = require('./env.config.js');
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
                callbackURL: `http://localhost:${PORT}/api/sessions/githubcallback`
            },
            async (accessTocken, _, profile, done) => {
                try {
                    //usé  profile._json.email por que me capturaba mas sencillo el mail
                    //no sé si hay diferencia entre usar primero el .email que el ._json
                    //de cualquier manera lo puedo resolver usando la expresion del clg comentado abajo
                    //console.log(profile.emails[0].value);
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
                        req.logger.info(userCreated)
                        return done(null, userCreated);
                    } else {
                        req.logger.info('user already exist');
                        return done(null, user);
                    }
                } catch (e) {
                    req.logger.error('error en github');
                    return done(e)
                }
            }
        )
    )
    /*
        passport.use(
            'google',
            new GoogleStrategy(
                {
                    clientID: GOOGLE_ID,
                    clientSecret: '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',
                    callbackURL: `http://localhost:${PORT}/api/sessions/googlecallback`,
                    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'email', 'name', 'displayName'],
                    passReqToCallback: true,
    
                },
                async (req, accessToken, refreshToken, profile, done) => {
                    try {
                        console.log(profile);
                        let user = await userModel.findOne({ email: profile.email });
                        if (!user) {
                            const newUser = {
                                email: profile.email,
                                first_name: profile.given_name || 'unspecified',
                                last_name: profile.family_name || 'unspecified',
                                password: 'unspecified',
                                age: 0
                            };
                            let cart = await cartManagerMongoose.createCart();
                            let cartId = cart._id.toString()
                            newUser.cart = cartId
                            let userCreated = await userModel.create(newUser);
                            console.log('user registered');
                            return done(null, userCreated);
                        } else {
                            console.log('user already exist');
                            return done(null, user);
                        }
                    } catch (e) {
                        console.log('error en google');
                        console.log(e);
                        return done(e)
                    }
                }
            )
        )
    
        passport.use(
            'facebook',
            new FacebookStrategy(
                {
                    clientID: FACEBOOK_ID,
                    clientSecret: 'fede9849c4b17736f98a021e7dd8c51d',
                    callbackURL: `http://localhost:${PORT}/api/sessions/facebookcallback`,
                    profileFields: ['id', 'emails', 'name']
                },
                async (accessTocken, _, profile, done) => {
                    try {
                        console.log(profile._json.first_name);
                        let user = await userModel.findOne({ email: profile._json.email });
                        if (!user) {
                            const newUser = {
                                email: profile._json.email,
                                first_name: profile._json.first_name || 'unspecified',
                                last_name: profile._json.last_name || 'unspecified',
                                password: 'unspecified',
                                age: 0
                            };
                            let cart = await cartManagerMongoose.createCart();
                            let cartId = cart._id.toString()
                            newUser.cart = cartId
                            let userCreated = await userModel.create(newUser);
                            console.log('user registered');
                            return done(null, userCreated);
                        } else {
                            console.log('user already exist');
                            return done(null, user);
                        }
                    } catch (e) {
                        console.log('error en facebook');
                        console.log(e);
                        return done(e)
                    }
                }
            )
        )
    */
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
                        req.logger.info('se actualizo el status a admin');
                    }
                } else {
                    user.role = 'user'
                }
                return done(null, user)
            } catch (err) {
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
                        req.logger.info('user already exists')
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
                    req.logger.info(userCreated)
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
