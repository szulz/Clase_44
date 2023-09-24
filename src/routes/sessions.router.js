const passport = require('passport')
const express = require('express');
const SessionsController = require('../controllers/sessions.controller.js');
const AuthController = require('../controllers/auth.controller.js');
const authController = new AuthController
const sessionsController = new SessionsController
const sessionRouter = express.Router();

sessionRouter.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

sessionRouter.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), sessionsController.user, authController.login);

sessionRouter.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

sessionRouter.get('/facebookcallback', passport.authenticate('facebook', { failureRedirect: '/login' }), sessionsController.user, authController.login);

sessionRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email', 'openid'], accessType: 'offline', prompt: 'select_account' }))

sessionRouter.get('/googlecallback', passport.authenticate('google', { failureRedirect: '/login' }), sessionsController.user, authController.login);

sessionRouter.get('/login', sessionsController.returnUser);

sessionRouter.get('/current', sessionsController.returnUser);

module.exports = sessionRouter