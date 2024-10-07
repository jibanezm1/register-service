const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Opciones', {
    idOpcion: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idPregunta: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    textoOpcion: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'Opciones',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idOpcion" },
        ]
      },
      {
        name: "idPregunta",
        using: "BTREE",
        fields: [
          { name: "idPregunta" },
        ]
      },
    ]
  });
};
