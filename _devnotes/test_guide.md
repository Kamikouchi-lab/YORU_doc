---
layout: page
title: YORU Testing Guide (pytest)
---


This page documents the pytest-based test suite for **YORU**, taking into account the project’s `pytest.ini` defaults. It explains **how to run** the tests, **what they cover**, and **how to extend** them for your workflow and CI.

---

## Defaults from `pytest.ini`

The repository configures pytest like this:

```ini
[pytest]
addopts = -vv -rA
testpaths = tests
markers =
    gui: tests that require a GUI window
    hw: tests that require hardware (camera, Arduino, etc.)
    slow: slow or heavy tests (training/inference)
```

- **Verbosity & report**: `-vv -rA` are applied by default; you’ll see verbose output and reasons for all outcomes (passes, failures, errors, skips, xfails).
- **Discovery root**: test collection happens under `tests/` by default.
- **Markers**: `gui`, `hw`, and `slow` are standard across the suite.

> You can still override or add flags at the command line (e.g., `-q` for quiet, `--maxfail=1`, etc.).

---

## What the tests cover

We organize checks into four practical “layers” to catch problems early while keeping the default run fast:

1. **Config & Layout**
   - Ensures repo structure and `config/template.yaml` exist.
   - Validates the template’s **shape** and key presence, and (optionally) validates against a **JSON Schema** if `jsonschema` is installed.
2. **Entry points (CLI)**
   - Confirms `python -m yoru --help` exits successfully and quickly (no heavy imports at top-level CLI).
3. **Trigger plugin import sanity**
   - Verifies every `trigger_plugins/*.py` is importable **without real hardware**.
   - Tests inject **stubs** for `pyserial` (`serial.tools.list_ports`), `libs.arduino`, and NI‑DAQ (`nidaqmx.constants`, `nidaqmx.errors.DaqError`) so imports succeed.
4. **Runtime smokes** (optional; marked `@slow`)
   - **Inference smoke**: creates small dummy images and runs a single inference pass against a **tiny** `.pt` to assert “no crash”.
   - **Training smoke**: minimal CPU run (~1 epoch on ~10–20 images) to ensure a **checkpoint/log** is produced.

These layers together protect: **config → startup → inference path → training path**.

---

## How to run

Because `pytest.ini` already enables `-vv -rA`, you can keep the CLI short.

### Fast (default) layer — CI-friendly
Exclude `gui` and `hw` by default; also exclude `slow` unless you explicitly want the smokes:

```bash
pytest -m "not gui and not hw and not slow"
```

### Show just a concise dot/skip/fail stream
```bash
pytest -q -m "not gui and not hw and not slow"
```

### See skip reasons and full summaries
(Already included by default via `-rA`, but you can combine with selection as needed)
```bash
pytest -m "not gui and not hw" -rA
```

### Time profiling (top 10 slow tests)
```bash
pytest -m "not gui and not hw" --durations=10
```

### See `print()` output live (disable capture)
```bash
pytest -m "not gui and not hw" -s
```

---

## Progress display (optional)

A compact progress line is available via a small plugin shipped under `tests/conftest.py`.

- Auto-enables only on TTY; you can force it:
  ```bash
  pytest --progress=on
  ```
- Disable explicitly:
  ```bash
  pytest --progress=off
  ```

The line shows a live bar and counts (✓ passed / ✗ failed / ~ skipped).

---

## Runtime smoke tests (optional, `@slow`)

These are **off by default**; enable on demand by selecting the marks and by providing small test assets.

### Inference smoke
- Purpose: ensure inference code path doesn’t crash on **dummy images** and a **tiny model**.
- Requirements:
  - `Pillow` (`pip install pillow`)
  - A tiny `.pt` file (set as env var)

Run:
```bash
export YORU_SMOKE_WEIGHTS=weights/tiny.pt   # path to a very small model file
pytest -k inference_smoke -m "slow and not gui and not hw"
```

### Training smoke
- Purpose: ensure the minimal training loop writes a checkpoint/log on **CPU**.
- Requirements:
  - A tiny training dataset (~10–20 images) (set as env var)

Run:
```bash
export YORU_SMOKE_DATA=/path/to/small_dataset
pytest -k training_smoke -m "slow and not gui and not hw"
```

#### Fallback CLI route
Both smokes can optionally call a CLI if a small Python API isn’t available. Provide templates via:

