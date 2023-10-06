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

    async deletedAccountMail(email) {
        let userEmail = email
        let subject = 'Deleted Account'
        const result = await transport.sendMail({
            from: GOOGLE_EMAIL,
            to: userEmail,
            subject: subject,
            html: `
                <div>
                    <h1>Your account has been removed due to inactivity, please if you want to come back feel free to register once again!</h1>
                    `,
        });
        return result
    }

    async deletePremiumUsersProduct(email, responsableEmail, productDeleted, responsableRole) {
        let targetedEmail = email
        let subject = 'Deleted Product'
        const result = await transport.sendMail({
            from: GOOGLE_EMAIL,
            to: targetedEmail,
            subject: subject,
            html: `
                <div>
                    <h1> Your product '${productDeleted}' has been removed by the ${responsableRole} user:'${responsableEmail}' </h1>
                    `,
        });
        return result
    }
}

module.exports = MailController