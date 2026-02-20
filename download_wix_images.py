#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Download Wix static images referenced in HTML files,
save them locally under ./images/,
and rewrite HTML to use local paths.

Supports: jpg/jpeg/png/webp/avif (saves based on Content-Type).
"""

from __future__ import annotations

import os
import re
import sys
import time
import json
import hashlib
from pathlib import Path
from urllib.parse import urlparse

try:
    import requests
except ImportError:
    print("Missing dependency: requests\nRun: pip3 install requests")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent
IMAGES_DIR = ROOT / "images"
TIMEOUT = 30
SLEEP_BETWEEN = 0.15  # be polite to server
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari"

# Match Wix static media URLs
WIX_RE = re.compile(r"https?://static\.wixstatic\.com/media/[^\s\"'<>()]+", re.IGNORECASE)

CONTENT_TYPE_EXT = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
}

def sha1(s: str) -> str:
    return hashlib.sha1(s.encode("utf-8")).hexdigest()[:16]

def iter_html_files(root: Path):
    for p in root.rglob("*.html"):
        yield p

def extract_urls(html_text: str) -> list[str]:
    urls = WIX_RE.findall(html_text)
    # de-dupe while preserving order
    seen = set()
    out = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out

def guess_ext_from_headers(resp: requests.Response) -> str:
    ct = (resp.headers.get("Content-Type") or "").split(";")[0].strip().lower()
    return CONTENT_TYPE_EXT.get(ct, "")

def safe_slug_from_url(url: str) -> str:
    # Use a stable name based on URL hash; keep directory by project if possible
    return sha1(url)

def choose_subfolder_for_html(html_path: Path) -> Path:
    # Put images referenced in each HTML into subfolder based on its location/name
    # e.g. projects/le-cube-nul.html -> images/projects-le-cube-nul/
    rel = html_path.relative_to(ROOT)
    name = "-".join(rel.parts).replace(".html", "")
    name = re.sub(r"[^a-zA-Z0-9\-_]+", "-", name).strip("-")
    return IMAGES_DIR / (name or "root")

def download_one(session: requests.Session, url: str, out_dir: Path) -> Path | None:
    out_dir.mkdir(parents=True, exist_ok=True)

    # temp file name (no ext yet)
    base = safe_slug_from_url(url)
    tmp_path = out_dir / f"{base}.tmp"

    # If already downloaded (any ext), skip
    for ext in [".jpg", ".png", ".webp", ".avif"]:
        candidate = out_dir / f"{base}{ext}"
        if candidate.exists() and candidate.stat().st_size > 0:
            return candidate

    try:
        r = session.get(url, timeout=TIMEOUT, stream=True)
        r.raise_for_status()
        ext = guess_ext_from_headers(r) or (Path(urlparse(url).path).suffix.lower() if Path(urlparse(url).path).suffix else ".bin")
        if ext == ".jpeg":
            ext = ".jpg"

        final_path = out_dir / f"{base}{ext}"

        with open(tmp_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=1024 * 128):
                if chunk:
                    f.write(chunk)

        # sanity check
        if tmp_path.stat().st_size < 1024:
            tmp_path.unlink(missing_ok=True)
            print(f"  !! too small, skipped: {url}")
            return None

        tmp_path.replace(final_path)
        return final_path

    except Exception as e:
        print(f"  !! failed: {url}\n     {e}")
        return None
    finally:
        time.sleep(SLEEP_BETWEEN)

def rewrite_html(html_path: Path, mapping: dict[str, str]) -> None:
    txt = html_path.read_text(encoding="utf-8", errors="replace")
    def repl(m):
        u = m.group(0)
        return mapping.get(u, u)
    new_txt = WIX_RE.sub(repl, txt)
    if new_txt != txt:
        html_path.write_text(new_txt, encoding="utf-8")

def main():
    print(f"Root: {ROOT}")
    IMAGES_DIR.mkdir(exist_ok=True)

    html_files = list(iter_html_files(ROOT))
    if not html_files:
        print("No .html files found.")
        return

    # Collect URLs per HTML so we can group downloads
    urls_by_file: dict[Path, list[str]] = {}
    all_urls: set[str] = set()

    for hp in html_files:
        txt = hp.read_text(encoding="utf-8", errors="replace")
        urls = extract_urls(txt)
        if urls:
            urls_by_file[hp] = urls
            all_urls.update(urls)

    if not all_urls:
        print("No Wix image URLs found in HTML files.")
        return

    print(f"Found {len(all_urls)} unique Wix image URLs in {len(urls_by_file)} HTML files.")

    # Download and build mapping
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    mapping: dict[str, str] = {}
    downloaded_count = 0

    for hp, urls in urls_by_file.items():
        sub = choose_subfolder_for_html(hp)
        rel_sub = sub.relative_to(ROOT)

        print(f"\n== {hp.relative_to(ROOT)}")
        print(f"   -> images folder: {rel_sub}")

        for u in urls:
            if u in mapping:
                continue

            saved = download_one(session, u, sub)
            if saved:
                downloaded_count += 1
                # Use site-root absolute path so it works on GitHub Pages
                rel = saved.relative_to(ROOT).as_posix()
                mapping[u] = "/" + rel
                print(f"  OK {rel}")
            else:
                print(f"  SKIP {u}")

    # Save mapping for reference
    (ROOT / "wix_image_map.json").write_text(json.dumps(mapping, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nDownloaded: {downloaded_count} files")
    print("Saved mapping: wix_image_map.json")

    # Rewrite HTML files
    rewritten = 0
    for hp in html_files:
        before = hp.read_text(encoding="utf-8", errors="replace")
        rewrite_html(hp, mapping)
        after = hp.read_text(encoding="utf-8", errors="replace")
        if after != before:
            rewritten += 1

    print(f"Rewritten HTML files: {rewritten}")
    print("\nDONE ✅")
    print("Now commit & push the updated site (with /images/) to GitHub Pages.")

if __name__ == "__main__":
    main()