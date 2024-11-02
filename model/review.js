const { Schema, model } = require("mongoose");

const Review = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    mark: {
      type: Number,
      default: 0,
    },
    comment: String,
    ticket: String,
    photo: String,
    review_type: {
      type: Schema.Types.ObjectId,
      ref: "ReviewType",
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, collection: "reviews" }
);

module.exports = model("Review", Review);
