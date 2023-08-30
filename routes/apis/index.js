const express = require('express')
const router = express.Router()

const admin = require('./modules/admin')
const passport = require('../../config/passport')

const restController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')

const { apiErrorHandler } = require('../../middleware/error-handler')
const { authenticated, authenticatedAdmin } = require('../../middleware/apiAuth')

// 管理者部分
router.use('/admin', authenticated, authenticatedAdmin, admin)
// 餐廳部分
router.get('/restaurants', authenticated, restController.getRestaurants)
// 使用者部分
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)

router.use('/', apiErrorHandler)

module.exports = router
