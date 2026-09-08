# Deploying the CRM Architecte to a VPS (Nginx + PHP-FPM + MySQL)

Two-step guide. **Step 1** gets the server + app running. **Step 2** is for future
updates. If you want one command that does everything on a fresh Ubuntu box, see
[Option A](#option-a--one-shot-automated-setup).

---

## What we're deploying

| Part     | Stack                        | Deploys to                         |
|----------|------------------------------|-------------------------------------|
| Backend  | Laravel 12 + PHP 8.3 + MySQL | `/var/www/crm` (app)                |
| Frontend | React (CRA) static build     | `/var/www/crm/html`                 |
| Web      | Nginx (SPA + PHP-FPM proxy)  | `/etc/nginx/sites-enabled/crm`      |

**Architecture (single domain, no CORS):**

```
Browser ── / .......... → React build (SPA fallback)
       └── /api/* ...... → Nginx → PHP-FPM → Laravel public/index.php
       └── /storage/* ... → uploaded files (storage/app/public)
```

The frontend already calls the relative `/api` base URL in production
(`Frontend/src/services/api.js`), so there is no hardcoded IP, and no
cross-origin problems.

---

## Prerequisites

- A VPS (Ubuntu 22.04 or 24.04 recommended) with root/sudo SSH access.
- A domain name pointing (`A` record) to the VPS IP. *(Not strictly required to
  start, but needed for HTTPS.)*
- Recent **Composer**, **PHP 8.2+**, **MySQL/MariaDB**, **Nginx** on the server.

---

## Step 0 – Build the frontend locally (on your Windows machine)

The React app must be compiled to static files before uploading.

```powershell
cd Frontend
npm install
npm run build         # creates Frontend/build
```

> Prod builds already use the relative `/api` URL — no env var needed.

---

## Step 1 – Upload the code

Open a terminal (Powershell on Windows). From the repo root, upload both
`Backend/` and the freshly built `Frontend/build`.

```powershell
# replace user@yourdomain.com with your server
scp -r Backend  user@yourdomain.com:/var/www/crm_tmp_backend
scp -r Frontend/build user@yourdomain.com:/var/www/crm_tmp_frontend
```

Then, actually put it in place (run on the server):

```bash
sudo mkdir -p /var/www/crm
sudo mv /var/www/crm_tmp_backend /var/www/crm
sudo mkdir -p /var/www/crm/html
sudo mv /var/www/crm_tmp_frontend /var/www/crm/html
```

> `vendor/` and `node_modules/` are intentionally not uploaded — we install
> them on the server.

---

## Step 2 – Server prerequisites (packages)

```bash
sudo apt update
sudo apt install -y nginx mysql-server php8.3-fpm php8.3-cli \
  php8.3-mysql php8.3-mbstring php8.3-xml php8.3-curl php8.3-zip \
  php8.3-bcmath php8.3-gd php8.3-intl git unzip curl

# Composer
curl -sS https://getcomposer.org/installer | sudo php -- \
  --install-dir=/usr/local/bin --filename=composer

# Node 20 (to build the frontend on the server if you ever want to)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Make sure the PHP-FPM version matches the socket path later. Check:

```bash
php -v                    # should be 8.2 or 8.3
ls /var/run/php/          # note the exact phpX.Y-fpm.sock name
```

---

## Step 3 – Database (MySQL)

```bash
sudo mysql
```

```sql
CREATE DATABASE crm_architecture CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'A_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON crm_architecture.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Step 4 – Configure Laravel

```bash
cd /var/www/crm

# 1) Install dependencies
sudo composer install --no-dev --optimize-autoloader

# 2) Configuration
sudo cp .env.example .env
sudo php artisan key:generate --force
sudo nano .env
```

In `.env` set at minimum:

```ini
APP_NAME="CRM Architecte"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com
APP_LOCALE=fr
APP_FALLBACK_LOCALE=fr

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=crm_architecture
DB_USERNAME=crm_user
DB_PASSWORD=YOUR_STRONG_PASSWORD

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
FILESYSTEM_DISK=public
```

> A ready-to-edit copy is at `deploy/backend.env.production` in this repo.

### Storage link, migrations, seed

```bash
sudo mkdir -p storage bootstrap/cache
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

sudo php artisan storage:link
sudo php artisan migrate --force --no-interaction
# If you have a seeder for the initial admin / statuses / demo data:
sudo php artisan db:seed --force --no-interaction
```

### Laravel optimization cache

```bash
sudo php artisan config:cache
sudo php artisan route:cache
sudo php artisan view:cache
```

> ⚠️ After any change to `.env`, run `sudo php artisan config:clear && sudo php
> artisan config:cache` again, or the old values stay cached.

---

## Step 5 – Nginx

Copy the included server block and fill in your domain/paths:

```bash
sudo cp deploy/nginx-crm.conf /etc/nginx/sites-available/crm
sudo nano /etc/nginx/sites-available/crm   # set server_name and $app_root / file paths
sudo ln -sf /etc/nginx/sites-available/crm /etc/nginx/sites-enabled/crm
sudo rm -f /etc/nginx/sites-enabled/default
```

Validate and load:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

The config does the important parts for you:

- `/` → serves `/var/www/crm/html` with SPA fallback (`try_files ... /index.html`)
- `/api/*` → PHP-FPM → Laravel front controller
- `/storage/*` → uploaded files
- 50 MB upload limit, static asset caching, hidden-file deny

---

## Step 6 – Permissions

```bash
sudo chown -R www-data:www-data /var/www/crm
sudo chmod -R 775 /var/www/crm/storage /var/www/crm/bootstrap/cache
```

---

## Step 7 – HTTPS (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot auto-installs the TLS block and HTTP→HTTPS redirect.

---

## Step 8 – Verify

| Test | URL |
|------|-----|
| Frontend login page | `https://yourdomain.com/auth/sign-in` |
| API health (Sanctum protected → expect 401 JSON, not HTML) | `https://yourdomain.com/api/me` |
| Uploaded file | `https://yourdomain.com/storage/...` |

Check logs if something 404s/500s:

```bash
sudo tail -f /var/www/crm/storage/logs/laravel.log
sudo tail -f /var/log/nginx/error.log
```

> If `/api` calls return the React `index.html`, it means the SPA `location /`
> is catching them — verify `location /api/` order/`$app_root` in the Nginx
> config and that `php8.3-fpm.sock` matches your installed version.

---

## Option A – One-shot automated setup

Prefer to skip all manual steps on a **fresh** Ubuntu VPS? Upload the helper
scripts and run one command:

```bash
scp deploy/setup_server.sh user@yourdomain.com:/tmp/
ssh user@yourdomain.com
chmod +x /tmp/setup_server.sh
sudo /tmp/setup_server.sh
```

Edit the `CONFIG` variables (domain, DB passwords, git repo) at the top of
`setup_server.sh` first. The script installs every package, creates the DB,
deploys the code, configures Nginx, and (optionally) clones an existing git
repo.

---

## Future updates (Step 2)

Two ways:

**A. Re-push code + run the update script (recommended):**

```powershell
# from your Windows machine
cd Frontend
npm run build
scp -r Backend user@yourdomain.com:/var/www/crm/      # or just changed files
scp -r Frontend/build user@yourdomain.com:/var/www/crm/html
```

then on the server:

```bash
cd /var/www/crm
sudo composer install --no-dev --optimize-autoloader
sudo php artisan migrate --force
sudo php artisan config:cache && sudo php artisan route:cache && sudo php artisan view:cache
sudo systemctl reload php8.3-fpm nginx
```

**B. Automated (if you have `deploy.ps1` and OpenSSH on Windows):**

```powershell
.\deploy\deploy.ps1 -Server user@yourdomain.com
```

This builds the frontend, packages `Backend/` + `Frontend/build`, uploads them,
and runs `composer install`, migrations, cache rebuild, and service reloads on
the server.

---

## Troubleshooting checklist

1. **Blank page / 500** – read `storage/logs/laravel.log`; often a missing
   `.env` value or a permission issue on `storage/`.
2. **API returns HTML** – SPA fallback catching `/api`; check `location /api/`
   is present and correct in Nginx, and reload Nginx.
3. **Uploads 404** – `storage:link` wasn't run or the symlink got wiped by
   `scp -r` of the public folder. Re-run `sudo php artisan storage:link`.
4. **Vendor missing** – you uploaded the backend but never ran
   `composer install` on the server.
5. **Permission denied writing storage** – re-run the `chown -R www-data` step.