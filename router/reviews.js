const router = require("express").Router();

const {
  get_reviews,
  get_review,
  get_review_stats,
  delete_review,
} = require("../controller/reviews");
const { auth } = require("../middleware/auth");

router.get("/", auth, get_reviews);
// router.get("/:id/:status", auth, status_review);
router.get("/statistics/stats", auth, get_review_stats);
router.get("/single/:id", auth, get_review);
router.delete("/delete/:reviewId", auth, delete_review);

module.exports = router;
