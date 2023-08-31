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
  },
  getRestaurant: (req, cb) => {
    Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('此餐廳不存在')
        return cb(null, { restaurant })
      })
      .catch(err => cb(err))
  },
  putRestaurant: (req, cb) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('名字不可空白')
    const { file } = req
    Promise.all([
      Restaurant.findByPk(req.params.id), // 從資料庫抓餐廳回來
      localFileHandler(file) // 寫入新檔案並抓取路徑
    ])
      .then(([restaurant, filePath]) => {
        if (!restaurant) throw new Error('此餐廳不存在')
        return restaurant.update({
          name,
          tel,
          address,
          openingHours: openingHours || restaurant.openingHours, // (!)編輯頁面時間是空的 容易蓋掉
          description,
          image: filePath || restaurant.image, // 如果有filepath就覆寫 沒有就用原本的資料庫路徑
          categoryId
        })
        // 注意這邊要加return 讓findByPk有返回值 才能讓後續接.then
      }).then(editedRestaurant => cb(null, { restaurant: editedRestaurant }))
      .catch(err => cb(err))
  }
}
module.exports = adminServices
