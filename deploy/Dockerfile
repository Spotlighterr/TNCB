# ============================================
# TNCB Rent - Production Multi-Stage Dockerfile
# Stage 1: Build static React SPA assets using Node
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy full source code and build production assets
COPY . .
RUN npm run build

# ============================================
# Stage 2: Serve static files with optimized NGINX
# ============================================
FROM nginx:1.25-alpine

# Copy custom NGINX configuration
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from Stage 1 to NGINX public HTML root
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
