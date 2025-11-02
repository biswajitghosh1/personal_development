FROM nginx:1.25-alpine

# Copy static site into nginx html dir
COPY . /usr/share/nginx/html

# Expose HTTP
EXPOSE 80

# Simple healthcheck
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -q --spider http://localhost/ || exit 1

CMD ["/bin/sh", "-c", "exec nginx -g 'daemon off;'"]
