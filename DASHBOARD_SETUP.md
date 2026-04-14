# YORU Usage Dashboard — Setup Guide

The Usage Dashboard displays GitHub-sourced metrics for the YORU repository
directly on the documentation site. Data is collected automatically by a
GitHub Actions workflow and stored as JSON files in this repository.

## One-time setup

### 1. Create a Personal Access Token (PAT)

The GitHub Traffic API requires **push access** to the target repository.
Create a fine-grained PAT (or classic PAT) with the necessary permissions:

**Fine-grained token (recommended):**

1. Go to <https://github.com/settings/tokens?type=beta>
2. Click **Generate new token**
3. Set a descriptive name, e.g. `YORU metrics collector`
4. Set expiration (e.g. 1 year — remember to rotate before it expires)
5. Under **Repository access**, select **Only select repositories** →
   choose `Kamikouchi-lab/YORU`
6. Under **Permissions → Repository permissions**, grant:
   - **Contents**: Read-only
   - **Metadata**: Read-only (auto-selected)
7. Click **Generate token** and copy the value

> **Note:** The Traffic API (`/repos/{owner}/{repo}/traffic/*`) requires
> push access. If you use a fine-grained token, you may need to add
> **Administration: Read-only** or use a classic token with the `repo`
> scope instead.

**Classic token alternative:**

1. Go to <https://github.com/settings/tokens>
2. Click **Generate new token (classic)**
3. Select the `repo` scope (full control of private repositories)
4. Generate and copy the token

### 2. Add the token as a repository secret

1. Go to `https://github.com/Kamikouchi-lab/YORU_doc/settings/secrets/actions`
2. Click **New repository secret**
3. Name: `YORU_GH_METRICS_TOKEN`
4. Value: paste the PAT from step 1
5. Click **Add secret**

### 3. Verify the workflow

1. Go to the **Actions** tab of the `YORU_doc` repository
2. Find the **Collect YORU Metrics** workflow
3. Click **Run workflow** → **Run workflow** to trigger it manually
4. Check that it completes successfully and creates a commit with updated
   JSON files in `dashboard/data/`

After this, the workflow runs automatically every day at 02:15 UTC.

## What happens without the secret

- Public API endpoints (releases, repository metadata) still work and will
  populate stars, forks, contributor count, and release download data
- Traffic endpoints (clones, views, referrers, popular paths) will be
  skipped with a warning in the workflow logs
- The dashboard page itself will still load and display whatever data is
  available; missing sections show placeholder messages
- The site build and deploy will **not** fail

## Local testing

To preview the dashboard locally:

```bash
# Optional: run the metrics fetch locally
export YORU_GH_METRICS_TOKEN="ghp_your_token_here"
python scripts/fetch_github_metrics.py
python scripts/build_metrics_summary.py

# Serve with Jekyll
bundle exec jekyll serve
# or, if using GitHub Pages gem:
# gem install github-pages
# github-pages serve
```

Then open <http://localhost:4000/YORU_doc/usage/> in your browser.

## File overview

| Path | Purpose |
|------|---------|
| `usage.html` | Dashboard page (layout: dashboard) |
| `_layouts/dashboard.html` | Wide-container layout for dashboard |
| `public/css/dashboard.css` | Dashboard styles |
| `public/js/dashboard.js` | Client-side chart rendering |
| `dashboard/data/*.json` | Metrics data (auto-updated by CI) |
| `scripts/fetch_github_metrics.py` | Fetches metrics from GitHub API |
| `scripts/build_metrics_summary.py` | Builds summary from raw data |
| `.github/workflows/collect-metrics.yml` | Scheduled metrics collection + deploy |

## Data retention

Traffic API data (clones, views) is only available for the last 14 days
from GitHub. The fetch script merges new data into existing history files,
building a long-term record over time. Missing days (e.g., if the workflow
was paused) will simply be absent from the history — the dashboard and
summary calculations handle gaps gracefully.
