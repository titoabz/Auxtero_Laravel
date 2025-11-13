# Pre-Deployment Checklist

## Before Uploading to Server

### 1. Code Preparation
- [ ] All code committed to version control (Git)
- [ ] Remove any debug code or console.logs
- [ ] Update .env.example with all required variables
- [ ] Test application locally one final time
- [ ] Run `composer install` to verify dependencies
- [ ] Run `npm run production` to build optimized assets

### 2. Database
- [ ] Backup local database if needed
- [ ] Verify all migrations are created
- [ ] Test migrations on fresh database
- [ ] Document any manual database changes needed

### 3. Files & Assets
- [ ] Ensure all required files are committed
- [ ] Compiled assets are in public/js and public/css
- [ ] Profile pictures or sample data prepared if needed
- [ ] .gitignore configured correctly

### 4. Configuration
- [ ] .env.production.example file reviewed
- [ ] Database credentials ready
- [ ] Domain name/IP address ready
- [ ] SSL certificate plan (Let's Encrypt recommended)

---

## Server Deployment Steps

### 1. Server Setup
- [ ] Server provisioned (Ubuntu 20.04+ or similar)
- [ ] SSH access configured
- [ ] Root or sudo access confirmed
- [ ] Server IP/hostname noted

### 2. Transfer Files
Choose one method:
- [ ] Git clone from repository (recommended)
- [ ] SCP/SFTP file transfer
- [ ] Upload via control panel (cPanel, Plesk, etc.)

### 3. Run Deployment Script
```bash
sudo bash deploy.sh
```

Or follow manual steps in SERVER_MIGRATION_GUIDE.md

### 4. Configuration
- [ ] Copy .env.production.example to .env
- [ ] Update .env with production values:
  - [ ] APP_URL (your domain)
  - [ ] DB_* (database credentials)
  - [ ] APP_DEBUG=false
  - [ ] APP_ENV=production
- [ ] Generate APP_KEY: `php artisan key:generate`

### 5. Database Setup
- [ ] Create MySQL database
- [ ] Create database user with privileges
- [ ] Run migrations: `php artisan migrate --force`
- [ ] (Optional) Seed data: `php artisan db:seed --force`

### 6. Permissions
```bash
sudo chown -R www-data:www-data /var/www/Auxtero_Bugasia_Laravel
sudo chmod -R 775 storage bootstrap/cache public/uploads
```

### 7. Web Server
- [ ] Nginx or Apache configured
- [ ] Virtual host/server block created
- [ ] Document root points to /public directory
- [ ] Server restarted
- [ ] Test web server: `curl http://localhost`

### 8. SSL/HTTPS
- [ ] SSL certificate obtained (Let's Encrypt)
- [ ] HTTPS configured and working
- [ ] HTTP to HTTPS redirect enabled
- [ ] Test SSL: https://www.ssllabs.com/ssltest/

### 9. Optimization
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### 10. Security
- [ ] Firewall configured (UFW)
- [ ] SSH key authentication enabled
- [ ] Password authentication disabled (optional)
- [ ] fail2ban installed and configured
- [ ] Security updates enabled

---

## Post-Deployment Testing

### Functional Tests
- [ ] Homepage loads correctly
- [ ] Login system works
- [ ] Can create/edit/delete students
- [ ] Profile picture upload works
- [ ] All navigation links work
- [ ] API endpoints respond correctly
- [ ] Course sections display properly
- [ ] Student view tabs functional

### Performance Tests
- [ ] Page load time acceptable (<3 seconds)
- [ ] Images load correctly
- [ ] No 404 errors on assets
- [ ] Database queries optimized

### Browser Tests
- [ ] Chrome/Edge - works
- [ ] Firefox - works
- [ ] Safari - works
- [ ] Mobile responsive - works

### Security Tests
- [ ] SQL injection protection working
- [ ] XSS protection enabled
- [ ] CSRF tokens working
- [ ] File upload restrictions working
- [ ] Direct file access blocked

---

## Monitoring & Maintenance

### Daily
- [ ] Check error logs: `tail -f storage/logs/laravel.log`
- [ ] Monitor disk space: `df -h`
- [ ] Check application uptime

### Weekly
- [ ] Review server logs
- [ ] Check for failed login attempts
- [ ] Verify backups are running
- [ ] Test backup restoration

### Monthly
- [ ] Update system packages: `sudo apt update && sudo apt upgrade`
- [ ] Review security advisories
- [ ] Update Laravel dependencies if needed
- [ ] Review and rotate logs

---

## Backup Strategy

### Automated Backups
- [ ] Database backup script configured
- [ ] Uploads directory backup configured
- [ ] Backup schedule set (daily recommended)
- [ ] Backup retention policy defined (7-30 days)
- [ ] Backup storage location secure

### Manual Backups Before
- [ ] Major updates
- [ ] Database migrations
- [ ] Configuration changes
- [ ] Code deployments

### Test Backup Restoration
- [ ] Restore test on non-production environment
- [ ] Verify data integrity
- [ ] Document restoration procedure

---

## Rollback Plan

### If Deployment Fails
1. Revert to previous code version
   ```bash
   git checkout <previous-commit>
   ```

2. Restore database from backup
   ```bash
   mysql -u user -p database < backup.sql
   ```

3. Clear all caches
   ```bash
   php artisan cache:clear
   php artisan config:clear
   ```

4. Restart web server
   ```bash
   sudo systemctl restart nginx
   ```

### Emergency Contacts
- System Administrator: _______________
- Database Administrator: _______________
- Hosting Provider Support: _______________

---

## Documentation

### Update After Deployment
- [ ] Server IP/hostname documented
- [ ] Database credentials stored securely
- [ ] SSH credentials stored securely
- [ ] Domain/DNS settings documented
- [ ] SSL certificate details noted
- [ ] Admin user credentials created and documented

### Access Information
- **Application URL**: https://_______________
- **Server IP**: _______________
- **SSH User**: _______________
- **Database Host**: _______________
- **Database Name**: _______________
- **Backup Location**: _______________

---

## Success Criteria

Deployment is considered successful when:
- ✅ Application accessible via domain name
- ✅ HTTPS working with valid certificate
- ✅ All features functional
- ✅ No errors in logs
- ✅ Performance meets requirements
- ✅ Backups configured and tested
- ✅ Monitoring in place
- ✅ Documentation complete

---

## Notes

Date Deployed: _______________
Deployed By: _______________
Server Provider: _______________
Domain Registrar: _______________

Additional Notes:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
