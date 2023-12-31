const nodemailer = require('nodemailer');
const { GOOGLE_EMAIL, GOOGLE_PASSWORD } = require('../config/env.config.js');
const currentPath = require('path');

const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: GOOGLE_EMAIL,
        pass: GOOGLE_PASSWORD,
    },
})


class MailService {
    async sentMail(userEmail, message, subject) {
        return await transport.sendMail({
            from: userEmail,
            to: GOOGLE_EMAIL,
            subject: subject,
            html: `
                <div>
                    <h1>${message}</h1>
                    `,
        });
    }

    async sentRecoveryMail(userEmail, message, subject) {
        return await transport.sendMail({
            from: GOOGLE_EMAIL,
            to: userEmail,
            subject: subject,
            html: `
                <div>
                    <h1>Here is your generated code: '${message}'</h1>
                    `,
        });
    }

    async deletedAccountMail(userEmail, subject, productsDeleted) {
        return await transport.sendMail({
            from: GOOGLE_EMAIL,
            to: userEmail,
            subject: subject,
            html: `
                <div>
                    <h1>Your account along with your credentials, created products and information has been deleted due to inactivity</h1> <br>
                    Products deleted: <br>
                    ${productsDeleted}
                    `,
        });
    }

    async deletePremiumUsersProduct(targetedEmail, subject, responsableEmail, productDeleted, responsableRole) {
        return await transport.sendMail({
            from: GOOGLE_EMAIL,
            to: targetedEmail,
            subject: subject,
            html: `
                <div>
                    <h1> Your product '${productDeleted}' has been removed by the ${responsableRole} user:'${responsableEmail}' </h1>
                    `,
        });
    }
}

module.exports = new MailService