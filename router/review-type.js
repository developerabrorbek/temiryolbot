const router = require("express").Router();

const { getAllReviewTypes } = require("../controller/review-type");

router.get("/", getAllReviewTypes);

module.exports = router;
