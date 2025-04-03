# Use a lightweight Node.js image
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 5173 

ENV HOST=0.0.0.0

CMD ["npm", "run", "preview"]

