#!/usr/bin/env python3
"""Fetch GitHub metrics for YORU and update local JSON data files."""

import json
import os
import urllib.request
import urllib.error
from datetime import datetime, timezone

# Target repository
OWNER = "Kamikouchi-lab"
REPO = "YORU"

# Data directory (relative to repo root)
DATA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "dashboard", "data",
)

API_BASE = "https://api.github.com"


def get_token():
    return os.environ.get("YORU_GH_METRICS_TOKEN", "")


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def api_get(path, token=""):
    """GET from GitHub API. Returns parsed JSON or None on failure."""
    url = f"{API_BASE}{path}"
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "YORU-Metrics-Collector",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code} for {path}: {e.reason}")
        return None
    except urllib.error.URLError as e:
        print(f"  Network error for {path}: {e.reason}")
        return None
    except Exception as e:
        print(f"  Unexpected error for {path}: {e}")
        return None


def load_json(filepath):
    try:
        with open(filepath, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError, ValueError):
        return {}


def save_json(filepath, data):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")


def merge_daily_history(existing, new_entries):
    """Merge new daily entries into existing history, keyed by date string."""
    by_date = {}
    for entry in existing:
        d = entry.get("date", "")[:10]
        if d:
            by_date[d] = entry

    for entry in new_entries:
        ts = entry.get("timestamp", entry.get("date", ""))
        d = ts[:10] if ts else ""
        if d:
            by_date[d] = {"date": d, "count": entry.get("count", 0), "uniques": entry.get("uniques", 0)}

    return sorted(by_date.values(), key=lambda x: x["date"])


# --- Individual fetch functions ---

def fetch_repo_meta(token):
    print("Fetching repo metadata...")
    data = api_get(f"/repos/{OWNER}/{REPO}", token)
    if data is None:
        print("  Skipped")
        return

    meta = {
        "stars": data.get("stargazers_count", 0),
        "forks": data.get("forks_count", 0),
        "open_issues": data.get("open_issues_count", 0),
        "watchers": data.get("subscribers_count", 0),
        "last_updated": now_iso(),
    }

    contribs = api_get(f"/repos/{OWNER}/{REPO}/contributors?per_page=100&anon=true", token)
    if contribs and isinstance(contribs, list):
        meta["contributors"] = len(contribs)

    save_json(os.path.join(DATA_DIR, "repo_meta.json"), meta)
    print(f"  Stars={meta['stars']} Forks={meta['forks']}")


def fetch_releases(token):
    print("Fetching releases...")
    data = api_get(f"/repos/{OWNER}/{REPO}/releases?per_page=100", token)
    if data is None:
        print("  Skipped")
        return

    releases = []
    for rel in (data if isinstance(data, list) else []):
        assets = []
        total = 0
        for asset in rel.get("assets", []):
            dl = asset.get("download_count", 0)
            assets.append({
                "name": asset.get("name", ""),
                "download_count": dl,
                "size": asset.get("size", 0),
            })
            total += dl
        releases.append({
            "tag_name": rel.get("tag_name", ""),
            "name": rel.get("name", ""),
            "published_at": rel.get("published_at", ""),
            "prerelease": rel.get("prerelease", False),
            "assets": assets,
            "total_downloads": total,
        })

    save_json(os.path.join(DATA_DIR, "releases.json"), {
        "releases": releases,
        "last_updated": now_iso(),
    })
    print(f"  {len(releases)} releases found")


def fetch_traffic_clones(token):
    print("Fetching traffic/clones...")
    filepath = os.path.join(DATA_DIR, "traffic_clones.json")
    existing = load_json(filepath)

    data = api_get(f"/repos/{OWNER}/{REPO}/traffic/clones", token)
    if data is None:
        print("  Skipped")
        return

    merged = merge_daily_history(existing.get("history", []), data.get("clones", []))

    save_json(filepath, {
        "count": data.get("count", 0),
        "uniques": data.get("uniques", 0),
        "history": merged,
        "last_updated": now_iso(),
    })
    print(f"  {len(merged)} days of clone history")


def fetch_traffic_views(token):
    print("Fetching traffic/views...")
    filepath = os.path.join(DATA_DIR, "traffic_views.json")
    existing = load_json(filepath)

    data = api_get(f"/repos/{OWNER}/{REPO}/traffic/views", token)
    if data is None:
        print("  Skipped")
        return

    merged = merge_daily_history(existing.get("history", []), data.get("views", []))

    save_json(filepath, {
        "count": data.get("count", 0),
        "uniques": data.get("uniques", 0),
        "history": merged,
        "last_updated": now_iso(),
    })
    print(f"  {len(merged)} days of view history")


def fetch_referrers(token):
    print("Fetching referrers...")
    data = api_get(f"/repos/{OWNER}/{REPO}/traffic/popular/referrers", token)
    if data is None:
        print("  Skipped")
        return

    save_json(os.path.join(DATA_DIR, "referrers.json"), {
        "referrers": data if isinstance(data, list) else [],
        "last_updated": now_iso(),
    })
    print(f"  {len(data)} referrers")


def fetch_popular_paths(token):
    print("Fetching popular paths...")
    data = api_get(f"/repos/{OWNER}/{REPO}/traffic/popular/paths", token)
    if data is None:
        print("  Skipped")
        return

    save_json(os.path.join(DATA_DIR, "popular_paths.json"), {
        "paths": data if isinstance(data, list) else [],
        "last_updated": now_iso(),
    })
    print(f"  {len(data)} paths")


if __name__ == "__main__":
    token = get_token()
    if not token:
        print("WARNING: YORU_GH_METRICS_TOKEN not set.")
        print("Traffic APIs require authentication with push access.")
        print("Public endpoints (releases, repo metadata) will still be attempted.\n")

    os.makedirs(DATA_DIR, exist_ok=True)

    fetch_repo_meta(token)
    fetch_releases(token)

    if token:
        fetch_traffic_clones(token)
        fetch_traffic_views(token)
        fetch_referrers(token)
        fetch_popular_paths(token)
    else:
        print("\nSkipping traffic endpoints (requires authentication).")

    print("\nMetrics collection complete.")
