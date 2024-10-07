var DataTypes = require("sequelize").DataTypes;
var _Clientes = require("./Clientes");
var _ContactForm = require("./ContactForm");
var _CuentasDestinatario = require("./CuentasDestinatario");
var _CuestionarioUsuario = require("./CuestionarioUsuario");
var _Cuestionarios = require("./Cuestionarios");
var _InstruccionesMision = require("./InstruccionesMision");
var _MisionUsuarios = require("./MisionUsuarios");
var _Misiones = require("./Misiones");
var _Opciones = require("./Opciones");
var _Perfil = require("./Perfil");
var _Preguntas = require("./Preguntas");
var _Respuestas = require("./Respuestas");
var _Solicitud = require("./Solicitud");
var _TipoMision = require("./TipoMision");
var _UsuarioCuestionario = require("./UsuarioCuestionario");
var _Usuarios = require("./Usuarios");
var _countries = require("./countries");
var _migration = require("./migration");
var _user_biometric_tokens = require("./user_biometric_tokens");
var _user_refresh_tokens = require("./user_refresh_tokens");
var _users = require("./users");

function initModels(sequelize) {
  var Clientes = _Clientes(sequelize, DataTypes);
  var ContactForm = _ContactForm(sequelize, DataTypes);
  var CuentasDestinatario = _CuentasDestinatario(sequelize, DataTypes);
  var CuestionarioUsuario = _CuestionarioUsuario(sequelize, DataTypes);
  var Cuestionarios = _Cuestionarios(sequelize, DataTypes);
  var InstruccionesMision = _InstruccionesMision(sequelize, DataTypes);
  var MisionUsuarios = _MisionUsuarios(sequelize, DataTypes);
  var Misiones = _Misiones(sequelize, DataTypes);
  var Opciones = _Opciones(sequelize, DataTypes);
  var Perfil = _Perfil(sequelize, DataTypes);
  var Preguntas = _Preguntas(sequelize, DataTypes);
  var Respuestas = _Respuestas(sequelize, DataTypes);
  var Solicitud = _Solicitud(sequelize, DataTypes);
  var TipoMision = _TipoMision(sequelize, DataTypes);
  var UsuarioCuestionario = _UsuarioCuestionario(sequelize, DataTypes);
  var Usuarios = _Usuarios(sequelize, DataTypes);
  var countries = _countries(sequelize, DataTypes);
  var migration = _migration(sequelize, DataTypes);
  var user_biometric_tokens = _user_biometric_tokens(sequelize, DataTypes);
  var user_refresh_tokens = _user_refresh_tokens(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);


  return {
    Clientes,
    ContactForm,
    CuentasDestinatario,
    CuestionarioUsuario,
    Cuestionarios,
    InstruccionesMision,
    MisionUsuarios,
    Misiones,
    Opciones,
    Perfil,
    Preguntas,
    Respuestas,
    Solicitud,
    TipoMision,
    UsuarioCuestionario,
    Usuarios,
    countries,
    migration,
    user_biometric_tokens,
    user_refresh_tokens,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
