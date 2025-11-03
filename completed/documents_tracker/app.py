#!/usr/bin/env python3
"""Simple Flask server + SQLite for Document Tracker (DocTrack).

Provides a minimal REST API and serves the static frontend.
"""
from pathlib import Path
import json
from datetime import datetime

from flask import Flask, jsonify, request, send_from_directory, abort
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

HERE = Path(__file__).parent.resolve()

app = Flask(__name__, static_folder=str(HERE / 'static'), static_url_path='/static')
CORS(app)

# SQLite DB in the project folder
db_path = HERE / 'doctrack.db'
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    section = db.Column(db.String(200), index=True)
    desc = db.Column(db.String(500))
    urls = db.Column(db.Text)  # store JSON list
    notes = db.Column(db.Text)
    created = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'section': self.section,
            'desc': self.desc,
            'urls': json.loads(self.urls or '[]'),
            'notes': self.notes,
            'created': int(self.created.timestamp() * 1000) if self.created else None,
        }


@app.before_first_request
def init_db():
    db.create_all()


@app.route('/')
def index():
    # serve the static index.html
    return send_from_directory(str(HERE), 'index.html')


@app.route('/api/ping')
def ping():
    return jsonify({'ok': True})


@app.route('/api/items', methods=['GET'])
def get_items():
    items = Item.query.order_by(Item.created.desc()).all()
    return jsonify([it.to_dict() for it in items])


@app.route('/api/items', methods=['POST'])
def create_item():
    data = request.get_json() or {}
    section = data.get('section')
    desc = data.get('desc')
    urls = data.get('urls') or []
    notes = data.get('notes')
    it = Item(section=section, desc=desc, urls=json.dumps(urls), notes=notes)
    db.session.add(it)
    db.session.commit()
    return jsonify(it.to_dict()), 201


@app.route('/api/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    it = Item.query.get_or_404(item_id)
    data = request.get_json() or {}
    it.section = data.get('section', it.section)
    it.desc = data.get('desc', it.desc)
    it.urls = json.dumps(data.get('urls', json.loads(it.urls or '[]')))
    it.notes = data.get('notes', it.notes)
    db.session.commit()
    return jsonify(it.to_dict())


@app.route('/api/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    it = Item.query.get_or_404(item_id)
    db.session.delete(it)
    db.session.commit()
    return jsonify({'ok': True})


@app.route('/api/import', methods=['POST'])
def import_items():
    data = request.get_json() or []
    if not isinstance(data, list):
        return abort(400, 'expected array')
    created = []
    for entry in data:
        urls = entry.get('urls') or []
        it = Item(section=entry.get('section'), desc=entry.get('desc'), urls=json.dumps(urls), notes=entry.get('notes'))
        db.session.add(it)
        created.append(it)
    db.session.commit()
    return jsonify([c.to_dict() for c in created])


if __name__ == '__main__':
    # run development server
    app.run(host='127.0.0.1', port=5000, debug=True)
