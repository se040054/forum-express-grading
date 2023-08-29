const { Restaurant, Category } = require('../models')

const adminServices = {
  getRestaurants: (req, callback) => { // req保留
    Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category] // 必須要是陣列
    })
      .then(restaurants => callback(null, { restaurants })) // restaurants做成物件
      .catch(err => callback(err))
  },
  deleteRestaurant: (req, callback) => {
    Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) throw new Error('此餐廳不存在')
        return restaurant.destroy()
      })
      .then(deletedRestaurant => callback(null, { restaurant: deletedRestaurant }))
      .catch(err => callback(err))
  }
}
module.exports = adminServices
