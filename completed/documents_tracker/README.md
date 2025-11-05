# DocTrack — Document URL Tracker

A Flask web application to track document URLs with sections, descriptions, and notes. Features a SQLite database for persistent storage and a modern web interface.

## Features

- Add and organize documents with sections, descriptions, and URLs
- Full-text search across sections, descriptions, and notes
- Filter by sections
- Export/Import data as JSON
- Persistent storage in SQLite database
- Clean, responsive interface

## Setup and Run

1. Create and activate a Python virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

1. Install dependencies:

```bash
pip install -r requirements.txt
```

1. Run the Flask application:

```bash
python app.py
```

1. Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser

## Project Structure

- `app.py` — Flask backend with SQLite database and REST API
- `index.html` — Main application page
- `static/`
  - `styles.css` — Responsive styling
  - `app.js` — Frontend logic and API integration
  - `logo.svg` — Application logo

## API Endpoints

- `GET /api/items` — List all documents (supports search with ?q= parameter)
- `POST /api/items` — Create a new document entry
- `PUT /api/items/<id>` — Update an existing document
- `DELETE /api/items/<id>` — Remove a document
- `POST /api/import` — Bulk import documents from JSON

## Database

The application uses SQLite (`doctrack.db`) for storage. The database is automatically initialized when you first run the app. Document entries include:

- Section (for categorization)
- Description
- URLs (stored as JSON)
- Notes
- Creation timestamp

## Development

## Development

### Frontend Development

- `static/app.js` - Application logic and API integration
- `static/styles.css` - Responsive styling
- `index.html` - Page structure and components

### Backend Development

- `app.py` - Flask routes and database models
- Database schema changes require migrations (see Database section)

## Data Import/Export

The app provides several ways to manage your data:

- Export/Import buttons in the UI for backup and transfer
- REST API endpoint `/api/import` for bulk imports
- Direct database access via SQLite (`doctrack.db`)

## License

© 2025 Biswajit Ghosh. All rights reserved.

