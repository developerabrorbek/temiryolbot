const Review = require('../model/review')

const {bot} = require('../bot')


const get_reviews = async (req,res) => {

    const page = +req.query.page || 1
    const limit = req.query.limit || 20
    const skip = (page - 1) * limit

    let select = req.query.select || null
    let fil = req.query.search || {}

    let marks = []

    for (let i=1;i<=5;i++){
        let count = await Review.find({mark:i,status:1}).count()
        marks.push(count)
    }

    const data = await Review
        .find({...fil})
        .select(select)
        .populate(['user'])
        .skip(skip)
        .limit(limit)
        .sort({_id:-1})
        .lean() || []

    const count = await Review
        .find({...fil})
        .count() || 0

    res.json({
        data, count, page, limit, marks
    })
}

const get_review = async (req,res) => {
    if (req.params.id){
        const id = req.params.id 
        let review = await Review.findById(id).populate(['user']).lean()
        res.json(review)
    }
}

const status_review = async (req, res) => {
    if (req.params.id) {
        const id = req.params.id
        const status = req.params.status || 0

        let data = await Review.findById(id).lean() || {}
        data.status = status

        await Review.findByIdAndUpdate(id,data,{new:true})

        let upData = await Review.findOne({_id:id}).populate(['user']).lean()
        res.status(200).send(upData)
    } else {
        res.ststus(400).send({message: "Id topilmadi"})
    }
}


module.exports = {
    get_reviews,
    status_review,
    get_review
}