const ReviewType = require("../model/review-type");

const getAllReviewTypes = async (req, res, next) => {
  try {
    const allReviewTypes = await ReviewType.find().populate("sub_reviews");

    res.status(200).send({
      message: "success",
      data: allReviewTypes,
    });
  } catch (error) {
    next(error);
  }
};

const createReviewType = async (req, res, next) => {
  try {
    const { name, reviewTypeId } = req.body;

    const newReviewType = new ReviewType({
        name,
        reviewTypeId,
      });

    if (reviewTypeId) {
      const parentReviewType = await ReviewType.findById(reviewTypeId);

      if (!parentReviewType) {
        throw new Error("Invalid review type id");
      }

      parentReviewType.sub_reviews.push(newReviewType._id);
      await parentReviewType.save();
    }

    await newReviewType.save();

    res.status(201).send({
      message: "success",
      data: newReviewType,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReviewTypes,
  createReviewType,
};
