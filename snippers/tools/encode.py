"""Resize the rendered PNGs (photos/rendered/) into responsive WebPs (assets/img/).

Each image gets a full-size version and a narrower one for phones:
  name.webp      (native width, 1000-1600px)
  name-640.webp  (640px wide)

Real Snippers photographs can go through the same step: drop a JPEG/PNG
into photos/rendered/ under the name it replaces and run
  python3 tools/encode.py name
"""
import sys
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
src = root / "photos" / "rendered"
dst = root / "assets" / "img"
dst.mkdir(parents=True, exist_ok=True)

names = sys.argv[1:] or [p.stem for p in src.glob("*.png")]
for name in names:
    path = next((p for p in src.glob(name + ".*")), None)
    if path is None:
        print("missing", name)
        continue
    im = Image.open(path).convert("RGB")
    w, h = im.size
    full_w = min(w // 2 if w > 1800 else w, 1600)
    for width, suffix in ((full_w, ""), (640, "-640")):
        out = im.resize((width, round(h * width / w)), Image.LANCZOS)
        out.save(dst / f"{name}{suffix}.webp", "WEBP", quality=80, method=6)
    print(name, (dst / f"{name}.webp").stat().st_size // 1024, "KB")
