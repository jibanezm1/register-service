const express = require("express");
const {
  getCuestionarios,
  getDetalleCuestionario,
} = require("../controllers/cuestionarioController");
const { verifyToken } = require("../controllers/userController");

const router = express.Router();

// Ruta para obtener los cuestionarios de un usuario por ID
router.get("/cuestionarios/:idUsuario", getCuestionarios);

// Nueva ruta para obtener el detalle de un cuestionario por ID
router.get("/cuestionarios/:idUsuario", verifyToken, getCuestionarios);
router.get(
  "/cuestionarios/detalle/:idCuestionario",
  verifyToken,
  getDetalleCuestionario
);

module.exports = router;
