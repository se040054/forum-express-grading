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
    return User.findByPk(req.params.id) // 注意全部最後都return 回來 1.確保執行2.確保自動化測試
      .then(user => {
        if (!user) throw new Error('')
        if (user.email === 'root@example.com') {
          req.flash('error_messages', '禁止變更 root 權限')
          return res.redirect('back')
        }
        return user.update({ isAdmin: !user.isAdmin })
      })
      .then(() => {
        req.flash('success_messages', '使用者權限變更成功')
        return res.redirect('/admin/users')
      }).catch(err => next(err))
  }
}

module.exports = adminController
