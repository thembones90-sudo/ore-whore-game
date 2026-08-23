"""Extract the canonical 5x3 mineral contact sheet into transparent sprites."""

from collections import deque
from pathlib import Path
import sys

import numpy as np
from PIL import Image, ImageFilter


IDS = [
    "malachite", "tigerseye", "shadowgem", "mossagate", "jade",
    "moonstone", "citrine", "aquamarine", "starruby", "vitriol",
    "largeopal", "sapphire", "diamond", "emerald", "arcane",
]


def edge_background_mask(rgb: np.ndarray) -> np.ndarray:
    """Select only edge-connected near-neutral checkerboard pixels."""
    spread = rgb.max(axis=2).astype(np.int16) - rgb.min(axis=2).astype(np.int16)
    candidate = (spread <= 10) & (rgb.mean(axis=2) >= 224)
    height, width = candidate.shape
    background = np.zeros_like(candidate)
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        if candidate[0, x]: queue.append((0, x))
        if candidate[height - 1, x]: queue.append((height - 1, x))
    for y in range(height):
        if candidate[y, 0]: queue.append((y, 0))
        if candidate[y, width - 1]: queue.append((y, width - 1))
    while queue:
        y, x = queue.popleft()
        if background[y, x] or not candidate[y, x]:
            continue
        background[y, x] = True
        if y: queue.append((y - 1, x))
        if y + 1 < height: queue.append((y + 1, x))
        if x: queue.append((y, x - 1))
        if x + 1 < width: queue.append((y, x + 1))
    return background


def keep_largest_component(alpha: Image.Image) -> Image.Image:
    """Discard disconnected glow/checker remnants while retaining the specimen."""
    opaque = np.asarray(alpha) > 48
    height, width = opaque.shape
    seen = np.zeros_like(opaque)
    components: list[list[tuple[int, int]]] = []
    for start_y, start_x in zip(*np.where(opaque & ~seen)):
        if seen[start_y, start_x]:
            continue
        queue = deque([(int(start_y), int(start_x))])
        component: list[tuple[int, int]] = []
        while queue:
            y, x = queue.popleft()
            if seen[y, x] or not opaque[y, x]:
                continue
            seen[y, x] = True
            component.append((y, x))
            if y: queue.append((y - 1, x))
            if y + 1 < height: queue.append((y + 1, x))
            if x: queue.append((y, x - 1))
            if x + 1 < width: queue.append((y, x + 1))
        components.append(component)
    keep = max(components, key=len)
    keep_mask = np.zeros_like(opaque)
    for y, x in keep:
        keep_mask[y, x] = True
    cleaned = np.where(keep_mask, np.asarray(alpha), 0).astype(np.uint8)
    return Image.fromarray(cleaned, "L")


def main() -> None:
    source = Image.open(sys.argv[1]).convert("RGB")
    output = Path(sys.argv[2])
    output.mkdir(parents=True, exist_ok=True)
    width, height = source.size
    for index, mineral_id in enumerate(IDS):
        row, column = divmod(index, 5)
        left, right = round(column * width / 5), round((column + 1) * width / 5)
        top, bottom = round(row * height / 3), round((row + 1) * height / 3)
        cell = source.crop((left, top, right, bottom))
        rgb = np.asarray(cell)
        background = edge_background_mask(rgb)
        alpha = Image.fromarray(np.where(background, 0, 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(.65))
        alpha = keep_largest_component(alpha)
        rgba = cell.convert("RGBA")
        rgba.putalpha(alpha)
        bbox = alpha.getbbox()
        if not bbox:
            raise RuntimeError(f"No specimen found for {mineral_id}")
        specimen = rgba.crop(bbox)
        max_size = 440
        specimen.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
        canvas.alpha_composite(specimen, ((512 - specimen.width) // 2, (512 - specimen.height) // 2))
        canvas.save(output / f"mineral-{mineral_id}.png", optimize=True)
        canvas.save(output / f"mineral-{mineral_id}.webp", "WEBP", lossless=True, method=6)


if __name__ == "__main__":
    main()
