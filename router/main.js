const router = require('express').Router()

const {home} = require('../controller/main')

router.route('/').get(home)

module.exports = router