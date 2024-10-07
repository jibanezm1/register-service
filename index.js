require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./config/database");
const userController = require("./controllers/userController");
const cuestionarioRoutes = require("./routes/routes");
const respuestaRoutes = require('./routes/respuestaRoutes');

const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Importar modelos y asociaciones

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
app.use("/api", cuestionarioRoutes);
app.use('/api/respuestas', respuestaRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
