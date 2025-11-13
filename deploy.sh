#!/bin/bash

# Auxtero Bugasia Laravel - Server Deployment Script
# This script automates the deployment process on Ubuntu/Debian servers

set -e  # Exit on error

echo "======================================"
echo "Auxtero Bugasia Deployment Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/Auxtero_Bugasia_Laravel"
WEB_USER="www-data"
WEB_GROUP="www-data"

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}➜ $1${NC}"
}

# Check if script is run as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

print_info "Starting deployment process..."
echo ""

# Step 1: Check if application directory exists
if [ ! -d "$APP_DIR" ]; then
    print_error "Application directory not found at $APP_DIR"
    print_info "Please ensure the application files are uploaded to the server first"
    exit 1
fi

cd "$APP_DIR"
print_success "Found application directory"

# Step 2: Install system dependencies
print_info "Checking system dependencies..."

# Check PHP
if ! command -v php &> /dev/null; then
    print_warning "PHP not found. Installing PHP 8.1..."
    apt update
    apt install -y php8.1 php8.1-fpm php8.1-mysql php8.1-xml php8.1-mbstring php8.1-curl php8.1-zip php8.1-gd
    print_success "PHP installed"
else
    print_success "PHP is installed: $(php -v | head -n 1)"
fi

# Check Composer
if ! command -v composer &> /dev/null; then
    print_warning "Composer not found. Installing..."
    curl -sS https://getcomposer.org/installer | php
    mv composer.phar /usr/local/bin/composer
    chmod +x /usr/local/bin/composer
    print_success "Composer installed"
else
    print_success "Composer is installed: $(composer --version)"
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    print_warning "Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    print_success "Node.js installed"
else
    print_success "Node.js is installed: $(node -v)"
fi

# Check MySQL
if ! command -v mysql &> /dev/null; then
    print_warning "MySQL not found. Installing..."
    apt install -y mysql-server
    print_success "MySQL installed"
    print_warning "Please run 'mysql_secure_installation' manually"
else
    print_success "MySQL is installed"
fi

echo ""

# Step 3: Set correct permissions
print_info "Setting file permissions..."
chown -R $WEB_USER:$WEB_GROUP "$APP_DIR"
find "$APP_DIR" -type d -exec chmod 755 {} \;
find "$APP_DIR" -type f -exec chmod 644 {} \;
chmod -R 775 "$APP_DIR/storage"
chmod -R 775 "$APP_DIR/bootstrap/cache"

# Create and set permissions for uploads directory
mkdir -p "$APP_DIR/public/uploads/students"
chmod -R 775 "$APP_DIR/public/uploads"
chown -R $WEB_USER:$WEB_GROUP "$APP_DIR/public/uploads"

print_success "Permissions set correctly"

# Step 4: Install PHP dependencies
print_info "Installing PHP dependencies..."
if [ -f composer.json ]; then
    sudo -u $WEB_USER composer install --optimize-autoloader --no-dev
    print_success "PHP dependencies installed"
else
    print_error "composer.json not found"
    exit 1
fi

# Step 5: Install Node dependencies and build assets
print_info "Installing Node dependencies and building assets..."
if [ -f package.json ]; then
    sudo -u $WEB_USER npm install
    sudo -u $WEB_USER npm run production
    print_success "Assets built successfully"
else
    print_warning "package.json not found, skipping npm install"
fi

echo ""

# Step 6: Check .env file
print_info "Checking environment configuration..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        print_warning ".env file created from .env.example"
        print_warning "Please edit .env with your database credentials before continuing"
        print_info "Run: nano $APP_DIR/.env"
        
        read -p "Press Enter after you've configured .env file..."
    else
        print_error ".env.example not found"
        exit 1
    fi
else
    print_success ".env file exists"
fi

# Step 7: Generate application key if not set
if ! grep -q "APP_KEY=base64:" .env; then
    print_info "Generating application key..."
    php artisan key:generate --force
    print_success "Application key generated"
else
    print_success "Application key already set"
fi

echo ""

# Step 8: Database setup
print_info "Database configuration..."
DB_NAME=$(grep DB_DATABASE .env | cut -d '=' -f2)
DB_USER=$(grep DB_USERNAME .env | cut -d '=' -f2)
DB_PASS=$(grep DB_PASSWORD .env | cut -d '=' -f2)

