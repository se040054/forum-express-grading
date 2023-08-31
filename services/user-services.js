const { User, Restaurant, Favorite, Like, Followship, Comment } = require('../models')
const bcrypt = require('bcryptjs')
const { defaultAvatarPath, localFileHandler } = require('../helpers/file-helper')

const userServices = {
  signUp: (req, cb) => {
    if (!req.body.email) throw new Error('信箱是必填')
    if (req.body.passwordCheck !== req.body.password) throw new Error('Password do not match')
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('Email already exists')

        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash
      })
      )
      .then(user => {
        req.flash('success_messages', '註冊成功!')
        return cb(null, { user })
      })
      .catch(err => cb(err))
  },
  getUser: (req, cb) => {
    return User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: Restaurant },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' },
        { model: Restaurant, as: 'FavoritedRestaurants' }
      ]
    })
      .then(user => {
        if (!user) throw new Error('使用者不存在')
        if (!user.image) {
          user.image = defaultAvatarPath // 指定預設頭貼
        }
        // 這邊有個邏輯，使用者的其他判斷是否要放入資料物件內，或是另外傳遞
        // 思考的方向: 若取得的資料為多筆放入物件，單筆則另外傳遞
        const isSelf = Number(req.user.id) === Number(user.id)
        const isFollowed = req.user && req.user.Followings.some(f => f.id === user.id)
        const data = user.toJSON() // 這邊是值傳遞
        const Comments = data.Comments // 這邊是址傳遞,data是物件
        for (let i = Comments.length - 1; i > 0; i--) {
          for (let j = i - 1; j >= 0; j--) {
            if (Comments[i].restaurantId === Comments[j].restaurantId) {
              Comments.splice([i], 1)
              break // (!)必須使用，有刪除則停止這次的迴圈
            }
          }
        }
        return cb(null, {
          user: data,
          isSelf,
          isFollowed
        })
      }).catch(err => cb(err))
  },
  putUser: (req, cb) => {
    const { name, email } = req.body
    const { file } = req
    return Promise.all([
      User.findByPk(req.params.id),
      localFileHandler(file)
    ])
      .then(([user, filePath]) => {
        if (!user) throw new Error('使用者不存在')
        if (user.id !== req.user.id) throw new Error('請勿修改他人資料') // api使用 測試時請刪除
        return user.update({
          name,
          email,
          image: filePath || user.image
        })
      })
      .then(editedUser => cb(null, { user: editedUser.toJSON() }))
      .catch(err => cb(err))
  },
  addFavorite: (req, cb) => {
    const { restaurantId } = req.params
    return Promise.all([ // 先查找有無餐廳 以及是否收藏過
      Restaurant.findByPk(restaurantId),
      Favorite.findOne({
        where: {
          userId: req.user.id,
          restaurantId
        }
      })
    ])
      .then(([restaurant, favorite]) => {
        if (!restaurant) throw new Error('餐廳不存在')
        if (favorite) throw new Error('你已經收藏過了')
        return Favorite.create({
          userId: req.user.id,
          restaurantId
        })
      })
      .then(newFavorite => cb(null, { favorite: newFavorite.toJSON() }))
      .catch(err => cb(err))
  },
  removeFavorite: (req, cb) => {
    return Favorite.findOne({
      where: {
        userId: req.user.id,
        restaurantId: req.params.restaurantId
      }
    })
      .then(favorite => {
        if (!favorite) throw new Error('尚未收藏此餐廳')
        return favorite.destroy()
      })
      .then(deletedFavorite => cb(null, { favorite: deletedFavorite.toJSON() }))
      .catch(err => cb(err))
  },
  addLike: (req, cb) => {
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Like.findOne({
        where: {
          userId: req.user.id,
          restaurantId
        }
      })
    ])
      .then(([restaurant, like]) => {
        if (!restaurant) throw new Error('此餐廳不存在')
        if (like) throw new Error('已經按過讚')
        return Like.create({
          userId: req.user.id,
          restaurantId
        })
      })
      .then(newLike => cb(null, { like: newLike.toJSON() }))
      .catch(err => cb(err))
  },
  removeLike: (req, cb) => {
    const { restaurantId } = req.params
    return Like.findOne({
      where: {
        userId: req.user.id,
        restaurantId
      }
    })
      .then(like => {
        if (!like) throw new Error('尚未點讚')
        return like.destroy()
      })
      .then(deletedLike => cb(null, { like: deletedLike.toJSON() }))
      .catch(err => cb(err))
  },
  getTopUsers: (req, cb) => {
    return User.findAll(
      {
        include: { model: User, as: 'Followers' }
      })
      .then(users => {
        users = users.map(
          user => ({ // 教案另外使用result存取陣列
            ...user.toJSON(),
            followerCount: user.Followers.length,
            isFollowed: req.user.Followings.some(f => f.id === user.id)
          })
        ).sort((user1, user2) => user2.followerCount - user1.followerCount)
        return cb(null, { users })
      })
      .catch(err => cb(err))
  },
  addFollowing: (req, cb) => {
    const { userId } = req.params
    return Promise.all([
      User.findByPk(userId),
      Followship.findOne({
        where: { // 記得還是要where 才能同時滿足二條件
          followerId: req.user.id,
          followingId: userId
        }
      })
    ])
      .then(([user, followship]) => {
        console.log('這個追蹤: ', followship)
        if (!user) throw new Error('用戶不存在')
        if (followship) throw new Error('已經追蹤過')
        if (req.user.id === user.id) throw new Error('無法追蹤自己')
        return Followship.create({
          followerId: req.user.id,
          followingId: userId
        })
      }).then(newFollowship => cb(null, { followship: newFollowship.toJSON() }))
      .catch(err => cb(err))
  },
  removeFollowing: (req, cb) => {
    return Followship.findOne({
      where: { // 記得where
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then(followship => {
        if (!followship) throw new Error('尚未追蹤此用戶')
        return followship.destroy()
      })
      .then(deletedFollowship => cb(null, { followship: deletedFollowship.toJSON() }))
      .catch(err => cb(err))
  }

}

module.exports = userServices
