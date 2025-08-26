#!/bin/bash
set -e

echo "🐳 Starting Docketify development environment..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating required directories..."
mkdir -p uploads logs

# Start development services
echo "🔨 Starting development Docker services..."
docker-compose -f docker-compose.dev.yml down --remove-orphans
docker-compose -f docker-compose.dev.yml up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
attempt=1
max_attempts=30

while [ $attempt -le $max_attempts ]; do
    if docker-compose -f docker-compose.dev.yml exec -T database pg_isready -U docketify_dev -d docketify_dev &>/dev/null; then
        echo "✅ Database is ready"
        break
    fi
    echo "⏳ Attempt $attempt/$max_attempts - waiting for database..."
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Database failed to start after $max_attempts attempts"
    exit 1
fi

# Wait for application to be ready
echo "⏳ Waiting for application to be ready..."
sleep 10

# Initialize database schema
echo "🗄️  Initializing database schema..."
if docker-compose -f docker-compose.dev.yml exec -T app npm run db:push; then
    echo "✅ Database schema initialized"
else
    echo "⚠️  Database schema initialization may have failed"
    echo "📋 This is normal if schema already exists"
fi

# Display service status
echo ""
echo "🎉 Development environment ready!"
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "🌐 Application URLs:"
echo "   Main application: http://localhost:5000"
echo "   API test: http://localhost:5000/api/test"

echo ""
echo "🔧 Development commands:"
echo "   View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "   View app logs: docker-compose -f docker-compose.dev.yml logs -f app"
echo "   Stop services: docker-compose -f docker-compose.dev.yml down"
echo "   Restart app: docker-compose -f docker-compose.dev.yml restart app"
echo "   Shell into app: docker-compose -f docker-compose.dev.yml exec app sh"

echo ""
echo "✅ Development environment is running with hot reload!"
echo "📝 Edit your code and changes will be reflected automatically."