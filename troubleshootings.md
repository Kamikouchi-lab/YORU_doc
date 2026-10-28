---
layout: page
title: Q and A
order: 2
---

> When you report a problem on [GitHub Issues](https://github.com/Kamikouchi-lab/YORU/issues), please attach the log file `~/.yoru/logs/yoru.log` (`%USERPROFILE%\.yoru\logs\yoru.log` on Windows). From v1.1.2 and v2.0.0-beta.3 it holds the full traceback of every error that the GUIs catch.

***
## Installation and startup

**Q. The launcher stops with `EnvironmentError: Can't find Google Chrome/Chromium installation`.** (v1.1.x)

**A.** The v1.1.x launcher opens in Google Chrome or Chromium. Install one of them. Microsoft Edge and Safari are not detected. The v2.0 betas do not need a browser.

**Q. Do I need to install the CUDA toolkit?**

**A.** No. Only the NVIDIA driver is needed (527.41 or newer on Windows, 525.60.13 or newer on Linux). The PyTorch wheels carry their own CUDA runtime. Check the driver with `nvidia-smi`. The CUDA 12.8 build that v2.0.0-beta.4 uses needs driver 570 or newer.

**Q. A YORU screen closes immediately after it opens, and nothing is written to `yoru.log`.**

**A.** An error while a screen is starting up can close its console before it is logged. Run that screen directly from a terminal to see the error, for example `python -m yoru.train_GUI`, and always launch YORU from the repository root.

**Q. `import cv2` fails after I installed or upgraded packages myself.**

**A.** `opencv-python` 4.10 is built against NumPy 1.x, so NumPy 2 breaks it. YORU's environment files cap NumPy below 2. If NumPy 2 was pulled in by another package, run `pip install "numpy<2"` in the YORU environment (or run `uv sync` again with uv).

**Q. `uv sync` fails on macOS while compiling a package.**

**A.** Some dependencies have no Apple Silicon wheels and are compiled during the sync. Install the Xcode Command Line Tools first with `xcode-select --install`, then run `uv sync` again.

**Q. Can I keep using my Beta 2 conda environment for v2.0.0-beta.3?**

**A.** No. Beta 3 moved from Python 3.9 to 3.10, and updating an environment in place is not reliable across a Python version change. Recreate the environment, as described in the [Beta Install guide]({{ site.baseurl }}/beta-guides/01-install/#upgrading-from-beta-2). uv users only need to run `uv sync`.

**Q. Can I keep using my Beta 3 conda environment for v2.0.0-beta.4?**

**A.** Yes. Python stays at 3.10 and `YORU.yml` has not changed. Install the CUDA 12.8 build of PyTorch in it, as described in the [Beta Install guide]({{ site.baseurl }}/beta-guides/01-install/#upgrading-from-beta-3). uv users only need to run `uv sync`.

## GPU and compute device

**Q. CUDA calls fail with `no kernel image is available` on an RTX 50-series (Blackwell) GPU.**

**A.** The PyTorch build has no kernels for these cards. **v2.0.0-beta.4** uses the CUDA 12.8 build on both routes, which supports them: with uv, check out the tag and run `uv sync`; with conda, install it as in the [Beta Install guide]({{ site.baseurl }}/beta-guides/01-install/#fresh-install-with-conda). It needs driver 570 or newer. With v1.1.2 or an earlier beta on uv, whose lockfile pins a CUDA 12.4 build, set `YORU_DEVICE=cpu`, or use the conda route and install a CUDA 12.8 build of PyTorch.

**Q. How do I choose between GPU and CPU?**

**A.** From v1.1.2, YORU picks CUDA, then Apple MPS, then the CPU. To choose yourself, set `YORU_DEVICE` (`cuda`, `mps`, `cpu`, or a CUDA index such as `0`) before launching, or use the **Device** selector in the Training GUI. See [Install]({{ site.baseurl }}/guides/01-install/#choosing-the-compute-device).

**Q. Real-time detection on my Mac is slower on MPS than I expected.**

**A.** MPS speeds up training, but for real-time inference with the small YOLO models it is not faster than the CPU. Try `YORU_DEVICE=cpu`.

## Training steps

**Q. We found "torch.cuda.OutOfMemoryError: CUDA out of memory" on the terminal.**

**A.** This occurs when the mini-batch during training exceeds the GPU's memory capacity. Try a smaller batch size. In the v2.0 betas, the Training GUI estimates GPU memory before a run starts and offers the largest batch expected to fit.

**Q. LabelImg from v1.1.x no longer starts after I used the v2.0 beta.**

**A.** Both versions share the settings file `~/.labelImgSettings.pkl`. After the beta's bundled LabelImg has saved its settings there, the LabelImg used by v1.1.x can fail to start. Delete or rename `~/.labelImgSettings.pkl` (`%USERPROFILE%\.labelImgSettings.pkl` on Windows). It only stores LabelImg's preferences, not your labels.

**Q. OBB training stops with `OBB dataset incorrectly formatted`.** (v2.0.0-beta.3 and later)

**A.** The dataset mixes ordinary (5-field) and OBB (9-field) label files. In an OBB session, opening an ordinary label file switches LabelImg to plain YOLO, and boxes saved after that lose their angle. Relabel those files as rotated boxes, or remove them from the dataset. See [Beta: Training]({{ site.baseurl }}/beta-guides/02-training/#oriented-bounding-boxes-obb).

## Model loading (training / analysis)

**Q. YORU fails to load YOLO weights with a `weights_only` / `Weights only load failed` error.**

**A.** The conda `YORU.yml` of v1.1.x pins `ultralytics==8.2.52`, which can fail with PyTorch 2.6+ because the default for `torch.load` changed to `weights_only=True` ([PyTorch documentation](https://docs.pytorch.org/docs/2.6/notes/serialization.html#torch-load-with-weights-only-true)).

- **Existing conda environment:** Activate the environment used to run YORU, then run `python -m pip install -U ultralytics` and restart YORU.
- **New installation (recommended):** Use the current YORU repository and run `uv sync`, then `uv run yoru` from its folder. Its [pyproject.toml](https://github.com/Kamikouchi-lab/YORU/blob/main/pyproject.toml) requires `ultralytics>=8.3.0`, excluding 8.2.52; `uv sync` uses the project's lockfile.

The cause is the dependency versions, not the choice of pip, conda, or uv.

**Q. My YOLOv5 model does not load in the v2.0 beta.**

**A.** Use **v2.0.0-beta.4** or later. Betas 2 and 3 could not load YOLOv5 `.pt` weights; Beta 4 bundles YOLOv5 again, loads models trained with YORU v1, and gives the same boxes as v1. Leave `yolo_model_type` on `auto`, or set it to `yolov5`. See [Beta: Training]({{ site.baseurl }}/beta-guides/02-training/#yolov5).

## Real-time process

**Q. The TTL signal does not come out of the pin set in `trigger_pin`.** (v1.1.x)

**A.** v1.1.x always outputs the TTL signal on Arduino digital pin 13 and does not apply `trigger_pin` or `trigger_threshold_configuration`. Wire the output to pin 13. Both settings are applied in the v2.0 betas.
