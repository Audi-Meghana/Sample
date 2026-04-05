# Multi-stage build for Node.js backend + Python FastAPI service
# Stage 1: Build Node.js dependencies and prepare app
FROM node:18-alpine AS node-builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Stage 2: Build Python environment
FROM python:3.10-slim AS python-builder

WORKDIR /app/ai_services
COPY backend/AI_services/requirements.txt ./
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Stage 3: Final production image
FROM node:18-alpine

# Install Python and runtime dependencies
RUN apk add --no-cache python3 py3-pip ffmpeg

WORKDIR /app

# Copy Node.js dependencies from builder
COPY --from=node-builder /app/backend/node_modules ./backend/node_modules

# Copy Python packages from builder
COPY --from=python-builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=python-builder /usr/local/bin /usr/local/bin

# Copy application code
COPY backend ./backend
COPY backend/AI_services ./backend/AI_services

WORKDIR /app/backend

# Create uploads directory
RUN mkdir -p uploads

# Expose ports
EXPOSE 3000 8000

# Set environment variables
ENV NODE_ENV=production
ENV PYTHONUNBUFFERED=1
ENV FASTAPI_URL=http://127.0.0.1:8000
ENV PORT=3000

# Start both services using a startup script
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

CMD ["/app/docker-entrypoint.sh"]
