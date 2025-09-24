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

# Install dependencies and PM2 globally
RUN npm install && npm install pm2 -g

# Copy all project files
COPY . .

# Expose port (change if your bot uses different port)
EXPOSE 3000

# Start bot using PM2 runtime
CMD ["pm2-runtime", "index.js"]
