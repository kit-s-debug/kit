"""Crop the shop photography into the web images the site uses.

    python3 photos/crops.py          (run from the bambo/ folder)

Each entry: output name -> (original photo, crop box in original pixels
(left, top, right, bottom), output width). Output height follows the box,
so keep boxes at the ratio the slot needs: 4:5 for product cards and tiles.
To use a new photo, drop it in photos/originals/ and add a line here.
"""
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

HERE = Path(__file__).parent
OUT = HERE.parent / "assets" / "photos"

# New set (12 Oct): boxes are written against a 1500px-wide preview of each photo
# and scaled to the 1932px originals by S.
S = 1932 / 1500
def b(l, t, r, btm):
    return tuple(round(v * S) for v in (l, t, r, btm))

CROPS = {
    # hero + section images: cropped inside the shelf frames, no walls, floor or LED strips
    "hero-wall":          ("lost-mary-pixl-clean.png",       (0, 40, 1086, 1397),    1000),
    "tile-kits":          ("ske-bloody-novamax-shelves.jpg", b(60, 270, 1430, 1982),  1000),
    "tile-salts":         ("elux-salts-full.jpg",            (195, 300, 980, 1281),   900),
    "tile-shisha":        ("hookah-amber.jpg",               b(310, 90, 1334, 1370),  900),
    "gallery-hayati":     ("hayati-promax-shelves.jpg",      b(0, 170, 1460, 1995),   900),
    "gallery-papers":     ("papers-shelf.jpg",               b(270, 280, 1110, 1330), 900),
    "gallery-ivg":        ("ivg-wall-full.jpg",              (190, 195, 1010, 1220),  900),
    "shopfront-wide":     ("shopfront.jpg",                  (0, 470, 1170, 1180),    1600),
    "shopfront":          ("shopfront.jpg",                  (50, 200, 1122, 1540),   1000),
    "doorway":            ("doorway.jpg",                    (300, 380, 1000, 1255),  900),
    "drinks-fridge":      ("drinks-fridge-3.png",            (0, 783, 1290, 2396),    900),
    # product cards (4:5)
    "ivg-pro-10k":        ("ivg-wall-full.jpg",              (190, 195, 1010, 1220),  800),
    "lost-mary-bm6000":   ("lost-mary-pixl-clean.png",       (20, 200, 540, 850),    800),
    "lost-mary-nera-30k": ("lost-mary-pixl-clean.png",       (560, 200, 1060, 825),  800),
    "lost-mary-nera-15k": ("ivg-nera-elux-wall.jpg",         b(275, 710, 835, 1410),  800),
    "lost-mary-bm600":    ("lm600-shisha-shelves.jpg",       b(80, 330, 560, 930),    800),
    "pixl-8000":          ("lost-mary-pixl-clean.png",       (400, 860, 870, 1448),  800),
    "hayati-pro-max-plus":("hayati-promax-shelves.jpg",      b(0, 340, 760, 1290),    800),
    "enjoy-ultra-9000":   ("lm600-shisha-shelves.jpg",       b(430, 735, 800, 1198),  800),
    "hayati-30k-shisha":  ("lm600-shisha-shelves.jpg",       b(980, 940, 1450, 1528), 800),
    "hayati-ultra-25k":   ("ske-hayati25k-shelves.jpg",      b(60, 680, 760, 1555),   800),
    "ske-crystal":        ("ske-bloody-novamax-shelves.jpg", b(90, 1110, 790, 1985),  800),
    "ske-bar-15k":        ("ske-bloody-novamax-shelves.jpg", b(90, 730, 780, 1592),   800),
    "bloody-bar-crystal": ("ske-bloody-novamax-shelves.jpg", b(20, 280, 470, 842),    800),
    "elux-legend-15k":    ("elux-pouches-tower.jpg",         b(560, 1395, 1010, 1958), 800),
    "ske-crystal-salts":  ("salts-shelves.jpg",              b(60, 800, 820, 1750),   800),
    "pixl-hayati-salts":  ("salts-wall-2.jpg",               b(200, 380, 760, 1080),  800),
    "elux-nic-salts":     ("elux-salts-full.jpg",            (195, 100, 980, 1081),   800),
    "nicotine-pouches":   ("elux-pouches-tower.jpg",         b(450, 140, 1250, 1140), 800),
    "grinders":           ("grinders-cabinet.jpg",           b(30, 240, 630, 990),    800),
    "rolling-papers":     ("papers-shelf.jpg",               b(300, 300, 1020, 1200), 800),
    "lighters":           ("counter-accessories.jpg",        (220, 470, 540, 870),    800),
    "chargers":           ("chargers-wall.jpg",              b(60, 270, 960, 1395),   800),
    "fragrances":         ("fragrance-tray.jpg",           (230, 420, 750, 1070),   800),
    "hookah-speckled":    ("hookah-speckled.jpg",            b(400, 100, 1300, 1225), 800),
    "hookah":             ("hookah-amber.jpg",               b(310, 90, 1334, 1370),  800),
    "hookah-blue":        ("hookah-clear.jpg",               b(170, 0, 1180, 1262),   800),
}

def enhance(im):
    """Phone shots of the shelves come out flat and a little dark: stretch the
    tones, lift exposure and colour, and add gentle local contrast."""
    im = ImageOps.autocontrast(im, cutoff=(0.4, 0.6))
    im = ImageEnhance.Brightness(im).enhance(1.05)
    im = ImageEnhance.Contrast(im).enhance(1.07)
    im = ImageEnhance.Color(im).enhance(1.2)
    return im.filter(ImageFilter.UnsharpMask(radius=6, percent=18, threshold=3))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (src, box, width) in CROPS.items():
        im = ImageOps.exif_transpose(Image.open(HERE / "originals" / src)).convert("RGB").crop(box)
        im = enhance(im)
        h = round(width * im.height / im.width)
        if width > im.width:  # small crops: upscale gently, then restore edge crispness
            im = im.resize((width, h), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.6, percent=70, threshold=2))
        else:
            im = im.resize((width, h), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=0.8, percent=40, threshold=2))
        im.save(OUT / f"{name}.webp", "WEBP", quality=82, method=6)
        print(f"{name:22s} {width}x{h}")

if __name__ == "__main__":
    main()
