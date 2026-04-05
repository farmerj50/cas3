"""
Generates assets/icon.png and assets/splash.png for Cash 3 Edge.
icon:   1024x1024, background #020b2d, centered "C3" text
splash: 2732x2732, background #020b2d, centered logo mark + app name
"""

from PIL import Image, ImageDraw, ImageFont
import os

BG = (2, 11, 45)          # #020b2d
CYAN = (34, 211, 238)     # accent cyan
WHITE = (255, 255, 255)

os.makedirs("assets", exist_ok=True)

# ── Icon 1024x1024 ──────────────────────────────────────────────────────────
W = H = 1024
img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

# Outer glow circle
cx, cy, r = W // 2, H // 2, 380
draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(10, 30, 80))

# Inner circle
r2 = 300
draw.ellipse([cx - r2, cy - r2, cx + r2, cy + r2], fill=(4, 18, 60))

# "C3" text — use default font scaled up via repeated drawing trick
# Try to use a large truetype font if available, else fallback
try:
    font = ImageFont.truetype("arial.ttf", 280)
except Exception:
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 280)
    except Exception:
        font = ImageFont.load_default()

text = "C3"
bbox = draw.textbbox((0, 0), text, font=font)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
tx = cx - tw // 2 - bbox[0]
ty = cy - th // 2 - bbox[1]

# Cyan text
draw.text((tx, ty), text, font=font, fill=CYAN)

# "EDGE" subtitle
try:
    sub_font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 72)
except Exception:
    sub_font = ImageFont.load_default()

sub = "EDGE"
sbbox = draw.textbbox((0, 0), sub, font=sub_font)
sw = sbbox[2] - sbbox[0]
draw.text((cx - sw // 2, cy + th // 2 - sbbox[1] + 20), sub, font=sub_font, fill=(150, 200, 230))

img.save("assets/icon.png", "PNG")
print("OK assets/icon.png (1024x1024)")

# ── Splash 2732x2732 ─────────────────────────────────────────────────────────
SW = SH = 2732
splash = Image.new("RGB", (SW, SH), BG)
sdraw = ImageDraw.Draw(splash)

# Subtle glow blobs
scx, scy = SW // 2, SH // 2

# Large outer glow
for i in range(5):
    gr = 600 - i * 80
    alpha_val = 15 + i * 8
    sdraw.ellipse(
        [scx - gr, scy - gr - 200, scx + gr, scy + gr - 200],
        fill=(10 + i * 3, 30 + i * 5, 80 + i * 10)
    )

# "C3" large
try:
    big_font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 600)
except Exception:
    big_font = ImageFont.load_default()

text = "C3"
bbox = sdraw.textbbox((0, 0), text, font=big_font)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
tx = scx - tw // 2 - bbox[0]
ty = scy - th // 2 - bbox[1] - 150

sdraw.text((tx, ty), text, font=big_font, fill=CYAN)

# App name below
try:
    name_font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 160)
except Exception:
    name_font = ImageFont.load_default()

name = "Cash 3 Edge"
nbbox = sdraw.textbbox((0, 0), name, font=name_font)
nw = nbbox[2] - nbbox[0]
sdraw.text((scx - nw // 2, ty + th + 60), name, font=name_font, fill=WHITE)

# Tagline
try:
    tag_font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 90)
except Exception:
    tag_font = ImageFont.load_default()

tag = "Smart picks. Real edge."
tbbox = sdraw.textbbox((0, 0), tag, font=tag_font)
tw2 = tbbox[2] - tbbox[0]
sdraw.text((scx - tw2 // 2, ty + th + 60 + 200), tag, font=tag_font, fill=(120, 180, 210))

splash.save("assets/splash.png", "PNG")
print("OK assets/splash.png (2732x2732)")
print("\nDone! Now run:")
print("  npx capacitor-assets generate --assetPath assets")
print("  npx cap sync")
