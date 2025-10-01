ROM php:8.2-fpm

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    curl \
    git \
 && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# Installer Composer depuis l'image officielle
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Définir le répertoire de travail
WORKDIR /var/www

# Copier les fichiers dans le conteneur
COPY . .

# Installer les dépendances PHP
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Fixer les permissions
RUN chown -R www-data:www-data /var/www \
 && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Lancer le serveur Artisan (⚠️ uniquement pour dev/test)
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

EXPOSE 8000



