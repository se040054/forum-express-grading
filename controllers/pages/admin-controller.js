const { Restaurant, User, Category } = require('../../models')

const { localFileHandler } = require('../../helpers/file-helper')
const { deletedCategoryFilter } = require('../../helpers/deleted-filter-helper')

const adminServices = require('../../services/admin-services')

const adminController = {
  /**       使用者管理餐廳部分        **/
  getRestaurants: (req, res, next) => {
    adminServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('admin/restaurants', data))
  },
  createRestaurants: (req, res, next) => {
    Category.findAll({ raw: true })
      .then(categories => {
        return res.render('admin/create-restaurant', {
          categories: deletedCategoryFilter(categories)
        })
      })
      .catch(err => next(err))
  },
  postRestaurant: (req, res, next) => {
    adminServices.postRestaurant(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '餐廳新增成功')
      req.session.createdData = data // 保留新增資料備用做法
      return res.redirect('/admin/restaurants')
    })
  },
  getRestaurant: (req, res, next) => {
    adminServices.getRestaurant(req, (err, data) => err ? next(err) : res.render('admin/restaurant', data))
  },
  editRestaurant: (req, res, next) => {
    Promise.all([
      Restaurant.findByPk(req.params.id, { raw: true }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error('此餐廳不存在')
        res.render('admin/edit-restaurant', {
          restaurant,
          categories: deletedCategoryFilter(categories)
        })
      })
      .catch(err => next(err))
  },
  putRestaurant: (req, res, next) => {
    adminServices.putRestaurant(req, (err, data) => {
      if (err) next(err)
      req.flash('success_messages', '餐廳編輯成功')
      req.session.editedData = data // 保留新增資料備用做法
      return res.redirect('/admin/restaurants')
    })
  },
  deleteRestaurant: (req, res, next) => {
    adminServices.deleteRestaurant(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '餐廳刪除成功')
      req.session.deletedData = data // 保留刪除資料備用做法
      return res.redirect('/admin/restaurants')
    }
    )
  },

  /**         使用者管理使用者部分        **/
  getUsers: (req, res, next) => {
    adminServices.getUsers(req, (err, data) => err ? next(err) : res.render('admin/users', data))
  },
  patchUser: (req, res, next) => { // 注意如果把當前管理者改掉會跳出後臺管理
    adminServices.patchUser(req, (err, data) => {
      if (err) return next(err) // 記得return 不然訊息會被下面那個蓋掉
      req.flash('success_messages', '使用者編輯成功')
      req.session.patchedUser = data // 保留新增資料備用做法
      return res.redirect('/admin/users')
    })
  }
}

module.exports = adminController
