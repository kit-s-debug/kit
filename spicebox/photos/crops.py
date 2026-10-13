"""Crop the shop photography into the web images the site uses.

    python3 photos/crops.py          (run from the spicebox/ folder)

Each entry: output name -> (original photo, crop box in original pixels
(left, top, right, bottom), output width). Output height follows the box.
To use a new photo, drop it in photos/originals/ and add a line here.
"""
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps

HERE = Path(__file__).parent
OUT = HERE.parent / "assets" / "photos"

CROPS = {
    # hero + shopfront
    "hero-chillies":      ("seeds-okra-herbs.jpg",      (100, 600, 1170, 1380), 1400),
    "shopfront":          ("shopfront-angle.jpg",       (60, 440, 1150, 1330),  1200),
    "walls":              ("seasonings-wall-right.jpg", (0, 640, 1170, 1560),   1200),
    # aisle tiles (4:5 or close)
    "whole-spices":       ("whole-spices-wall.jpg",     (0, 420, 1170, 1210),   1000),
    "ground-spices":      ("powders-garlic-onion.jpg",  (280, 380, 1170, 970),  1000),
    "fresh-veg":          ("seeds-okra-herbs.jpg",      (90, 960, 1170, 1360),  1000),
    "exotic-fruit":       ("spices-fruit-veg.jpg",      (0, 940, 1170, 1380),   1000),
    "roots-tubers":       ("seeds-roots-plantain.jpg",  (0, 800, 1170, 1400),   1000),
    "poppadoms":          ("poppadoms-powders.jpg",     (0, 0, 940, 440),       1000),
    "herb-stand":         ("herb-stand.jpg",            (430, 380, 950, 1030),  800),
    "caribbean":          ("seasonings-wall-left.jpg",  (200, 380, 980, 640),   1000),
    "east-asian":         ("east-asian-shelf.jpg",      (140, 230, 930, 1230),  800),
    "garlic-ginger":      ("powders-garlic-onion.jpg",  (130, 1180, 1170, 1500), 1000),
    "dried-chillies":     ("curry-chilli-leaves.jpg",   (90, 110, 1170, 600),   1000),
    "masala-shelf":       ("poppadoms-peppers.jpg",     (140, 230, 1170, 960),  1000),
}

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (src, box, width) in CROPS.items():
        im = ImageOps.exif_transpose(Image.open(HERE / "originals" / src)).convert("RGB").crop(box)
        h = round(width * im.height / im.width)
        sharpen = (1.6, 70) if width > im.width else (0.8, 40)
        im = im.resize((width, h), Image.LANCZOS).filter(
            ImageFilter.UnsharpMask(radius=sharpen[0], percent=sharpen[1], threshold=2))
        im.save(OUT / f"{name}.webp", "WEBP", quality=82, method=6)
        print(f"{name:16s} {width}x{h}")

if __name__ == "__main__":
    main()
