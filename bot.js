require('dotenv').config()
const telegram = require('node-telegram-bot-api')

const bot = new telegram(process.env.TOKEN,{
    polling: true,
})


module.exports = {
    bot
}

require('./router/message')