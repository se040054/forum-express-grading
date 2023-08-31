const { Restaurant, Category } = require('../models')
const { deletedCategoryFilter, deletedCategoryId } = require('../helpers/deleted-filter-helper')

const categoryServices = {
  getCategories: (req, cb) => {
    return Promise.all([
      Category.findAll({ raw: true }),
      req.params.id ? Category.findByPk(req.params.id, { raw: true }) : null
    ])
      .then(([categories, category]) => {
        categories = deletedCategoryFilter(categories)
        return cb(null, { categories, category })
      })
      .catch(err => cb(err))
  },
  postCategory: (req, cb) => {
    const { name } = req.body
    if (!name) throw new Error('類別名稱不可為空')
    return Category.create({ name })
      .then(newCategory => cb(null, { category: newCategory }))
      .catch(err => cb(err))
  },
  putCategories: (req, cb) => {
    const { name } = req.body
    if (!name) throw new Error('類別名稱不可為空')
    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error('此類別不存在')
        return category.update({ name })
      })
      .then(editCategory => cb(null, { category: editCategory }))
      .catch(err => cb(err))
  },
  deleteCategory: (req, cb) => {
    return Promise.all([
      Category.findByPk(req.params.id),
      Restaurant.findAll({ where: { categoryId: req.params.id } })
    ])
      .then(async ([category, restaurants]) => {
        if (!category) throw new Error('此類別不存在')
        await Promise.all(restaurants.map(restaurant => { // 注意這裡用map才能取得返回值
          return restaurant.update({ categoryId: String(deletedCategoryId) })
        }))
        return await category.destroy()
      })
      .then(deletedCategory => cb(null, deletedCategory))
      .catch(err => cb(err))
  }
}

module.exports = categoryServices
