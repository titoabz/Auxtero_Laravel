# Server Migration Guide

## Prerequisites
- Linux server (Ubuntu 20.04+ recommended) or Windows Server
- PHP 8.0 or higher
- MySQL 8.0 or MariaDB 10.3+
- Composer
- Node.js 16+ and npm
- Web server (Apache or Nginx)

## Step 1: Prepare the Server

### For Ubuntu/Linux Server:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP and extensions
sudo apt install php8.1 php8.1-fpm php8.1-mysql php8.1-xml php8.1-mbstring php8.1-curl php8.1-zip php8.1-gd -y

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install Nginx
sudo apt install nginx -y
```

### For Windows Server:
1. Install XAMPP or Laragon
2. Install Composer from https://getcomposer.org/
3. Install Node.js from https://nodejs.org/

## Step 2: Transfer Files to Server

### Option A: Using Git (Recommended)
```bash
# On your local machine, commit all changes
git add .
git commit -m "Prepare for server deployment"
git push origin main

# On server
cd /var/www/
sudo git clone YOUR_REPOSITORY_URL Auxtero_Bugasia_Laravel
cd Auxtero_Bugasia_Laravel
```

### Option B: Using FTP/SCP
```bash
# Using SCP from local machine
scp -r P:\IT\Urios\Auxtero_Bugasia_Laravel user@server_ip:/var/www/

# Or use FileZilla, WinSCP for GUI transfer
```

## Step 3: Configure the Application

### Set Permissions (Linux):
```bash
cd /var/www/Auxtero_Bugasia_Laravel

# Set ownership
sudo chown -R www-data:www-data .

# Set directory permissions
sudo find . -type d -exec chmod 755 {} \;
sudo find . -type f -exec chmod 644 {} \;

# Set storage and cache permissions
sudo chmod -R 775 storage bootstrap/cache
sudo chown -R www-data:www-data storage bootstrap/cache

# Create uploads directory with proper permissions
mkdir -p public/uploads/students
sudo chmod -R 775 public/uploads
sudo chown -R www-data:www-data public/uploads
```

### Install Dependencies:
```bash
# Install PHP dependencies
composer install --optimize-autoloader --no-dev

# Install Node dependencies and build assets
npm install
npm run production
```

## Step 4: Configure Environment

### Create .env file:
```bash
cp .env.example .env
nano .env
```

### Update .env with server settings:
```env
APP_NAME="Auxtero Bugasia"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://your-domain.com

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=auxtero_bugasia
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
```

### Generate Application Key:
```bash
php artisan key:generate
```

## Step 5: Setup Database

### Create Database:
```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE auxtero_bugasia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'auxtero_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON auxtero_bugasia.* TO 'auxtero_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Run Migrations:
```bash
php artisan migrate --force
```

### (Optional) Seed Sample Data:
```bash
php artisan db:seed --force
```

## Step 6: Configure Web Server

### For Nginx:

Create config file:
```bash
sudo nano /etc/nginx/sites-available/auxtero-bugasia
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/Auxtero_Bugasia_Laravel/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Increase upload size for profile pictures
    client_max_body_size 10M;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/auxtero-bugasia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### For Apache:

Create .htaccess in public directory (already exists):
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

Enable mod_rewrite:
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

Create virtual host:
```bash
sudo nano /etc/apache2/sites-available/auxtero-bugasia.conf
```

Add configuration:
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAdmin admin@your-domain.com
    DocumentRoot /var/www/Auxtero_Bugasia_Laravel/public

    <Directory /var/www/Auxtero_Bugasia_Laravel/public>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/auxtero-error.log
    CustomLog ${APACHE_LOG_DIR}/auxtero-access.log combined
</VirtualHost>
```

Enable site:
```bash
sudo a2ensite auxtero-bugasia.conf
sudo systemctl restart apache2
```

## Step 7: Setup SSL (Optional but Recommended)

