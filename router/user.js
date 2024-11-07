const router = require('express').Router()

const {get_users} = require('../controller/user')
const { auth } = require('../middleware/auth')

router.get('/', auth ,get_users)


module.exports = router