"""Draws the masala dabba (round steel spice tin) and its lid as SVG.

    python3 art/dabba.py        (run from the spicebox/ folder)

Writes art/dabba.svg and art/lid.svg. art/render.mjs turns them into the
transparent WebP images the hero uses (assets/img/dabba.webp, lid.webp).
Deterministic: the same seed always draws the same spices.
"""
import math, random
from pathlib import Path

R = random.Random(27)  # 27 Dew Street
HERE = Path(__file__).parent
S = 1000  # viewBox size
C = S / 2

def steel(id_, stops):
    s = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return f'<radialGradient id="{id_}" cx="38%" cy="32%" r="80%">{s}</radialGradient>'

def scatter(cx, cy, r, n, draw):
    out = []
    for _ in range(n):
        a = R.random() * math.tau
        d = r * math.sqrt(R.random())
        out.append(draw(cx + d * math.cos(a), cy + d * math.sin(a)))
    return "".join(out)

def pick(*cols): return R.choice(cols)

def powder(base, lights, darks):
    def f(x, y):
        rr = R.uniform(.6, 2.2)
        return f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rr:.1f}" fill="{pick(*lights, *darks)}" opacity="{R.uniform(.35,.9):.2f}"/>'
    return base, f, 1600

def seeds(base, cols, w, h, n, stroke=None):
    def f(x, y):
        rot = R.uniform(0, 180)
        ww, hh = w * R.uniform(.8, 1.2), h * R.uniform(.8, 1.2)
        col = pick(*cols)
        hl = f'<ellipse cx="{-ww*.25:.1f}" cy="{-hh*.3:.1f}" rx="{ww*.35:.1f}" ry="{hh*.25:.1f}" fill="#fff" opacity=".18"/>'
        st = f' stroke="{stroke}" stroke-width=".6"' if stroke else ""
        return f'<g transform="translate({x:.1f} {y:.1f}) rotate({rot:.0f})"><ellipse rx="{ww:.1f}" ry="{hh:.1f}" fill="{col}"{st}/>{hl}</g>'
    return base, f, n

def cloves():
    def f(x, y):
        rot = R.uniform(0, 360); L = R.uniform(14, 20)
        c = pick("#5a3322", "#4a2a1c", "#6b3d27")
        return (f'<g transform="translate({x:.1f} {y:.1f}) rotate({rot:.0f})">'
                f'<rect x="0" y="-2" width="{L:.1f}" height="4" rx="2" fill="{c}"/>'
                f'<circle cx="{L+3:.1f}" cy="0" r="4.6" fill="{c}"/><circle cx="{L+2:.1f}" cy="-1.5" r="1.6" fill="#8a5a3c"/></g>')
    return "#3b2116", f, 330

def cardamom():
    return seeds("#55642f", ["#8a9a55", "#7a8a48", "#9aa865", "#6d7d3e"], 13, 7, 260, stroke="#4b5a2a")

BOWLS = [  # (name, label, generator)
    ("turmeric", "Haldi", lambda: powder("#E7B52F", ["#F4D16B", "#f7dc85", "#efc34a"], ["#c9921a", "#b9831a"])),
    ("chilli", "Lal mirch", lambda: powder("#b4301c", ["#d9472b", "#e0573a", "#c43a22"], ["#8f2414", "#7a1e10"])),
    ("cumin", "Jeera", lambda: seeds("#5a3d22", ["#8a6a43", "#7b5a36", "#9b7a4f", "#6b4a2b"], 8, 2.6, 900)),
    ("mustard", "Rai", lambda: seeds("#1d1512", ["#2f231c", "#3a2c24", "#241a15", "#4a3a2e"], 3.6, 3.4, 1300)),
    ("coriander", "Dhania", lambda: seeds("#8c6a3c", ["#c29a5e", "#b38b52", "#a67f48", "#d1ab6e"], 6, 5.6, 520, stroke="#8a6a3e")),
    ("cardamom", "Elaichi", cardamom),
    ("cloves", "Laung", cloves),
]

