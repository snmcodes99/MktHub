# Development stage
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Copy the docker-specific environment variables for use during dev
COPY .env.docker .env

# Expose Vite's default port
EXPOSE 5173

# Start the Vite development server and expose it to the Docker network
CMD ["npm", "run", "dev", "--", "--host"]
