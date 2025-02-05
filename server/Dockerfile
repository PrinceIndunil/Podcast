# Use a lightweight Node.js image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy only package files first for better caching
COPY package*.json ./

# Install dependencies efficiently
RUN npm ci --only=production

# Copy the rest of the backend code
COPY . .

# Expose the correct backend port (8800)
EXPOSE 8800

# Ensure Node.js binds to all network interfaces
ENV HOST=0.0.0.0

# Start the backend server
CMD ["npm", "start"]
