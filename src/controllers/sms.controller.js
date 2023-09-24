const { TWILIO_TOKEN, TWILIO_ID, TWILIO_PHONE } = require('../config/env.config')
const twilio = require('twilio')
const client = twilio(TWILIO_ID, TWILIO_TOKEN)

class SmsController {
    async send(req, res) {
        let message = req.body.smsBody
        const result = await client.messages.create({
            body: message,
            from: TWILIO_PHONE,
            to: '+541150968007'
        })
        req.logger.info(result);
        setTimeout(() => {
            res.redirect('/products'); // Redirect after 5 seconds
        }, 5000);
    }

    async view(req, res) {
        res.render('sms', {})
    }
}

module.exports = SmsController