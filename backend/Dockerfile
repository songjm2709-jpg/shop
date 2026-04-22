FROM php:8.4-cli-alpine

RUN apk add --no-cache \
    git curl unzip zip \
    libpng-dev libjpeg-turbo-dev freetype-dev \
    libxml2-dev oniguruma-dev \
    && docker-php-ext-install \
        pdo pdo_mysql mbstring xml bcmath opcache ctype tokenizer fileinfo

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

RUN mkdir -p storage/framework/{sessions,views,cache} \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8080

CMD sh -c "php artisan config:cache && php artisan route:cache && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"
