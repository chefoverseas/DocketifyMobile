#!/bin/bash
set -e

echo "🐳 Starting Docketify Docker deployment..."

# Function to check if service is running
check_service() {
    local service=$1
    echo "🔍 Checking $service..."
    if docker-compose ps --services --filter "status=running" | grep -q "^$service$"; then
        echo "✅ $service is running"
        return 0
    else
        echo "❌ $service is not running"
        return 1
    fi
}

# Function to wait for service to be healthy
wait_for_health() {
    local service=$1
    local max_attempts=${2:-30}
    local attempt=1
    
    echo "⏳ Waiting for $service to be healthy..."
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T $service sh -c 'exit 0' 2>/dev/null; then
            echo "✅ $service is healthy"
            return 0
        fi
        echo "⏳ Attempt $attempt/$max_attempts - waiting for $service..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service failed to become healthy after $max_attempts attempts"
    return 1
}

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f .env.docker ]; then
        cp .env.docker .env
        echo "📝 Please edit .env file with your configuration before continuing."
        echo "   Required: DB_PASSWORD, SESSION_SECRET, SENDGRID_API_KEY"
        exit 1
    else
        echo "❌ No .env template found. Please create .env file with required variables."
        exit 1
    fi
fi

# Load environment variables
source .env

# Validate required environment variables
required_vars=("DB_PASSWORD" "SESSION_SECRET" "SENDGRID_API_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    printf "   %s\n" "${missing_vars[@]}"
    echo "   Please configure these in your .env file."
    exit 1
fi

echo "✅ Environment validation passed"

# Create necessary directories
echo "📁 Creating required directories..."
mkdir -p uploads logs ssl

# Build and start services
echo "🔨 Building and starting Docker services..."
docker-compose down --remove-orphans
docker-compose up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
wait_for_health database

# Wait for application to be ready
echo "⏳ Waiting for application to be ready..."
wait_for_health app

# Initialize database schema
echo "🗄️  Initializing database schema..."
if docker-compose exec -T app npm run db:push; then
    echo "✅ Database schema initialized"
else
    echo "❌ Failed to initialize database schema"
    echo "📋 Application logs:"
    docker-compose logs --tail=20 app
    exit 1
fi

# Final health check
echo "🏥 Performing final health check..."
sleep 5

if curl -f http://localhost/health &>/dev/null; then
    echo "✅ Application is healthy and responding"
else
    echo "⚠️  Health check failed, but services may still be starting..."
    echo "🔍 Check logs with: docker-compose logs -f"
fi

# Display service status
echo ""
echo "🎉 Docketify deployment complete!"
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🌐 Application URLs:"
echo "   Main application: http://localhost"
echo "   Health check: http://localhost/health"
echo "   API test: http://localhost/api/test"

echo ""
echo "🔧 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   View app logs: docker-compose logs -f app"
echo "   Stop services: docker-compose down"
echo "   Restart app: docker-compose restart app"
echo "   Database backup: docker-compose exec database pg_dump -U docketify_user docketify > backup.sql"

echo ""
echo "✅ Deployment successful! Your Docketify application is running."