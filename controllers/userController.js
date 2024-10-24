const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Usuarios } = require("../models"); // Importar los modelos generados
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const multer = require("multer");
const Recipient = require("mailersend").Recipient;
const EmailParams = require("mailersend").EmailParams;
const MailerSend = require("mailersend").MailerSend;
const Sender = require("mailersend").Sender;

// Inicializar el cliente de MailerSend con tu API Key
const mailerSendConfig = { apiKey: process.env.TOKENMAIL }; // Asegúrate de definir TOKENMAIL en el archivo .env
const mailerSend = new MailerSend(mailerSendConfig);

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
      dni,
    } = req.body;

    const missingFields = [];

    if (!nombre) missingFields.push("nombre");
    if (!apellidos) missingFields.push("apellidos");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (!telefono) missingFields.push("telefono");
    if (!fechaNacimiento) missingFields.push("fechaNacimiento");
    if (!dni) missingFields.push("dni");

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
        telefono,
        clave: hashedPassword,
        country_id,
        dni_front_path: dniFrontUrl,
        dni_back_path: dniBackUrl,
        fechaNacimiento,
        dni,
        status: 1,
        idPerfil: 1,
      });

      // Generar el código de verificación
      const verificationCode = Math.floor(
        1000 + Math.random() * 9000
      ).toString();

      // Guardar el código de verificación en la base de datos (puedes agregar una columna para este código)
      user.verification_code = verificationCode;
      console.log("verificationCode", verificationCode);
      await user.save();

      // Configurar el correo electrónico
      const recipients = [new Recipient(email, `${nombre} ${apellidos}`)];
      const sentFrom = new Sender("info@yoelijo.digital", "YoElijo.digital");

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject("Código de Verificación")
        .setHtml(
          `<p>Hola ${nombre},</p><p>Tu código de verificación es: <strong>${verificationCode}</strong></p>`
        )
        .setText(
          `Hola ${nombre}, tu código de verificación es: ${verificationCode}`
        );

      // Enviar el correo con MailerSend
      try {
        await mailerSend.email.send(emailParams);
        console.log("Correo enviado correctamente");
      } catch (error) {
        console.error("Error enviando el correo:", error);
        return res.status(500).json({
          status: "error",
          message: "Error enviando el correo de verificación",
        });
      }

      // Generar el token JWT
      const token = jwt.sign({ id: user.idUsuario }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.status(201).json({
        status: "success",
        message:
          "Usuario registrado con éxito. Revisa tu correo para el código de verificación.",
        token,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        status: "error",
        message: "Error interno del servidor",
      });
    }
  },
];

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validar request
  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Se requiere email y password",
    });
  }

  try {
    // Encontrar al usuario por email
    const user = await Usuarios.findOne({ where: { email, status: 1 } });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // Validar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.clave);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Clave incorrecta",
      });
    }

    // Generar el token JWT
    const token = jwt.sign({ id: user.idUsuario }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Retornar datos del usuario y token
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
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
};

// Middleware para verificar el token JWT
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

exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;
  console.log(req.body);
  if (!email || !code) {
    return res.status(400).json({
      status: "error",
      message: "Se requiere email y código de verificación.",
    });
  }

  try {
    // Buscar el usuario por email
    const user = await Usuarios.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado.",
      });
    }
    console.log(user.verification_code);
    // Comparar el código de verificación
    if (user.verification_code === code) {
      // Marcar al usuario como verificado (agrega el campo isVerified si no lo tienes)
      user.isVerified = true;
      await user.save();

      return res.status(200).json({
        status: "success",
        message:
          "Código de verificación correcto. Usuario verificado con éxito.",
      });
    } else {
      return res.status(400).json({
        status: "error",
        message: "Código de verificación incorrecto.",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor.",
    });
  }
};
