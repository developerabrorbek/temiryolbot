const router = require('express').Router()

const {get_reviews, status_review} = require('../controller/reviews')

router.get('/', get_reviews)
router.get('/:id/:status', status_review)
router.get('/:id', status_review)


module.exports = router