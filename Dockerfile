# Use an official Node image with Debian base
FROM node:18-bullseye

# Install PHP and required extensions
RUN apt-get update && apt-get install -y \
    php php-cli php-mbstring php-xml php-curl php-sqlite3 unzip curl git zip \
    && rm -rf /var/lib/apt/lists/*

# Install Composer globally
RUN curl -sS https://getcomposer.org/installer | php && \
    mv composer.phar /usr/local/bin/composer

# Set working directory
WORKDIR /app

# Copy app files
COPY . .

# Separate install steps for better error tracking
RUN composer install --optimize-autoloader --no-dev
RUN npm install
RUN npm run build
