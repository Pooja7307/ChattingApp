# Use Node.js official image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all backend files
COPY . .

# Expose port (backend server port)
EXPOSE 8081

# Start the server
CMD ["node", "server.js"]
