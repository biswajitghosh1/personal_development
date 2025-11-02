# personal_development

A personal workspace for small projects, experiments, and utilities — mostly hobby projects, prototypes, and notes. The repository contains multiple small apps (Python, Node, static web) and supportive scripts used for personal development and learning.

This README gives a short overview, where to find each project, and quick start instructions for the most relevant subprojects.

## Repository layout

- `password_vault/` — Flask-based password vault web app (app.py, Dockerfile, docker-compose). See the folder README for run instructions.
- `personal_development/` — meta folder for notes and smaller experiments (the current repo root). Contains `generative_AI/` notes and other resources.
- `generative_AI/` — notes and experiments related to generative AI (e.g. `Notes.md`).
- `rss_reader_app/` — small Python RSS reader demo (app.py, requirements.txt).
- `wordlist_generator/` — Python package for generating wordlists (pyproject.toml, tests).
- `WIP/` — assorted work-in-progress projects and front-end prototypes.

Each subfolder is a self-contained mini-project — check the folder for a README, `requirements.txt`, or `package.json` for project-specific instructions.

## Quick start — common tasks

Open the repository in VS Code (recommended):

```sh
code .
```

Search for the subproject you want to run and follow its README. Typical commands by project type:

- Python (virtualenv):

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

- Docker / docker-compose (for services with Dockerfiles):

```sh
docker compose up --build
```




- Node (if a `package.json` exists):

```sh
cd <project-folder>
npm install
npm start
```

## How to run locally (detailed)

This section contains step-by-step instructions for running the most common project types found in this repository on macOS (zsh). Adjust commands for Linux/Windows where appropriate.

General Python projects

1. Create and activate a virtual environment:

```sh
python3 -m venv .venv
source .venv/bin/activate
```

1. Install dependencies and run the app (if a `requirements.txt` exists):

```sh
pip install -r requirements.txt
python app.py
```

Notes:

- If the project uses `flask` and expects the `FLASK_APP` env var, you can run:

  ```sh
  export FLASK_APP=app.py
  export FLASK_ENV=development
  flask run --host=0.0.0.0 --port=5000
  ```

- Some projects may provide an explicit entrypoint (for example `manage.py` or a `run.sh`). Prefer the project README if present.

password_vault (example)

From the repository root:

```sh
cd password_vault
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# if app.py is the entrypoint
python app.py
```

Common gotchas:

- Ensure any required environment variables (database URLs, secret keys) are set. If the project expects a `.env` file, create one and keep it out of git.
- If the app binds to `127.0.0.1` and you want external access, either set the host in the app or run `flask run --host=0.0.0.0`.

rss_reader_app (example)

```sh
cd rss_reader_app
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Using Docker / docker-compose

If a project has a `Dockerfile` and/or `docker-compose.yml`, you can run it with Docker:

```sh
cd <project-folder>
docker compose up --build
```

This will build the image and start any configured services. Use `docker compose down` to stop and remove containers.

Environment variables & secrets

- Never commit secrets to the repository. Use a `.env` file (and add it to `.gitignore`) or export them in your shell before running.
- Example `.env` pattern:

```env
SECRET_KEY=changeme
DATABASE_URL=sqlite:///data.db
```

Troubleshooting

- If you see missing package errors, re-run `pip install -r requirements.txt` inside the activated venv.
- For port conflicts, either change the port or stop the process using the port (`lsof -i :5000`).
- If a project uses a different Python version, use `pyenv` or the system package manager to install the appropriate interpreter.

Adjust ports and environment variables as documented in the individual project folders.

## Development notes

- Keep secrets out of the repository. Use environment variables, `.env` files (gitignored), or a secrets manager.
- Tests, when present, live next to the project (e.g. `wordlist_generator/tests`). Use the project’s test runner (pytest for Python projects).

## Contribution & workflow

This is a personal repo, but if you want to suggest changes:

1. Fork or create a branch.
2. Make small, focused commits with clear messages.
3. Open a PR with a description of the change and any verification steps.

## Useful commands

- Open repository in VS Code: `code .`
- Run a Python app (example): `python app.py`
- Run docker compose: `docker compose up --build`

## License

Most projects in this repository are small personal utilities and experiments. Check each subfolder for a LICENSE file. If none exists, treat them as personal code; contact the owner for reuse permissions.

---

If you want, I can also:

- Add per-project README stubs for missing folders.
- Create a top-level CONTRIBUTING.md with preferred workflow and commit signing notes.

Last updated: 2025-11-02
