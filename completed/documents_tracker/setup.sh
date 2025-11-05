# This is the script which will run the app locally to setup the password vault app.

# Check for python3
if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 was not found on this system."
  echo "Please install Python 3. Opening the download page in your browser..."
  PY_URL="https://www.python.org/downloads/"
  if command -v open >/dev/null 2>&1; then
    open "$PY_URL"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$PY_URL"
  else
    echo "Unable to open a browser automatically. Please visit:"
    echo "  $PY_URL"
  fi
  exit 1
fi

# Show installed python3 version
python3 --version

# Allow specifying virtualenv name via env var, first CLI arg or interactive prompt
VENV_NAME="${VENV_NAME:-}"
if [ -n "$1" ] && [ -z "$VENV_NAME" ]; then
  VENV_NAME="$1"
fi

if [ -z "$VENV_NAME" ]; then
  # Prompt user for a venv name (default: .venv)
  read -p "Enter virtualenv name [default: .venv]: " input_venv
  if [ -n "$input_venv" ]; then
    VENV_NAME="$input_venv"
  else
    VENV_NAME=".venv"
  fi
fi

echo "Using virtualenv: $VENV_NAME"

# Create venv (ignore error if it already exists)
python3 -m venv "$VENV_NAME" || true

# Activate the venv (works for bash/zsh)
if [ -f "$VENV_NAME/bin/activate" ]; then
  # shellcheck disable=SC1090
  source "$VENV_NAME/bin/activate"
else
  echo "ERROR: virtualenv activation script not found at $VENV_NAME/bin/activate"
  exit 1
fi

pip install --upgrade pip
pip install -r requirements.txt

# Start the app (development server)
export FLASK_APP=app.py
echo "Starting Flask development server on http://127.0.0.1:5000"
flask run --port 5000

echo "Setup Complete. Open Browser and go to http://127.0.0.1:5000"