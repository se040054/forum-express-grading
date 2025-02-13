'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Restaurant.belongsTo(models.Category, { foreignKey: 'categoryId' }) // 要指定名稱
      Restaurant.hasMany(models.Comment, { foreignKey: 'restaurantId' })
      Restaurant.belongsToMany(models.User, {
        through: models.Favorite,
        foreignKey: 'restaurantId',
        as: 'FavoritedUsers' // 給這段關係命名 (後續include會取用)
        // 注意這裡的命名邏輯 對此餐廳收藏的用戶們
      })
      Restaurant.belongsToMany(models.User, {
        through: models.Like,
        foreignKey: 'restaurantId',
        as: 'LikedUsers'
      })
    }
  };
  Restaurant.init({
    name: DataTypes.STRING,
    tel: DataTypes.STRING,
    address: DataTypes.STRING,
    openingHours: DataTypes.STRING, // JS使用 受自動轉換影響 不須用底線
    description: DataTypes.TEXT,
    image: DataTypes.STRING, // 新增
    viewCounts: DataTypes.INTEGER // 新增
  }, {
    sequelize,
    modelName: 'Restaurant',
    tableName: 'Restaurants', // 新增這裡
    underscored: true
  })
  return Restaurant
}
