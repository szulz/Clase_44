const dotenv = require('dotenv')
const { Command } = require('commander')

const program = new Command()

program.option("--mode <mode>", "modo de trabajo", 'DEVELOPMENT')
program.parse();

dotenv.config({
    path: program.opts().mode === 'DEVELOPMENT' ? './.env.development' : './.env.production',
})


module.exports = {
    MONGO_URL: process.env.MONGO_URL,
    PORT: process.env.PORT,
    ADMIN_STATUS: process.env.ADMIN_STATUS,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    MODE_DESCRIPTION: process.env.MODE_DESCRIPTION,
    MODE: process.env.MODE,
    GITHUB_ID: process.env.GITHUB_ID,
    GOOGLE_ID: process.env.GOOGLE_ID,
    FACEBOOK_ID: process.env.FACEBOOK_ID,
    GOOGLE_EMAIL: process.env.GOOGLE_EMAIL,
    GOOGLE_PASSWORD: process.env.GOOGLE_PASSWORD,
    TWILIO_ID: process.env.TWILIO_ID,
    TWILIO_TOKEN: process.env.TWILIO_TOKEN,
    TWILIO_PHONE: process.env.TWILIO_PHONE,
    SERVER_URL: process.env.SERVER_URL,
    URL: process.env.URL,
    GITHUB_LOCAL_ID: process.env.GITHUB_LOCAL_ID,
    GITHUB_LOCAL_clientSecret: process.env.GITHUB_LOCAL_clientSecret,
    GITHUB_LOCAL_callbackURL: process.env.GITHUB_LOCAL_callbackURL,
    GITHUB_RENDER_ID: process.env.GITHUB_RENDER_ID,
    GITHUB_RENDER_clientSecret: process.env.GITHUB_RENDER_clientSecret,
    GITHUB_RENDER_callbackURL: process.env.GITHUB_RENDER_callbackURL,
}
