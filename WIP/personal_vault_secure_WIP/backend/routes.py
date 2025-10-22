from flask import Blueprint, render_template, current_app, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from .db import get_db, create_section_if_missing, seed_from_jsonpath
import json

bp = Blueprint("main", __name__)

@bp.app_context_processor
def inject_nav():
    """
    Provide a callable sections_nav() to templates so they can call sections_nav()
    (keeps backward compatibility with templates that do that).
    """
    def sections_nav():
        db = get_db()
        secs = db.execute("SELECT slug, title FROM sections ORDER BY id").fetchall()
        return [{"slug": s["slug"], "title": s["title"]} for s in secs]
    return dict(sections_nav=sections_nav)

@bp.route("/")
def index():
    db = get_db()
    sections = db.execute("SELECT id, slug, title FROM sections ORDER BY id").fetchall()
    data = []
    for s in sections:
        rows = db.execute("SELECT id, payload FROM entries WHERE section_id = ? ORDER BY id", (s["id"],)).fetchall()
        parsed = []
        for r in rows:
            try:
                parsed.append({"id": r["id"], **json.loads(r["payload"])})
            except Exception:
                parsed.append({"id": r["id"], "_raw": r["payload"]})
        data.append({"id": s["id"], "slug": s["slug"], "title": s["title"], "rows": parsed})
    return render_template("index.html", sections=data)

@bp.route("/add/<slug>", methods=["GET", "POST"])
@login_required
def add_entry(slug):
    db = get_db()
    sec = db.execute("SELECT id, title FROM sections WHERE slug = ?", (slug,)).fetchone()
    if not sec:
        flash("Section not found", "warning")
        return redirect(url_for("main.index"))
    if request.method == "POST":
        keys = request.form.getlist("key[]")
        values = request.form.getlist("value[]")
        payload = {k: v for k, v in zip(keys, values) if k}
        db.execute("INSERT INTO entries (section_id, payload) VALUES (?, ?)", (sec["id"], json.dumps(payload, ensure_ascii=False)))
        db.commit()
        flash("Entry added.", "success")
        return redirect(url_for("main.index") + "#" + slug)
    return render_template("add_entry.html", section=sec)

@bp.route("/edit/<int:entry_id>", methods=["GET", "POST"])
@login_required
def edit_entry(entry_id):
    db = get_db()
    row = db.execute("SELECT id, section_id, payload FROM entries WHERE id = ?", (entry_id,)).fetchone()
    if not row:
        flash("Entry not found", "warning")
        return redirect(url_for("main.index"))
    try:
        payload = json.loads(row["payload"])
    except Exception:
        payload = {"_raw": row["payload"]}
    section = db.execute("SELECT slug, title FROM sections WHERE id = ?", (row["section_id"],)).fetchone()
    if request.method == "POST":
        keys = request.form.getlist("key[]")
        values = request.form.getlist("value[]")
        payload_new = {k: v for k, v in zip(keys, values) if k}
        db.execute("UPDATE entries SET payload = ? WHERE id = ?", (json.dumps(payload_new, ensure_ascii=False), entry_id))
        db.commit()
        flash("Entry updated.", "success")
        return redirect(url_for("main.index") + "#" + section["slug"])
    return render_template("edit_entry.html", entry_id=entry_id, payload=payload, section=section)

@bp.route("/delete/<int:entry_id>", methods=["POST"])
@login_required
def delete_entry(entry_id):
    db = get_db()
    db.execute("DELETE FROM entries WHERE id = ?", (entry_id,))
    db.commit()
    flash("Entry deleted.", "success")
    return redirect(url_for("main.index"))

@bp.route("/admin/seed", methods=["POST"])
@login_required
def admin_seed():
    # convenience endpoint: seed from frontend/data/seed.json if present; keep protected
    jsonpath = current_app.root_path + "/frontend/data/seed.json"
    seed_from_jsonpath(jsonpath)
    flash("Seed attempted from data/seed.json", "info")
    return redirect(url_for("main.index"))
PY

# quick verify
grep -n "def inject_nav" backend/routes.py || true
echo "Backup kept at backend/routes.py.bak"