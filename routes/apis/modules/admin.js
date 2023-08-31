const express = require('express')
const router = express.Router()

const upload = require('../../../middleware/multer') // 需要上傳的路由掛載
const adminController = require('../../../controllers/apis/admin-controller')

// 管理者餐廳部分
router.get('/restaurants', adminController.getRestaurants)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant)
router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.get('/restaurants/:id', adminController.getRestaurant)
router.put('/restaurants/:id', adminController.putRestaurant)

// 管理者用戶部分
router.get('/users', adminController.getUsers)

module.exports = router
