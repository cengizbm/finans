# --- Build aşaması ---
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# prepare script'i (git hook kurulumu) konteynerde gereksiz
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# --- Sunum aşaması ---
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
