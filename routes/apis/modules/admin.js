const express = require('express')
const router = express.Router()

const upload = require('../../../middleware/multer') // 需要上傳的路由掛載
const adminController = require('../../../controllers/apis/admin-controller')

router.get('/restaurants', adminController.getRestaurants)
router.post('/restaurants', upload.single('image'), adminController.postRestaurant)
router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.get('/restaurants/:id', adminController.getRestaurant)
module.exports = router
