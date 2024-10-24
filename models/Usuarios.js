const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "Usuarios",
    {
      idUsuario: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      apellidos: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      clave: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      idGmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      idApple: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      idFacebook: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      idTipoCuestionario: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      idPerfil: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      country_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      pendiente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      dni_front_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      dni_back_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      fechaNacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      dni: {
        type: DataTypes.STRING(100), // Añadir el campo dni aquí
        allowNull: true,
      },
      verification_code: {
        type: Sequelize.STRING,
        allowNull: true, // Puedes permitir que sea null inicialmente
      },
    },
    {
      sequelize,
      tableName: "Usuarios",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "idUsuario" }],
        },
        {
          name: "idTipoCuestionario",
          using: "BTREE",
          fields: [{ name: "idTipoCuestionario" }],
        },
        {
          name: "idPerfil",
          using: "BTREE",
          fields: [{ name: "idPerfil" }],
        },
      ],
    }
  );
};
