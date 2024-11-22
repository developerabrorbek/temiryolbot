const Review = require("../model/review");
const path = require("path");
const fs = require("fs");

const get_reviews = async (req, res) => {
  const page = +req.query.page || 1;
  const limit = req.query.limit || 20;
  const skip = (page - 1) * limit;

  let select = req.query.select || null;
  let fil = req.query.search || {};

  let marks = [];

  for (let i = 1; i <= 5; i++) {
    let count = await Review.find({ mark: i, status: 1 }).count();
    marks.push(count);
  }

  const data =
    (await Review.find({ ...fil, status: 1 })
      .select(select)
      .populate(["user", "review_type", "parent_review_type"])
      // .skip(skip)
      // .limit(limit)
      .sort({ _id: -1 })
      .lean()) || [];

  const count = (await Review.find({ ...fil }).count()) || 0;

  res.json({
    data,
    count,
    // page,
    // limit,
    marks,
  });
};

const get_review_stats = async (req, res) => {
  const categoryStats = await Review.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  const parentReviewTypeStats = await Review.aggregate([
    {
      $lookup: {
        from: "review_type", // Collection name to join with
        localField: "parent_review_type", // Field in `Post` model
        foreignField: "_id", // Field in `User` model
        as: "parentReviewType", // Output array field for matched documents
      },
    },
    {
      $unwind: "$parentReviewType", // Flatten the `userDetails` array
    },
    {
      $group: {
        _id: "$parentReviewType._id",
        count: { $sum: 1 },
        name: { $first: "$parentReviewType.name" },
      },
    },
  ]);

  const unfinishedReviewStats = await Review.aggregate([
    {
      $group: {
        _id: null,
        count: {
          $sum: {
            $cond: [{ $eq: ["$category", 0] }, 1, 0],
          },
        },
      },
    },
  ]);

  res.send({
    categoryStats,
    parentReviewTypeStats,
    unfinishedReviewStats,
  });
};

const get_review = async (req, res) => {
  if (req.params.id) {
    const id = req.params.id;
    let review = await Review.findById(id)
      .populate(["user", "review_type", "parent_review_type"])
      .lean();
    res.json(review);
  } else {
    res.status(404).send({
      message: "Review not found",
    });
  }
};

const delete_review = async (req, res) => {
  if (req.params.reviewId) {
    const id = req.params.reviewId;
    const foundedReview = await Review.findById(id);

    if (foundedReview?.ticket) {
      const filePath = path.join(
        __dirname,
        "..",
        "files",
        foundedReview.ticket
      );
      fs.unlink(filePath, (err) => {
        if (err) {
          return res.status(500).send("File deletion failed");
        }
      });
    }

    await Review.findByIdAndDelete(id);
    return res.status(200).send({ message: "Review deleted successfully" });
  } else {
    return res.status(400).send({ message: "Id topilmadi" });
  }
};

const status_review = async (req, res) => {
  if (req.params.id) {
    const id = req.params.id;
    const status = req.params.status || 0;

    let data = (await Review.findById(id).lean()) || {};
    data.status = status;

    await Review.findByIdAndUpdate(id, data, { new: true });

    let upData = await Review.findOne({ _id: id }).populate(["user"]).lean();
    res.status(200).send(upData);
  } else {
    res.status(400).send({ message: "Id topilmadi" });
  }
};

module.exports = {
  get_reviews,
  status_review,
  get_review,
  get_review_stats,
  delete_review,
};
