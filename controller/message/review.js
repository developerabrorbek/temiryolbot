const { v4: uuidv4 } = require('uuid');
const Review = require('../../model/review')
const User = require('../../model/user')
const lang = require('../../helper/lang')
const {bot} = require('../../bot')
const { remove_msg, log_msg } = require('../../helper/msg')
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const https = require('https')

const start_review = async msg => {
    const chat_id = msg.from.id
    await remove_msg(chat_id)
    let user = await User.findOne({chat_id}).lean()
    // await User
    await User.findByIdAndUpdate(user._id,{...user,action:'review_1'},{new:true})

    let message = await bot.sendMessage(chat_id,lang[user.language].review_1,{
        reply_markup: {
            keyboard: [
                [{text:'⭐️'}],
                [{text:'⭐️⭐️'}],
                [{text:'⭐️⭐️⭐️'}],
                [{text:'⭐️⭐️⭐️⭐️'}],
                [{text:'⭐️⭐️⭐️⭐️⭐️'}],
            ],
            resize_keyboard:true
        }
    })
    await log_msg(chat_id,message.message_id)
}

const start_text = async msg => {
    const chat_id = msg.from.id 
    await remove_msg(chat_id)
    let user = await User.findOne({chat_id}).lean()
    let list = ['⭐️','⭐️⭐️','⭐️⭐️⭐️','⭐️⭐️⭐️⭐️','⭐️⭐️⭐️⭐️⭐️']
    if (list.includes(msg.text)){
        let mark = msg.text.length/2
        let checkReview = await Review.findOne({user:user._id,status:0}).lean()
        if (!checkReview){
            await new Review({user:user._id,mark}).save()
        } else {
            await Review.findByIdAndUpdate(checkReview._id,{...checkReview,mark},{new:true})
        }        
        await User.findByIdAndUpdate(user._id,{...user,action:'review_2'},{new:true})
        let message = await bot.sendMessage(chat_id,lang[user.language].review_2,{
            reply_markup: {
                keyboard: [
                    [
                        {text:lang[user.language].back},
                        {text:lang[user.language].pass},
                    ]
                ],
                resize_keyboard:true
            }
        })
        return await log_msg(chat_id,message.message_id)
    } 
    return await start_review(msg)
}

const start_photo = async msg => {
    const chat_id = msg.from.id 
    await remove_msg(chat_id)
    let user = await User.findOne({chat_id}).lean()
    let review = await Review.findOne({user:user._id,status:0}).lean()
    if (lang[user.language].back == msg.text){
        return await start_review(msg)
    }

    if (lang[user.language].pass == msg.text){
        await Review.findByIdAndUpdate(review._id,{...review,photo: null},{new:true})  
        await User.findByIdAndUpdate(user._id,{...user,action:'review_3'},{new:true})
        let message = await bot.sendMessage(chat_id,lang[user.language].review_3,{
            reply_markup: {
                keyboard: [
                    [
                        {text:lang[user.language].back},
                        {text:lang[user.language].pass},
                    ]
                ],
                resize_keyboard:true
            }
        })
        return await log_msg(chat_id,message.message_id)
    }
    
    await Review.findByIdAndUpdate(review._id,{...review,comment: msg.text},{new:true})      
    await User.findByIdAndUpdate(user._id,{...user,action:'review_3'},{new:true})
    let message = await bot.sendMessage(chat_id,lang[user.language].review_3,{
        reply_markup: {
            keyboard: [
                [
                    {text:lang[user.language].back},
                    {text:lang[user.language].pass},
                ]
            ],
            resize_keyboard:true
        }
    })
    return await log_msg(chat_id,message.message_id)
}

