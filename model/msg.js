const {Schema, model} = require('mongoose')

const Msg = new Schema({
    chat_id: Number,
    message_id: Number,
},{timestamps:true})

module.exports = model('Msg',Msg)