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
