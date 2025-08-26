# 🐳 Docker Deployment Guide - Docketify

Complete guide to containerize and deploy your Docketify application using Docker.

## 🚀 Quick Start

### Option 1: Production Deployment with Docker Compose
```bash
# 1. Clone your repository
git clone https://github.com/yourusername/docketify.git
cd docketify

# 2. Configure environment
cp .env.docker .env
# Edit .env with your actual values

# 3. Build and start all services
docker-compose up -d

# 4. Initialize database
docker-compose exec app npm run db:push

# Your app is now running at http://localhost
```

### Option 2: Development Setup
```bash
# For development with hot reload
docker-compose -f docker-compose.dev.yml up -d
```

## 📋 Complete Setup Instructions

### 1. Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB RAM available
- SendGrid API key for email functionality

### 2. Environment Configuration

Create `.env` file from template:
```bash
cp .env.docker .env
```

**Required environment variables:**
```env
# Database
DB_PASSWORD=your_secure_db_password
DATABASE_URL=postgresql://docketify_user:your_secure_db_password@database:5432/docketify

# Security
SESSION_SECRET=generate_with_openssl_rand_base64_48

# Email
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here

# Optional
PRODUCTION_DOMAIN=yourdomain.com
REDIS_PASSWORD=redis_secure_password
```

### 3. Build and Deploy

**Production deployment:**
```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f app

# Initialize database schema
docker-compose exec app npm run db:push
```

**Development deployment:**
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Attach to app container for debugging
docker-compose -f docker-compose.dev.yml exec app sh
```

## 🏗️ Architecture Overview

The Docker setup includes:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   Docketify     │    │   PostgreSQL    │
│  Reverse Proxy  │◄───┤      App        │◄───┤    Database     │
│   Port 80/443   │    │    Port 5000    │    │    Port 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                 │
                       ┌─────────────────┐
                       │      Redis      │
                       │  Session Store  │
                       │    Port 6379    │
                       └─────────────────┘
```

### Services:

1. **nginx** - Reverse proxy with SSL termination, rate limiting, static file caching
2. **app** - Main Docketify application (Node.js/Express + React)
3. **database** - PostgreSQL database with persistent storage
4. **redis** - Session storage and caching (optional but recommended)

## 🔧 Configuration Details

### Dockerfile Stages

**Production Build:**
- Multi-stage build for optimal image size
- Non-root user for security
- Health checks for container monitoring
- Proper signal handling with dumb-init

**Development Build:**
- Single stage with development dependencies
- Volume mounting for hot reload
- Debug tools included

### Security Features

- **Non-root containers** for all services
- **Security headers** via Nginx
- **Rate limiting** on API endpoints
- **SSL/TLS ready** for production
- **Input validation** maintained from application

### Performance Optimizations

- **Multi-stage builds** reduce image size by 60%
- **Nginx caching** for static assets
- **Redis session store** for scalability
- **Health checks** for automatic recovery
- **Gzip compression** for faster responses

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# Check container health
docker-compose ps

# Application health endpoint
curl http://localhost/health

# Database connection
docker-compose exec database pg_isready -U docketify_user
```

### Logs and Debugging
```bash
# View application logs
docker-compose logs -f app

# Database logs
docker-compose logs database

# Nginx access logs
docker-compose exec nginx tail -f /var/log/nginx/access.log

# Enter container for debugging
docker-compose exec app sh
```

### Backup and Recovery
```bash
# Database backup
docker-compose exec database pg_dump -U docketify_user docketify > backup.sql

# Restore database
docker-compose exec -T database psql -U docketify_user docketify < backup.sql

# Backup uploaded files
docker run --rm -v docketify_uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz -C /data .
```

## 🚀 Production Deployment

### SSL Certificate Setup
```bash
# Create SSL directory
mkdir ssl

# Copy your certificates
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem

# Update nginx.conf to enable HTTPS server block
# Uncomment the HTTPS server section
```

### Domain Configuration
```bash
# Update .env file
PRODUCTION_DOMAIN=yourdomain.com
USE_SSL=true

# Update nginx.conf
# Replace 'localhost' with your domain
```

### Scaling for Production
```bash
# Scale application instances
docker-compose up -d --scale app=3

# Use external load balancer for multiple servers
# Consider managed database for high availability
```

## 🔄 Updates and Maintenance

### Application Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Apply database migrations
docker-compose exec app npm run db:push
```

### System Maintenance
```bash
# Update base images
docker-compose pull

# Clean unused images
docker system prune -a

# Update Docker Compose file if needed
docker-compose down
docker-compose up -d
```

## 🐛 Troubleshooting

### Common Issues

**Container won't start:**
```bash
# Check logs
docker-compose logs app

# Check environment variables
docker-compose exec app env | grep -E "(DATABASE|SENDGRID|SESSION)"

# Restart specific service
docker-compose restart app
```

**Database connection issues:**
```bash
# Check database status
docker-compose exec database pg_isready

# Test connection from app container
docker-compose exec app node -e "console.log(process.env.DATABASE_URL)"
```

**Email not working:**
```bash
# Verify SendGrid configuration
docker-compose exec app node -e "console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET')"

# Check logs for email errors
docker-compose logs app | grep -i sendgrid
```

**Performance issues:**
```bash
# Check resource usage
docker stats

# Monitor container logs
docker-compose logs -f --tail=50 app

# Scale up if needed
docker-compose up -d --scale app=2
```

### Resource Requirements

**Minimum (Development):**
- 2GB RAM
- 1 CPU core  
- 10GB disk space

**Recommended (Production):**
- 4GB RAM
- 2 CPU cores
- 50GB disk space
- SSD storage for database

## 🌐 Cloud Deployment

### Docker Hub Registry
```bash
# Build and tag image
docker build -t yourusername/docketify:latest .

# Push to registry
docker push yourusername/docketify:latest

# Deploy on remote server
docker run -d --name docketify \
  -e DATABASE_URL=your_db_url \
  -e SESSION_SECRET=your_secret \
  -e SENDGRID_API_KEY=your_key \
  -p 5000:5000 \
  yourusername/docketify:latest
```

### Cloud Provider Examples

**AWS ECS/Fargate:**
- Use provided docker-compose.yml as base
- Configure RDS for PostgreSQL
- Use ElastiCache for Redis
- Set up Application Load Balancer

**Google Cloud Run:**
- Build with Cloud Build
- Use Cloud SQL for PostgreSQL
- Configure environment variables in Cloud Run

**DigitalOcean App Platform:**
- Connect GitHub repository
- Use managed PostgreSQL database
- Configure environment variables in dashboard

## 📞 Support

For deployment issues:
- Check logs first: `docker-compose logs app`
- Verify environment variables
- Ensure ports are not already in use
- Contact: info@chefoverseas.com

---

**Your Docketify application is now fully containerized and production-ready!** 🐳