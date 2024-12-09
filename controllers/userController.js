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
      await user.save();

      // Configurar el destinatario
      // Configurar el destinatario
      const recipients = [new Recipient(email, `${nombre} ${apellidos}`)];
      mail_from = {
        name: "YoElijo.digital",
        email: "info@yoelijo.digital",
      };

      const variables = {
        email: email,
        substitutions: [
          {
            var: "variable1",
            value: nombre,
          },
          {
            var: "variable2",
            value: verificationCode,
          },
        ],
      };

      // Configurar los parámetros del correo electrónico de forma directa
      const emailParams = new EmailParams({
        from: "info@yoelijo.digital", // Correo electrónico del remitente
        fromName: "YoElijo.digital", // Nombre del remitente como texto
        to: recipients, // Lista de destinatarios
        variables: variables, // Variables de sustitución
        subject: "Código de Verificación:" + verificationCode, // Asunto
        template_id: "0p7kx4xvx0el9yjr", // ID de la plantilla
      })
        .setTemplateId("0p7kx4xvx0el9yjr")
        .setFrom(mail_from)
        .setPersonalization([
          {
            email: email,
            data: {
              variable1: nombre,
              variable2: verificationCode,
            },
          },
        ]);

      // Enviar el correo con MailerSend
      try {
        await mailerSend.email.send(emailParams);
        console.log("Correo enviado correctamente");
      } catch (error) {
        await user.destroy();

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

    // Verificar si el usuario está verificado
    if (!user.isVerified) {
      return res.status(403).json({
        status: "error",
        message: "Usuario no verificado",
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

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: "error",
      message: "Se requiere el email.",
    });
  }

  try {
    const user = await Usuarios.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado.",
      });
    }

    // Generar el código de verificación
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Guardar el código en la base de datos
    user.verification_code = verificationCode;
    await user.save();

    // Configurar el remitente
    const sender = new Sender("info@yoelijo.digital", "YoElijo.digital");

    // Configurar los destinatarios
    const recipients = [
      new Recipient(email, `${user.nombre} ${user.apellidos}`),
    ];

    // Crear el contenido HTML del correo
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 20px;">
      <div style="text-align: center;">
        <img src="https://bucket.mailersendapp.com/neqvygmrw5l0p7w2/pxkjn4182y6lz781/images/9d597101-5811-44ee-8516-3c228935c071.png" alt="Yo Elijo Logo" style="width: 100px; margin-bottom: 20px;">
      </div>
      <div style="background-color: #fff; color: #000; padding: 20px; border-radius: 8px;">
        <h3 style="margin: 0; color: #000;">Hola ${user.nombre},</h3>
        <h1 style="color: #000; font-size: 24px; margin-top: 10px;">Verificación de Cambio de Contraseña</h1>
        <p style="font-size: 16px; color: #333;">Has solicitado un cambio de contraseña. Usa el siguiente código de verificación para continuar con el proceso:</p>
        <p style="font-size: 20px; font-weight: bold; color: #4CAF50; text-align: center;">${verificationCode}</p>
        <p style="font-size: 16px; color: #333;">Si <strong>no solicitaste</strong> este cambio de contraseña, puedes ignorar este mensaje.</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://yoelijo.digital/change.html" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007A33; border-radius: 5px; text-decoration: none; font-weight: bold;">Ir a restablecer contraseña</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 14px; color: #333;">Si tienes alguna pregunta o deseas más información, envíanos un mensaje a <a href="mailto:contacto@yoelijo.digital" style="color: #007A33;">contacto@yoelijo.digital</a></p>
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <img src="https://bucket.mailersendapp.com/neqvygmrw5l0p7w2/pxkjn4182y6lz781/images/9d597101-5811-44ee-8516-3c228935c071.png" alt="Yo Elijo Logo" style="width: 50px;">
        <p style="font-size: 12px; color: #777;">© 2024 YoElijo.digital Todos los derechos reservados</p>
        <p style="font-size: 12px; color: #777;">
          <a href="https://yoelijo.digital/terms" style="color: #777; text-decoration: none;">Términos</a> | 
          <a href="https://yoelijo.digital/privacy" style="color: #777; text-decoration: none;">Privacidad</a> | 
          <a href="https://yoelijo.digital/help" style="color: #777; text-decoration: none;">Ayuda</a>
        </p>
      </div>
    </div>
  `;


    // Configurar los parámetros del correo electrónico
    const emailParams = new EmailParams()
      .setFrom(sender) // Usar el objeto Sender como remitente
      .setTo(recipients)
      .setSubject("Código de verificación para cambio de contraseña")
      .setHtml(htmlContent);

    // Enviar el correo con MailerSend
    await mailerSend.email.send(emailParams);
    console.log("Correo de verificación enviado correctamente");

    res.status(200).json({
      status: "success",
      message: "Código de verificación enviado al correo.",
    });
  } catch (error) {
    console.error("Error enviando el correo:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor.",
    });
  }
};

// Acción para deshabilitar un usuario
exports.disableUser = async (req, res) => {
  const { idUsuario } = req.params;

  try {
    // Buscar al usuario por ID
    const user = await Usuarios.findOne({ where: { idUsuario } });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // Cambiar el estado del usuario a 1 (deshabilitado)
    user.status = 1; // Suponiendo que 1 significa deshabilitado

    // Guardar los cambios en la base de datos
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Usuario deshabilitado con éxito",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al deshabilitar al usuario",
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, code, newPassword, confirmPassword } = req.body;

  if (!email || !code || !newPassword || !confirmPassword) {
    return res.status(400).json({
      status: "error",
      message: "Se requiere email, código, nueva contraseña y confirmación.",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      status: "error",
      message: "Las contraseñas no coinciden.",
    });
  }

  try {
    const user = await Usuarios.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado.",
      });
    }

    if (user.verification_code !== code) {
      return res.status(400).json({
        status: "error",
        message: "Código de verificación incorrecto.",
      });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.clave = hashedPassword;
    user.verification_code = null; // Limpiar el código de verificación
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Contraseña actualizada con éxito.",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor.",
    });
  }
};
