const adminServices = require('../../services/admin-services')

const adminController = {
  getRestaurants: (req, res, next) => { // req保留
    adminServices.getRestaurants(req, (err, data) => err ? next(err) : res.json(data))
  }
}

module.exports = adminController
