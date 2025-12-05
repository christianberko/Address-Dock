#build application
FROM node:20.13.1 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript to JavaScript cuz node does support ts
RUN npm run build

# production runtime
FROM node:20.13.1

WORKDIR /app

# Copy package files
COPY package*.json ./

# dependencies
RUN npm install --production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

#port the app runs on for docker
EXPOSE 4900

# environment variable for port
ENV SERVER_PORT=4900
ENV ENV=production

# Start the app
CMD ["node", "dist/server.js"]

