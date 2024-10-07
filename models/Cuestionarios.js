const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const Cuestionarios = sequelize.define('Cuestionarios', {
    idCuestionario: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    imagenIcono: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    valorMonetario: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    tiempoEstimado: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    idTipoCuestionario: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    country_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 9
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Cuestionarios',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idCuestionario" },
        ]
      },
      {
        name: "fk_cliente_id_cuestionario",
        using: "BTREE",
        fields: [
          { name: "cliente_id" },
        ]
      },
      {
        name: "fk_country_id_cuestionario",
        using: "BTREE",
        fields: [
          { name: "country_id" },
        ]
      },
    ]
  });

  // Definir la asociación con CuestionarioUsuario
  Cuestionarios.associate = (models) => {
    Cuestionarios.hasMany(models.CuestionarioUsuario, {
      foreignKey: 'idCuestionario',
      as: 'usuariosRelacionados',  // Alias que se usará en las consultas
    });
  };

  return Cuestionarios;
};
