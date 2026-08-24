from collections import deque
from pathlib import Path
from PIL import Image

SOURCE = Path(r"C:\Users\user\.codex\generated_images\01a026a3-9294-70a0-ab21-dda120353dc6\exec-f0ef9a80-f7e7-4bad-8094-392485a59f1e.png")
OUTPUT = Path(__file__).parents[1] / "public" / "assets" / "true" / "alijas-shovel.webp"

image = Image.open(SOURCE).convert("RGBA")
pixels = image.load()
width, height = image.size

def is_checker(x: int, y: int) -> bool:
    r, g, b, _ = pixels[x, y]
    return min(r, g, b) >= 200 and max(r, g, b) - min(r, g, b) <= 10

outside = bytearray(width * height)
queue: deque[tuple[int, int]] = deque()
for x in range(width):
    for y in (0, height - 1):
        if is_checker(x, y): queue.append((x, y))
for y in range(height):
    for x in (0, width - 1):
        if is_checker(x, y): queue.append((x, y))

while queue:
    x, y = queue.popleft()
    index = y * width + x
    if outside[index] or not is_checker(x, y):
        continue
    outside[index] = 1
    if x: queue.append((x - 1, y))
    if x + 1 < width: queue.append((x + 1, y))
    if y: queue.append((x, y - 1))
    if y + 1 < height: queue.append((x, y + 1))

for y in range(height):
    for x in range(width):
        if outside[y * width + x]:
            r, g, b, _ = pixels[x, y]
            pixels[x, y] = (r, g, b, 0)

bounds = image.getbbox()
if not bounds:
    raise RuntimeError("Background extraction removed the entire asset")
left, top, right, bottom = bounds
padding = 28
left, top = max(0, left - padding), max(0, top - padding)
right, bottom = min(width, right + padding), min(height, bottom + padding)
image = image.crop((left, top, right, bottom))
image.thumbnail((1280, 1280), Image.Resampling.LANCZOS)
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
image.save(OUTPUT, "WEBP", quality=94, method=6)
print(OUTPUT)
print(image.mode, image.size, image.getchannel("A").getextrema())
