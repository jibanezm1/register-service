const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_biometric_tokens', {
    user_bio_tokenID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ubio_userID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ubio_token: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    ubio_created: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "UTC"
    }
  }, {
    sequelize,
    tableName: 'user_biometric_tokens',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "user_bio_tokenID" },
        ]
      },
      {
        name: "idx-ubio_userID",
        using: "BTREE",
        fields: [
          { name: "ubio_userID" },
        ]
      },
    ]
  });
};
