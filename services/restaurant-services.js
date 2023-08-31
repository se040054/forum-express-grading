const { Restaurant, Category, User, Comment } = require('../models')
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
  },
  getRestaurant: (req, cb) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: User },
        { model: User, as: 'FavoritedUsers' }, // 把收藏此餐廳的使用者抓出來
        { model: User, as: 'LikedUsers' } // 按過讚的使用者抓出來
      ],
      order: [
        [Comment, 'createdAt', 'DESC'] // 新的時間在上面
      ]
      // EagerLoading會自動幫你抓外鍵對應的資料
      // 注意返回的資料類型hasMany為物件陣列，belongsTo為物件
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('此餐廳不存在')
        return restaurant.increment('viewCounts')
      })
      .then(restaurant => {
        // 這邊改用some 搜到一個匹配就停止 , 登入者的id若有匹配到此餐廳收藏者id就true
        const isFavorited = restaurant.FavoritedUsers.some(fu => fu.id === req.user.id)
        const isLiked = restaurant.LikedUsers.some(lu => lu.id)
        return cb(null, {
          restaurant: restaurant.toJSON(),
          isFavorited,
          isLiked
        })
      })
      .catch(err => cb(err))
  },
  getDashboard: (req, cb) => {
    return Restaurant.findByPk(req.params.id,
      { include: [Category, Comment, { model: User, as: 'FavoritedUsers' }] }
    )
      .then(restaurant => cb(null, { restaurant: restaurant.toJSON() }))
      .catch(err => cb(err))
  },
  getFeeds: (req, cb) => {
    return Promise.all([
      Restaurant.findAll({
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']], // (!)不要用到空白
        include: [Category],
        limit: 10
      }),
      Comment.findAll({
        raw: true,
        nest: true,
        include: [Restaurant, User],
        limit: 10,
        order: [['createdAt', 'DESC']]
      })
    ])
      .then(([restaurants, comments]) => cb(null, { restaurants, comments }))
      .catch(err => cb(err))
  },
  getTopRestaurants: (req, cb) => {
    return Restaurant.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }]
    })
      .then(restaurants => {
        restaurants = restaurants.map(restaurant => ({
          ...restaurant.toJSON(),
          description: restaurant.description?.substring(0, 50),
          favoritedCount: restaurant.FavoritedUsers.length,
          isFavorited: req.user && req.user.FavoritedRestaurants?.some(fr => fr.id === restaurant.id)
        })// 記得要驗證req.user
        ).sort((res1, res2) => res2.favoritedCount - res1.favoritedCount)
        restaurants = restaurants.slice(0, 10)
        return cb(null, { restaurants })
      })
      .catch(err => cb(err))
  }
}

module.exports = restaurantServices
