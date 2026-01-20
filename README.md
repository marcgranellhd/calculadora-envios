# Calculadora de Envíos

Aplicación React para calcular costos de envíos.

## Despliegue en Portainer

### Opción 1: Stack en Portainer (Recomendado)

1. Accede a Portainer
2. Ve a **Stacks** → **Add stack**
3. Sube el archivo `docker-compose.yml` o copia su contenido
4. Haz clic en **Deploy the stack**
5. Accede a la aplicación en: `http://tu-servidor:46070`

### Opción 2: Construcción manual

```bash
# Construir la imagen
docker build -t calculadora-envios .

# Ejecutar el contenedor
docker run -d -p 46070:46070 --name calculadora-envios calculadora-envios
```

### Opción 3: Desarrollo local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:46070`

## Puerto

La aplicación se ejecuta en el puerto **46070**.
