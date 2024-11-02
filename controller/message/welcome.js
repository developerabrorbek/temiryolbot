const Review = require('../../model/review')
const User = require('../../model/user')
const lang = require('../../helper/lang')
const {bot} = require('../../bot')
const { log_msg, remove_msg } = require('../../helper/msg')
const path = require('path')

const welcome = async msg => {
    const chat_id = msg.from.id
    await remove_msg(chat_id)
    let user = await User.findOne({chat_id}).lean()
    await User.findByIdAndUpdate(user._id,{...user,action:'welcome'},{new:true})

    let message = await bot.sendMessage(chat_id,lang[user?.language]?.welcome)

    await log_msg(chat_id,message.message_id)

    message = await bot.sendPhoto(chat_id,path.join(`${__dirname}/../../assets/logo.jpg`),{
        caption: lang[user.language].welcome_text,
        parse_mode:'HTML',
        reply_markup: {
            keyboard: [
                [
                    {text:lang[user.language].start_review},
                    {text:lang[user.language].about_us}
                ],
                [
                    {text:lang[user.language].set_language}
                ]
            ],
            resize_keyboard:true
        }
    })

    await log_msg(chat_id,message.message_id)

}


module.exports = {
    welcome
}