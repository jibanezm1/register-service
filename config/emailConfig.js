const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // o el servicio de tu preferencia (e.g. SMTP)
  auth: {
    user: process.env.EMAIL_USER, // Añade tu correo electrónico en las variables de entorno
    pass: process.env.EMAIL_PASSWORD, // Añade tu contraseña en las variables de entorno
  },
});

module.exports = transporter;
