# Use a lightweight Node.js image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy only package files first to leverage caching
COPY package*.json ./

# Install dependencies efficiently
RUN npm ci

# Copy the rest of the project files
COPY . .

EXPOSE 5173 

# Set environment variables to allow Vite to work in a container
ENV HOST=0.0.0.0

# Start the Vite development server
CMD ["npm", "run", "dev"]
