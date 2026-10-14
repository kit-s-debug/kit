"""Crop the shop photography into the responsive web images the site uses.

    python3 photos/crops.py          (run from the spicebox/ folder)

Each entry: output name -> (original photo, crop box in original pixels
(left, top, right, bottom)). Every crop is written at two widths,
<name>-sm.webp and <name>-lg.webp, for use in srcset. Originals are 1170px
wide, so the large size is capped near the crop's native width to avoid
blurry upscaling.
"""
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps

HERE = Path(__file__).parent
OUT = HERE.parent / "assets" / "img"
SMALL, LARGE = 720, 1400

CROPS = {
    "hero":         ("seeds-okra-herbs.jpg",     (0, 560, 1170, 1560)),
    "shopfront":    ("shopfront-angle.jpg",      (60, 420, 1150, 1360)),
    # product categories
    "cat-spices":   ("whole-spices-wall.jpg",    (0, 380, 1170, 1200)),
    "cat-fresh":    ("spices-fruit-veg.jpg",     (0, 900, 1170, 1560)),
    "cat-pantry":   ("rice-display-2.jpg",       (0, 150, 1170, 1250)),
    "cat-asian":    ("noodles-sauces-right.jpg", (0, 90, 1050, 830)),
    "cat-world":    ("african-flours.jpg",       (150, 560, 960, 1460)),
    "cat-frozen":   ("halal-freezer-tubs.jpg",   (150, 480, 1030, 1150)),
    "cat-drinks":   ("drinks-fridge-right.jpg",  (400, 560, 960, 1200)),
    # gallery
    "g-ground":     ("powders-garlic-onion.jpg", (280, 380, 1170, 970)),
    "g-chillies":   ("curry-chilli-leaves.jpg",  (90, 110, 1170, 600)),
    "g-herbs":      ("herb-stand.jpg",           (430, 380, 950, 1030)),
    "g-sauces":     ("noodles-sauces-left.jpg",  (0, 860, 1170, 1500)),
    "g-fresh":      ("seeds-okra-herbs.jpg",     (0, 330, 1170, 1560)),  # full width: the gallery's zoom-out photo
    "g-roots":      ("seeds-roots-plantain.jpg", (0, 800, 1170, 1400)),
    # closing call to action
    "cta":          ("poppadoms-peppers.jpg",    (140, 230, 1170, 960)),
}

def save(im, width, path):
    h = round(width * im.height / im.width)
    out = im.resize((width, h), Image.LANCZOS)
    out = out.filter(ImageFilter.UnsharpMask(radius=0.8, percent=40, threshold=2))
    out.save(path, "WEBP", quality=80, method=6)
    return h

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (src, box) in CROPS.items():
        im = ImageOps.exif_transpose(Image.open(HERE / "originals" / src)).convert("RGB").crop(box)
        large = min(LARGE, im.width)  # never upscale: blur shows when it's zoomed
        hs = save(im, min(SMALL, large), OUT / f"{name}-sm.webp")
        hl = save(im, large, OUT / f"{name}-lg.webp")
        print(f"{name:12s} sm {min(SMALL, large)}x{hs}  lg {large}x{hl}")
    # social sharing card
    hero = ImageOps.exif_transpose(Image.open(HERE / "originals" / CROPS["hero"][0])).convert("RGB")
    ImageOps.fit(hero.crop(CROPS["hero"][1]), (1200, 630), Image.LANCZOS).save(OUT / "og.jpg", quality=82)

if __name__ == "__main__":
    main()
