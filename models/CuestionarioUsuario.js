const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const CuestionarioUsuario = sequelize.define('CuestionarioUsuario', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idUsuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idCuestionario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estaResuelto: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'CuestionarioUsuario',
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
        name: "idCuestionario",
        using: "BTREE",
        fields: [
          { name: "idCuestionario" },
        ]
      },
    ]
  });

  // Definir la asociación con Cuestionarios
  CuestionarioUsuario.associate = (models) => {
    CuestionarioUsuario.belongsTo(models.Cuestionarios, {
      foreignKey: 'idCuestionario',
      as: 'cuestionario',  // Alias que se usará en las consultas
    });
  };

  return CuestionarioUsuario;
};
