# Use a lightweight Node.js image
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 8800

ENV HOST=0.0.0.0

CMD ["npm", "start"]
