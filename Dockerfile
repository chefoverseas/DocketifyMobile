# Multi-stage Docker build for Docketify
# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS production

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    ca-certificates \
    tzdata \
    dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S docketify -u 1001 -G nodejs

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=docketify:nodejs /app/dist ./dist
COPY --from=builder --chown=docketify:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=docketify:nodejs /app/package*.json ./

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chown -R docketify:nodejs uploads

# Switch to non-root user
USER docketify

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]