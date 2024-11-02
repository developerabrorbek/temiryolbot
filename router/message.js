const {bot} = require('../bot')
const User = require('../model/user')

const lang = require('../helper/lang')
const {getKey} = require('../helper/func')

const {
    start, 
    choose_language, 
    get_language, 
    get_phone
} = require('../controller/message/start')
const { welcome } = require('../controller/message/welcome')

const { about } = require('../controller/message/about')
const { 
    start_review, 
    start_text, 
    start_photo, 
    get_photo,
    start_ticket
} = require('../controller/message/review')

const user_action = {
    '/start': start,
    'choose_language': get_language,
    'welcome': welcome,
    'review_1': start_text,
    'review_2': start_photo,
    'review_3': get_photo,
    'review_4': start_ticket
}

const url_map = {
    'about_us': about,
    'set_language': choose_language,
    'start_review': start_review
}

bot.on('message',async msg => {
    const chat_id = msg.from.id
    let user = await User.findOne({chat_id}).lean() || null
    // console.log(user)
    console.log(msg)

    if (msg.text == '/start'){
        return await start(msg)
    }

    if (!user || !user.language && user?.action !=='choose_language'){
        return await choose_language(msg)
    }

    if (user && user?.action == 'choose_language'){
        return await get_language(msg)
    }

    if (!user.phone_number || user.action == 'get_phone'){
        return await get_phone(msg)
    }

    if (url_map.hasOwnProperty(getKey(lang[user.language],msg.text))){
        return await url_map[getKey(lang[user.language],msg.text)](msg,user.language)
    }

    if (user_action.hasOwnProperty(user.action)){
        return await user_action[user.action](msg,user.language)
    }


})