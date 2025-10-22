# RSS Reader

A small Flask-based RSS/Atom reader with a web GUI.

Prerequisites

- Python 3.10+ installed and available as `python3`.

Run locally (recommended)

1. Open a terminal and change into the folder where you have downloaded the REPO:


2. Give Executable permissions to the script

```
chmod +x setup.sh
```
3. Run Setup.sh

```
./setup.sh
```

4. Open the app in your browser:

```
http://127.0.0.1:5000
```

Notes and troubleshooting

- The app attempts a normal, verified HTTPS request first. If the feed server presents a self-signed certificate the app will retry the request with certificate verification disabled; the UI will display a warning when this insecure fallback is used.
- Disabling verification (`verify=False`) is insecure and should only be used for local testing or trusted internal feeds. For production, either obtain a valid certificate or configure the system to trust the feed's CA.
- To change the session secret key, update `app.secret_key` in `app.py` before deployment.
- The server runs on port `5000` by default; change the port when running with `flask run --port <PORT>`.

Saving feeds, pagination, and persistent storage are not implemented yet — these are possible next enhancements.
