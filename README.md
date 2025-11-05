
# Personal Development Projects

A collection of personal projects and experiments spanning web apps, automation tools, and learning resources. Each project is self-contained with its own dependencies and configuration.

## Project Categories

### Production Apps

#### Password Vault (Flask)

Located in [2. App Development/a. password_vault](2.%20App%20Development/a.%20password_vault/)

- Flask-based password manager with encrypted storage
- Features: User authentication, CRUD operations for passwords
- Run locally: `python app.py` (runs on port 5002)
- Docker support with nginx reverse proxy for production
- Environment variables for configuration

#### RSS Reader

Located in [completed/rss_reader_app](completed/rss_reader_app/)

- Flask-based RSS/Atom feed reader with web GUI
- Requires Python 3.10+
- Handles self-signed certificates with security warnings
- Setup: `./setup.sh`
- Runs on port 5000

### Work in Progress (WIP)

#### Internet Speed Test

Located in [WIP/internet_speedtest_WIP](WIP/internet_speedtest_WIP/)

- Static frontend for M-Lab ndt7 speed testing
- Discovers nearest M-Lab server
- Measures download/upload speeds and latency
- Fallback ping/jitter test using image loads

#### Personal Vault

Located in [WIP/personal_vault_WIP](WIP/personal_vault_WIP/)

- Secure information management system
- Sections: Training records, Account details, Asset tracking
- Static HTML/CSS/JS implementation
- Responsive design with red/yellow theme

#### Knowledge Base

Located in [WIP/knowledge_base_WIP](WIP/knowledge_base_WIP/)

- Technical documentation system
- Topics: Assignment groups, Compliance policies, Device scripts
- Code highlighting and navigation
- Mobile-responsive layout

## Quick Start

1. Clone the repository:

```sh
git clone <repository-url>
cd personal_development
```

1. For Python projects:

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

1. For static web projects:

```sh
cd project_folder
python3 -m http.server 8000
# Open http://localhost:8000
```

1. For Docker projects:

```sh
docker compose up --build
```

## Development Guidelines

- Keep secrets out of git - use environment variables or `.env` files
- Each project has its own requirements.txt or package.json
- Frontend dependencies typically loaded from CDNs
- Projects follow standard Python/Node.js conventions

## Security Notes

- Production deployments should use HTTPS/TLS
- Database credentials should be properly secured
- API keys should never be committed to git
- See SECURITY.md for vulnerability reporting

## Contributing

1. Fork the repository
2. Create a focused feature branch
3. Make small, atomic commits
4. Submit a PR with verification steps

## License

This project is licensed under GNU GPL v3 - see [`personal_development/LICENSE`](personal_development/LICENSE) for details.
Individual projects may have their own licensing terms.

Last updated: 2025-11-05 by Biswajit Ghosh
