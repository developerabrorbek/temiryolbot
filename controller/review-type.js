const ReviewType = require("../model/review-type");

const getAllReviewTypes = async (req, res, next) => {
  try {
    const reviewTypesWithSubReviews = await ReviewType.find({
      // $or: [
      //   {
      //     sub_reviews: {
      //       $not: {
      //         $size: 0,
      //       },
      //     },
      //   },

      // ],
      review: null,
    }).populate("sub_reviews");

    const allReviewTypes = await ReviewType.find().populate("sub_reviews");

    res.status(200).send({
      message: "success",
      data: allReviewTypes,
      subReviews: reviewTypesWithSubReviews,
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
    });

    if (reviewTypeId) {
      const parentReviewType = await ReviewType.findById(reviewTypeId);

      if (!parentReviewType) {
        throw new Error("Invalid review type id");
      }

      newReviewType.review = reviewTypeId;

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

const updateReviewType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const reviewType = await ReviewType.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!reviewType) {
      throw new Error("Review type not found");
    }

    res.status(200).send({
      message: "success",
      data: reviewType,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReviewType = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reviewType = await ReviewType.findByIdAndDelete(id);

    if (!reviewType) {
      throw new Error("Review type not found");
    }

    res.status(200).send({
      message: "success",
      data: reviewType,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReviewTypes,
  createReviewType,
  updateReviewType,
  deleteReviewType,
};
