const categoryServices = require('../../services/category-services')

const categoryController = {
  getCategories: (req, res, next) => {
    categoryServices.getCategories(req, (err, data) => err ? next(err) : res.render('admin/categories', data))
  },
  postCategory: (req, res, next) => {
    categoryServices.postCategory(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '分類新增成功')
      req.session.nweCategory = data // 保留新增資料備用做法
      return res.redirect('/admin/categories')
    })
  },
  putCategories: (req, res, next) => {
    categoryServices.putCategories(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '分類編輯成功')
      req.session.editedCategory = data // 保留新增資料備用做法
      return res.redirect('/admin/categories')
    })
  },
  deleteCategory: (req, res, next) => {
    categoryServices.deleteCategory(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '分類刪除成功')
      req.session.deletedCategory = data // 保留新增資料備用做法
      return res.redirect('/admin/categories')
    })
  }
}

module.exports = categoryController
