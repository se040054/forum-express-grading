const express = require('express')
const router = express.Router()

const admin = require('./modules/admin')
const passport = require('../../config/passport')
const upload = require('../../middleware/multer')

const restController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')
const commentController = require('../../controllers/apis/comment-controller')
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

router.delete('/comments/:id', authenticated, authenticatedAdmin, commentController.deleteComment) // 記得兩個驗證都要掛
router.post('/comments', authenticated, commentController.postComment)

// 使用者部分
router.post('/signin', passport.authenticate('local', { session: false }), userController.signIn)
router.post('/signup', userController.signUp)

router.get('/users/top', authenticated, userController.getTopUsers)
router.get('/users/:id', authenticated, userController.getUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)

router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.removeLike)

router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.removeFollowing)

router.use('/', apiErrorHandler)

module.exports = router
