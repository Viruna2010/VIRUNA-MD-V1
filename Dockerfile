# Use the LTS version of Node.js (Bullseye)
FROM node:lts-bullseye

# Install necessary packages
RUN apt-get update && \
    apt-get install -y ffmpeg imagemagick webp && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies including PM2
RUN npm install && npm install pm2 -g

# Copy all application files
COPY . .

# Expose port (Render uses 10000 by default, you can change if needed)
EXPOSE 10000

# Start app with PM2 runtime
CMD ["pm2-runtime", "index.js", "--", "--server"]
