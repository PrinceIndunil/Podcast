FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including nodemon
# Either use one of these approaches:
# Option 1: Install all dependencies including devDependencies
RUN npm install

# Option 2: Install only production dependencies + nodemon explicitly
# RUN npm ci --only=production && npm install -g nodemon

# Copy the rest of the application
COPY . .

# Expose the port your app runs on
EXPOSE 8800

# Start the application with node instead of nodemon for production
CMD ["node", "index.js"]