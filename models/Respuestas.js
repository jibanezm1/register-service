const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Respuestas', {
    idRespuesta: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idPregunta: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idOpcion: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    textoRespuesta: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    urlFoto: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    idUsuario: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Respuestas',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idRespuesta" },
        ]
      },
      {
        name: "idPregunta",
        using: "BTREE",
        fields: [
          { name: "idPregunta" },
        ]
      },
      {
        name: "idOpcion",
        using: "BTREE",
        fields: [
          { name: "idOpcion" },
        ]
      },
    ]
  });
};
