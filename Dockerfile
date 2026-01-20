FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 46070

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
