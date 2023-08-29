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
  }
}
module.exports = adminServices
