const { Schema, model } = require("mongoose");

const ReviewType = new Schema(
  {
    name: {
      type: Schema.Types.Mixed,
    },
    sub_reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "ReviewType",
      },
    ],
    review: {
      type: Schema.Types.ObjectId,
      ref: "ReviewType",
    },
    priority: {
      type: Schema.Types.Number,
      default: 1
    }
  },
  { timestamps: true, collection: "review_type" }
);

module.exports = model("ReviewType", ReviewType);