if [ ! -z "$DB_NAME" ]; then
    print_info "Database name: $DB_NAME"
    read -p "Do you want to run migrations now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        php artisan migrate --force
        print_success "Migrations completed"
        
        read -p "Do you want to seed the database? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            php artisan db:seed --force
            print_success "Database seeded"
        fi
    fi
else
    print_warning "Database not configured in .env"
fi

echo ""

# Step 9: Optimize for production
print_info "Optimizing application for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
print_success "Application optimized"

# Step 10: Configure web server
echo ""
print_info "Web server configuration..."
echo "Choose your web server:"
echo "1) Nginx"
echo "2) Apache"
echo "3) Skip (configure manually)"
read -p "Enter choice [1-3]: " server_choice

case $server_choice in
    1)
        print_info "Configuring Nginx..."
        
        # Check if Nginx is installed
        if ! command -v nginx &> /dev/null; then
            print_warning "Nginx not found. Installing..."
            apt install -y nginx
        fi
        
        read -p "Enter your domain name (e.g., example.com): " domain_name
        
        # Create Nginx config
        cat > /etc/nginx/sites-available/auxtero-bugasia << EOF
server {
    listen 80;
    server_name $domain_name www.$domain_name;
    root $APP_DIR/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;
    charset utf-8;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    client_max_body_size 10M;
}
EOF
        
        ln -sf /etc/nginx/sites-available/auxtero-bugasia /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        
        nginx -t && systemctl restart nginx
        print_success "Nginx configured and restarted"
        
        # Offer SSL setup
        read -p "Do you want to setup SSL with Let's Encrypt? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if ! command -v certbot &> /dev/null; then
                apt install -y certbot python3-certbot-nginx
            fi
            certbot --nginx -d $domain_name -d www.$domain_name
            print_success "SSL configured"
        fi
        ;;
        
    2)
        print_info "Configuring Apache..."
        
        # Check if Apache is installed
        if ! command -v apache2 &> /dev/null; then
            print_warning "Apache not found. Installing..."
            apt install -y apache2
        fi
        
        read -p "Enter your domain name (e.g., example.com): " domain_name
        
        # Enable required modules
        a2enmod rewrite
        
        # Create Apache config
        cat > /etc/apache2/sites-available/auxtero-bugasia.conf << EOF
<VirtualHost *:80>
    ServerName $domain_name
    ServerAdmin admin@$domain_name
    DocumentRoot $APP_DIR/public

    <Directory $APP_DIR/public>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog \${APACHE_LOG_DIR}/auxtero-error.log
    CustomLog \${APACHE_LOG_DIR}/auxtero-access.log combined
</VirtualHost>
EOF
        
        a2ensite auxtero-bugasia.conf
        a2dissite 000-default.conf
        
        systemctl restart apache2
        print_success "Apache configured and restarted"
        
        # Offer SSL setup
        read -p "Do you want to setup SSL with Let's Encrypt? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if ! command -v certbot &> /dev/null; then
                apt install -y certbot python3-certbot-apache
            fi
            certbot --apache -d $domain_name -d www.$domain_name
            print_success "SSL configured"
        fi
        ;;
        
    3)
        print_warning "Skipping web server configuration"
        print_info "Please configure your web server manually"
        ;;
esac

echo ""

# Step 11: Setup firewall
print_info "Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow OpenSSH
    ufw allow 'Nginx Full' 2>/dev/null || ufw allow 'Apache Full' 2>/dev/null
    ufw --force enable
    print_success "Firewall configured"
else
    print_warning "UFW not found, skipping firewall configuration"
fi

echo ""
echo "======================================"
echo "Deployment Complete! 🎉"
echo "======================================"
echo ""
print_success "Application deployed successfully!"
echo ""
print_info "Next steps:"
echo "  1. Test your application in a browser"
echo "  2. Setup backups (see SERVER_MIGRATION_GUIDE.md)"
echo "  3. Configure monitoring if needed"
echo "  4. Review logs: tail -f $APP_DIR/storage/logs/laravel.log"
echo ""

if [ ! -z "$domain_name" ]; then
    print_info "Access your application at: http://$domain_name"
else
    print_info "Access your application at: http://$(hostname -I | awk '{print $1}')"
fi

echo ""
print_warning "Remember to:"
echo "  - Keep your .env file secure"
echo "  - Setup regular backups"
echo "  - Monitor application logs"
echo "  - Keep system packages updated"
echo ""
