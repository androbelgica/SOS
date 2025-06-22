FROM php:8.2-cli-alpine

# Install PHP extensions and system dependencies
RUN apk update && apk add --no-cache \
    git unzip curl zip \
    php8-pecl-pdo_sqlite php8-pecl-intl php8-pecl-mbstring php8-pecl-xml php8-pecl-curl php8-pecl-gd php8-pecl-bcmath \
    nodejs npm

# Set working directory
WORKDIR /app

# Copy existing application
COPY . .

# Install composer
RUN curl -sS https://getcomposer.org/installer | php && \
    mv composer.phar /usr/local/bin/composer

# Install backend dependencies
RUN composer install --optimize-autoloader --no-dev

# Install frontend dependencies and build
RUN npm install && npm run build

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
