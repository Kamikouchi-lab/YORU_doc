---
layout: page
title: Q and A
order: 2
---

***
## Training steps

- We found "tourch.cuda.Out.OfMemoryError: CUDA out of memory" on terminal.

> This occurs when the mini-batch during training exceeds the GPU's memory capacity. Try smaler batch size.

## Model loading (training / analysis)

**Q. YORU fails to load YOLO weights with a `weights_only` / `Weights only load failed` error.**

**A.** Older `YORU.yml` environments pin `ultralytics==8.2.52`, which can fail with PyTorch 2.6+ because the default for `torch.load` changed to `weights_only=True` ([PyTorch documentation](https://docs.pytorch.org/docs/2.6/notes/serialization.html#torch-load-with-weights-only-true)).

- **Existing conda environment:** Activate the environment used to run YORU, then run `python -m pip install -U ultralytics` and restart YORU.
- **New installation (recommended):** Use the current YORU repository and run `uv sync`, then `uv run yoru` from its folder. Its [pyproject.toml](https://github.com/Kamikouchi-lab/YORU/blob/main/pyproject.toml) requires `ultralytics>=8.3.0`, excluding 8.2.52; `uv sync` uses the project's lockfile.

The cause is the dependency versions, not the choice of pip, conda, or uv.