- `YORU_SMOKE_CMD` — e.g. `python -m yoru infer --input {images} --weights {weights} --out {out}`
- `YORU_TRAIN_CMD` — e.g. `python -m yoru train --data {data} --epochs {epochs} --out {out} --device cpu`

The tests will prefer `yoru.testing.run_inference(...)` / `yoru.testing.run_training(...)` if present; otherwise they expand the above templates and run a subprocess.

---

## What each test file does

- **`tests/test_repo_layout.py`** — Basic repository shape and presence checks for required files.
- **`tests/test_imports.py`** — `import yoru` and (optionally) `import yoru.__main__` must succeed.
- **`tests/test_cli_help.py`** (`@gui`) — `python -m yoru --help` returns 0 (fast, no top-level heavies).
- **`tests/test_config_template.py`** — Validates the template YAML’s top‑level keys and nested sections.
- **`tests/test_config_schema.py`** — Strict JSON‑Schema validation (skips if `jsonschema` is not installed).
- **`tests/test_trigger_plugins_import.py`** — Discovers `trigger_plugins/*.py` and asserts they are importable under hardware stubs.
- **`tests/test_inference_smoke.py`** (`@slow`) — “does not crash” inference with dummy images and a tiny model.
- **`tests/test_training_smoke.py`** (`@slow`) — “writes artifacts” training on CPU for 1 epoch.

---

## Extending the test suite

### 1) Add a new trigger plugin
- Place your file under `trigger_plugins/my_plugin.py`.
- **Avoid heavy side effects at import time** (defer I/O/hardware open to functions).
- If you import additional device libraries, extend the test stubs in `tests/conftest.py`:
  ```python
  # inside fake_serial() in conftest.py
  import types, sys
  myhw = types.ModuleType("myhw"); myhw.__path__ = []  # package if submodules are used
  sys.modules["myhw"] = myhw  # and any myhw.submodule you need
  ```

### 2) Add a new CLI test
- Implement the subcommand in `yoru/cli.py` (keep imports lazy).
- Add a test:
  ```python
  def test_newcmd_help():
      proc = subprocess.run([sys.executable, "-m", "yoru", "newcmd", "--help"], check=False, capture_output=True, text=True)
      assert proc.returncode == 0
      assert "New command description" in proc.stdout
  ```

### 3) Tighten YAML validation
- Maintain a JSON Schema (e.g., `tests/schema/yoru_config.schema.json`) that matches the public template.
- Use `anyOf` when introducing new names/fields to keep backward compatibility.

### 4) Provide small Python APIs for smokes (recommended)
Provide thin wrappers so both CLI and tests can reuse them:

```python
# yoru/testing.py
def run_inference(images_dir: str, weights_path: str, out_dir: str) -> None: ...
def run_training(data_dir: str, out_dir: str, epochs: int = 1, device: str = "cpu") -> None: ...
```

The smoke tests auto-detect these functions; otherwise they fall back to the CLI templates.

### 5) CI integration
Example (GitHub Actions):

```yaml
name: tests
on: [push, pull_request]
jobs:
  fast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.10' }
      - run: pip install -U pip pytest pyyaml jsonschema pillow
      - run: pytest -m "not gui and not hw and not slow"
  smoke:
    if: github.event_name == 'schedule' || github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.10' }
      - run: pip install -U pip pytest pyyaml pillow
      - run: |
          echo "No tiny weights/data provided on CI → skip smokes by design"
          pytest -k "inference_smoke or training_smoke" -m "slow and not gui and not hw" || true
```

---

## Troubleshooting

- **UnicodeDecodeError when reading YAML**  
  Hidden characters (BOM/NBSP/zero‑width space) can corrupt YAML. Clean the file or sanitize before parsing.

- **ModuleNotFoundError for `serial`, `nidaqmx`, `libs.arduino` during plugin imports**  
  The tests inject stubs under `tests/conftest.py`. If your plugin imports new modules (`nidaqmx.something`, custom `myhw`), add a minimal stub there.

- **CLI help test fails**  
  Keep heavy imports out of the top of `yoru/cli.py`. Import frameworks lazily inside subcommands.

---

## Summary

- **Run**: `pytest -m "not gui and not hw and not slow"` for the fast layer; markers come from `pytest.ini`.  
- **Extend**: add plugins, CLI tests, JSON‑Schema rules, or small Python APIs.  
- **Opt‑in smokes**: add tiny weights/data and run `@slow` tests when you need end‑to‑end checks.
