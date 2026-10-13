"""Bundle this buildless site into one offline HTML file, using Python 3 only."""
from pathlib import Path
import base64
import mimetypes
import re
import sys

root = Path(__file__).resolve().parents[1]
target = Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'HBD-PAM.html'
html = (root / 'index.html').read_text(encoding='utf-8')
css = (root / 'styles.css').read_text(encoding='utf-8')
js = (root / 'app.js').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>' + css + '</style>')
html = html.replace('<script src="app.js"></script>', '<script>' + js + '</script>')

def embed(match):
    filename = match.group(0)
    asset = root / filename
    if not asset.is_file():
        raise FileNotFoundError(asset)
    mime = mimetypes.guess_type(asset)[0] or 'application/octet-stream'
    encoded = base64.b64encode(asset.read_bytes()).decode('ascii')
    return f'data:{mime};base64,{encoded}'

html = re.sub(r'assets/[\w-]+\.(?:png|jpe?g|webp|svg|mp3)', embed, html)
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(html, encoding='utf-8')
print(f'Created {target.name}: {target.stat().st_size:,} bytes')
