import os
import sqlite3
import json
from flask import current_app, g
from werkzeug.security import generate_password_hash
import secrets

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(
            current_app.config["DATABASE"], detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()

def init_db():
    db = get_db()
    db.executescript(
        """
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE,
      title TEXT
    );

    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_id INTEGER,
      payload TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(section_id) REFERENCES sections(id) ON DELETE CASCADE
    );
    """
    )
    db.commit()

def init_app_db():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    instance = os.path.join(root, "instance")
    os.makedirs(instance, exist_ok=True)
    from flask import Flask
    temp = Flask(__name__)
    temp.instance_path = instance
    temp.config["DATABASE"] = os.path.join(instance, "vault.db")
    with temp.app_context():
        init_db()

def create_user_if_none():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    instance = os.path.join(root, "instance")
    os.makedirs(instance, exist_ok=True)
    db_path = os.path.join(instance, "vault.db")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.executescript(
        """
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE,
      title TEXT
    );

    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_id INTEGER,
      payload TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(section_id) REFERENCES sections(id) ON DELETE CASCADE
    );
    """
    )
    conn.commit()
    cur.execute("SELECT COUNT(*) as c FROM users")
    row = cur.fetchone()
    c = row["c"] if row else 0
    if c > 0:
        conn.close()
        return False, None, None
    username = "admin"
    password = secrets.token_urlsafe(10)
    phash = generate_password_hash(password)
    cur.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (username, phash))
    conn.commit()
    conn.close()
    return True, username, password

def get_user_by_username(username):
    db = get_db()
    return db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()

def get_user_by_id(user_id):
    db = get_db()
    return db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

def create_section_if_missing(slug, title):
    db = get_db()
    db.execute("INSERT OR IGNORE INTO sections (slug, title) VALUES (?, ?)", (slug, title))
    db.commit()

def seed_from_jsonpath(path):
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    db = get_db()
    for sec in data.get("sections", []):
        db.execute("INSERT OR IGNORE INTO sections (slug, title) VALUES (?, ?)", (sec.get("slug"), sec.get("title")))
        db.commit()
        section_row = db.execute("SELECT id FROM sections WHERE slug = ?", (sec.get("slug"),)).fetchone()
        if not section_row:
            continue
        section_id = section_row["id"]
        for row in sec.get("rows", []):
            db.execute("INSERT INTO entries (section_id, payload) VALUES (?, ?)", (section_id, json.dumps(row, ensure_ascii=False)))
        db.commit()
