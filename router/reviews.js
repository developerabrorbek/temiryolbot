const router = require("express").Router();

const {
  get_reviews,
  status_review,
  get_review,
} = require("../controller/reviews");
const { auth } = require("../middleware/auth");

router.get("/", auth, get_reviews);
router.get("/:id/:status", auth, status_review);
router.get("/:id", auth, get_review);

module.exports = router;
