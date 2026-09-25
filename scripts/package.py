"""Build a store upload containing only runtime files, never dev metadata."""
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / 'manifest.json').read_text())
files = ['manifest.json', 'content.js', 'content.css', 'rules.json', 'popup.html', 'popup.js']
files += sorted(set(manifest['icons'].values()))
out = root / 'dist' / f"cleantube-{manifest['version']}.zip"
out.parent.mkdir(exist_ok=True)
with ZipFile(out, 'w', ZIP_DEFLATED) as archive:
    for name in files:
        archive.write(root / name, name)
with ZipFile(out) as archive:
    assert archive.testzip() is None
    assert set(archive.namelist()) == set(files)
print(out)
