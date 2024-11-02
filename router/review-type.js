const router = require("express").Router();

const {
  getAllReviewTypes,
  createReviewType,
  updateReviewType,
  deleteReviewType,
} = require("../controller/review-type");
const { auth } = require("../middleware/auth");

router
  .get("/", auth, getAllReviewTypes)
  .post("/add", auth, createReviewType)
  .put("/edit/:id", auth, updateReviewType)
  .delete("/delete/:id", auth, deleteReviewType);

module.exports = router;
