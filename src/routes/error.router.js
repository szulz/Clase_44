const express = require('express')
const errorRouter = express.Router();

errorRouter.get('/', async (req, res) => {
    req.logger.error('this is a error logger')
    req.logger.warn('this is a warn logger')
    req.logger.info('this is a info logger')
    req.logger.http('this is a http logger')
    req.logger.verbose('this is a verbose logger')
    req.logger.debug('this is a debug logger')
    res.send({ message: 'Logger Testing endpoint' })
})


module.exports = errorRouter