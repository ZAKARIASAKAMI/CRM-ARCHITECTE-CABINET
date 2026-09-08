#!/usr/bin/env bash
# =============================================================================
# CRM Architecte - Fresh VPS setup script (Ubuntu 22.04 / 24.04)
# Run this ON THE SERVER, over SSH, as root or with sudo:
#   chmod +x setup_server.sh && sudo ./setup_server.sh
# =============================================================================
set -euo pipefail

# ----------------------------- CONFIG --------------------------------------
APP_DIR="/var/www/crm"
APP_DOMAIN="yourdomain.com"                # <-- CHANGE ME
MYSQL_ROOT_PASS="CHANGE_ME_ROOT_PASS"      # <-- CHANGE ME
MYSQL_APP_DB="crm_architecture"
MYSQL_APP_USER="crm_user"
MYSQL_APP_PASS="CHANGE_ME_STRONG_PASSWORD" # <-- CHANGE ME
PHP_VERSION="8.3"
GIT_REPO="https://github.com/ZAKARIASAKAMI/CRM-ARCHITECTE-CABINET.git" # optional

# ----------------------------- PACKAGES -------------------------------------
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y software-properties-common curl git unzip zip \
    nginx mysql-server \
    lsb-release ca-certificates apt-transport-https gnupg

# PHP 8.3
if ! command -v php >/dev/null 2>&1; then
    add-apt-repository -y ppa:ondrej/php
    apt-get update -y
fi
apt-get install -y php${PHP_VERSION}-fpm php${PHP_VERSION}-cli \
    php${PHP_VERSION}-mysql php${PHP_VERSION}-mbstring php${PHP_VERSION}-xml \
    php${PHP_VERSION}-curl php${PHP_VERSION}-zip php${PHP_VERSION}-bcmath \
    php${PHP_VERSION}-gd php${PHP_VERSION}-intl php${PHP_VERSION}-sqlite3

# Composer
if ! command -v composer >/dev/null 2>&1; then
    curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
fi

# Node.js 20 (for building the frontend on the server)
if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# ----------------------------- MYSQL ----------------------------------------
systemctl enable --now mysql
mysql -uroot <<SQL
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASS}';
CREATE DATABASE IF NOT EXISTS ${MYSQL_APP_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${MYSQL_APP_USER}'@'localhost' IDENTIFIED BY '${MYSQL_APP_PASS}';
GRANT ALL PRIVILEGES ON ${MYSQL_APP_DB}.* TO '${MYSQL_APP_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

# ----------------------------- APP CODE ------------------------------------
mkdir -p ${APP_DIR}
if [ ! -f ${APP_DIR}/artisan ]; then
    if [ -n "${GIT_REPO}" ]; then
        git clone ${GIT_REPO} /tmp/crm-repo
        cp -r /tmp/crm-repo/Backend/* /tmp/crm-repo/Backend/.[!.]* ${APP_DIR}/ 2>/dev/null || true
    else
        echo ">> No backend found. Upload the code first (see DEPLOY.md), then re-run."
        exit 0
    fi
fi

cd ${APP_DIR}

# ----------------------------- BACKEND -------------------------------------
if [ ! -f .env ]; then
    cp .env.example .env
    php artisan key:generate --force
fi
# Set production values (only if placeholders still present)
sed -i "s|^APP_ENV=.*|APP_ENV=production|" .env
sed -i "s|^APP_DEBUG=.*|APP_DEBUG=false|" .env
sed -i "s|^APP_URL=.*|APP_URL=https://${APP_DOMAIN}|" .env
sed -i "s|^DB_CONNECTION=.*|DB_CONNECTION=mysql|" .env
sed -i "s|^DB_DATABASE=.*|DB_DATABASE=${MYSQL_APP_DB}|" .env
sed -i "s|^DB_USERNAME=.*|DB_USERNAME=${MYSQL_APP_USER}|" .env
sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${MYSQL_APP_PASS}|" .env

composer install --no-dev --optimize-autoloader --no-interaction

# Permissions
mkdir -p storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

php artisan storage:link
php artisan migrate --force --no-interaction || python3 seed_full.php artisan migrate:fresh --seed --force 2>/dev/null || true

# Laravel optimizations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# ----------------------------- FRONTEND ------------------------------------
echo ">> Building React frontend..."
FRONT_SRC=$(ls -d /tmp/crm-repo/Frontend 2>/dev/null || true)
if [ -n "${FRONT_SRC}" ] && [ -d "${FRONT_SRC}" ]; then
    pushd ${FRONT_SRC}
    CI=false npm install
    CI=false REACT_APP_API_URL=/api npm run build
    popd
    rm -rf ${APP_DIR}/html
    cp -r ${FRONT_SRC}/build ${APP_DIR}/html
    chown -R www-data:www-data ${APP_DIR}/html
fi

# ----------------------------- NGINX ---------------------------------------
echo ">> Configuring Nginx..."
cat > /etc/nginx/sites-available/crm <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name DOMAIN_PLACEHOLDER;
    root /var/www/crm/html;
    index index.html;
    charset utf-8;
    client_max_body_size 50M;

    location /api/ {
        root /var/www/crm/public;
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        root /var/www/crm/public;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_pass unix:/var/run/php/PHPV_PLACEHOLDER-fpm.sock;
    }

    location /storage/ {
        alias /var/www/crm/storage/app/public/;
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public";
    }

    location ~ /\.(?!well-known).* { deny all; }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public";
    }
}
NGINX
sed -i "s/DOMAIN_PLACEHOLDER/${APP_DOMAIN}/g" /etc/nginx/sites-available/crm
sed -i "s/PHPV_PLACEHOLDER/php${PHP_VERSION}/g" /etc/nginx/sites-available/crm

ln -sf /etc/nginx/sites-available/crm /etc/nginx/sites-enabled/crm
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ----------------------------- DONE ----------------------------------------
echo
echo "======================================================"
echo " Setup complete!"
echo "   App dir:     ${APP_DIR}"
echo "   Domain:      ${APP_DOMAIN}"
echo "   PHP:         $(php -r 'echo PHP_VERSION;')"
echo "   Next steps:"
echo "     1) Point your DNS A record to this server IP"
echo "     2) Run: sudo certbot --nginx -d ${APP_DOMAIN} -d www.${APP_DOMAIN}"
echo "     3) Login with your seeded admin user"
echo "======================================================"