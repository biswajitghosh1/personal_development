#!/usr/bin/env bash
# One-shot generator for the Daily Journal app (Flask + SQLite + auth + DOCX export)
# Writes files to: development/Personal_Development/python/daily_journal_app
# Usage:
#   chmod +x create_daily_journal_app.sh
#   ./create_daily_journal_app.sh         # create, install, init DB and start server
#   ./create_daily_journal_app.sh --no-start  # create, install, init DB but don't start server
set -euo pipefail

ROOT_DIR="$(pwd)"
TARGET="development/Personal_Development/python/daily_journal_app"
NO_START=0

for arg in "$@"; do
  case "$arg" in
    --no-start) NO_START=1 ;;
    -h|--help)
      cat <<'USAGE'
Usage: create_daily_journal_app.sh [--no-start]

Creates the Daily Journal app under:
  development/Personal_Development/python/daily_journal_app

Environment:
  DJ_ADMIN_USER  - optional admin username (default: admin)
  DJ_ADMIN_PASS  - optional admin password (default: admin)
  DJ_SECRET      - optional Flask SECRET_KEY (default: dev-secret)

Options:
  --no-start     - create files, venv, install deps, init DB, but do NOT start the Flask server.
USAGE
      exit 0
      ;;
    *)
      ;;
  esac
done

echo "Creating app at: $TARGET"
mkdir -p "$TARGET"
mkdir -p "$TARGET/scripts"
mkdir -p "$TARGET/templates"
mkdir -p "$TARGET/static"
mkdir -p "$TARGET/instance"

# requirements
cat > "$TARGET/requirements.txt" <<'PYREQ'
Flask>=2.0
Flask-SQLAlchemy>=3.0
python-dateutil>=2.8
Flask-Login>=0.6
python-docx>=0.8.11
pytest>=7.0
PYREQ

# run.sh
cat > "$TARGET/run.sh" <<'RUNSH'
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required. Please install Python 3: https://www.python.org/downloads/"
  exit 1
fi

if [ ! -d "venv" ]; then
  python3 -m venv venv
fi
# shellcheck source=/dev/null
. venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt

# initialize db (creates admin user if DJ_ADMIN_USER & DJ_ADMIN_PASS set)
if [ ! -f "instance/journal.db" ]; then
  python -m scripts.init_db
fi

export FLASK_APP=app.py
export FLASK_ENV=development
echo "Starting Flask dev server at http://127.0.0.1:5000"
flask run --port 5000
RUNSH
chmod +x "$TARGET/run.sh"

