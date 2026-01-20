FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el resto de archivos
COPY . .

# Exponer puerto
EXPOSE 46070

# Ejecutar en modo desarrollo con host correcto
CMD ["npm", "run", "dev"]
