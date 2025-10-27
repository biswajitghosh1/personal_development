FROM python:3.11-slim

# Keep default buffering off for logs
ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1

WORKDIR /app

# Create a non-root user for running the app
RUN useradd -m appuser || true

# Install runtime dependencies
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip setuptools wheel \
    && pip install -r /app/requirements.txt gunicorn

# Copy application code
COPY . /app

# Ensure app user owns the files
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 5002

# Run with Gunicorn WSGI server
CMD ["gunicorn", "-w", "2", "-k", "gthread", "--threads", "4", "-b", "0.0.0.0:5002", "app:app"]
