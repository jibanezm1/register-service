const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const Preguntas = sequelize.define('Preguntas', {
    idPregunta: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idCuestionario: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tipo: {
      type: DataTypes.ENUM('multiple', 'single', 'open', 'camera'),
      allowNull: false
    },
    textoPregunta: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'Preguntas',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idPregunta" },
        ]
      },
      {
        name: "idCuestionario",
        using: "BTREE",
        fields: [
          { name: "idCuestionario" },
        ]
      },
    ]
  });

  // Agregar la asociación con el modelo Opciones
  Preguntas.associate = function(models) {
    Preguntas.hasMany(models.Opciones, {
      foreignKey: 'idPregunta',  // Relacionando con el campo en Opciones
      as: 'opciones' // Alias para usar en las consultas
    });
  };

  return Preguntas;
};
