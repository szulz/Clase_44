const winston = require('winston');
const { format } = require('winston')
const { MODE } = require('./../config/env.config')
const { combine, timestamp, prettyPrint} = format;

/*
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};
*/
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: "info",
            format: winston.format.colorize({ all: true })
        }),

        new winston.transports.File({
            filename: './errors.log',
            level: 'error',
            format: winston.format.simple(),
        }),
    ],
});

//loggers por .env

const devLogger = winston.createLogger({
    format: combine(
        timestamp(),
        prettyPrint(),
    ),
    transports: [
        new winston.transports.Console({
            level: "debug",
            format: winston.format.colorize({ all: true })
        }),
    ],
});

const prodLogger = winston.createLogger({
    format: combine(
        timestamp(),
        prettyPrint()
    ),
    transports: [
        new winston.transports.Console({
            level: "info",
            format: winston.format.colorize({ all: true })
        }),

        new winston.transports.File({
            filename: './errors.log',
            level: 'error',
            format: winston.format.simple(),
        }),
    ],
});

const addLogger = (req, res, next) => {
    if (MODE === 'development') {
        req.logger = devLogger
    } else {
        req.logger = prodLogger
    }
    next()
}

module.exports = {
    addLogger: addLogger,
    logger: logger
};
