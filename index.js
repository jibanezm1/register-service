require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./config/database");
const userController = require("./controllers/userController");
const cuestionarioRoutes = require("./routes/routes");
const respuestaRoutes = require("./routes/respuestaRoutes");

const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Conectar y sincronizar la base de datos
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");

    // Sincronizar modelos (si aún no se ha hecho)
    return sequelize.sync();
  })
  .then(() => {
    console.log("Database synced successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// Rutas de la API
app.post("/register", userController.registerUser);
app.post("/login", userController.loginUser);
app.post("/verify-code", userController.verifyCode); // Añadir endpoint de validación de código
app.use("/api", cuestionarioRoutes);
app.use("/api/respuestas", respuestaRoutes);
app.post("/request-password-reset", userController.requestPasswordReset); // Endpoint para solicitud de cambio de contraseña
app.post("/reset-password", userController.resetPassword); // Endpoint para confirmar el cambio de contraseña
app.put("/disable-user/:idUsuario", userController.disableUser);

// Iniciar el servidor
const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
