const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('countries', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    country_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "country_name"
    }
  }, {
    sequelize,
    tableName: 'countries',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "country_name",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "country_name" },
        ]
      },
    ]
  });
};
