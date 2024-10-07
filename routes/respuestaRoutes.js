const express = require('express');
const respuestaController = require('../controllers/respuestaController');
const { verifyToken } = require('../controllers/userController'); // Importar el middleware de verificación de token

const router = express.Router();

// Ruta para guardar las respuestas y subir imágenes, protegida por verificación de token
router.post('/save', verifyToken, respuestaController.saveResponses);

module.exports = router;
