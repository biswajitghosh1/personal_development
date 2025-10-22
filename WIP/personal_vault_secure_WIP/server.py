from backend import create_app

app = create_app()

if __name__ == "__main__":
    # Development server; use a WSGI server for production
    app.run(host="127.0.0.1", port=5000, debug=True)
