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
