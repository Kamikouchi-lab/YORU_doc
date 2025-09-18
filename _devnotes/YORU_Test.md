---
layout: page
title: YORU Testing Guide (pytest)
---



This page lists the **minimal** steps to verify the YORU test suite.  
Run these commands at the **repository root** (the directory where `yoru/` is visible).

---

## 1) Prerequisites
```bash
python -m pip install -e .[dev]   # installs pytest and dev deps
pytest --version
```

---

## 2) Fast default check
Exclude GUI / hardware / heavy tests and just confirm nothing is broken.

```bash
pytest -m "not gui and not hw and not slow"
```

**Pass criteria**: `failed=0 errors=0`. (`skipped` is fine.)

---

## 3) CLI basics (no‑patch add‑on tests)
Assumes you have `tests_extra/test_cli_basics_nopatch.py` in your tree.

```bash
pytest -m "not hw" tests_extra/test_cli_basics_nopatch.py
```
**What to look for**
- `python -m yoru --help` exits **0** and prints text containing “YORU/yoru”
- `python -m yoru -V` exits **0** and prints `X.Y.Z` or `0+unknown`
- If `yoru/__init__.py` contains a relative `sys.path.append("../yoru")`, the in‑process check is **skipped** (that is expected).

---

## 4) Trigger plugin API shape (no‑patch)
Assumes you have `tests_extra/test_trigger_plugins_api.py` in your tree.

```bash
pytest -m "not hw" tests_extra/test_trigger_plugins_api.py
```
**Pass criteria** for each `trigger_plugins/*.py`:
- A class named `trigger_condition` exists
- It has a callable method `trigger(...)` with **≥ 6 parameters**

---

## 5) Smoke runs (optional)
Use tiny data to confirm “end‑to‑end runs” only. These are slow; you can skip in routine checks.

```bash
# Example (adapt to your Python API / CLI wrappers)
export YORU_SMOKE_WEIGHTS=/path/to/tiny.pt
export YORU_SMOKE_DATA=/path/to/small_dataset

# inference only (marked as @slow)
pytest -k inference_smoke -m "slow and not gui and not hw"

# training only
pytest -k training_smoke -m "slow and not gui and not hw"
```

**Pass criteria (examples):**
- Inference: output directory is created and contains at least one file
- Training: a checkpoint/log is produced

---

## 6) Quick triage on failures
- CLI help fails → check for heavy imports at the top of `yoru/cli.py`; move them into subcommands (lazy import).
- Plugin import errors for `serial` / `nidaqmx` / `libs.arduino` → ensure test stubs in `tests/conftest.py` are active.
- Weird OS‑specific failures → first isolate with `pytest -m "not gui and not hw"`.
