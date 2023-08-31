const { Restaurant, Category, User, Comment } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    restaurantServices.getRestaurant(req, (err, data) => err ? next(err) : res.render('restaurant', data))
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id,
      { include: [Category, Comment, { model: User, as: 'FavoritedUsers' }] }
    )
      .then(restaurant => {
        res.render('dashboard', { restaurant: restaurant.toJSON() })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
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
      .then(([restaurants, comments]) => {
        console.log(restaurants, comments)
        return res.render('feeds', { restaurants, comments })
      })
      .catch(err => next(err))
  },
  getTopRestaurants: (req, res, next) => {
    return Restaurant.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }]
    })
      .then(restaurants => {
        restaurants = restaurants.map(restaurant => ({
          ...restaurant.toJSON(),
          description: restaurant.description.substring(0, 50),
          favoritedCount: restaurant.FavoritedUsers.length,
          isFavorited: req.user && req.user.FavoritedRestaurants.some(fr => fr.id === restaurant.id)
        })// 記得要驗證req.user 否則測試不會通過
        ).sort((res1, res2) => res2.favoritedCount - res1.favoritedCount)
        restaurants = restaurants.slice(0, 10)
        return res.render('top-restaurants', { restaurants })
      })
      .catch(err => next(err))
  }
}
module.exports = restaurantController
