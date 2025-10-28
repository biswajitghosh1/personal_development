# Password Generator (Static Web)

Simple, device-agnostic static password generator UI (HTML/CSS/JS). Open `index.html` in any modern browser or serve it via HTTP. This repository folder contains a Dockerfile and a docker-compose configuration so you can run the site in a container quickly.

## What is included

- `index.html` — main UI
- `styles.css` — styling and centered layout
- `script.js` — generation logic and clipboard helper
- `Dockerfile` — builds a small nginx-based image that serves the static files
- `docker-compose.yml` — compose file to build and run the service (exposes port 8080 by default)

## Quick local usage (no Docker)

Open `index.html` directly in a browser (works offline). For better browser features (clipboard, Service Worker, etc.) serve via a local HTTP server.

Using Python (PowerShell):

```powershell
cd "C:\Users\Biswajit.Ghosh2\OneDrive - Shell\Shell\4. GitHub\github_per\personal_development\password_generator_web"
python -m http.server 8000
# then open http://localhost:8000
```

## Docker (recommended for hosting)

This folder includes a minimal `Dockerfile` that copies the static files into an `nginx:alpine` image. There's also a `docker-compose.yml` that builds the image and exposes port `8080` on the host.

Build the image and run with Docker directly:

```powershell
cd "C:\...\password_generator_web"
docker build -t password-generator:latest .
docker run -d --name password_generator -p 8080:80 password-generator:latest
# open http://localhost:8080
```

Or use Docker Compose (recommended):

```powershell
cd "C:\...\password_generator_web"
docker compose up --build -d
# open http://localhost:8080
```

To stop and remove the containers:

```powershell
docker compose down
```

### Dev mode (live edits)

If you want to iterate quickly without rebuilding the image, the compose file includes an optional `volumes` mapping (commented). You can enable it to mount the local directory into the container. This lets you edit `index.html`/`script.js` and refresh the browser to see changes immediately.

## Production notes

- The image is intentionally minimal and uses nginx to serve static content. For production, consider adding a small reverse proxy or TLS termination (e.g., Caddy, Traefik) to manage HTTPS (or run behind a load balancer that provides TLS).
- If you want to publish the site to the public internet, ensure you secure the hosting environment (firewall, TLS), and consider using a static site host (GitHub Pages, Netlify) for simplicity.

## Troubleshooting

- If port `8080` is in use, update `docker-compose.yml` or `docker run` port mapping.
- If clipboard copy doesn't work in some browsers when opened as a `file://` URL, use the HTTP server or Docker approach described above.

## License & copyright
© 2025 Biswajit Ghosh
