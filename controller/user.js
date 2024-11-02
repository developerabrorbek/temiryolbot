const User = require('../model/user')

const get_users = async (req,res) => {
    const page = +req.query.page || 1
    const limit = req.query.limit || 20
    const skip = (page - 1) * limit

    let select = req.query.select || null
    let fil = req.query.search || {}

    const data = await User
        .find({...fil})
        .select(select)
        .skip(skip)
        .limit(limit)
        .sort({_id:-1})
        .lean() || []

    const count = await User
        .find({...fil})
        .count() || 0

    res.json({
        data, count, page, limit
    })
}


module.exports = {
    get_users
}