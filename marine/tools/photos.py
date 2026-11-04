"""Turn photographs into responsive WebP sets.
   python3 -I tools/photos.py <src_dir> [dest_dir=assets/img/photos] [--grade]
Each <name>.png|jpg|jpeg|webp becomes <name>-<width>.webp for every width <= the source.
--grade applies the site's house look so phone photos sit with the navy palette:
slightly calmer colour, a touch more contrast, and shadows nudged towards midnight navy.
It never crops, stretches or retouches the subject."""
import sys, os
from PIL import Image, ImageOps, ImageEnhance

args = [a for a in sys.argv[1:] if not a.startswith("--")]
grade = "--grade" in sys.argv
src = args[0]
dest = args[1] if len(args) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "img", "photos")
os.makedirs(dest, exist_ok=True)
WIDTHS = [2560, 1920, 1440, 1200, 960, 640]

def house(im):
    im = ImageEnhance.Color(im).enhance(0.84)
    im = ImageEnhance.Contrast(im).enhance(1.06)
    # shadows towards navy: weight by darkness so highlights stay clean
    lum = im.convert("L").point(lambda v: int(255 * (1 - v / 255) ** 2.2))
    navy = Image.new("RGB", im.size, (8, 20, 38))
    return Image.composite(navy, im, lum.point(lambda v: int(v * 0.32)))

for f in sorted(os.listdir(src)):
    name, ext = os.path.splitext(f)
    if ext.lower() not in (".png", ".jpg", ".jpeg", ".webp") or name.startswith(("p-", "sheet")): continue
    im = ImageOps.exif_transpose(Image.open(os.path.join(src, f))).convert("RGB")  # phone photos carry rotation in EXIF
    if grade: im = house(im)
    for w in WIDTHS:
        if w > im.width: continue
        h = round(im.height * w / im.width)
        im.resize((w, h), Image.LANCZOS).save(os.path.join(dest, f"{name}-{w}.webp"), "WEBP", quality=80, method=6)
    print(name, im.size)
