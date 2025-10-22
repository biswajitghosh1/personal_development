# Minimal M-Lab ndt7 Speed Test (Static Frontend)

This is a minimal static frontend that:
- discovers the nearest M‑Lab ndt7 server (using public nameserver endpoints),
- displays server location information,
- attempts to use the official M‑Lab ndt7 client loaded from a CDN (unpkg) to run a full speed test (download/upload/ping/jitter),
- falls back to a lightweight ping/jitter measurement using image loads when the full test cannot run.

Files
- `index.html` — main page (references the ndt7 client via unpkg CDN).
- `static/styles.css` — minimal responsive styling.
- `static/app.js` — discovery, UI logic, fallback ping/jitter, ndt7 invocation attempts.

How to run locally
1. Serve the directory with a static HTTP server (Python is the easiest):

```bash
# from the repository root (where index.html is located)
python3 -m http.server 8000
```

2. Open your browser to:
```
http://localhost:8000/
```

Notes, limitations and troubleshooting
- The page references the ndt7 client from `https://unpkg.com/@m-lab/ndt7@latest/dist/ndt7.js`. If you want a specific version, change the `@latest` in `index.html` (example: `@0.8.0`) and I can adapt the JS to target that version's API if needed.
- The M-Lab nameserver endpoints used for discovery are tried in sequence:
  - `https://mlab-ns.appspot.com/ndt?format=json`
  - `https://mlab-ns.appspot.com/ndt/v1?format=json`
  - `https://mlab-ns.measurementlab.net/ndt?format=json`
  - `https://mlab-ns.measurementlab.net/ndt/v1?format=json`
  If discovery fails, you can provide an explicit server URL (not implemented in the UI yet) or I can add an input to allow manual server tuning.
- Full download/upload speeds require:
  - the ndt7 client to be loaded successfully, and
  - the selected M-Lab server to support the required transports (WebTransport, WebSocket) and CORS for the browser to run the tests.
- The fallback "ping/jitter" uses image loads to measure RTT (works around CORS but is not a replacement for a real ndt7 measurement).
- If you want automatic nearest-server selection + reliable full tests across all browsers, it's common to add a tiny backend proxy or to pin a specific ndt7 client version and adapt the frontend to its API. I can add that next.

Next steps I can take (pick any):
- Pin a specific ndt7 client version and adapt the invocation to that library's API so full tests run from the page.
- Add a manual server URL input for testing specific M-Lab endpoints.
- Add a small Node/Python backend that proxies ndt7 discovery and harvests cross-origin-friendly information (improves reliability).
- Implement a pure-JS measurement fallback for download/upload (less accurate than ndt7, but possible).

If you'd like, I can:
- commit these files to the repo for you (I don't currently have editing tools enabled — if you want me to create files directly, enable file editing), or
- modify the code to target a specific ndt7 client version once you tell me which version to target.

Enjoy — tell me which next step you want (pin client version / add server input / add backend proxy / commit files).// filepath: README.md
# Minimal M-Lab ndt7 Speed Test (Static Frontend)

This is a minimal static frontend that:
- discovers the nearest M‑Lab ndt7 server (using public nameserver endpoints),
- displays server location information,
- attempts to use the official M‑Lab ndt7 client loaded from a CDN (unpkg) to run a full speed test (download/upload/ping/jitter),
- falls back to a lightweight ping/jitter measurement using image loads when the full test cannot run.

Files
- `index.html` — main page (references the ndt7 client via unpkg CDN).
- `static/styles.css` — minimal responsive styling.
- `static/app.js` — discovery, UI logic, fallback ping/jitter, ndt7 invocation attempts.

How to run locally
1. Serve the directory with a static HTTP server (Python is the easiest):

```bash
# from the repository root (where index.html is located)
python3 -m http.server 8000
```

2. Open your browser to:
```
http://localhost:8000/
```

Notes, limitations and troubleshooting
- The page references the ndt7 client from `https://unpkg.com/@m-lab/ndt7@latest/dist/ndt7.js`. If you want a specific version, change the `@latest` in `index.html` (example: `@0.8.0`) and I can adapt the JS to target that version's API if needed.
- The M-Lab nameserver endpoints used for discovery are tried in sequence:
  - `https://mlab-ns.appspot.com/ndt?format=json`
  - `https://mlab-ns.appspot.com/ndt/v1?format=json`
  - `https://mlab-ns.measurementlab.net/ndt?format=json`
  - `https://mlab-ns.measurementlab.net/ndt/v1?format=json`
  If discovery fails, you can provide an explicit server URL (not implemented in the UI yet) or I can add an input to allow manual server tuning.
- Full download/upload speeds require:
  - the ndt7 client to be loaded successfully, and
  - the selected M-Lab server to support the required transports (WebTransport, WebSocket) and CORS for the browser to run the tests.
- The fallback "ping/jitter" uses image loads to measure RTT (works around CORS but is not a replacement for a real ndt7 measurement).
- If you want automatic nearest-server selection + reliable full tests across all browsers, it's common to add a tiny backend proxy or to pin a specific ndt7 client version and adapt the frontend to its API. I can add that next.

Next steps I can take (pick any):
- Pin a specific ndt7 client version and adapt the invocation to that library's API so full tests run from the page.
- Add a manual server URL input for testing specific M-Lab endpoints.
- Add a small Node/Python backend that proxies ndt7 discovery and harvests cross-origin-friendly information (improves reliability).
- Implement a pure-JS measurement fallback for download/upload (less accurate than ndt7, but possible).

If you'd like, I can:
- commit these files to the repo for you (I don't currently have editing tools enabled — if you want me to create files directly, enable file editing), or
- modify the code to target a specific ndt7 client version once you tell me which version to target.

Enjoy — tell me which next step you want (pin client version / add server input / add backend proxy / commit files).