#!/usr/bin/env python3
"""Build summary.json from collected metrics data files."""

import json
import os
from datetime import datetime, timedelta, timezone

DATA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "dashboard", "data",
)


def load_json(filepath):
    try:
        with open(filepath, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError, ValueError):
        return {}


def save_json(filepath, data):
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")


def sum_last_30d(history):
    """Sum count/uniques from history entries within the last 30 days."""
    cutoff = (datetime.now(timezone.utc) - timedelta(days=30)).strftime("%Y-%m-%d")
    recent = [e for e in history if e.get("date", "") >= cutoff]
    return {
        "count": sum(e.get("count", 0) for e in recent),
        "uniques": sum(e.get("uniques", 0) for e in recent),
    }


def build():
    clones = load_json(os.path.join(DATA_DIR, "traffic_clones.json"))
    views = load_json(os.path.join(DATA_DIR, "traffic_views.json"))
    releases = load_json(os.path.join(DATA_DIR, "releases.json"))
    meta = load_json(os.path.join(DATA_DIR, "repo_meta.json"))

    clone_history = clones.get("history", [])
    view_history = views.get("history", [])
    clones_30d = sum_last_30d(clone_history)
    views_30d = sum_last_30d(view_history)

    total_clones = sum(e.get("count", 0) for e in clone_history)
    total_views = sum(e.get("count", 0) for e in view_history)

    total_downloads = sum(
        r.get("total_downloads", 0)
        for r in releases.get("releases", [])
    )

    summary = {
        "total_release_downloads": total_downloads,
        "total_clones": total_clones,
        "total_views": total_views,
        "clones_30d": clones_30d["count"],
        "unique_cloners_30d": clones_30d["uniques"],
        "views_30d": views_30d["count"],
        "unique_visitors_30d": views_30d["uniques"],
        "stars": meta.get("stars", 0),
        "forks": meta.get("forks", 0),
        "contributors": meta.get("contributors", 0),
        "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }

    out = os.path.join(DATA_DIR, "summary.json")
    save_json(out, summary)
    print("Summary built:")
    for k, v in summary.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    build()
