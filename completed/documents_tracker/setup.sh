#!/usr/bin/env zsh
# Setup script for documents_tracker
# - Checks for python3 (or python)
# - Lets the user specify a virtualenv name (env var, CLI arg, or interactive prompt)
# - Creates the venv if needed, activates it, and installs requirements from requirements.txt

set -euo pipefail

print_header() {
  echo "========================================"
  echo "  documents_tracker - setup virtualenv"
  echo "========================================"
}

is_sourced() {
  # Returns 0 if the script is being sourced, non-zero otherwise
  # Works for zsh and bash
  (return 0 2>/dev/null) && return 0 || return 1
}

print_header

# Find Python
if command -v python3 >/dev/null 2>&1; then
  PYTHON=python3
elif command -v python >/dev/null 2>&1; then
  PYTHON=python
else
  echo "Error: Python is not installed or not on PATH. Please install Python 3 and try again." >&2
  exit 1
fi

echo "Using Python: $(${PYTHON} --version 2>&1)"

# Determine venv name: precedence VENV_NAME env var > first CLI arg > interactive prompt > default .venv
if [ -n "${VENV_NAME-}" ]; then
  VENV_NAME="$VENV_NAME"
elif [ -n "${1-}" ]; then
  VENV_NAME="$1"
else
  # interactive prompt
  printf "Enter virtualenv name (default .venv): "
  read -r INPUT_VENV
  if [ -n "$INPUT_VENV" ]; then
    VENV_NAME="$INPUT_VENV"
  else
    VENV_NAME=".venv"
  fi
fi

echo "Virtualenv path: $VENV_NAME"

# Create venv if it doesn't exist
if [ ! -d "$VENV_NAME" ]; then
  echo "Creating virtual environment at '$VENV_NAME'..."
  ${PYTHON} -m venv "$VENV_NAME"
  echo "Virtual environment created."
else
  echo "Virtual environment already exists at '$VENV_NAME'."
fi

# Activate the venv in the current shell if the script is sourced
ACTIVATE_SCRIPT="$VENV_NAME/bin/activate"
if [ ! -f "$ACTIVATE_SCRIPT" ]; then
  echo "Warning: activation script not found at '$ACTIVATE_SCRIPT'" >&2
else
  if is_sourced; then
    # shellcheck disable=SC1091
    source "$ACTIVATE_SCRIPT"
    echo "Activated virtualenv in current shell."
  else
    echo "Note: script is not being sourced, so activation would only apply inside this script's process."
    printf "Would you like to open a new shell with the virtualenv activated? [y/N]: "
    read -r OPEN_SHELL
    if [[ "$OPEN_SHELL" =~ ^[Yy]$ ]]; then
      # Start a new interactive shell with the venv activated so user can continue working
      # Use exec to replace current shell with a new one that has the venv active
      echo "Spawning a new shell with virtualenv activated. Use 'exit' to return to your previous shell." 
      exec "$SHELL" -lc "source '$ACTIVATE_SCRIPT' && exec $SHELL"
    else
      echo "Okay — to activate the venv in your current shell, run:"
      echo "  source '$ACTIVATE_SCRIPT'"
    fi
  fi
fi

# If we reached here and the venv is activated inside this process, install requirements
# We try to use pip from the venv if available; otherwise rely on user to activate first
install_requirements() {
  if [ -f requirements.txt ]; then
    echo "Installing Python dependencies from requirements.txt..."
    # Prefer pip from the venv if it exists
    if command -v pip >/dev/null 2>&1 && python -c "import sys,sysconfig; print(sys.prefix)" 2>/dev/null | grep -q "$PWD/$VENV_NAME"; then
      pip install -r requirements.txt
    else
      # Try to call the python inside venv
      if [ -x "$VENV_NAME/bin/python" ]; then
        "$VENV_NAME/bin/python" -m pip install --upgrade pip
        "$VENV_NAME/bin/python" -m pip install -r requirements.txt
      else
        echo "Could not find pip. Activate the venv or install requirements manually: pip install -r requirements.txt" >&2
        return 1
      fi
    fi
    echo "Dependencies installed."
  else
    echo "No requirements.txt found in $(pwd). Skipping dependency installation."
  fi
}

# Only attempt to install if the venv activation is present in this process OR if we can run the venv python directly
if is_sourced || [ -x "$VENV_NAME/bin/python" ]; then
  install_requirements
else
  echo "Note: venv is not activated in this shell. You can activate it with: source '$ACTIVATE_SCRIPT' and then run:"
  echo "  pip install -r requirements.txt"
fi

echo "Setup complete."

if is_sourced; then
  echo "You are in the virtualenv now. Run your development commands as usual (for example: python app.py)."
else
  echo "If you didn't open an activated shell above, activate the venv with: source '$ACTIVATE_SCRIPT'"
fi

exit 0