### Using Let's Encrypt (Free):
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (already setup by certbot)
sudo certbot renew --dry-run
```

## Step 8: Optimize for Production

### Cache Configuration:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Setup Cron Jobs (for scheduled tasks):
```bash
sudo crontab -e
```

Add this line:
```
* * * * * cd /var/www/Auxtero_Bugasia_Laravel && php artisan schedule:run >> /dev/null 2>&1
```

### Setup Supervisor (for queue workers):
```bash
sudo apt install supervisor -y
sudo nano /etc/supervisor/conf.d/auxtero-worker.conf
```

Add:
```ini
[program:auxtero-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/Auxtero_Bugasia_Laravel/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/Auxtero_Bugasia_Laravel/storage/logs/worker.log
```

Start supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start auxtero-worker:*
```

## Step 9: Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'  # or 'Apache Full'
sudo ufw enable
```

## Step 10: Post-Deployment Checklist

- [ ] Test all API endpoints
- [ ] Test file uploads (profile pictures)
- [ ] Verify database connection
- [ ] Check logs: `tail -f storage/logs/laravel.log`
- [ ] Test user authentication
- [ ] Verify all routes work correctly
- [ ] Check CORS settings if using separate frontend
- [ ] Setup backup script
- [ ] Configure monitoring (optional)

## Database Backup Script

Create backup script:
```bash
sudo nano /usr/local/bin/backup-auxtero.sh
```

Add:
```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/auxtero"
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u auxtero_user -p'your_password' auxtero_bugasia > $BACKUP_DIR/db_backup_$TIMESTAMP.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz /var/www/Auxtero_Bugasia_Laravel/public/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Make executable and schedule:
```bash
sudo chmod +x /usr/local/bin/backup-auxtero.sh
sudo crontab -e
```

Add daily backup at 2 AM:
```
0 2 * * * /usr/local/bin/backup-auxtero.sh
```

## Troubleshooting

### Issue: 500 Internal Server Error
```bash
# Check logs
tail -f storage/logs/laravel.log
sudo tail -f /var/log/nginx/error.log

# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Issue: Permission Denied
```bash
sudo chown -R www-data:www-data /var/www/Auxtero_Bugasia_Laravel
sudo chmod -R 775 storage bootstrap/cache public/uploads
```

### Issue: Database Connection Failed
```bash
# Test MySQL connection
mysql -u auxtero_user -p

# Check .env database settings
# Verify DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD
```

### Issue: Assets Not Loading
```bash
# Rebuild assets
npm run production

# Check public directory permissions
sudo chmod -R 755 public
```

## Monitoring & Maintenance

### Check Application Status:
```bash
# Check disk space
df -h

# Check memory
free -m

# Check running processes
ps aux | grep php

# Monitor logs
tail -f storage/logs/laravel.log
```

### Update Application:
```bash
cd /var/www/Auxtero_Bugasia_Laravel
git pull origin main
composer install --optimize-autoloader --no-dev
npm install
npm run production
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo systemctl restart nginx  # or apache2
```

## Security Recommendations

1. **Keep software updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use strong passwords** for database and server access

3. **Enable fail2ban** to prevent brute force attacks
   ```bash
   sudo apt install fail2ban -y
   ```

4. **Regular backups** - Use the backup script provided

5. **Monitor logs** regularly for suspicious activity

6. **Use SSL/HTTPS** in production (Let's Encrypt is free)

7. **Disable directory listing** (already configured in Nginx/Apache)

8. **Set proper file permissions** (documented above)

## Support

For issues or questions:
- Check Laravel logs: `storage/logs/laravel.log`
- Check web server logs: `/var/log/nginx/error.log` or `/var/log/apache2/error.log`
- Review this migration guide
- Contact system administrator

---

**Migration Completed Successfully!** 🎉

Access your application at: `http://your-domain.com` or `https://your-domain.com` (if SSL configured)
