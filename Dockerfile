# build environment
FROM node:18-alpine as build
WORKDIR /app
ENV NPM_CONFIG_PRODUCTION=false
COPY package*.json ./
RUN npm install --include=dev --legacy-peer-deps
COPY . ./
RUN npm run build

# production environment
FROM nginx:stable-alpine
ENV NODE_ENV=production
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
