#!/usr/bin/env bash
# =============================================================================
# CRM Architecte - Update / deploy new code on the server
# Run ON THE SERVER after pulling/pushing new code:
#   chmod +x deploy_update.sh && sudo ./deploy_update.sh
# =============================================================================
set -euo pipefail

APP_DIR="/var/www/crm"
PHP_VERSION="8.3"
FRONT_SRC="/tmp/crm-repo/Frontend"   # <-- path where fresh code lives

cd ${APP_DIR}

echo ">> Backend: composer + Laravel"
composer install --no-dev --optimize-autoloader --no-interaction

chown -R www-data:www-data storage bootstrap/cache
php artisan migrate --force --no-interaction || true

php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link

echo ">> Frontend: rebuild" 
if [ -d "${FRONT_SRC}" ]; then
    pushd ${FRONT_SRC}
    CI=false npm install
    CI=false REACT_APP_API_URL=/api npm run build
    popd
    rm -rf ${APP_DIR}/html
    cp -r ${FRONT_SRC}/build ${APP_DIR}/html
    chown -R www-data:www-data ${APP_DIR}/html
fi

systemctl reload php${PHP_VERSION}-fpm
nginx -t && systemctl reload nginx

echo ">> Deploy OK"