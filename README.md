# Calculadora de envíos (volumétrico)

Aplicación web para calcular el peso facturable y el precio estimado de envíos según dimensiones, peso real y tarifas por tramos. Permite consolidar unidades por fila, elegir el divisor volumétrico (nacional/internacional/personalizado), seleccionar tarifa y trayecto/país, y visualizar el bloque optimizado.

## Qué hace el proyecto

- Calcula **peso volumétrico** por fila usando el divisor seleccionado (cm³/kg).
- Calcula **peso real** total y **peso facturable** (máximo entre real y volumétrico).
- Aplica **tarifas por tramos** e incrementos por kg para nacional/internacional.
- Consolida unidades por fila con un **apilado restringido** (solo crece el ancho).
- Muestra **totales** y un **diagrama SVG** del bloque optimizado.

## Tecnologías

- React 18
- react-scripts (Create React App)
- Tailwind CSS vía CDN (para estilos rápidos)
- Docker (build multi-stage con Nginx)

## Requisitos

- Node.js 18+ (para desarrollo local)
- Docker (para despliegue en producción)

## Estructura del proyecto

- src/App.jsx: componente principal de la calculadora.
- src/index.js: punto de entrada de React.
- public/index.html: HTML base (incluye Tailwind CDN).
- Dockerfile: construcción de imagen de producción.
- docker-compose.yml: stack para Portainer.

## Uso en desarrollo (local)

1. Instalar dependencias:
	```bash
	npm install
	```

2. Ejecutar en modo desarrollo:
	```bash
	npm start
	```

3. Abrir en el navegador:
	```
	http://localhost:3000
	```

## Build de producción (local)

```bash
npm run build
```

Genera una carpeta build con los archivos estáticos listos para servir.

## Despliegue con Docker (local)

```bash
docker build -t calculadora-envios .
docker run -p 46070:80 calculadora-envios
```

Abrir en:
```
http://localhost:46070
```

## Despliegue en Portainer (Stack)

1. Abrir Portainer → Stacks → Add stack.
2. Pegar el contenido de docker-compose.yml.
3. Deploy the stack.

El servicio expone el puerto 46070 del host hacia el 80 del contenedor.

## Personalización de tarifas

Las tarifas se definen dentro de src/App.jsx en la constante TARIFAS. Puedes añadir o modificar tramos y países según tu tabla original.

## Notas

- El divisor volumétrico se puede cambiar desde el selector superior.
- En internacional ≤ 40 kg se usa la tabla por tramos; > 40 kg usa incremento por kg.
- Los valores mostrados son estimaciones según las tarifas configuradas.
