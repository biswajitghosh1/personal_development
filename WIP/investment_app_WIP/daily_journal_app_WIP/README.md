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
