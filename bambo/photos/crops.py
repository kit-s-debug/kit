"""Crop the shop photography into the web images the site uses.

    python3 photos/crops.py          (run from the bambo/ folder)

Each entry: output name -> (original photo, crop box in original pixels
(left, top, right, bottom), output width). Output height follows the box,
so keep boxes at the ratio the slot needs: 4:5 for product cards and tiles.
To use a new photo, drop it in photos/originals/ and add a line here.
"""
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps

HERE = Path(__file__).parent
OUT = HERE.parent / "assets" / "photos"

# New set (12 Oct): boxes are written against a 1500px-wide preview of each photo
# and scaled to the 1932px originals by S.
S = 1932 / 1500
def b(l, t, r, btm):
    return tuple(round(v * S) for v in (l, t, r, btm))

CROPS = {
    # hero + section images
    "hero-wall":          ("lost-mary-pixl-shelves.jpg",     b(0, 180, 1456, 2000),   1000),
    "tile-kits":          ("ske-bloody-novamax-shelves.jpg", b(0, 100, 1500, 1975),   1000),
    "tile-salts":         ("salts-shelves.jpg",              b(0, 100, 1500, 1975),   900),
    "tile-shisha":        ("hookah-window.jpg",              (130, 160, 1030, 1285),  900),
    "gallery-hayati":     ("hayati-promax-shelves.jpg",      b(0, 100, 1500, 1975),   900),
    "gallery-papers":     ("papers-shelf.jpg",               b(150, 200, 1190, 1500), 900),
    "gallery-ivg":        ("ivg-shelves.jpg",                b(0, 100, 1500, 1975),   900),
    "shopfront-wide":     ("shopfront.jpg",                  (0, 470, 1170, 1180),    1600),
    "shopfront":          ("shopfront.jpg",                  (50, 200, 1122, 1540),   1000),
    "doorway":            ("doorway.jpg",                    (300, 380, 1000, 1255),  900),
    "drinks-fridge":      ("drinks-fridge-2.jpg",            b(100, 300, 1396, 1920), 900),
    # product cards (4:5)
    "ivg-pro-10k":        ("ivg-shelves.jpg",                b(0, 150, 760, 1100),    800),
    "lost-mary-bm6000":   ("lost-mary-pixl-shelves.jpg",     b(140, 700, 740, 1450),  800),
    "lost-mary-nera-30k": ("lost-mary-pixl-shelves.jpg",     b(540, 220, 1140, 970),  800),
    "lost-mary-bm600":    ("lm600-shelf.jpg",                b(90, 200, 500, 712),           800),
    "pixl-8000":          ("lost-mary-pixl-shelves.jpg",     b(450, 1120, 1050, 1870), 800),
    "hayati-pro-max-plus":("hayati-promax-shelves.jpg",      b(0, 340, 760, 1290),    800),
    "hayati-30k-shisha":  ("lost-mary-hayati-wall.jpg",      (520, 430, 900, 905),    800),
    "hayati-ultra-25k":   ("ske-hayati25k-shelves.jpg",      b(60, 680, 760, 1555),   800),
    "ske-crystal":        ("ske-bloody-novamax-shelves.jpg", b(90, 1110, 790, 1985),           800),
    "ske-bar-15k":        ("ske-bloody-novamax-shelves.jpg", b(40, 730, 760, 1630),           800),
    "bloody-bar-crystal": ("ske-bloody-novamax-shelves.jpg", b(20, 280, 470, 842),           800),
    "elux-legend-15k":    ("elux-pouches-tower.jpg",         b(560, 1395, 1010, 1958), 800),
    "ske-crystal-salts":  ("salts-shelves.jpg",              b(30, 760, 830, 1760),   800),
    "elfliq-pixl-salts":  ("salts-shelves.jpg",              b(0, 240, 600, 990),    800),
    "nicotine-pouches":   ("elux-pouches-tower.jpg",         b(450, 140, 1250, 1140), 800),
    "grinders":           ("grinders-cabinet.jpg",           b(30, 240, 630, 990),    800),
    "rolling-papers":     ("papers-shelf.jpg",               b(150, 280, 930, 1255),  800),
    "lighters":           ("counter-accessories.jpg",        (220, 470, 540, 870),    800),
    "hookah":             ("hookah-gold.jpg",                (170, 100, 1010, 1150),  800),
    "hookah-blue":        ("hookah-blue.jpg",                (240, 150, 1000, 1100),  800),
}

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (src, box, width) in CROPS.items():
        im = ImageOps.exif_transpose(Image.open(HERE / "originals" / src)).convert("RGB").crop(box)
        h = round(width * im.height / im.width)
        if width > im.width:  # small crops: upscale gently, then restore edge crispness
            im = im.resize((width, h), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.6, percent=70, threshold=2))
        else:
            im = im.resize((width, h), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=0.8, percent=40, threshold=2))
        im.save(OUT / f"{name}.webp", "WEBP", quality=82, method=6)
        print(f"{name:22s} {width}x{h}")

if __name__ == "__main__":
    main()
