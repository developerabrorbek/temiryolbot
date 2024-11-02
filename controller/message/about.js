const {bot} = require('../../bot')

const { remove_msg, log_msg } = require('../../helper/msg')
const lang = require('../../helper/lang')

const about = async (msg,l) => {
    const chat_id = msg.from.id 

    await remove_msg(chat_id)

    let message = await bot.sendPhoto(chat_id,'https://railway.uz/upload/iblock/a65/a6549437b8b0717513fb54e60581df70.JPG',{
        caption: lang[l].about_text,
        parse_mode:'HTML',
        reply_markup: {
            keyboard: [
                [
                    {text:lang[l].start_review},
                    {text:lang[l].about_us}
                ],
                [
                    {text:lang[l].set_language}
                ]
            ],
            resize_keyboard:true
        }
    })

    await log_msg(chat_id,message.message_id)
}

module.exports = {
    about
}