const get_photo = async msg => {
    const chat_id = msg.from.id 
    await remove_msg(chat_id)
    let id = uuidv4()
    let user = await User.findOne({chat_id}).lean()
    if (lang[user.language].back == msg.text){
        await User.findByIdAndUpdate(user._id,{...user,action:'review_2'},{new:true})
        let message = await bot.sendMessage(chat_id,lang[user.language].review_2,{
            reply_markup: {
                keyboard: [
                    [
                        {text:lang[user.language].back},
                        {text:lang[user.language].pass},
                    ]
                ],
                resize_keyboard:true
            }
        })
        return await log_msg(chat_id,message.message_id)
    }

    if (lang[user.language].pass == msg.text){
        await User.findByIdAndUpdate(user._id,{...user,action:'review_4'},{new:true})
        let review = await Review.findOne({user:user._id,status:0}).lean()
        await Review.findByIdAndUpdate(review._id,{...review,photo:null},{new:true})

        await User.findByIdAndUpdate(user._id,{...user,action:'review_4'},{new:true})
        let message = await bot.sendMessage(chat_id,lang[user.language].review_4,{
            reply_markup: {
                keyboard: [
                    [
                        {text:lang[user.language].back},
                        {text:lang[user.language].done},
                    ]
                ],
                resize_keyboard:true
            }
        })
        return await log_msg(chat_id,message.message_id)
    }

    let fileId
    let fileUniqueId
    let folder

    if (msg.photo){
        const photo = msg.photo.reduce((prev, current) => (prev.width > current.width) ? prev : current);
        folder = 'photo'
        fileId = photo.file_id;
        fileUniqueId = photo.file_unique_id;
    }

    if (msg.video){
        folder = 'video'
        fileId = msg.video.file_id;
        fileUniqueId = msg.video.file_unique_id;
    }
    if (msg.video_note){
        folder = 'video_note'
        fileId = msg.video_note.file_id;
        fileUniqueId = msg.video_note.file_unique_id;
    }

    if (fileId && fileUniqueId){
        bot.getFile(fileId).then(async (fileInfo) => {
            const fileUrl = `https://api.telegram.org/file/bot${process.env.TOKEN}/${fileInfo.file_path}`

            let filename = folder == 'photo'  ? `${fileUniqueId}.jpg` : folder == 'video_note' ? `${fileUniqueId}.mp4`  : `${fileUniqueId}_${msg.video.file_name}`

            filename = `${id}_${filename}`
            
            const fileStream = fs.createWriteStream(path.join(`${__dirname}/../../files/${folder}/${filename}`))
            https.get(fileUrl, (response) => {response.pipe(fileStream)})

            let review = await Review.findOne({user:user._id,status:0}).lean()
            await Review.findByIdAndUpdate(review._id,{...review,photo:`${folder}/${filename}`},{new:true})

            await User.findByIdAndUpdate(user._id,{...user,action:'review_4'},{new:true})
            let message = await bot.sendMessage(chat_id,lang[user.language].review_4,{
                reply_markup: {
                    keyboard: [
                        [
                            {text:lang[user.language].back},
                            {text:lang[user.language].done},
                        ]
                    ],
                    resize_keyboard:true
                }
            })
            return await log_msg(chat_id,message.message_id)

        }).catch((error) => {
            console.error('Error downloading file:', error);
        })
    } else {
        await start_photo(msg)
    }


}

const start_ticket = async msg => {
    const chat_id = msg.from.id 
    await remove_msg(chat_id)
    let user = await User.findOne({chat_id}).lean()
    let review = await Review.findOne({user:user._id,status:0}).lean()
    let id = uuidv4()
    if (lang[user.language].back == msg.text){
        await Review.findByIdAndUpdate(review._id,{...review,ticket:null,photo:null},{new:true})      
        await User.findByIdAndUpdate(user._id,{...user,action:'review_3'},{new:true})
        let message = await bot.sendMessage(chat_id,lang[user.language].review_3,{
            reply_markup: {
                keyboard: [
                    [
                        {text:lang[user.language].back},
                        {text:lang[user.language].pass},
                    ]
                ],
                resize_keyboard:true
            }
        })
        return await log_msg(chat_id,message.message_id)
    }

    if (lang[user.language].done == msg.text){
        await User.findByIdAndUpdate(user._id,{...user,action:'welcome'},{new:true})
        await Review.findByIdAndUpdate(review._id,{...review,status:1},{new:true})
        let message = await bot.sendMessage(chat_id,lang[user.language].review_5,{
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
        return await log_msg(chat_id,message.message_id)
    }

    let fileId
    let fileUniqueId
    let folder

    if (msg.photo){
        const photo = msg.photo.reduce((prev, current) => (prev.width > current.width) ? prev : current);
        folder = 'ticket'
        fileId = photo.file_id;
        fileUniqueId = photo.file_unique_id;
    }

    if (fileId && fileUniqueId){
        bot.getFile(fileId).then(async (fileInfo) => {
            const fileUrl = `https://api.telegram.org/file/bot${process.env.TOKEN}/${fileInfo.file_path}`
            let filename = `${id}_${fileUniqueId}.jpg`
            const fileStream = fs.createWriteStream(path.join(`${__dirname}/../../files/${folder}/${filename}`))
            https.get(fileUrl, (response) => {response.pipe(fileStream)})

            await Review.findByIdAndUpdate(review._id,{
                ...review,
                ticket:`${folder}/${filename}`,
                status:1
            },{new:true})


            await User.findByIdAndUpdate(user._id,{...user,action:'welcome'},{new:true})
            let message = await bot.sendMessage(chat_id,lang[user.language].review_5,{
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
            return await log_msg(chat_id,message.message_id)

        }).catch((error) => {
            console.error('Error downloading file:', error);
        })
    } else {
        await User.findByIdAndUpdate(user._id,{...user,action:'review_4'},{new:true})
            let message = await bot.sendMessage(chat_id,lang[user.language].review_4,{
                reply_markup: {
                    keyboard: [
                        [
                            {text:lang[user.language].back},
                            {text:lang[user.language].done},
                        ]
                    ],
                    resize_keyboard:true
                }
            })
            return await log_msg(chat_id,message.message_id)
    }
}

module.exports = {
    start_review,
    start_text,
    start_photo,
    get_photo,
    start_ticket
}