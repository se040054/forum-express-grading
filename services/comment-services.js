const { Restaurant, User, Comment } = require('../models')
const commentServices = {
  postComment: (req, cb) => {
    const { restaurantId, text } = req.body
    const userId = req.user && req.user.id // api修改
    if (!text) throw new Error('評論不可空白')
    Promise.all([ // 先確認餐廳跟使用者是否都存在
      Restaurant.findByPk(restaurantId),
      User.findByPk(userId)
    ]).then(([restaurant, user]) => {
      if (!restaurant) throw new Error('餐廳不存在')
      if (!user) throw new Error('使用者不存在')

      return Comment.create({ text, restaurantId, userId })
    })
      .then(newComment => cb(null, { comment: newComment.toJSON() }))
      .catch(err => cb(err))
  },
  deleteComment: (req, cb) => {
    return Comment.findByPk(req.params.id)
      .then(comment => {
        if (!comment) throw new Error('評論不存在')
        return comment.destroy() // 這個也會返回被刪除的資料
      })
      .then(deletedComment => cb(null, { comment: deletedComment }))
      .catch(err => cb(err))
  }
}

module.exports = commentServices
