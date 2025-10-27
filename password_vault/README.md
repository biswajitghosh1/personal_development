Password Vault (WIP)

This is a minimal local-only demo of a password vault web UI. It's intentionally simple and NOT secure for production use. Use only for local testing or prototyping.

Features
- Static login (default admin/password)
- Add, list, delete entries stored in-memory for the current process

Run locally

1. Create and activate a venv (macOS / zsh):

   python3 -m venv .venv
   source .venv/bin/activate

2. Install dependencies:

   pip install -r requirements.txt

3. Run:

   python app.py

The app listens on http://127.0.0.1:5002 by default.

Persistence
-----------

Entries are stored in a local SQLite database file named `vault.db` next to `app.py`. This means items persist across restarts and logoffs for the same filesystem location.

Environment variables
---------------------

- `VAULT_SECRET` — optional Flask secret key override (recommended to set for any sharing)
- `VAULT_USER` — override the demo username (default: `admin`)
- `VAULT_PASS` — override the demo password (default: `password`)

Security notes
- This stores credentials in-memory and shows them in cleartext. Do not use for real secrets.
- Replace the static login and in-memory store with a proper encrypted storage (SQLite + encryption) and secure authentication for any real usage.

Docker / Docker Compose
-----------------------

A Dockerfile and `docker-compose.yml` are provided to run the app in a container.

Build the image locally (from the app folder):

```bash
cd development/Operations/password_vault
docker build -t password-vault:latest .
```

Run with Docker (mount a host file to persist the SQLite DB):

```bash
mkdir -p data
# create an empty DB file (optional) so permissions are correct
touch data/vault.db
docker run -d \
   --name password-vault \
   -p 5002:5002 \
   -v "$PWD/data/vault.db":/app/vault.db \
   -e VAULT_USER=admin \
   -e VAULT_PASS='password' \
   -e VAULT_SECRET='change-me' \
   password-vault:latest
```

Run with Docker Compose (recommended for local dev):

```bash
cd development/Operations/password_vault
mkdir -p data
docker compose up --build -d
```

Then open http://127.0.0.1:5002. The compose file mounts `./data/vault.db` into the container so entries persist across restarts.

Notes
- If `data/vault.db` does not exist the container will create it and the app will initialize the schema.
- For production use you should:
   - Use a named Docker volume or managed storage instead of a host file mount.
   - Add encryption for stored secrets and a secure authentication flow.
   - Run the service behind a reverse proxy (nginx/Traefik) with TLS.

Hosting on Docker (production)
--------------------------------

This section gives a concise path to run the app in a production-like Docker environment. It assumes you are comfortable running containers on a server and have a domain and TLS solution (Let's Encrypt, e.g. via Traefik or nginx + certbot).

1) Use a named Docker volume for persistent data (recommended):

```bash
cd development/Operations/password_vault
docker volume create password_vault_data
docker compose up -d --build
```

Update `docker-compose.yml` to mount the volume instead of a host file if you prefer:

```yaml
services:
   password-vault:
      volumes:
         - password_vault_data:/app/vault.db

volumes:
   password_vault_data:
```

2) Run behind a reverse proxy and enable TLS

- Option A — Traefik (recommended for automated Let's Encrypt):
   - Add Traefik to your compose stack or run it separately and add labels to the service. Traefik will automatically obtain and renew certificates.

- Option B — nginx + certbot:
   - Configure nginx to proxy_pass to the container (127.0.0.1:5002) and obtain TLS certs via certbot. Example proxy snippet:

```nginx
server {
      listen 443 ssl;
      server_name vault.example.com;

      ssl_certificate /etc/letsencrypt/live/vault.example.com/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/vault.example.com/privkey.pem;

      location / {
            proxy_pass http://127.0.0.1:5002;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
      }
}
```

3) Secrets and environment

- Do NOT store production secrets in plaintext in `docker-compose.yml`. Use one of:
   - Docker secrets (swarm mode) or an external secrets manager (Vault, AWS Secrets Manager, Azure Key Vault).
   - An `.env` file with restrictive file permissions and load it via `env_file:` in compose (still less secure than a secrets manager).

4) Hardening and monitoring

- Run the service as a non-root user in the container (the provided Dockerfile already does this).
- Add a healthcheck (compose includes a basic one) and use `restart: unless-stopped`.
- Monitor logs and resource usage (docker logs, docker stats, or host monitoring tools).

5) Backup and migration

- Before changing the DB schema in production, create a backup of the SQLite file and test migrations on a copy.
- For high-availability or multi-node setups consider moving to a server-based DB (Postgres) with encryption at rest and in transit.

Quick commands recap

```bash
# Build & run (compose)
docker compose up --build -d

# Tail logs
docker compose logs -f

# Stop
docker compose down
```

If you'd like, I can add an example `docker-compose.prod.yml` that uses a named volume and an nginx reverse-proxy service, or scaffold a Traefik labels example. Let me know which you'd prefer.
