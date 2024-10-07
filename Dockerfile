# Usa una imagen base oficial de Node.js
FROM node:20-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el archivo package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto de los archivos del proyecto al contenedor
COPY . .

# Expone el puerto en el que tu aplicación va a escuchar (puedes cambiarlo según tu configuración)
EXPOSE 3040

# Comando para ejecutar la aplicación
CMD ["npm", "start"]
