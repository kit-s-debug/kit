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

CROPS = {
    # hero + section images
    "hero-wall":          ("ske-hayati-wall.jpg",     (250, 100, 1050, 1100), 1000),
    "tile-kits":          ("ivg-wall.jpg",            (200, 300, 1000, 1300), 1000),
    "tile-salts":         ("elux-salts-wall.jpg",     (330, 190, 870, 865),   900),
    "tile-shisha":        ("hookah-window.jpg",       (130, 160, 1030, 1285), 900),
    "gallery-salts":      ("salts-wall.jpg",          (370, 160, 900, 822),   900),
    "gallery-lost-mary":  ("lost-mary-pixl-wall.jpg", (290, 590, 890, 1340),  900),
    "gallery-hayati":     ("hayati-wall.jpg",         (170, 270, 900, 1180),  900),
    "shopfront-wide":     ("shopfront.jpg",           (0, 470, 1170, 1180),   1600),
    "shopfront":          ("shopfront.jpg",           (50, 200, 1122, 1540),  1000),
    "doorway":            ("doorway.jpg",             (300, 380, 1000, 1255), 900),
    # product cards (4:5)
    "ivg-pro-10k":        ("ivg-wall.jpg",            (440, 400, 800, 850),   800),
    "lost-mary-bm6000":   ("lost-mary-pixl-wall.jpg", (420, 620, 780, 1070),  800),
    "pixl-8000":          ("lost-mary-pixl-wall.jpg", (470, 890, 750, 1240),  800),
    "hayati-pro-max-plus":("hayati-wall.jpg",         (330, 430, 690, 880),   800),
    "hayati-30k-shisha":  ("lost-mary-hayati-wall.jpg", (520, 430, 900, 905), 800),
    "hayati-ultra-25k":   ("ske-hayati-wall.jpg",     (460, 930, 820, 1380),  800),
    "ske-crystal":        ("ske-hayati-wall.jpg",     (430, 200, 790, 650),   800),
    "elux-legend-15k":    ("elux-display-sims.jpg",   (510, 1040, 760, 1352), 800),
    "elux-nic-salts":     ("elux-salts-wall.jpg",     (420, 200, 780, 650),   800),
    "pixl-hayati-salts":  ("salts-wall.jpg",          (420, 300, 780, 750),   800),
    "nicotine-pouches":   ("elux-display-sims.jpg",   (490, 500, 762, 840),   800),
    "drinks-fridge":      ("drinks-fridge.jpg",       (100, 330, 1060, 1530), 900),
    "grinders":           ("counter-accessories.jpg", (370, 240, 710, 665),   800),
    "rolling-papers":     ("counter-accessories.jpg", (560, 560, 832, 900),   800),
    "lighters":           ("counter-accessories.jpg", (220, 470, 540, 870),   800),
    "hookah":             ("hookah-gold.jpg",         (170, 100, 1010, 1150), 800),
    "hookah-blue":        ("hookah-blue.jpg",         (240, 150, 1000, 1100), 800),
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
