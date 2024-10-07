const {
    Respuestas,
    MisionUsuarios,
    CuestionarioUsuario,
  } = require("../models"); // Modelos de Sequelize
  const { S3Client } = require("@aws-sdk/client-s3");
  const { Upload } = require("@aws-sdk/lib-storage");
  const multer = require("multer");
  
  // Crear cliente S3 para DigitalOcean Spaces
  const s3Client = new S3Client({
    endpoint: "https://sfo3.digitaloceanspaces.com",
    region: "us-east-1",
    credentials: {
      accessKeyId: "DO00UVJFWYDE2R8AHUWW",
      secretAccessKey: "q7kfJNeHvv+bXwX/QtHGoYX50Lne7blZmiUI4OyVi4c",
    },
  });
  
  // Configurar multer para subir archivos
  const storage = multer.memoryStorage();
  const upload = multer({ storage });
  
  // Función para subir a DigitalOcean Spaces
  const uploadToSpaces = async (fileBuffer, fileName) => {
    const uploadParams = {
      Bucket: "yoelijobolivia", // El nombre del bucket
      Key: fileName,
      Body: fileBuffer,
      ACL: "public-read", // Permitir acceso público
    };
  
    const upload = new Upload({
      client: s3Client,
      params: uploadParams,
    });
  
    const result = await upload.done();
    return result.Location; // Devuelve la URL pública del archivo
  };
  
  // Controller para guardar respuestas y subir imágenes
  exports.saveResponses = [
    upload.any(), // Para permitir múltiples archivos
    async (req, res) => {
      const transaction = await Respuestas.sequelize.transaction(); // Crear una transacción
      try {
        const responseData = {};
  
        // Validar que idCuestionario o idMision e idUsuario estén presentes en req.body
        if (!req.body.idUsuario) {
          return res.status(400).json({
            success: false,
            message: "Falta idUsuario en la solicitud",
          });
        }
  
        console.log("Datos recibidos:", req.body);
  
        // Subir archivos y registrar imágenes
        for (let file of req.files) {
          if (file.fieldname.startsWith("urlFoto_")) {
            const fileName = `${Date.now()}_${file.originalname}`;
            const fileUrl = await uploadToSpaces(file.buffer, fileName);
            responseData[file.fieldname] = fileUrl;
            console.log("Imagen subida:", file.fieldname, fileUrl);
          }
        }
  
        // Procesar las respuestas
        for (const key in req.body) {
          if (key.startsWith("response_")) {
            const respuestaData = JSON.parse(req.body[key]);
            console.log("Datos de la respuesta procesada:", respuestaData);
  
            const respuesta = await Respuestas.create({
              idPregunta: respuestaData.idPregunta,
              idOpcion: respuestaData.idOpcion,
              textoRespuesta: respuestaData.textoRespuesta || null,
              idUsuario: req.body.idUsuario,
              urlFoto: responseData[respuestaData.urlFoto] || null,
            }, { transaction });
  
            console.log("Respuesta guardada en DB:", respuesta);
          }
        }
  
        // Si hay una misión definida, guardarla en MisionUsuarios
        if (req.body.misiones && req.body.misiones !== "undefined") {
          console.log("Guardando misión:", req.body.misiones);
          const misionUsuario = await MisionUsuarios.create({
            idMision: req.body.misiones,
            idUsuario: req.body.idUsuario,
          }, { transaction });
  
          console.log("Misión guardada en DB:", misionUsuario);
        }
  
        // Si hay un cuestionario, guardarlo en CuestionarioUsuario
        if (req.body.idCuestionario && req.body.idCuestionario !== "undefined") {
          console.log("Guardando CuestionarioUsuario:", {
            idCuestionario: req.body.idCuestionario,
            idUsuario: req.body.idUsuario,
          });
  
          const cuestionarioUsuario = await CuestionarioUsuario.create({
            idCuestionario: req.body.idCuestionario,
            idUsuario: req.body.idUsuario,
          }, { transaction });
  
          console.log("CuestionarioUsuario guardado en DB:", cuestionarioUsuario);
        }
  
        await transaction.commit(); // Confirmar la transacción
        res
          .status(200)
          .json({ success: true, message: "Responses and data saved successfully" });
      } catch (error) {
        console.error("Error:", error);
        await transaction.rollback(); // Revertir la transacción en caso de error
        res
          .status(500)
          .json({ success: false, message: "Error saving responses and data" });
      }
    },
  ];
  
  