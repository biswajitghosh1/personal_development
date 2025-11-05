from flask import Flask, render_template, request, redirect, url_for, flash
import feedparser
import requests
from requests.exceptions import SSLError
from urllib.parse import urlparse
import warnings
from requests.packages.urllib3.exceptions import InsecureRequestWarning

app = Flask(__name__)
app.secret_key = 'change-this-in-production'

# Simple cache to avoid repeated requests (in-memory)
RSS_CACHE = {}

def fetch_feed(url):
    # Basic validation
    parsed = urlparse(url)
    if not parsed.scheme:
        url = 'http://' + url

    headers = {'User-Agent': 'rss-reader/1.0'}
    insecure_used = False

    try:
        # Normal, verified request first
        r = requests.get(url, timeout=8, headers=headers, verify=True)
        r.raise_for_status()
    except SSLError:
        # Retry without verification (some internal feeds use self-signed certs)
        try:
            warnings.simplefilter('ignore', InsecureRequestWarning)
        except Exception:
            pass
        try:
            r = requests.get(url, timeout=8, headers=headers, verify=False)
            r.raise_for_status()
            insecure_used = True
        except Exception as e:
            raise RuntimeError(f"Failed to fetch feed: {e}")
    except Exception as e:
        raise RuntimeError(f"Failed to fetch feed: {e}")

    feed = feedparser.parse(r.content)
    if feed.bozo:
        # malformed feed; feedparser may still return usable entries
        pass
    return feed, insecure_used

@app.route('/', methods=['GET', 'POST'])
def index():
    feed = None
    url = request.args.get('url') or ''
    embed = request.args.get('embed') == '1'
    if request.method == 'POST':
        url = request.form.get('feed_url', '').strip()
        if not url:
            flash('Please enter an RSS feed URL', 'warning')
            return redirect(url_for('index'))
        return redirect(url_for('index', url=url))

    if url:
        try:
            if url in RSS_CACHE:
                feed, insecure = RSS_CACHE[url]
            else:
                feed, insecure = fetch_feed(url)
                RSS_CACHE[url] = (feed, insecure)
            if insecure:
                flash('Loaded feed with SSL verification disabled (self-signed certificate).', 'warning')
        except Exception as e:
            flash(str(e), 'danger')
            feed = None
    inline_css = None
    if embed:
        try:
            with open(app.static_folder + '/styles.css', 'r', encoding='utf-8') as f:
                inline_css = f.read()
        except Exception:
            inline_css = None
    return render_template('index.html', feed=feed, url=url, inline_css=inline_css)

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