# scripts/init_db.py
cat > "$TARGET/scripts/init_db.py" <<'INITPY'
#!/usr/bin/env python3
"""
Initialize the SQLite DB and create an admin user if not present.
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from app import create_app
from models import db, User
from werkzeug.security import generate_password_hash

app = create_app()
with app.app_context():
    os.makedirs(app.instance_path, exist_ok=True)
    db.create_all()
    username = os.environ.get("DJ_ADMIN_USER", "admin")
    password = os.environ.get("DJ_ADMIN_PASS", "admin")
    existing = User.query.filter_by(username=username).first()
    if not existing:
        u = User(username=username, password_hash=generate_password_hash(password))
        db.session.add(u)
        db.session.commit()
        print(f"Created admin user: {username} (change password immediately)")
    else:
        print(f"Admin user {username} already exists.")
    print("Initialized database at", os.path.join(app.instance_path, "journal.db"))
INITPY
chmod +x "$TARGET/scripts/init_db.py"

# models.py
cat > "$TARGET/models.py" <<'MODELS'
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash

db = SQLAlchemy()

class Entry(db.Model):
    __tablename__ = "entries"
    id = db.Column(db.Integer, primary_key=True)
    entry_date = db.Column(db.Date, nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    important = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "entry_date": self.entry_date.isoformat(),
            "title": self.title,
            "content": self.content,
            "important": bool(self.important),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
MODELS

# app.py
cat > "$TARGET/app.py" <<'APY'
from flask import (Flask, render_template, request, redirect, url_for,
                   flash, jsonify, Response, send_file)
from datetime import date
from dateutil.parser import parse as parse_date
from io import BytesIO, StringIO
import csv, re, os
from collections import Counter
from models import db, Entry, User
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash
from docx import Document
from docx.shared import RGBColor

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True, template_folder="templates", static_folder="static")
    app.config.from_mapping(
        SECRET_KEY=os.environ.get("DJ_SECRET", "dev-secret"),
        SQLALCHEMY_DATABASE_URI=f"sqlite:///{os.path.join(app.instance_path, 'journal.db')}",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )
    if test_config:
        app.config.update(test_config)
    try:
        os.makedirs(app.instance_path, exist_ok=True)
    except OSError:
        pass

    db.init_app(app)

    login_manager = LoginManager()
    login_manager.login_view = "login"
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    @app.context_processor
    def inject_now():
        from datetime import datetime
        return {"now": datetime.utcnow}

    @app.route("/")
    def index():
        q_date = request.args.get("date")
        if q_date:
            try:
                dt = parse_date(q_date).date()
            except Exception:
                flash("Invalid date format", "error")
                return redirect(url_for("index"))
            entries = Entry.query.filter_by(entry_date=dt).order_by(Entry.entry_date.desc(), Entry.created_at.desc()).all()
        else:
            entries = Entry.query.order_by(Entry.entry_date.desc(), Entry.created_at.desc()).limit(200).all()
        return render_template("index.html", entries=entries)

    @app.route("/login", methods=["GET","POST"])
    def login():
        if request.method == "POST":
            username = request.form.get("username","").strip()
            password = request.form.get("password","").strip()
            user = User.query.filter_by(username=username).first()
            if user and user.check_password(password):
                login_user(user)
                flash("Logged in", "success")
                return redirect(url_for("index"))
            flash("Invalid username or password", "error")
            return redirect(url_for("login"))
        return render_template("login.html")

    @app.route("/logout")
    @login_required
    def logout():
        logout_user()
        flash("Logged out", "success")
        return redirect(url_for("index"))

    @app.route("/add", methods=["GET","POST"])
    @login_required
    def add_entry():
        if request.method == "POST":
            entry_date = request.form.get("entry_date")
            title = request.form.get("title","").strip()
            content = request.form.get("content","").strip()
            important = bool(request.form.get("important"))
            if not entry_date or not title or not content:
                flash("Date, title and content are required", "error")
                return redirect(url_for("add_entry"))
            try:
                dt = parse_date(entry_date).date()
            except Exception:
                flash("Invalid date", "error")
                return redirect(url_for("add_entry"))
            e = Entry(entry_date=dt, title=title, content=content, important=important)
            db.session.add(e)
            db.session.commit()
            flash("Entry added", "success")
            return redirect(url_for("index"))
        default_date = date.today().isoformat()
        return render_template("add_edit.html", entry=None, default_date=default_date)

    @app.route("/edit/<int:entry_id>", methods=["GET","POST"])
    @login_required
    def edit_entry(entry_id):
        e = Entry.query.get_or_404(entry_id)
        if request.method == "POST":
            entry_date = request.form.get("entry_date")
            title = request.form.get("title","").strip()
            content = request.form.get("content","").strip()
            important = bool(request.form.get("important"))
            if not entry_date or not title or not content:
                flash("Date, title and content are required", "error")
                return redirect(url_for("edit_entry", entry_id=entry_id))
            try:
                dt = parse_date(entry_date).date()
            except Exception:
                flash("Invalid date", "error")
                return redirect(url_for("edit_entry", entry_id=entry_id))
            e.entry_date = dt
            e.title = title
            e.content = content
            e.important = important
            db.session.commit()
            flash("Entry updated", "success")
            return redirect(url_for("index"))
        return render_template("add_edit.html", entry=e, default_date=e.entry_date.isoformat())

    @app.route("/delete/<int:entry_id>", methods=["POST"])
    @login_required
    def delete_entry(entry_id):
        e = Entry.query.get_or_404(entry_id)
        db.session.delete(e)
        db.session.commit()
        flash("Entry deleted", "success")
        return redirect(url_for("index"))

    def basic_summary_for_entries(entries):
        total_entries = len(entries)
        total_words = 0
        counter = Counter()
        word_re = re.compile(r"\b[a-zA-Z']+\b")
        stopwords = {
            "the","and","a","to","of","in","is","it","for","on","that","with","as","this","are","was","but","be","or","by","an","from"
        }
        for e in entries:
            words = word_re.findall(e.title.lower() + " " + e.content.lower())
            filtered = [w for w in words if w not in stopwords and len(w) > 1]
            total_words += len(filtered)
            counter.update(filtered)
        top = counter.most_common(10)
        return {
            "total_entries": total_entries,
            "total_words": total_words,
            "average_words_per_entry": total_words / total_entries if total_entries else 0,
            "top_words": top,
        }

    @app.route("/summary/<int:year>/<int:month>", methods=["GET"])
    def monthly_summary(year, month):
        start = date(year, month, 1)
        if month == 12:
            end = date(year + 1, 1, 1)
        else:
            end = date(year, month + 1, 1)
        entries = Entry.query.filter(Entry.entry_date >= start, Entry.entry_date < end).order_by(Entry.entry_date.asc()).all()
        summary = basic_summary_for_entries(entries)
        return render_template("summary.html", year=year, month=month, entries=entries, summary=summary)

    @app.route("/export", methods=["GET"])
    @login_required
    def export():
        fmt = request.args.get("format", "csv").lower()
        start = request.args.get("start")
        end = request.args.get("end")
        try:
            s = parse_date(start).date() if start else None
            e = parse_date(end).date() if end else None
        except Exception:
            return "Invalid date", 400

        q = Entry.query
        if s:
            q = q.filter(Entry.entry_date >= s)
        if e:
            q = q.filter(Entry.entry_date <= e)
        results = q.order_by(Entry.entry_date.asc()).all()

        if fmt == "json":
            return jsonify([r.to_dict() for r in results])

        if fmt == "docx":
            doc = Document()
            doc.add_heading('Journal Export', level=1)
            doc.add_paragraph(f"Range: {start or 'start'} — {end or 'end'}")
            for r in results:
                p = doc.add_paragraph()
                run_text = f"{r.entry_date.isoformat()} — {r.title}"
                if r.important:
                    run_text = "[IMPORTANT] " + run_text
                run = p.add_run(run_text)
                run.bold = True
                if r.important:
                    run.font.color.rgb = RGBColor(0x99, 0x00, 0x00)
                doc.add_paragraph(r.content)
                doc.add_paragraph("")
            bio = BytesIO()
            doc.save(bio)
            bio.seek(0)
            return send_file(
                bio,
                as_attachment=True,
                download_name=f"journal_{start or 'all'}_{end or 'all'}.docx",
                mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )

        # CSV fallback
        si = StringIO()
        cw = csv.writer(si)
        cw.writerow(["id","entry_date","title","important","content","created_at","updated_at"])
        for r in results:
            cw.writerow([r.id, r.entry_date.isoformat(), r.title, r.important, r.content, r.created_at.isoformat() if r.created_at else "", r.updated_at.isoformat() if r.updated_at else ""])
        output = si.getvalue()
        return Response(
            output,
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment; filename=entries_{start or 'all'}_{end or 'all'}.csv"}
        )

    @app.route("/api/entries", methods=["GET"])
    @login_required
    def api_entries():
        start = request.args.get("start")
        end = request.args.get("end")
        limit = int(request.args.get("limit", "100"))
        offset = int(request.args.get("offset", "0"))
        try:
            s = parse_date(start).date() if start else None
            e = parse_date(end).date() if end else None
        except Exception:
            return jsonify({"error":"invalid date"}), 400
        q = Entry.query
        if s:
            q = q.filter(Entry.entry_date >= s)
        if e:
            q = q.filter(Entry.entry_date <= e)
        items = q.order_by(Entry.entry_date.asc()).limit(limit).offset(offset).all()
        return jsonify([i.to_dict() for i in items])

    return app

if __name__ == "__main__":
    application = create_app()
    application.run(debug=True)
APY

# templates/layout.html
cat > "$TARGET/templates/layout.html" <<'LAY'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Daily Journal</title>
  <link rel="stylesheet" href="{{ url_for('static', filename='styles.css') }}">
</head>
<body>
  <header class="site-header">
    <div class="inner">
      <h1><a href="{{ url_for('index') }}">Daily Journal</a></h1>
      <nav>
        {% if current_user.is_authenticated %}
          <a href="{{ url_for('add_entry') }}">Add Entry</a> |
          <a href="{{ url_for('index') }}">Entries</a> |
          <a href="{{ url_for('logout') }}">Logout</a>
        {% else %}
          <a href="{{ url_for('login') }}">Login</a>
        {% endif %}
      </nav>
    </div>
  </header>
  <main class="container">
    {% with messages = get_flashed_messages(with_categories=true) %}
      {% if messages %}
        <div class="messages">
          {% for cat, msg in messages %}
            <div class="flash {{ cat }}">{{ msg }}</div>
          {% endfor %}
        </div>
      {% endif %}
    {% endwith %}
    {% block content %}{% endblock %}
  </main>
  <footer class="site-footer">
    <div class="inner">© {{ now().year if now is defined else "2025" }}</div>
  </footer>
</body>
</html>
LAY

# templates/index.html
cat > "$TARGET/templates/index.html" <<'IDX'
{% extends "layout.html" %}
{% block content %}
  <h2>Recent Entries</h2>
  <form method="get" class="inline-filter">
    <label for="date">Filter by date</label>
    <input type="date" id="date" name="date" value="{{ request.args.get('date','') }}">
    <button type="submit">Filter</button>
    <a href="{{ url_for('index') }}">Clear</a>
  </form>

  {% if entries %}
    <ul class="entries">
      {% for e in entries %}
        <li class="entry-item {% if e.important %}important{% endif %}">
          <div class="meta">{{ e.entry_date }} — <strong>{{ e.title }}</strong>{% if e.important %} <span class="imp-badge">IMPORTANT</span>{% endif %}</div>
          <div class="content-preview">{{ e.content[:300]|safe }}{% if e.content|length > 300 %}…{% endif %}</div>
          <div class="entry-actions">
            {% if current_user.is_authenticated %}
              <a href="{{ url_for('edit_entry', entry_id=e.id) }}">Edit</a>
              <form method="post" action="{{ url_for('delete_entry', entry_id=e.id) }}" style="display:inline" onsubmit="return confirm('Delete this entry?');">
                <button type="submit">Delete</button>
              </form>
            {% endif %}
          </div>
        </li>
      {% endfor %}
    </ul>
  {% else %}
    <p>No entries yet. {% if current_user.is_authenticated %}<a href="{{ url_for('add_entry') }}">Add one</a>.{% else %}<a href="{{ url_for('login') }}">Login</a> to add entries.{% endif %}</p>
  {% endif %}
{% endblock %}
IDX

# templates/add_edit.html
cat > "$TARGET/templates/add_edit.html" <<'AE'
{% extends "layout.html" %}
{% block content %}
  <h2>{{ 'Edit' if entry else 'Add' }} Entry</h2>
  <form method="post" class="entry-form">
    <label for="entry_date">Date</label>
    <input id="entry_date" name="entry_date" type="date" value="{{ default_date }}">
    <label for="title">Title</label>
    <input id="title" name="title" type="text" value="{{ entry.title if entry else '' }}" required>
    <label for="content">Content</label>
    <textarea id="content" name="content" rows="8" required>{{ entry.content if entry else '' }}</textarea>
    <label>
      <input type="checkbox" name="important" value="1" {% if entry and entry.important %}checked{% endif %}>
      Mark as important
    </label>
    <div class="form-actions">
      <button type="submit">{{ 'Save' if entry else 'Add' }}</button>
      <a href="{{ url_for('index') }}">Cancel</a>
    </div>
  </form>
{% endblock %}
AE

# templates/login.html
cat > "$TARGET/templates/login.html" <<'LOGIN'
{% extends "layout.html" %}
{% block content %}
  <h2>Login</h2>
  <form method="post" class="login-form">
    <label for="username">Username</label>
    <input id="username" name="username" type="text" required>
    <label for="password">Password</label>
    <input id="password" name="password" type="password" required>
    <div class="form-actions">
      <button type="submit">Login</button>
    </div>
  </form>
{% endblock %}
LOGIN

# templates/summary.html
cat > "$TARGET/templates/summary.html" <<'SUM'
{% extends "layout.html" %}
{% block content %}
  <h2>Summary for {{ month }}/{{ year }}</h2>

  <p>Total entries: {{ summary.total_entries }}</p>
  <p>Total words (approx): {{ summary.total_words }}</p>
  <p>Average words per entry: {{ summary.average_words_per_entry|round(1) }}</p>

  <h3>Top words</h3>
  {% if summary.top_words %}
    <ol>
      {% for word, count in summary.top_words %}
        <li>{{ word }} — {{ count }}</li>
      {% endfor %}
    </ol>
  {% else %}
    <p>No top words (no entries).</p>
  {% endif %}

  <h3>Entries</h3>
  {% if entries %}
    <ul>
      {% for e in entries %}
        <li>
          <strong>{{ e.entry_date }} - {{ e.title }}{% if e.important %} <span class="imp-badge">IMPORTANT</span>{% endif %}</strong>
          <div class="content-preview">{{ e.content[:400]|safe }}{% if e.content|length > 400 %}…{% endif %}</div>
          <div>
            {% if current_user.is_authenticated %}
              <a href="{{ url_for('edit_entry', entry_id=e.id) }}">Edit</a>
            {% endif %}
          </div>
        </li>
      {% endfor %}
    </ul>
  {% else %}
    <p>No entries for this month.</p>
  {% endif %}

  <hr>
  <p>
    <a href="{{ url_for('export') }}?start={{ year }}-{{ "%02d"|format(month) }}-01&end={{ year }}-{{ "%02d"|format(month) }}-31&format=docx">Export DOCX</a> |
    <a href="{{ url_for('export') }}?start={{ year }}-{{ "%02d"|format(month) }}-01&end={{ year }}-{{ "%02d"|format(month) }}-31&format=csv">Export CSV</a> |
    <a href="{{ url_for('export') }}?start={{ year }}-{{ "%02d"|format(month) }}-01&end={{ year }}-{{ "%02d"|format(month) }}-31&format=json">Export JSON</a>
  </p>
{% endblock %}
SUM

# static/styles.css
cat > "$TARGET/static/styles.css" <<'CSS'
:root {
  --bg: #fafafa;
  --accent: #1167b1;
  --muted: #666;
}
body {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  margin: 0;
  background: var(--bg);
  color: #111;
}
.site-header { background: var(--accent); color: white; padding: 12px 0; }
.site-header .inner { max-width: 900px; margin: 0 auto; padding: 0 12px; display:flex; align-items:center; justify-content:space-between; }
.site-header h1 { margin: 0; font-size: 1.25rem; }
.container { max-width: 900px; margin: 22px auto; padding: 0 12px; }
.entry-form input[type="text"], .entry-form textarea, .entry-form input[type="date"], .login-form input[type="text"], .login-form input[type="password"] { width: 100%; padding:8px; margin-bottom:10px; border:1px solid #ddd; border-radius:4px; }
.form-actions { display:flex; gap:8px; align-items:center; }
.entries { list-style:none; padding:0; margin:0; }
.entry-item { padding:10px; background:white; border:1px solid #eee; margin-bottom:10px; border-radius:6px; }
.entry-item.important { border-left: 6px solid #d9534f; background:#fff6f6; }
.imp-badge { background:#d9534f; color:white; padding:2px 6px; border-radius:4px; font-size:0.8rem; margin-left:6px; }
.meta { color:var(--muted); font-size:0.95rem; margin-bottom:6px; }
.content-preview { margin:6px 0; color:#222; }
.flash { padding:8px; border-radius:4px; margin-bottom:12px; }
.flash.success { background:#e6ffed; color:#064e27; border:1px solid #b8f1d0; }
.flash.error { background:#ffe6e6; color:#6a0808; border:1px solid #ffbdbd; }
.site-footer { text-align:center; padding:16px 0; color:#666; margin-top:30px; }
.inline-filter { margin-bottom:12px; display:flex; gap:8px; align-items:center; }
CSS

# README.md
cat > "$TARGET/README.md" <<'RMD'
# Daily Journal App (with Basic Auth + DOCX export)

Features
- Create dated entries, mark entries as "important"
- Basic user authentication (Flask-Login)
- Month summary and top words
- Export to DOCX (Word) with important entries highlighted, CSV, or JSON
- Simple API endpoint (`/api/entries`) protected by login

Quick start
1. From workspace root:
   bash create_daily_journal_app.sh
2. Default admin user: DJ_ADMIN_USER (env) or 'admin' / DJ_ADMIN_PASS (env) or 'admin' if not set.
   Example to set at runtime:
   export DJ_ADMIN_USER=alice
   export DJ_ADMIN_PASS='MyStrongPass123'
   python -m scripts.init_db

Run manually:
```bash
cd development/Personal_Development/python/daily_journal_app
./run.sh
```

DOCX export
- Use `/export?format=docx&start=YYYY-MM-DD&end=YYYY-MM-DD` (login required).
- Important entries are prefixed with [IMPORTANT] and title colored on the document.

Security note
- Change the default admin password immediately.
- For production use, set a strong `DJ_SECRET` env var and deploy behind a WSGI server (Gunicorn/uWSGI).
RMD

# Done
echo "All files written to $TARGET"
echo "Next steps:"
echo "  cd $TARGET"
echo "  # optionally set admin credentials before DB init:"
echo "  # export DJ_ADMIN_USER=alice"
echo "  # export DJ_ADMIN_PASS='S3curePass'"
echo "  ./run.sh   # starts the dev server"
if [ "$NO_START" -eq 1 ]; then
  echo "Created files and venv; server start suppressed by --no-start."
else
  echo "If you passed --no-start, run ./run.sh manually to start the server."
fi

exit 0