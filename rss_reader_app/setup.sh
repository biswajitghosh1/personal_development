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

# Upgrade pip and install requirements
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

# Start the app (development server)
export FLASK_APP=app.py
echo "Starting Flask development server on http://127.0.0.1:5000"
flask run --port 5000

echo "Setup Complete. Open Browser and go to http://127.0.0.1:5000"