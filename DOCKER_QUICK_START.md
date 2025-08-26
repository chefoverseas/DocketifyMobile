# 🐳 Docker Quick Start - Docketify

## One-Command Deployment

### Production Deployment
```bash
./scripts/docker-start.sh
```

### Development Environment  
```bash
./scripts/docker-dev.sh
```

### Cleanup Everything
```bash
./scripts/docker-cleanup.sh
```

## Manual Setup (if scripts don't work)

### 1. Configure Environment
```bash
cp .env.docker .env
# Edit .env with your values:
# - DB_PASSWORD=your_secure_password
# - SESSION_SECRET=generate_with_openssl_rand_base64_48  
# - SENDGRID_API_KEY=SG.your_api_key_here
```

### 2. Start Production
```bash
docker-compose up -d --build
docker-compose exec app npm run db:push
```

### 3. Start Development
```bash
docker-compose -f docker-compose.dev.yml up -d --build
docker-compose -f docker-compose.dev.yml exec app npm run db:push
```

## Access Your Application

**Production (with Nginx):**
- Main app: http://localhost
- Health check: http://localhost/health

**Development:**
- Main app: http://localhost:5000
- Health check: http://localhost:5000/api/health

## Quick Commands

```bash
# View logs
docker-compose logs -f app

# Restart app
docker-compose restart app

# Database backup
docker-compose exec database pg_dump -U docketify_user docketify > backup.sql

# Stop everything
docker-compose down
```

## Troubleshooting

**Container won't start:**
```bash
docker-compose logs app
```

**Database issues:**
```bash
docker-compose exec database pg_isready
```

**Reset everything:**
```bash
./scripts/docker-cleanup.sh
./scripts/docker-start.sh
```

## What's Included

✅ **Complete Application Stack:**
- React frontend with modern UI
- Express.js backend with all APIs
- PostgreSQL database with schema
- Redis session storage
- Nginx reverse proxy with SSL ready

✅ **Production Features:**
- Health checks and monitoring
- Security headers and rate limiting
- File upload handling
- Email notification system
- Data synchronization service
- Audit logging system

✅ **Development Tools:**
- Hot reload for code changes
- Development database
- Console logging for emails
- Easy debugging and testing

Your complete Docketify application runs in Docker with one command! 🚀