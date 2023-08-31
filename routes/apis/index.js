const express = require('express')
const router = express.Router()

const admin = require('./modules/admin')
const passport = require('../../config/passport')

const restController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')

const { apiErrorHandler } = require('../../middleware/error-handler')
const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')

// 管理者部分
router.use('/admin', authenticated, authenticatedAdmin, admin)

// 餐廳部分
router.get('/restaurants/feeds', authenticated, restController.getFeeds) // 注意順序
router.get('/restaurants/top', authenticated, restController.getTopRestaurants) // 注意順序
router.get('/restaurants', authenticated, restController.getRestaurants)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)

// 使用者部分
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)
router.post('/signup', userController.signUp)

router.use('/', apiErrorHandler)

module.exports = router
