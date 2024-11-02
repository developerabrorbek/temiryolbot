const ReviewType = require("../model/review-type")

const getAllReviewTypes = async (req, res) => {
    try {
        const allReviewTypes = await ReviewType.find().populate("ReviewType")

        res.status(200).send({
            message: "success",
            data: allReviewTypes
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getAllReviewTypes
}