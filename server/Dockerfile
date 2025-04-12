FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port app runs on
EXPOSE 8800

# Start the application with node instead of nodemon for production
CMD ["node", "index.js"]