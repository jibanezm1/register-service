const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Usuarios } = require("../models"); // Importar los modelos generados
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const multer = require("multer");

// Create S3 client
const s3Client = new S3Client({
  endpoint: "https://sfo3.digitaloceanspaces.com",
  region: "us-east-1",
  credentials: {
    accessKeyId: "DO00UVJFWYDE2R8AHUWW",
    secretAccessKey: "q7kfJNeHvv+bXwX/QtHGoYX50Lne7blZmiUI4OyVi4c",
  },
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Register User (Middleware included for file upload)
exports.registerUser = [
  upload.fields([
    { name: "dniFront", maxCount: 1 },
    { name: "dniBack", maxCount: 1 },
  ]),
  async (req, res) => {
    const {
      nombre,
      apellidos,
      email,
      password,
      telefono,
      country,
      fechaNacimiento,
      dni, // Añadir el campo dni aquí
    } = req.body;

    const missingFields = [];

    if (!nombre) missingFields.push("nombre");
    if (!apellidos) missingFields.push("apellidos");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (!fechaNacimiento) missingFields.push("fechaNacimiento");
    if (!dni) missingFields.push("dni"); // Validar el dni

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "error",
        message: `Por favor, complete todos los campos: ${missingFields.join(
          ", "
        )}`,
      });
    }

    try {
      // Verificar si el usuario ya existe
      const existingUser = await Usuarios.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          status: "error",
          message: "El usuario ya está registrado con este correo electrónico.",
        });
      }

      console.log("req.files", req.files);

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      country_id = 2;

      // Subir imágenes de DNI a DigitalOcean Spaces
      const uploadToSpaces = async (fileBuffer, fileName) => {
        const uploadParams = {
          Bucket: "yoelijobolivia",
          Key: fileName,
          Body: fileBuffer,
          ACL: "public-read",
        };

        const upload = new Upload({
          client: s3Client,
          params: uploadParams,
        });

        const result = await upload.done();
        return result.Location;
      };

      let dniFrontUrl = null;
      let dniBackUrl = null;

      if (req.files && req.files.dniFront) {
        const dniFrontBuffer = req.files.dniFront[0].buffer;
        dniFrontUrl = await uploadToSpaces(
          dniFrontBuffer,
          `dniFront_${Date.now()}.jpg`
        );
      }

      if (req.files && req.files.dniBack) {
        const dniBackBuffer = req.files.dniBack[0].buffer;
        dniBackUrl = await uploadToSpaces(
          dniBackBuffer,
          `dniBack_${Date.now()}.jpg`
        );
      }

      // Crear el usuario
      const user = await Usuarios.create({
        nombre,
        apellidos,
        email,
        telefono: telefono || 0, // Si telefono no viene, poner 0
        clave: hashedPassword,
        country_id,
        dni_front_path: dniFrontUrl, // Puede ser null si no se subió
        dni_back_path: dniBackUrl, // Puede ser null si no se subió
        fechaNacimiento,
        dni, // Añadir el campo dni aquí
        status: 1,
        idPerfil: 1,
      });

      // Generar el token JWT
      const token = jwt.sign({ id: user.idUsuario }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.status(201).json({
        status: "success",
        message: "Usuario registrado con éxito",
        token,
      });
    } catch (error) {
      console.error("Error:", error);
      res
        .status(500)
        .json({ status: "error", message: "Error interno del servidor" });
    }
  },
];

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate request
  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Se requiere email y password",
    });
  }

  try {
    // Find the user by email
    const user = await Usuarios.findOne({ where: { email, status: 1 } });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.clave);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Clave incorrecta",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.idUsuario }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Return user data and token
    res.status(200).json({
      status: "success",
      message: "Inicio de sesión exitoso",
      user: {
        idUsuario: user.idUsuario,
        nombre: user.nombre,
        apellidos: user.apellidos,
        email: user.email,
        telefono: user.telefono,
      },
      token,
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
};

// Middleware to verify JWT token
exports.verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res
      .status(403)
      .json({ status: "error", message: "Token no proporcionado" });
  }

  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ status: "error", message: "Token no válido" });
    }

    // Guardar el idUsuario en el request para usarlo en las siguientes funciones
    req.userId = decoded.id;
    next();
  });
};
