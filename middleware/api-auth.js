const passport = require('../config/passport')

const authenticated = passport.authenticate('jwt', { session: false })

const authenticatedAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next()
  return res.status(403).res.json({ status: 'error', message: '登入失敗' })
}
module.exports = {
  authenticated,
  authenticatedAdmin
}
