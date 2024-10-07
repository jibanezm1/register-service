const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_refresh_tokens', {
    user_refresh_tokenID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    urf_userID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    urf_token: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    urf_created: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "UTC"
    }
  }, {
    sequelize,
    tableName: 'user_refresh_tokens',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "user_refresh_tokenID" },
        ]
      },
      {
        name: "idx-urf_userID",
        using: "BTREE",
        fields: [
          { name: "urf_userID" },
        ]
      },
    ]
  });
};
