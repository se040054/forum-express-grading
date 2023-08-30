const { Restaurant, Category } = require('../models')
const { deletedCategoryFilter } = require('../helpers/deleted-filter-helper')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const restaurantServices = {
  getRestaurants: (req, cb) => { // 抽換成服務的時候cb資料回去
    const categoryId = Number(req.query.categoryId) || '' // 注意req.query是字串要轉型別，全部要給空字串
    const DEFAULT_LIMIT = 9
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    return Promise.all([
      Restaurant.findAndCountAll({
        raw: true,
        nest: true,
        include: Category,
        where: {
          ...categoryId ? { categoryId } : {}
          // 要注意空物件永遠是true，這邊用成物件展開是為了擴充 實際上拿掉也可以跑
        },
        limit,
        offset
      }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        const favoritedRestaurantsId = // fr是簡寫 , 會返回一個只包含此使用者喜愛餐廳id的陣列
          req.user?.FavoritedRestaurants ? req.user.FavoritedRestaurants.map(fr => fr.id) : []
        const LikedRestaurantsId =
          req.user?.LikedRestaurants ? req.user.LikedRestaurants.map(lr => lr.id) : []

        restaurants.rows = restaurants.rows.map(r => ({ // 小括號代替return,注意這裡不能改整個restaurants,要選rows
          ...r,
          description: r.description.substring(0, 50), // 雖然展開的時候也有屬性了，但後面的keyvalue可以覆蓋前面的keyvalue
          isFavorited: favoritedRestaurantsId.includes(r.id),
          isLiked: LikedRestaurantsId.includes(r.id)
        })
        )
        categories = deletedCategoryFilter(categories)
        return cb(null, {
          restaurants: restaurants.rows, // 注意這裡要用rows
          categories,
          categoryId,
          pagination: getPagination(limit, page, restaurants.count)
        })
      })
      .catch(err => cb(err))
  }
}
module.exports = restaurantServices
