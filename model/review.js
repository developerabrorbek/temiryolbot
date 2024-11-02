const {Schema,model} = require('mongoose')

const Review = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    mark: {
        type: Number,
        default: 0
    },
    comment: String,
    ticket: String,
    photo: String,
    status: {
        type: Number,
        default: 0
    }
},{timestamps:true})


module.exports = model('Review',Review)

