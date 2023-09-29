# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app/server

# Copy package.json and package-lock.json to install dependencies
COPY ./server/package*.json ./

# Install backend dependencies
RUN npm install

# Copy the backend code into the container
COPY ./server ./

# Expose the port for the backend
EXPOSE 8000

# Command to start the backend
CMD ["node", "index.js"]