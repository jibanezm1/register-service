const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('InstruccionesMision', {
    idInstruccion: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idMision: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    tiempoEstimado: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    requisitos: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lat: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lng: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    imagen: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'InstruccionesMision',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idInstruccion" },
        ]
      },
      {
        name: "idMision",
        using: "BTREE",
        fields: [
          { name: "idMision" },
        ]
      },
    ]
  });
};
