const {bot} = require('../bot')
const Msg = require('../model/msg')

const remove_msg = async (chat_id) => {
    let messages = await Msg.find({chat_id}).lean()
    if (messages){
        await Promise.all(messages.map(async m => {
            await bot.deleteMessage(chat_id,m.message_id)
                .then(() => {
                    return true
                })
                .catch(() => {
                    return false
                })
            await Msg.findByIdAndDelete(m._id)
        }))
    }
}

const log_msg = async (chat_id,message_id,action = '') => {
    await new Msg({chat_id,message_id,action}).save()
}

module.exports = {
    remove_msg,
    log_msg
}