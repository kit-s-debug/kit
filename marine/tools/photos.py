"""Turn photographs (yours, or the stand-in renders) into responsive WebP sets.
   python3 -I tools/photos.py <src_dir> [dest_dir=assets/img/photos]
Each <name>.png|jpg|jpeg|webp becomes <name>-<width>.webp for every width <= the source."""
import sys, os
from PIL import Image, ImageOps
src = sys.argv[1]
dest = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "img", "photos")
os.makedirs(dest, exist_ok=True)
WIDTHS = [2560, 1920, 1440, 960, 640]
for f in sorted(os.listdir(src)):
    name, ext = os.path.splitext(f)
    if ext.lower() not in (".png", ".jpg", ".jpeg", ".webp") or name.startswith(("p-", "sheet")): continue
    im = ImageOps.exif_transpose(Image.open(os.path.join(src, f))).convert("RGB")  # phone photos carry rotation in EXIF
    for w in WIDTHS:
        if w > im.width: continue
        h = round(im.height * w / im.width)
        im.resize((w, h), Image.LANCZOS).save(os.path.join(dest, f"{name}-{w}.webp"), "WEBP", quality=78, method=6)
    print(name, im.size)
