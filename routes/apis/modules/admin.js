const express = require('express')
const router = express.Router()

const upload = require('../../../middleware/multer') // 需要上傳的路由掛載
const adminController = require('../../../controllers/apis/admin-controller')
const categoryController = require('../../../controllers/apis/category-controller')

// 管理者餐廳部分
router.get('/restaurants', adminController.getRestaurants)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant)
router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.get('/restaurants/:id', adminController.getRestaurant)
router.put('/restaurants/:id', adminController.putRestaurant)

// 管理者用戶部分
router.get('/users', adminController.getUsers)
router.patch('/users/:id', adminController.patchUser)

// 管理者分類部分
router.put('/categories/:id', categoryController.putCategories)
router.get('/categories', categoryController.getCategories)
router.post('/categories', categoryController.postCategory)
router.delete('/categories/:id', categoryController.deleteCategory)

module.exports = router
