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
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('名字是必填欄位')
    const { file } = req // 這個是因為有Multer做成的image 被當成req.file傳過來
    localFileHandler(file) // 丟進Multer抓到的file ，回傳正式路徑
      .then(filePath => Restaurant.create(
        {
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || null,
          categoryId
        }
      ))
      .then(() => {
        req.flash('success_messages', '新增餐廳成功')
        res.redirect('/admin/restaurants')
      }).catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('此餐廳不存在')
        res.render('admin/restaurant', { restaurant })
      })
      .catch(err => next(err))
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
      }).then(() => {
        req.flash('success_message', '編輯餐廳成功')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  deleteRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) throw new Error('此餐廳不存在')
        return restaurant.destroy()
      })
      .then(() => res.redirect('/admin/restaurants'))
      .catch(err => next(err))
  },

  /**         使用者管理使用者部分        **/
  getUsers: (req, res, next) => {
    return User.findAll({ raw: true })
      .then(users => {
        users.forEach(user => {
          if (user.isAdmin === 0) user.role = 'user'
          if (user.isAdmin === 1) user.role = 'admin'
        })
        return res.render('admin/users', { users })
      })
      .catch(err => next(err))
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
