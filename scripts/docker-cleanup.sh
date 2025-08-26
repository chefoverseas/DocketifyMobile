#!/bin/bash

echo "🧹 Docker cleanup script for Docketify"

# Function to ask for confirmation
confirm() {
    read -r -p "$1 (y/N): " response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            true
            ;;
        *)
            false
            ;;
    esac
}

# Stop all Docketify services
echo "🛑 Stopping all Docketify services..."
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true

# Remove Docketify containers
if confirm "Remove all Docketify containers?"; then
    echo "🗑️  Removing containers..."
    docker ps -a --filter "name=docketify" --format "table {{.Names}}" | tail -n +2 | xargs -r docker rm -f
fi

# Remove Docketify images
if confirm "Remove Docketify Docker images?"; then
    echo "🗑️  Removing images..."
    docker images --filter "reference=*docketify*" --format "table {{.Repository}}:{{.Tag}}" | tail -n +2 | xargs -r docker rmi -f
fi

# Remove volumes (WARNING: This will delete data)
if confirm "⚠️  Remove Docker volumes? (THIS WILL DELETE ALL DATA including database and uploads)"; then
    echo "🗑️  Removing volumes..."
    docker volume ls --filter "name=docketify" --format "table {{.Name}}" | tail -n +2 | xargs -r docker volume rm -f
fi

# Remove networks
echo "🗑️  Removing networks..."
docker network ls --filter "name=docketify" --format "table {{.Name}}" | tail -n +2 | xargs -r docker network rm 2>/dev/null || true

# Clean up unused Docker resources
if confirm "Clean up unused Docker resources (images, containers, volumes)?"; then
    echo "🧹 Cleaning up unused Docker resources..."
    docker system prune -a -f --volumes
fi

# Clean up build cache
if confirm "Clean up Docker build cache?"; then
    echo "🧹 Cleaning up build cache..."
    docker builder prune -a -f
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📋 Remaining Docketify resources:"
echo "Containers:"
docker ps -a --filter "name=docketify" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "None"

echo ""
echo "Images:"
docker images --filter "reference=*docketify*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" 2>/dev/null || echo "None"

echo ""
echo "Volumes:"
docker volume ls --filter "name=docketify" --format "table {{.Name}}\t{{.Driver}}" 2>/dev/null || echo "None"

echo ""
echo "🔄 To start fresh:"
echo "   Production: ./scripts/docker-start.sh"
echo "   Development: ./scripts/docker-dev.sh"