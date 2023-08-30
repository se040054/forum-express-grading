const { Restaurant, Category } = require('../models')
const { localFileHandler } = require('../helpers/file-helper')

const adminServices = {
  getRestaurants: (req, cb) => { // req保留
    Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category] // 必須要是陣列
    })
      .then(restaurants => cb(null, { restaurants })) // restaurants做成物件
      .catch(err => cb(err))
  },
  deleteRestaurant: (req, cb) => {
    Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) throw new Error('此餐廳不存在')
        return restaurant.destroy()
      })
      .then(deletedRestaurant => cb(null, { restaurant: deletedRestaurant }))
      .catch(err => cb(err))
  },
  postRestaurant: (req, cb) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('名字是必填欄位')
    const { file } = req // 這個是因為有Multer做成的image 被當成req.file傳過來
    localFileHandler(file) // 丟進Multer抓到的file ，回傳正式路徑
      .then(filePath => Restaurant.create({
        name,
        tel,
        address,
        openingHours,
        description,
        image: filePath || null,
        categoryId
      }))
      .then(newRestaurant => cb(null, { restaurant: newRestaurant }))
      .catch(err => cb(err))
  }
}
module.exports = adminServices
