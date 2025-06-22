# 🌐 Base PHP image with Composer, PHP 8.2, and extensions needed by Laravel
FROM composer:2.7 as php-builder

# 🧰 Install PHP extensions and Node
RUN apt-get update && apt-get install -y \
    git unzip curl zip \
    php8.2-cli php8.2-mbstring php8.2-xml php8.2-curl php8.2-sqlite3 php8.2-gd php8.2-bcmath php8.2-tokenizer php8.2-fileinfo php8.2-pdo php8.2-pdo-sqlite php8.2-intl \
    nodejs npm

# ✅ Set working directory
WORKDIR /app

# 📁 Copy all files
COPY . .

# 📦 Install backend dependencies
RUN composer install --optimize-autoloader --no-dev

# 📦 Install frontend dependencies and build
RUN npm install && npm run build

# 🧼 Clean up
RUN rm -rf node_modules && npm cache clean --force

# 🚀 Start Laravel (optional: could be managed by a process manager or web server)
CMD php artisan serve --host=0.0.0.0 --port=3000
