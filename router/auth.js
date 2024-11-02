const router = require('express').Router()

const {login,check} = require('../controller/auth')
const { auth } = require('../middleware/auth')

router.get('/', auth, check)
router.post('/login', login)

module.exports = router