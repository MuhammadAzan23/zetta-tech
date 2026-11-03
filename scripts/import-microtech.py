"""Import the authorized Microtech catalog into the local Next.js site.

Run from the repository root with:
    python scripts/import-microtech.py
"""

from __future__ import annotations

import html
import json
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

import requests


BASE_URL = "https://microtech.net.pk/wp-json/wp/v2"
ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "lib" / "catalog.json"
IMAGE_DIR = ROOT / "public" / "catalog" / "images"
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "Zetta-Tech-authorized-catalog-import/1.0"})


def get_json(path: str, params: dict[str, Any] | None = None) -> tuple[Any, requests.Response]:
    for attempt in range(3):
        try:
            response = SESSION.get(f"{BASE_URL}/{path}", params=params, timeout=90)
            response.raise_for_status()
            return response.json(), response
        except requests.RequestException:
            if attempt == 2:
                raise
    raise RuntimeError("unreachable")


def fetch_pages(path: str, per_page: int = 100) -> list[dict[str, Any]]:
    first, response = get_json(path, {"per_page": per_page, "page": 1})
    pages = int(response.headers.get("X-WP-TotalPages", "1"))
    items = list(first)
    if pages == 1:
        return items

    def fetch(page: int) -> list[dict[str, Any]]:
        data, _ = get_json(path, {"per_page": per_page, "page": page})
        return data

    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = [pool.submit(fetch, page) for page in range(2, pages + 1)]
        for future in as_completed(futures):
            items.extend(future.result())
    return items


def clean_html(value: str) -> str:
    value = re.sub(r"<script\b[^>]*>.*?</script>", "", value, flags=re.I | re.S)
    value = re.sub(r"\s+data-(?:start|end|section-id)=\"[^\"]*\"", "", value)
    value = re.sub(r"\s+on[a-z-]+\s*=\s*(['\"]).*?\1", "", value, flags=re.I | re.S)
    return value.strip()


def text_from_html(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def image_name(media: dict[str, Any]) -> str:
    source = media.get("source_url", "")
    filename = Path(source.split("?")[0]).name or f"media-{media['id']}.webp"
    filename = re.sub(r"[^a-zA-Z0-9._-]", "-", filename)
    return f"{media['id']}-{filename}"


def download_media(media: dict[str, Any]) -> tuple[int, str] | None:
    source = media.get("source_url")
    if not source or not media.get("mime_type", "").startswith("image/"):
        return None
    filename = image_name(media)
    destination = IMAGE_DIR / filename
    if not destination.exists():
        for attempt in range(6):
            try:
                response = SESSION.get(source, timeout=90)
                if response.status_code == 429:
                    retry_after = response.headers.get("Retry-After")
                    delay = float(retry_after) if retry_after and retry_after.isdigit() else 5 * (attempt + 1)
                    time.sleep(min(delay, 60))
                    continue
                response.raise_for_status()
                destination.write_bytes(response.content)
                break
            except requests.RequestException as error:
                if attempt == 5:
                    print(f"Skipping media {media['id']} after retries: {error}")
                    return None
                time.sleep(min(5 * (attempt + 1), 60))
    return media["id"], f"/catalog/images/{filename}"


def main() -> int:
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    print("Fetching products...")
    products = fetch_pages("product", 100)
    print(f"Fetched {len(products)} products")
    print("Fetching categories and media...")
    categories = fetch_pages("product_cat", 100)
    media = fetch_pages("media", 100)
    category_by_id = {item["id"]: item for item in categories}
    product_ids = {item["id"] for item in products}
    product_media = [item for item in media if item.get("post") in product_ids]

    media_paths: dict[int, str] = {}
    with ThreadPoolExecutor(max_workers=3) as pool:
        futures = [pool.submit(download_media, item) for item in product_media]
        for index, future in enumerate(as_completed(futures), start=1):
            result = future.result()
            if result:
                media_paths[result[0]] = result[1]
            if index % 100 == 0:
                print(f"Downloaded {index}/{len(futures)} media files")

    # These are the source's top-level categories that represent manufacturers.
    brand_slugs = {
        "ai-tek", "cdata", "cisco", "corning", "dahua", "dinstar", "huawei-ekit",
        "imou", "linksys", "microlink", "microtech", "mikrotik", "ruijie-networks",
        "schneider", "ubiquiti", "vsol", "zkteco",
    }
    brands = [
        {
            "id": category["id"],
            "name": html.unescape(category["name"]),
            "slug": category["slug"],
            "productCount": category["count"],
        }
        for category in categories
        if category["parent"] == 0 and category["slug"] in brand_slugs
    ]
    brands.sort(key=lambda item: item["name"].lower())

    catalog_products = []
    for product in products:
        product_categories = [
            {
                "id": category_id,
                "name": html.unescape(category_by_id[category_id]["name"]),
                "slug": category_by_id[category_id]["slug"],
            }
            for category_id in product.get("product_cat", [])
            if category_id in category_by_id
        ]
        images = []
        featured_media = product.get("featured_media")
        if featured_media in media_paths:
            images.append(media_paths[featured_media])
        for item in product_media:
            if item.get("post") == product["id"] and item["id"] in media_paths and media_paths[item["id"]] not in images:
                images.append(media_paths[item["id"]])
        catalog_products.append(
            {
                "id": product["id"],
                "slug": product["slug"],
                "name": html.unescape(product["title"]["rendered"]),
                "excerpt": clean_html(product.get("excerpt", {}).get("rendered", "")),
                "description": clean_html(product.get("content", {}).get("rendered", "")),
                "categories": product_categories,
                "images": images,
                "sourceUrl": product["link"],
                "modified": product["modified"],
            }
        )
    catalog_products.sort(key=lambda item: item["name"].lower())

    payload = {
        "source": "https://microtech.net.pk/",
        "importedAt": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        "categories": [
            {
                "id": item["id"],
                "name": html.unescape(item["name"]),
                "slug": item["slug"],
                "parent": item["parent"],
                "count": item["count"],
            }
            for item in categories
        ],
        "brands": brands,
        "products": catalog_products,
    }
    CATALOG_PATH.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {CATALOG_PATH} ({CATALOG_PATH.stat().st_size / 1024 / 1024:.1f} MB)")
    print(f"Saved {len(media_paths)} product images")
    return 0


if __name__ == "__main__":
    sys.exit(main())
