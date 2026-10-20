FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

FROM nginx:1.28-alpine
ENV NGINX_ENVSUBST_FILTER=CORS_ORIGIN
COPY gateway/nginx.conf /etc/nginx/nginx.conf
COPY gateway/conf.d/default.conf.template /etc/nginx/templates/default.conf.template
COPY gateway/snippets/ /etc/nginx/snippets/
COPY --from=frontend-build /app/dist /usr/share/nginx/html
EXPOSE 80
