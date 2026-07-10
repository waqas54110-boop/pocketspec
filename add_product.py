#!/usr/bin/env python3
"""
PocketSpec — Add Product Tool
------------------------------
Daraz product URL do, ye script product ka data nikaal ke
ready-to-paste HTML card bana deta hai, affiliate link ke saath.

Usage:
    python3 add_product.py "https://www.daraz.pk/products/xxx-i123456789.html"

Requirements (ek dafa install karo):
    pip install requests beautifulsoup4 --break-system-packages
"""

import sys
import re
import json
import html
from urllib.parse import quote

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Pehle ye chalao: pip install requests beautifulsoup4 --break-system-packages")
    sys.exit(1)

# ---------- APNA AFFILIATE ID (already tumhari site ke links mein hai) ----------
AFF_OFFER_ID = "164"
AFF_ID = "170889"
AFF_BASE = "https://go.urtrackinglink.com/aff_c"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}


def build_affiliate_link(daraz_url: str) -> str:
    encoded = quote(daraz_url, safe="")
    return (
        f"{AFF_BASE}?offer_id={AFF_OFFER_ID}&aff_id={AFF_ID}"
        f"&url={encoded}%3Fsub_id1%3D{{transaction_id}}%26sub_aff_id%3D{{affiliate_id}}"
    )


def scrape_product(url: str) -> dict:
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    data = {"title": None, "image": None, "price": None, "rating": None, "sold": None}

    # --- Open Graph tags (sabse reliable, Daraz ye usually deta hai) ---
    og_title = soup.find("meta", property="og:title")
    if og_title:
        data["title"] = og_title.get("content", "").strip()

    og_image = soup.find("meta", property="og:image")
    if og_image:
        data["image"] = og_image.get("content", "").strip()

    # --- Try JSON-LD structured data (price/rating aksar yahan hota hai) ---
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            payload = json.loads(script.string or "{}")
        except (json.JSONDecodeError, TypeError):
            continue
        items = payload if isinstance(payload, list) else [payload]
        for item in items:
            if not isinstance(item, dict):
                continue
            if item.get("@type") in ("Product", "Offer"):
                offers = item.get("offers", {})
                if isinstance(offers, dict):
                    data["price"] = data["price"] or offers.get("price")
                agg = item.get("aggregateRating", {})
                if isinstance(agg, dict):
                    data["rating"] = data["rating"] or agg.get("ratingValue")
                data["title"] = data["title"] or item.get("name")
                data["image"] = data["image"] or item.get("image")

    # --- Fallback: raw text regex for price (Rs. 1,234) agar upar wala fail ho ---
    if not data["price"]:
        m = re.search(r"Rs\.?\s?([\d,]+)", resp.text)
        if m:
            data["price"] = m.group(1).replace(",", "")

    return data


def make_card_html(product: dict, daraz_url: str, category: str) -> str:
    aff_link = build_affiliate_link(daraz_url)
    title = html.escape(product.get("title") or "PRODUCT NAME YAHAN LIKHO")
    price = product.get("price") or "0"
    image = product.get("image") or "images/placeholder.png"
    rating = product.get("rating")
    stars = "★" * round(float(rating)) + "☆" * (5 - round(float(rating))) if rating else "★★★★☆"

    return f"""
        <article class="card">
          <img class="card-img" src="{image}" alt="{title}">
          <div class="card-top"><span class="cat">{html.escape(category)}</span><span class="stars">{stars}</span></div>
          <h3>{title}</h3>
          <p class="desc">EDIT KARO: chhoti si description likho (specs, key feature).</p>
          <div class="pc">
            <div class="pros"><div class="lbl">Pros</div><ul><li>EDIT: pro 1</li><li>EDIT: pro 2</li></ul></div>
            <div class="cons"><div class="lbl">Cons</div><ul><li>EDIT: con 1</li><li>EDIT: con 2</li></ul></div>
          </div>
          <div class="card-foot"><span class="price">Rs. {price}</span><a class="buy" href="{aff_link}" rel="sponsored nofollow" target="_blank" data-product="{title}" data-slot="grid" onclick="trackClick(this)">View deal →</a></div>
        </article>
"""


def main():
    if len(sys.argv) < 2:
        print('Usage: python3 add_product.py "https://www.daraz.pk/products/..."')
        sys.exit(1)

    daraz_url = sys.argv[1]
    category = sys.argv[2] if len(sys.argv) > 2 else "New Pick"

    print("Product data nikal raha hoon...")
    try:
        product = scrape_product(daraz_url)
    except Exception as e:
        print(f"Scraping fail hui: {e}")
        print("Daraz kabhi kabhi bot-blocking karta hai. Manually fields neeche fill kar lena.")
        product = {}

    print("\n--- Mila hua data (check kar lo, galat ho to card mein khud edit kar lena) ---")
    print(json.dumps(product, indent=2, ensure_ascii=False))

    card_html = make_card_html(product, daraz_url, category)

    out_file = "new_product_card.html"
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(card_html)

    print(f"\n✅ Card ban gaya: {out_file}")
    print("Ye card open karo, EDIT wali lines fill karo, phir index.html ke")
    print('<div class="grid grid-4"> ... </div> ke andar paste kar do.')


if __name__ == "__main__":
    main()
