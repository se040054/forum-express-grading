const jwt = require('jsonwebtoken')

const userController = {
  signIn: (req, res, next) => {
    try {
      const userData = req.user.toJSON()
      delete userData.password // 密碼不能洩漏
      // payload檔案不能為
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' }) // 這行就是passport解開的資料
      res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      next(err)
    }
  }

}
module.exports = userController