def bowl(cx, cy, r, gen, i):
    base, f, n = gen()
    clip = f"b{i}"
    return (f'<clipPath id="{clip}"><circle cx="{cx}" cy="{cy}" r="{r}"/></clipPath>'
            f'<circle cx="{cx}" cy="{cy}" r="{r+16}" fill="url(#rim)"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r+3}" fill="#6d726b"/>'
            f'<g clip-path="url(#{clip})"><circle cx="{cx}" cy="{cy}" r="{r}" fill="{base}"/>{scatter(cx, cy, r + 8, n, f)}'
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#bowlshade)"/></g>')

def dabba():
    defs = (steel("tin", [(0, "#f2f3ef"), (.45, "#c9ccc5"), (.8, "#9a9f97"), (1, "#7d827a")])
            + steel("rim", [(0, "#ffffff"), (.5, "#d3d6cf"), (1, "#8a8f87")])
            + '<radialGradient id="bowlshade" cx="50%" cy="50%" r="50%"><stop offset=".72" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></radialGradient>'
            + '<radialGradient id="shadow" cx="50%" cy="50%" r="50%"><stop offset=".85" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>')
    body = [f'<circle cx="{C+14}" cy="{C+22}" r="{C-8}" fill="url(#shadow)"/>',
            f'<circle cx="{C}" cy="{C}" r="{C-30}" fill="url(#tin)"/>',
            f'<circle cx="{C}" cy="{C}" r="{C-44}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>',
            f'<circle cx="{C}" cy="{C}" r="{C-52}" fill="#a9ada5"/>']
    ring, rr = 300, 118
    body.append(bowl(C, C, rr, BOWLS[0][2], 0))
    for k in range(6):
        a = -math.pi / 2 + k * math.tau / 6
        body.append(bowl(round(C + ring * math.cos(a)), round(C + ring * math.sin(a)), rr, BOWLS[k + 1][2], k + 1))
    # little steel spoon resting across the turmeric
    body.append('<g transform="translate(500 500) rotate(-32)"><rect x="-6" y="-150" width="12" height="170" rx="6" fill="url(#rim)"/>'
                '<ellipse cx="0" cy="40" rx="30" ry="40" fill="url(#rim)"/><ellipse cx="0" cy="40" rx="22" ry="31" fill="#E7B52F"/>'
                + scatter(0, 40, 22, 120, lambda x, y: f'<circle cx="{x:.1f}" cy="{y:.1f}" r="1.3" fill="{pick("#c9921a", "#F4D16B")}"/>') + '</g>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}"><defs>{defs}</defs>{"".join(body)}</svg>'

def lid():
    defs = (steel("lidg", [(0, "#ffffff"), (.35, "#dfe2db"), (.75, "#a7aca4"), (1, "#80857d")])
            + '<path id="txt" d="M 500 500 m -330 0 a 330 330 0 1 1 660 0 a 330 330 0 1 1 -660 0"/>'
            + '<radialGradient id="lshadow" cx="50%" cy="50%" r="50%"><stop offset=".86" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>')
    rings = "".join(f'<circle cx="500" cy="500" r="{r}" fill="none" stroke="{c}" stroke-width="{w}" opacity="{o}"/>'
                    for r, c, w, o in [(462, "#fff", 4, .7), (440, "#6f746c", 2, .5), (290, "#fff", 3, .55), (282, "#6f746c", 1.5, .45), (120, "#6f746c", 2, .4)])
    # brushed-steel streaks
    streaks = "".join(f'<circle cx="500" cy="500" r="{r}" fill="none" stroke="#fff" stroke-width=".8" opacity="{R.uniform(.05,.18):.2f}"/>'
                      for r in range(130, 460, 7))
    star = "".join(f'<path d="M500 500c-14-24-15-56 0-84 15 28 14 60 0 84z" fill="#173D2B" transform="rotate({k*45} 500 500)"/>' for k in range(8))
    text = ('<text font-family="Rozha One, Georgia, serif" font-size="46" letter-spacing="9" fill="#173D2B" opacity=".85">'
            '<textPath href="#txt" startOffset="0">THE SPICE BOX ✦ 27 DEW STREET ✦ HAVERFORDWEST ✦</textPath></text>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}"><defs>{defs}</defs>'
            f'<circle cx="514" cy="524" r="490" fill="url(#lshadow)"/>'
            f'<circle cx="500" cy="500" r="470" fill="url(#lidg)"/>{streaks}{rings}{text}'
            f'<circle cx="500" cy="500" r="104" fill="#E7B52F"/><circle cx="500" cy="500" r="104" fill="none" stroke="#173D2B" stroke-width="3"/>{star}'
            f'<circle cx="500" cy="500" r="12" fill="#E7B52F"/></svg>')

(HERE / "dabba.svg").write_text(dabba())
(HERE / "lid.svg").write_text(lid())
print("ok", len(dabba()) // 1024, "KB")
