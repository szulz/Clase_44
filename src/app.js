const fs = require('fs');
const express = require('express');
const { json } = require('express');
const handlebars = require('express-handlebars')
const productRouter = require('./routes/product.router.js')
const mailRouter = require('./routes/mail.router.js');
const sessionRouter = require('./routes/sessions.router.js');
const cartsRouter = require('./routes/carts.router.js')
const authRouter = require('./routes/auth.router.js');
const smsRouter = require('./routes/sms.router.js');
const errorHandler = require('./middlewares/error.js')
const { addLogger, logger } = require('./utils/logger.js');
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUiExpress = require('swagger-ui-express')
const { chatRouter, connectSocket } = require('./routes/chat.router.js');
const passport = require('passport')
const startPassport = require('./config/passport.config.js');
const Auth = require('./middlewares/auth.js');
const auth = new Auth
const { MODE, MONGO_URL, PORT, ADMIN_EMAIL, ADMIN_PASSWORD, MODE_DESCRIPTION, ADMIN_STATUS } = require('./config/env.config.js');
logger.info(MODE_DESCRIPTION)


//--------login----------
const session = require('express-session')
const MongoStore = require('connect-mongo');
//*************************

const myModules = require('./utils/utils.js')
const path = require('path');
const userRouter = require('./routes/users.router.js');
const homeRouter = require('./routes/home.router.js');
const app = express();
app.use(addLogger)
// --------CONNECT TO MONGO--------

myModules.mongo()

// --------HANDLEBARS--------
app.engine('handlebars', handlebars.engine())
app.set("view engine", "handlebars")
app.set("views", path.join(__dirname, "views"))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// --------RUTAS--------

//*MONGOCOOKIES*
app.use(session({
  store: MongoStore.create({ mongoUrl: MONGO_URL, ttl: 7200 }),
  secret: 'SECRETO',
  resave: true,
  saveUninitialized: true
}));
//*fin cookies*

//*PASSPORT*
startPassport();
app.use(passport.initialize())
app.use(passport.session())

//*fin passport*


//------swagger-----
const swaggerOptions = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'Backend 51380',
      description: 'Documentacion proyecto ecommerce. PARA LA MAYORIA DE LAS PRUEBAS NECESITAS ESTÁR EN UNA SESSION, DE LO CONTRARIO LAS PRUEBAS NO FUNCIONAN, ADEMAS DE QUE LA MAYORIA DE LAS RUTAS FUNCIONAN UNICAMENTE CON LA INFORMACION DE UNO MISMO',
    },
  },
  apis: [`${__dirname}/docs/**/*.yaml`],
};

const specs = swaggerJSDoc(swaggerOptions);
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));
//-----------------

app.use('/', homeRouter)
app.use('/auth', authRouter)
app.use('/api/sessions', sessionRouter);
app.use('/api/users', auth.allowUsersInSession, userRouter)
app.use('/products', auth.allowUsersInSession, productRouter);
app.use('/carts', auth.allowUsersInSession, cartsRouter);
app.use('/mail', auth.allowUsersInSession, mailRouter)
app.use('/sms', auth.allowUsersInSession, smsRouter)
app.use('/chat', auth.allowUsersInSession, chatRouter)
app.use(errorHandler)

const httpServer = app.listen(PORT, () => {
  logger.info(`Example app listening on port http://localhost:${PORT}`)
});

connectSocket(httpServer)



