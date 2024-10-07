const {
  Cuestionarios,
  Usuarios,
  CuestionarioUsuario,
  Preguntas,
  Opciones,
} = require("../models"); // Importar los modelos generados
const { Op, literal } = require("sequelize");

const obtenerCuestionariosResueltos = async (idUsuario, countryId) => {
  const resueltos = await Cuestionarios.findAll({
    include: [
      {
        model: CuestionarioUsuario,
        as: "usuariosRelacionados",
        where: {
          idUsuario: idUsuario,
          estaResuelto: 1, // Obtener solo los resueltos
        },
        required: true, // Solo incluir los que tienen relación
      },
    ],
    where: {
      country_id: countryId,
      idTipoCuestionario: 1,
    },
    order: [["idCuestionario", "DESC"]],
  });

  // Mapear la data para devolver en el formato esperado
  return resueltos.map((cuestionario) => ({
    cuestionarioId: cuestionario.idCuestionario,
    titulo: cuestionario.titulo,
    descripcion: cuestionario.descripcion,
    imagenIcono: cuestionario.imagenIcono,
    valorMonetario: cuestionario.valorMonetario,
    tiempoEstimado: cuestionario.tiempoEstimado,
    idTipoCuestionario: cuestionario.idTipoCuestionario,
  }));
};

const obtenerCuestionariosNoResueltos = async (idUsuario, countryId) => {
  const noResueltos = await Cuestionarios.findAll({
    include: [
      {
        model: CuestionarioUsuario,
        as: "usuariosRelacionados",
        where: {
          idUsuario: idUsuario,
        },
        required: false, // Incluir también los que no tienen relación
      },
    ],
    where: {
      country_id: countryId,
      idTipoCuestionario: 1,
      [Op.or]: [
        {
          "$usuariosRelacionados.idCuestionario$": null, // No hay relación en CuestionarioUsuario (no respondidos)
        },
        {
          "$usuariosRelacionados.estaResuelto$": 0, // No están resueltos
        },
      ],
    },
    order: [["idCuestionario", "DESC"]],
  });

  // Mapear la data para devolver en el formato esperado
  return noResueltos.map((cuestionario) => ({
    cuestionarioId: cuestionario.idCuestionario,
    titulo: cuestionario.titulo,
    descripcion: cuestionario.descripcion,
    imagenIcono: cuestionario.imagenIcono,
    valorMonetario: cuestionario.valorMonetario,
    tiempoEstimado: cuestionario.tiempoEstimado,
    idTipoCuestionario: cuestionario.idTipoCuestionario,
  }));
};

const getCuestionarios = async (req, res) => {
  try {
    const { idUsuario } = req.params;

    // Obtener el usuario
    const user = await Usuarios.findOne({ where: { idUsuario } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Obtener cuestionarios resueltos
    const cuestionariosResueltos = await obtenerCuestionariosResueltos(
      idUsuario,
      user.country_id
    );

    // Obtener cuestionarios no resueltos
    const cuestionariosNoResueltos = await obtenerCuestionariosNoResueltos(
      idUsuario,
      user.country_id
    );

    const datadevuelta = {
      cuestionariosResueltos: cuestionariosResueltos,
      cuestionariosNoResueltos: cuestionariosNoResueltos,
    };

    return res.json(datadevuelta);
  } catch (error) {
    console.error("Error al obtener cuestionarios:", error);
    return res
      .status(500)
      .json({ error: "Ocurrió un error al obtener los cuestionarios" });
  }
};

// detalle del cuestionario

const obtenerDetalleCuestionario = async (idCuestionario) => {
  try {
    // Obtener el cuestionario
    const cuestionario = await Cuestionarios.findOne({
      where: { idCuestionario },
    });

    if (!cuestionario) {
      throw new Error("Cuestionario no encontrado");
    }

    // Obtener las preguntas del cuestionario
    const preguntas = await Preguntas.findAll({
      where: { idCuestionario },
      include: [
        {
          model: Opciones,
          as: "opciones", // Usar el alias correcto
        },
      ],
    });

    // Formatear el array de preguntas y opciones en el formato esperado
    const preguntasArray = preguntas.map((pregunta) => {
      const opcionesArray = pregunta.opciones.map((opcion) => [
        opcion.textoOpcion,
        opcion.idOpcion.toString(), // Convertir el ID a string para seguir el formato esperado
      ]);

      return {
        id: pregunta.idPregunta,
        type: pregunta.tipo,
        question: pregunta.textoPregunta,
        options: opcionesArray, // Array de arrays para opciones
        selectedOptions: [], // Array vacío para opciones seleccionadas
      };
    });

    // Formatear el cuestionario en el formato esperado
    const cuestionarioDetalle = {
      cuestionarioId: cuestionario.idCuestionario,
      titulo: cuestionario.titulo,
      descripcion: cuestionario.descripcion,
      imagenIcono: cuestionario.imagenIcono,
      valorMonetario: cuestionario.valorMonetario,
      tiempoEstimado: cuestionario.tiempoEstimado,
      idTipoCuestionario: cuestionario.idTipoCuestionario,
      preguntas: preguntasArray,
    };

    return cuestionarioDetalle;
  } catch (error) {
    console.error("Error al obtener el detalle del cuestionario:", error);
    throw error;
  }
};

// Nuevo controlador para obtener el detalle del cuestionario
const getDetalleCuestionario = async (req, res) => {
  try {
    const { idCuestionario } = req.params;

    // Obtener el detalle del cuestionario
    const detalleCuestionario = await obtenerDetalleCuestionario(
      idCuestionario
    );

    return res.json(detalleCuestionario);
  } catch (error) {
    console.error("Error al obtener el detalle del cuestionario:", error);
    return res.status(500).json({
      error: "Ocurrió un error al obtener el detalle del cuestionario",
    });
  }
};

module.exports = { getCuestionarios, getCuestionarios, getDetalleCuestionario };
