const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Misiones', {
    idMision: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    recompensa: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    tiempo: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    distancia: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    idTipoMision: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idCuestionario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lat: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    lng: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 9
    },
    country_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'Misiones',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idMision" },
        ]
      },
      {
        name: "fk_tipoMision",
        using: "BTREE",
        fields: [
          { name: "idTipoMision" },
        ]
      },
      {
        name: "fk_cuestionario",
        using: "BTREE",
        fields: [
          { name: "idCuestionario" },
        ]
      },
      {
        name: "fk_cliente_id_mision",
        using: "BTREE",
        fields: [
          { name: "cliente_id" },
        ]
      },
      {
        name: "fk_country_id_mision",
        using: "BTREE",
        fields: [
          { name: "country_id" },
        ]
      },
    ]
  });
};
