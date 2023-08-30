const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportJWT = require('passport-jwt')
const JWTStrategy = passportJWT.Strategy // 注意這是class，不能用解構賦值
const ExtractJWT = passportJWT.ExtractJwt // 注意這是class，不能用解構賦值

const bcrypt = require('bcryptjs')

const { User, Restaurant } = require('../models')

// 選擇登入策略
passport.use(new LocalStrategy(
  // 客製化欄位資料+選項
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  // 驗證登入流程
  (req, email, password, done) => {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) return done(null, false, req.flash('error_messages', '帳號或密碼錯誤'))

        bcrypt.compare(password, user.password).then(res => {
          if (!res) return done(null, false, req.flash('error_messages', '帳號或密碼錯誤'))

          return done(null, user)
        })
      })
  }
))

const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), // 設定jwtToken如何取得的方式
  secretOrKey: process.env.JWT_SECRET // 檢查token是否竄改
}

passport.use(new JWTStrategy(jwtOptions, (jwtPayload, cb) => {
  User.findByPk(jwtPayload.id, { // Payload為解析token後的主體資料
    include: [
      { model: Restaurant, as: 'FavoritedRestaurants' }, // 取用的關係必須明確指定
      { model: Restaurant, as: 'LikedRestaurants' },
      { model: User, as: 'Followers' },
      { model: User, as: 'Followings' }
    ]
  })
    .then(user => cb(null, user)) // jwt拿出來的已經是JSON格式，這組資料會成為req.user
    .catch(err => cb(err))
}))

// serialize
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
// deserialize user
passport.deserializeUser((id, cb) => {
  User.findByPk(id, {
    include: [
      { model: Restaurant, as: 'FavoritedRestaurants' }, // 取用的關係必須明確指定
      { model: Restaurant, as: 'LikedRestaurants' },
      { model: User, as: 'Followers' },
      { model: User, as: 'Followings' }
    ]
  })
    .then(user => cb(null, user.toJSON()))
    .catch(err => cb(err))
})
module.exports = passport
