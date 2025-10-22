#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# Configurable environment
FLASK_PORT="${FLASK_PORT:-8000}"
DJ_ADMIN_USER="${DJ_ADMIN_USER:-admin}"
DJ_ADMIN_PASS="${DJ_ADMIN_PASS:-admin}"
DJ_SECRET="${DJ_SECRET:-dev-secret}"

# Ensure python3 exists
if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required. Please install Python 3: https://www.python.org/downloads/"
  exit 1
fi

# Create venv if missing or if venv python is broken, recreate it
create_venv() {
  echo "Creating venv..."
  python3 -m venv venv
  # shellcheck source=/dev/null
  . venv/bin/activate
  python3 -m pip install --upgrade pip
}

if [ ! -d "venv" ]; then
  create_venv
else
  # If venv/bin/python is missing or not executable, recreate venv
  if [ ! -x "venv/bin/python" ]; then
    echo "Detected broken venv, recreating..."
    rm -rf venv
    create_venv
  else
    # activate existing venv
    # shellcheck source=/dev/null
    . venv/bin/activate
    python3 -m pip install --upgrade pip
  fi
fi

# Install requirements
if [ -f requirements.txt ]; then
  python3 -m pip install -r requirements.txt
fi

# Allow callers to set admin creds and DJ_SECRET before we init DB
export DJ_ADMIN_USER DJ_ADMIN_PASS DJ_SECRET

# Initialize DB (module form ensures imports work)
# It will create an admin user if not present, reading DJ_ADMIN_USER/DJ_ADMIN_PASS
python3 -m scripts.init_db

# Start Flask dev server (development/debug mode)
export FLASK_APP=app.py
export FLASK_ENV=development
echo "Starting Flask dev server at http://127.0.0.1:${FLASK_PORT}"
flask run --port "${FLASK_PORT}"