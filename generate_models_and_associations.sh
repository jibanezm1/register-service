
#!/bin/bash

# Crear carpeta para los modelos
mkdir -p models

# Modelo Clientes
echo "Generando modelo Clientes..."
cat <<EOT >> models/Clientes.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Clientes extends Model {}

Clientes.init({
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nombre: DataTypes.STRING,
    Direccion: DataTypes.STRING,
    Telefono: DataTypes.STRING,
    CorreoElectronico: DataTypes.STRING,
    FechaRegistro: DataTypes.DATE,
    imagen: DataTypes.STRING
}, {
    sequelize,
    modelName: 'Clientes',
    tableName: 'Clientes',
    timestamps: false
});

module.exports = Clientes;
EOT

# Modelo ContactForm
echo "Generando modelo ContactForm..."
cat <<EOT >> models/ContactForm.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ContactForm extends Model {}

ContactForm.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    message: DataTypes.TEXT,
    submitted_at: DataTypes.DATE
}, {
    sequelize,
    modelName: 'ContactForm',
    tableName: 'ContactForm',
    timestamps: false
});

module.exports = ContactForm;
EOT

# Modelo Countries
echo "Generando modelo Countries..."
cat <<EOT >> models/Countries.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Countries extends Model {}

Countries.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    country_name: DataTypes.STRING
}, {
    sequelize,
    modelName: 'Countries',
    tableName: 'countries',
    timestamps: false
});

module.exports = Countries;
EOT

# Modelo CuentasDestinatario
echo "Generando modelo CuentasDestinatario..."
cat <<EOT >> models/CuentasDestinatario.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class CuentasDestinatario extends Model {}

CuentasDestinatario.init({
    ID_Cuenta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nombre_Titular: DataTypes.TEXT,
    Numero_Cuenta: DataTypes.TEXT,
    Banco: DataTypes.TEXT,
    Tipo_Cuenta: DataTypes.TEXT,
    Moneda: DataTypes.TEXT,
    idUsuario: DataTypes.INTEGER
}, {
    sequelize,
    modelName: 'CuentasDestinatario',
    tableName: 'CuentasDestinatario',
    timestamps: false
});

module.exports = CuentasDestinatario;
EOT

# Modelo Cuestionarios
echo "Generando modelo Cuestionarios..."
cat <<EOT >> models/Cuestionarios.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Cuestionarios extends Model {}

Cuestionarios.init({
    idCuestionario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titulo: DataTypes.STRING,
    imagenIcono: DataTypes.STRING,
    valorMonetario: DataTypes.DECIMAL,
    tiempoEstimado: DataTypes.INTEGER,
    idTipoCuestionario: DataTypes.INTEGER,
    country_id: DataTypes.INTEGER,
    cliente_id: DataTypes.INTEGER,
    estado: DataTypes.INTEGER,
    fecha: DataTypes.DATE,
    descripcion: DataTypes.TEXT
}, {
    sequelize,
    modelName: 'Cuestionarios',
    tableName: 'Cuestionarios',
    timestamps: false
});

module.exports = Cuestionarios;
EOT

# Modelo CuestionarioUsuario
echo "Generando modelo CuestionarioUsuario..."
cat <<EOT >> models/CuestionarioUsuario.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class CuestionarioUsuario extends Model {}

CuestionarioUsuario.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idUsuario: DataTypes.INTEGER,
    idCuestionario: DataTypes.INTEGER,
    estaResuelto: DataTypes.TINYINT,
    fecha: DataTypes.DATE
}, {
    sequelize,
    modelName: 'CuestionarioUsuario',
    tableName: 'CuestionarioUsuario',
    timestamps: false
});

module.exports = CuestionarioUsuario;
EOT

# Modelo Misiones
echo "Generando modelo Misiones..."
cat <<EOT >> models/Misiones.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Misiones extends Model {}

Misiones.init({
    idMision: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titulo: DataTypes.STRING,
    descripcion: DataTypes.TEXT,
    recompensa: DataTypes.DECIMAL,
    tiempo: DataTypes.STRING,
    distancia: DataTypes.BIGINT,
    idTipoMision: DataTypes.INTEGER,
    idCuestionario: DataTypes.INTEGER,
    lat: DataTypes.TEXT,
    lng: DataTypes.TEXT,
    cliente_id: DataTypes.INTEGER,
    country_id: DataTypes.INTEGER
}, {
    sequelize,
    modelName: 'Misiones',
    tableName: 'Misiones',
    timestamps: false
});

module.exports = Misiones;
EOT

# Asociaciones entre modelos
echo "Generando asociaciones..."
cat <<EOT >> models/associations.js
const Clientes = require('./Clientes');
const Cuestionarios = require('./Cuestionarios');
const CuestionarioUsuario = require('./CuestionarioUsuario');
const Preguntas = require('./Preguntas');
const Opciones = require('./Opciones');
const Usuarios = require('./Usuarios');
const Misiones = require('./Misiones');

// Asociaciones
Cuestionarios.hasMany(Preguntas, { foreignKey: 'idCuestionario', as: 'preguntas' });
Preguntas.belongsTo(Cuestionarios, { foreignKey: 'idCuestionario', as: 'cuestionario' });

Preguntas.hasMany(Opciones, { foreignKey: 'idPregunta', as: 'opciones' });
Opciones.belongsTo(Preguntas, { foreignKey: 'idPregunta', as: 'pregunta' });

Cuestionarios.belongsToMany(Usuarios, { through: CuestionarioUsuario, foreignKey: 'idCuestionario', as: 'usuarios' });
Usuarios.belongsToMany(Cuestionarios, { through: CuestionarioUsuario, foreignKey: 'idUsuario', as: 'cuestionarios' });

CuestionarioUsuario.belongsTo(Cuestionarios, { foreignKey: 'idCuestionario', as: 'cuestionario' });
CuestionarioUsuario.belongsTo(Usuarios, { foreignKey: 'idUsuario', as: 'usuario' });

Misiones.belongsTo(Cuestionarios, { foreignKey: 'idCuestionario', as: 'cuestionario' });

module.exports = { Clientes, Cuestionarios, CuestionarioUsuario, Preguntas, Opciones, Usuarios, Misiones };
EOT

