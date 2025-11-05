# Password Generator (Static Web)

Simple, device-agnostic static password generator UI (HTML/CSS/JS). Open `index.html` in any modern browser or serve it via a local HTTP server to enable full browser features (clipboard, fetch, service workers).

## What is included

- `index.html` — main UI
- `styles.css` — styling and centered layout
- `script.js` — generation logic and clipboard helper
- `script.js` — generation logic and clipboard helper

## Quick local usage (no Docker)

Open `index.html` directly in a browser (works offline). For better browser features (clipboard, Service Worker, etc.) serve via a local HTTP server.

Using Python (PowerShell):

```powershell
cd "C:\Users\Biswajit.Ghosh2\OneDrive - Shell\Shell\4. GitHub\github_per\personal_development\password_generator_web"
python -m http.server 8000
# then open http://localhost:8000
```

## Quick local usage

Open `index.html` directly in a browser (works offline). For best compatibility with features like the clipboard API and fetch requests, serve the folder over HTTP. A simple way to do this is with Python's built-in HTTP server.

Using Python (macOS / Linux / zsh):

```bash
cd "2. App Development/b. password_generator_web"
python3 -m http.server 8000
# then open http://localhost:8000
```

If you prefer, use any static file server or host the files on a static host (GitHub Pages, Netlify, Vercel, etc.).

## Production notes

- If you publish the site to the public internet, ensure TLS is configured (HTTPS) and the hosting environment is secured.
- For a simple public deployment prefer a static site host (GitHub Pages, Netlify, Vercel) or serve behind a reverse proxy that handles TLS.

## Troubleshooting

- If fetch requests or clipboard APIs appear restricted when opening `index.html` via `file://`, serve the folder over HTTP (see Quick local usage).
- If a port is in use, pick a different port when running the local server (for example `python3 -m http.server 9000`).

## License & copyright

© 2025 Biswajit Ghosh
