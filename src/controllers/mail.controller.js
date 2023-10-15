const mailService = require('../services/mail.service');

class MailController {
    async view(req, res) {
        res.status(200).render('mail', {})
    }

    async sentMail(req, res) {
        let userEmail = req.user.email
        let message = req.body.message
        let subject = req.body.subject
        let result = await mailService.sentMail(userEmail, message, subject)
        req.logger.info(result);
        res.status(200).render('mailSent', {})
    }

    async sentRecoveryMail(email, code) {
        let userEmail = email
        let message = code
        let subject = 'Recovery Code'
        return await mailService.sentRecoveryMail(userEmail, message, subject)
    }

    async deletedAccountMail(email) {
        let userEmail = email
        let subject = 'Deleted Account'
        return await mailService.deletedAccountMail(userEmail, subject)
    }

    async deletePremiumUsersProduct(email, responsableEmail, productDeleted, responsableRole) {
        let targetedEmail = email
        let subject = 'Deleted Product'
        return await mailService.deletePremiumUsersProduct(targetedEmail, subject, responsableEmail, productDeleted, responsableRole)
    }
}

module.exports = MailController