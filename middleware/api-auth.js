const passport = require('../config/passport')

// 原先寫法 無法客製錯誤訊息
// const authenticated = passport.authenticate('jwt', { session: false })
// 其實 authenticate第三參數可以接受cb函式 但是要自己處理驗證成功時 req.user 給資料

const authenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => { // (err, user) 是cb函式
    if (err || !user) return res.status(401).json({ status: 'error', message: '未授權' })
    req.user = user // 被cb覆蓋掉了 記得寫回來 否則登入不會有req.user
    next()
  })(req, res, next)
}

const authenticatedAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next()
  return res.status(403).res.json({ status: 'error', message: '未授權' })
}
module.exports = {
  authenticated,
  authenticatedAdmin
}
