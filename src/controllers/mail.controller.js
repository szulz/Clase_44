const nodemailer = require('nodemailer');
const { GOOGLE_EMAIL, GOOGLE_PASSWORD } = require('../config/env.config');
const currentPath = require('path');

const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: GOOGLE_EMAIL,
        pass: GOOGLE_PASSWORD,
    },
})

class MailController {
    async view(req, res) {

        res.render('mail', {})
    }

    async sentMail(req, res) {
        console.log(req.body);
        console.log('lo envie');
        let userEmail = req.user.email
        let message = req.body.message
        let subject = req.body.subject
        const result = await transport.sendMail({
            from: GOOGLE_EMAIL,
            to: userEmail,
            subject: subject,
            html: `
                <div>
                    <h1>${message}</h1>
                    `,
        });
        req.logger.info(result);
        res.render('mailSent', {})
    }

    async sentRecoveryMail(email, code) {
        let userEmail = email
        let message = code
        let subject = 'Recovery Code'
        const result = await transport.sendMail({
            from: GOOGLE_EMAIL,
            to: userEmail,
            subject: subject,
            html: `
                <div>
                    <h1>Here is your generated code: '${message}'</h1>
                    `,
        });
        return result
    }
}

module.exports = MailController