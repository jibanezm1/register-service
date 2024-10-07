const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('migration', {
    version: {
      type: DataTypes.STRING(180),
      allowNull: false,
      primaryKey: true
    },
    apply_time: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'migration',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "version" },
        ]
      },
    ]
  });
};
