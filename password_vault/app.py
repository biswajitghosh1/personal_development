import os
import sqlite3
from flask import Flask, render_template, request, redirect, url_for, session, g
from functools import wraps

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, 'vault.db')

app = Flask(__name__)
# Use environment variable to set secret in real usage
app.secret_key = os.environ.get('VAULT_SECRET', 'change-me')

# Static credentials (for demo only)
USERNAME = os.environ.get('VAULT_USER', 'admin')
PASSWORD = os.environ.get('VAULT_PASS', 'password')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute(
        '''
        CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            site TEXT NOT NULL,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            description TEXT,
            type TEXT DEFAULT 'personal',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        '''
    )
    conn.commit()
    conn.close()

init_db()

# Lightweight migration: ensure 'type' column exists
conn = get_db_connection()
cur = conn.execute("PRAGMA table_info(entries)")
cols = [r['name'] for r in cur.fetchall()]
if 'type' not in cols:
    conn.execute("ALTER TABLE entries ADD COLUMN type TEXT DEFAULT 'personal'")
    conn.commit()
conn.close()

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        u = request.form.get('username')
        p = request.form.get('password')
        if u == USERNAME and p == PASSWORD:
            session['logged_in'] = True
            return redirect(url_for('index'))
        error = 'Invalid credentials'
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/', methods=['GET', 'POST'])
@login_required
def index():
    if request.method == 'POST':
        site = request.form.get('site')
        uname = request.form.get('uname')
        pwd = request.form.get('pwd')
        desc = request.form.get('description')
        if site and uname and pwd:
            etype = request.form.get('type') or 'personal'
            conn = get_db_connection()
            conn.execute(
                'INSERT INTO entries (site, username, password, description, type) VALUES (?, ?, ?, ?, ?)',
                (site, uname, pwd, desc, etype)
            )
            conn.commit()
            conn.close()
        return redirect(url_for('index'))

    conn = get_db_connection()
    rows = conn.execute('SELECT * FROM entries ORDER BY id DESC').fetchall()
    conn.close()
    items = [dict(r) for r in rows]
    return render_template('index.html', items=items)

@app.route('/delete/<int:entry_id>', methods=['POST'])
@login_required
def delete(entry_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM entries WHERE id = ?', (entry_id,))
    conn.commit()
    conn.close()
    return redirect(url_for('index'))


@app.route('/edit/<int:entry_id>', methods=['GET', 'POST'])
@login_required
def edit(entry_id):
    conn = get_db_connection()
    row = conn.execute('SELECT * FROM entries WHERE id = ?', (entry_id,)).fetchone()
    if not row:
        conn.close()
        return redirect(url_for('index'))

    if request.method == 'POST':
        site = request.form.get('site')
        uname = request.form.get('uname')
        pwd = request.form.get('pwd')
        desc = request.form.get('description')
        etype = request.form.get('type') or 'personal'
        conn.execute(
            'UPDATE entries SET site = ?, username = ?, password = ?, description = ?, type = ? WHERE id = ?',
            (site, uname, pwd, desc, etype, entry_id)
        )
        conn.commit()
        conn.close()
        return redirect(url_for('index'))

    item = dict(row)
    conn.close()
    return render_template('edit.html', item=item)

if __name__ == '__main__':
    app.run(port=5002, debug=True)
