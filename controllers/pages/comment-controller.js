const commentServices = require('../../services/comment-services')

const commentController = {
  postComment: (req, res, next) => {
    commentServices.postComment(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '評論新增成功')
      req.session.newComment = data // 保留新增資料備用做法
      // console.log('api data is :', data, data.comment.restaurantId)
      return res.redirect(`/restaurants/${data.comment.restaurantId}`) // 記得修改這裡的導向id
    })
  },
  deleteComment: (req, res, next) => {
    commentServices.deleteComment(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '評論刪除成功')
      req.session.deletedComment = data // 保留新增資料備用做法
      //  console.log('api data is :', data, data.comment.restaurantId)
      return res.redirect(`/restaurants/${data.comment.restaurantId}`) // 記得修改這裡的導向id
    })
  }
}
module.exports = commentController
