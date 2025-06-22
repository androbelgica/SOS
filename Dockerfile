# Use official PHP image with Node.js installed
FROM node:18-bullseye

# Install PHP and extensions
RUN apt-get update && apt-get install -y \
    php php-cli php-mbstring php-xml php-curl php-sqlite3 unzip curl git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# 1️⃣ COPY code first
COPY . .

# 2️⃣ Install PHP and Node dependencies
RUN curl -sS https://getcomposer.org/installer | php && \
    php composer.phar install --optimize-autoloader --no-dev && \
    npm install && npm run build

# 3️⃣ Serve the app (adjust port and command as needed)
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=3000"]
