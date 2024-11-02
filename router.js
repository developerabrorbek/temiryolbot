const router = require('express').Router()

const {auth} = require('./middleware/auth')

router.use('/',require('./router/main'))
router.use('/auth',require('./router/auth'))
router.use('/review',auth, require('./router/reviews'))
router.use('/user',auth, require('./router/user'))

module.exports = router