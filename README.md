# YORU's documents

The documentation site of [YORU](https://github.com/Kamikouchi-lab/YORU),
published at <https://kamikouchi-lab.github.io/YORU_doc/>.

It is a [Jekyll](https://jekyllrb.com/) site with the Lanyon layout (all
layouts, includes and styles are in this repository). The sister applications
have sites of their own in the same style:
[YORU Tracker](https://kamikouchi-lab.github.io/YORU-Tracker_doc/)
([repository](https://github.com/Kamikouchi-lab/YORU-Tracker_doc)) and
[YORU-Explain](https://kamikouchi-lab.github.io/YORU-Explain_doc/)
([repository](https://github.com/Kamikouchi-lab/YORU-Explain_doc)).

| Folder / file | Content |
|---|---|
| `home.md` | Home (published at `/`) |
| `beta.md` | Beta release notes |
| `_guides/` | User Guides, for the stable release (sidebar order: `order:` in the front matter) |
| `_beta_guides/` | Beta Guides, for the v2.0 betas |
| `_plugins/` | Trigger plugins |
| `_tutorial/` | Step-by-step Protocols |
| `_devnotes/` | Development notes |
| `ecosystem.html`, `_data/ecosystem.yml` | The YORU Ecosystem page. Every diagram on it is drawn from the data file; a new system is one new entry there. It also fills the sidebar's *Sister Applications* |
| `usage.html`, `dashboard/data/` | The usage dashboard; the data is refreshed daily by `.github/workflows/collect-metrics.yml` (see `DASHBOARD_SETUP.md`) |
| `troubleshootings.md`, `downloads.md`, `screenshots.md` | Q and A, Download Resources, Screenshots |
| `_config.yml` | `version` (stable) and `beta_version`, shown in the sidebar and on the Ecosystem page |
| `imgs/`, `logos/`, `public/` | Images, logos, favicon, CSS and JavaScript |

## Preview locally

GitHub Pages builds the site with the `github-pages` gem (Jekyll 3.10):

```
gem install github-pages webrick
jekyll serve
```

and open <http://127.0.0.1:4000/YORU_doc/>.

## Publish

`.github/workflows/jekyll-gh-pages.yml` builds and deploys the site on every
push to `main`. In the repository's **Settings → Pages**, **Source** is
**GitHub Actions**.
