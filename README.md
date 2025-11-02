
# personal_development

A compact collection of small, personal projects and experiments (Python, Node, static web). Each top-level folder is a self-contained mini-project — check the folder for project-specific instructions, dependencies, and run steps.

Highlights

- `password_vault/` — Flask demo web app
- `rss_reader_app/` — Python RSS reader example
- `wordlist_generator/` — utility for generating wordlists
- `WIP/` — work-in-progress prototypes

Quick start (common patterns)

- Open repository in VS Code:

```sh
code .
```

- Typical Python workflow (from a project folder):

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

- Docker (if `docker-compose.yml` or `Dockerfile` exist):

```sh
docker compose up --build
```

Example: run `password_vault` locally

```sh
cd password_vault
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Notes

- Keep secrets out of git. Use environment variables or a `.env` file added to `.gitignore`.
- See each project folder for exact configuration, ports, and environment variables.

Contributing

- Fork or branch, make small focused commits, and open a PR with verification steps.

License

Check for a `LICENSE` file in each folder. If none exists, assume the code is personal and contact the owner for reuse.

Last updated: 2025-11-02



License
