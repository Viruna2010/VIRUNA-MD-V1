# Use LTS Node.js on Debian Bullseye
FROM node:lts-bullseye

# Install necessary packages
RUN apt-get update && \
    apt-get install -y \
    ffmpeg \
    imagemagick \
    webp && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Create folder for persistent session
RUN mkdir -p /usr/src/app/session

# Expose port if needed (optional for pure WhatsApp bot)
EXPOSE 3000

# Set environment variable for session path
ENV SESSION_FILE=/usr/src/app/session/session.json

# Start bot directly using Node.js
CMD ["node", "index.js"]
