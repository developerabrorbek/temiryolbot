const router = require("express").Router();

const { getAllReviewTypes, createReviewType } = require("../controller/review-type");

router.get("/", getAllReviewTypes)
.post("/add", createReviewType)

module.exports = router;
