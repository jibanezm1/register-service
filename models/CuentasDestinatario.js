const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('CuentasDestinatario', {
    ID_Cuenta: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    Nombre_Titular: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Numero_Cuenta: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Banco: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Tipo_Cuenta: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Moneda: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idUsuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'CuentasDestinatario',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ID_Cuenta" },
        ]
      },
    ]
  });
};
