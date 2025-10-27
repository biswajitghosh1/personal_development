# This is the script which will run the app locally to setup the password vault.


python3 -m venv .venv || true
source .venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt gunicorn
python app.py