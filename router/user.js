const router = require('express').Router()

const {get_users} = require('../controller/user')

router.get('/', get_users)


module.exports = router