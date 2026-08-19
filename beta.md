---
layout: page
title: Beta Release Notes
order: 10
---

## YORU v2.0.0-beta.2

> **Pre-release software.** This version targets the `develop4` branch and may contain bugs. For general lab use, **v1.1.1 remains the recommended stable release**. Feedback and bug reports via [GitHub Issues](https://github.com/Kamikouchi-lab/YORU/issues) are welcome.

Released 2026-08-19 — [release page](https://github.com/Kamikouchi-lab/YORU/releases/tag/v2.0.0-beta.2)

To use this beta version, check out the corresponding tag:

```
git checkout v2.0.0-beta.2
```

### Highlights

- **Google Chrome is no longer required.** The launcher opens in a native window (pywebview) instead of a browser page served over `localhost:8889`. Because of this, **you must update your environment before YORU will start**.
- **The bundled YOLOv5 code has been removed.** Detection and training now run through a plugin system built on the `ultralytics` package, torchvision, and a new **ONNX** backend. YOLOv5 is no longer trainable, and old YOLOv5 `.pt` files can no longer be loaded.
- **The Training GUI estimates GPU memory before a run starts**, and a run can be ended cleanly with "Stop after this epoch" instead of being killed. In addition, a number of substantive bugs were fixed — the closed-loop trigger ignored both the confidence threshold and the pin number, screen-capture mode fed broken frames to the detector, and the Video Analysis window froze while working.

---

### Installation and Upgrading

#### Upgrading from Beta 1 (conda)

This step is **required** — the launcher will not start otherwise.

```
conda activate yoru
conda env update -f YORU.yml --prune
python -m yoru
```

#### Fresh install (conda)

Google Chrome is no longer a prerequisite.

```
git clone https://github.com/Kamikouchi-lab/YORU.git
cd YORU
git checkout v2.0.0-beta.2
conda env create -f YORU.yml
conda activate yoru
python -m yoru
```

#### Alternative: install with uv

`uv` resolves everything from `pyproject.toml` / `uv.lock`, so the conda environment creation and the manual PyTorch step are not needed.

```
cd Path/to/YORU
uv sync
uv run python -m yoru
```

#### GPU note

The PyTorch install line in the README covers CUDA 11.8 and 12.1. RTX 50-series (Blackwell) cards need a newer build — see `working-example.md` in the repository, which records a working RTX 5070 Ti setup on torch 2.8.0+cu128.

#### After upgrading, check

1. The `trigger_pin` value in every condition file (breaking change 3).
2. Your `trigger_threshold_configuration` values (breaking change 4).
3. Any script that points at `<project>/train/weights/best.pt` (breaking change 5).

---

### Breaking Changes

#### 1. You must update your environment before YORU will start

The launcher moved from Eel to pywebview, and `onnxruntime` was added. An environment created for Beta 1 has neither, so `python -m yoru` stops with:

```
[yoru] failed to import yoru.app.main: No module named 'webview'
```

Run `conda env update -f YORU.yml --prune` to fix it. The launch command itself is **unchanged**: `python -m yoru` (or the `yoru` command). Google Chrome is no longer required, and nothing opens a network port any more.

#### 2. YOLOv5 models can no longer be trained, and old YOLOv5 weights no longer load

The vendored `yoru/libs/yolov5/` tree was removed. What to do with an existing YOLOv5 model:

- **To keep using it for detection:** export it to ONNX with the upstream YOLOv5 repository, then point `yolo_model_path` in your condition file at the `.onnx` file. The new ONNX backend understands the YOLOv5 output layout and is selected automatically from the file extension.
- **Otherwise:** retrain with **YOLOv8** or **YOLO11** in the Training GUI. Opening a v1.x / Beta 1 project does not error — the GUI swaps `yolov5s.pt` for `yolo11s.pt` (same size letter) and prints a notice — but the run starts from scratch and the results are not comparable to a YOLOv5 baseline.
- Condition files that still say `yolo_model_type: yolov5` keep loading (the name is aliased to `ultralytics`); it is the old weight *file* that cannot be read.

#### 3. Check `trigger_pin` in your condition files

Beta 1 hard-coded the TTL output to digital pin **13** and silently ignored the `trigger_pin` value in your file. Beta 2 actually uses it. **If any of your condition files sets `trigger_pin` to something other than 13, that pin is what will now fire** — edit the YAML or rewire before your next experiment. Files with no `trigger_pin` key still default to 13.

#### 4. Your closed-loop trigger will fire less often

`trigger_threshold_configuration` was loaded but never read in Beta 1, so the trigger fired on *any* detection of the trigger class regardless of confidence. It is now applied. With the shipped values (0.3–0.5), expect fewer firings from an unchanged config. If you had raised the threshold to compensate for it being ignored, lower it back to the value you actually want.

#### 5. Trained models are now saved in `exp_<model>/`, not `train/`

Look for the weights in `<project>/exp_yolo11s/weights/best.pt` (YOLO / RT-DETR) or `<project>/exp_fasterrcnn/fasterrcnn_best.pt` (torchvision). Repeat runs go to `exp_yolo11s2`, `exp_yolo11s3`, … so retraining no longer overwrites earlier weights or writes checkpoints into the training-image folder. Existing `train/` folders are untouched; update any scripts or notes that point at them.

#### 6. If you wrote your own trigger plugin

The plugin contract changed — check all of the following:

- The constructor must accept `m_dict`: `def __init__(self, m_dict=None):`, not `def __init__(self):`.
- The 3rd argument of `trigger()` is a pyfirmata board, not a serial port: use `arduino.writeDO_all(1)` / `arduino.writeDO_all(0)`, not `ser.write(b"1")`.
- Handle a missing board: `if arduino is None: return` (for configs with `Arduino_COM: "None"`).
- Fix the import: `import libs.arduino as ard` → `import yoru.libs.arduino as ard`.

#### 7. If you import YORU from your own scripts

`yoru.libs.yolo_wrapper` was deleted. Replace `from yoru.libs.yolo_wrapper import load_yolo_model` with:

```python
from yoru.libs.plugins import get_detector
det = get_detector("auto", model_path)   # or "ultralytics", "rtdetr", "torchvision", "onnx"
```

The detector exposes `.names` and `.detect(image)`, which takes a BGR image and returns a list of dicts with the keys `x1, y1, x2, y2, conf, class_id, class_name`. `yoru.libs.file_operation_evaluation` was also removed (it was a duplicate of `yoru.libs.file_operation_create_label`).

#### 8. Smaller changes to be aware of

- **Detection thresholds are now the same for every backend** (confidence 0.25, IoU 0.45). Previously each backend used its own default — torchvision models in particular will report a different number of detections than in Beta 1.
- **ONNX inference now letterboxes** instead of stretching the frame, so box coordinates on non-square inputs are geometrically correct but numerically different from Beta 1.
- **The train/val split is now deterministic** (seeded) and matches `.jpg` / `.jpeg` / `.bmp` / `.tif` / `.tiff` as well as `.png`. Do not re-split a project mid-experiment — the split will differ from the one Beta 1 produced.
- **Saved window layouts reset once**: the `custom_layout_*.ini` files moved from `config/` to `logs/`. The stale `config/custom_layout_*.ini` files can be deleted.

---

### New Features

#### Model Support

- New **ONNX** detection backend — point `yolo_model_path` at a `.onnx` file (or set `yolo_model_type: onnx`) and it is used automatically. It handles models exported from **YOLOv5** and **YOLOv8** / **YOLO11**, reads class names from the model metadata, and uses whatever ONNX Runtime execution providers are installed.
- Detection and training now go through a plugin registry (`yoru/libs/plugins/`) with `ultralytics` (**YOLOv8** / **YOLO11**), `rtdetr` (**RT-DETR**), `torchvision` (**Faster R-CNN** / **Mask R-CNN** / **SSD**) and `onnx` backends; `auto` picks one from the weights file.
- Backend auto-detection no longer unpickles the checkpoint to identify it — it reads the file name and, if needed, the class-name table out of the archive.
- If a backend's dependency is missing, the error now names the backends that *are* available and why the others failed, instead of reporting "unknown backend".
- Existing torchvision checkpoints from Beta 1 load unchanged.

#### Training GUI

- **GPU memory estimate before training.** Step 6 shows a live line such as `~9.4 GB needed / 7.6 GB free (NVIDIA RTX 4070)` with a breakdown, colour-coded green / orange / red, recalculated as the model, Image Size and Batch change. It counts *free* VRAM, so another training run or a live detection session on the same card is taken into account. Pressing **Train Model** while it is red offers "Use Batch *n*" (the largest batch expected to fit), "Train anyway" or "Cancel". Accurate to roughly ±30%.
- **"Stop after this epoch".** Ends a run gracefully: the current epoch finishes and is saved, the final validation pass runs, and both `best.pt` and `last.pt` stay usable. A red **Force stop** appears while a stop is pending, with a confirmation that spells out what is lost — and it kills the dataloader workers too, so nothing is left holding the GPU. A run started from a terminal can be stopped the same way by creating an empty `.yoru_stop_request` file in the project directory.
- Step 6 now reports how the run ended — **Complete!!**, or **Stopped at epoch N / M** with a message giving the weights location — and **Train Model** is disabled during a run, so a second training subprocess can no longer be started by accident.
- The training console shows **one line per epoch** instead of ~161 (ultralytics' progress-bar redraws were arriving as separate lines).
- Training subprocesses now use the Python interpreter YORU is running under, so training works when YORU is started from another directory or when `python` is not the environment's interpreter.

#### Launcher and Windows

- The launcher is a native window — no browser, no local web server, no port 8889 — and it now renders correctly offline.
- Selecting a config file that no longer exists shows an error dialog instead of only printing to the console; the selected condition file is shown in the window at startup.
- `yoru gui` remembers the last-used config instead of resetting to `config/template.yaml`, and `yoru gui --config <file>` now actually works (it was silently discarded in Beta 1).
- The real-time process can be started directly from the command line:

  ```
  python -m yoru.realtime_yoru_GUI path/to/condition.yaml
  ```

- All windows are a uniform 1000×800. Note that the Real-time Process window is narrower than in Beta 1 (it was 1280×700).
- Launching Frame Capture or labelImg no longer freezes the window that launched it.

#### Configuration

- New optional key `hardware.camera_settings_dialog` (default `False`) — the camera driver's property dialog is now opt-in.
- All shipped condition files under `config/` were rewritten: developer-machine paths and the dead `root:` key removed, `export` defaults to `./results/`, a model path pointing at a non-existent file fixed, `Arduino_COM: 13` (a pin number in the COM field) fixed, curly quotes around `“COM3”` fixed, a `trigger_style` naming a plugin that does not exist fixed, and every key given an inline comment.
- Existing condition files still load — the new keys are optional and unknown keys are ignored.

#### Documentation and Licensing

- `docs/install.md` in the repository gains an **install with uv** path.
- `docs/training.md` documents the GPU-memory estimate and the stop buttons; `docs/evaluation.md` points at the new `exp_<model>/` folders.
- New `THIRD_PARTY_LICENSES.md` lists every dependency and its licence, and the README adds an **Ultralytics dual-licensing notice**: Ultralytics YOLO is AGPL-3.0 by default and that extends to models trained with it, so commercial use needs an Ultralytics Enterprise licence.
- New `working-example.md` records one verified working machine (Windows 11, RTX 5070 Ti, torch 2.8.0+cu128) as a reference when an install misbehaves.
- The README now has a **Versions** table making clear that v1.1.1 is the stable release and that this is a preview.

---

### Bug Fixes

- **The closed-loop trigger ignored the confidence threshold.** `trigger_threshold_configuration` was never read, so any detection of the trigger class fired the TTL. Closed-loop experiments run on Beta 1 were effectively running with threshold 0.
- **The TTL always came out of pin 13**, whatever `trigger_pin` said in the condition file.
- **Three of the five bundled trigger plugins could not run at all** — `standard_nidaq`, `state_convert` and `state_convert_for_copulation_attempts` could not even be constructed, so the trigger never engaged; the two `state_convert` plugins also still wrote to a serial port that had become a pyfirmata board. The Arduino plugins no longer crash the trigger process when no board is connected.
- **Turning the trigger off crashed the trigger process** and left the COM port held open, so re-enabling it in the same session did nothing.
- **Screen-capture mode (`stream_MSS: True`) fed 4-channel BGRA frames** to the detector, the recorder and the display — recording and detection should now work where they previously produced broken output.
- **Recorded video was written at the measured frame rate rather than the configured one**, so clips played back at the wrong speed. A camera that cannot be opened, or that returns no frame, now says so and names `hardware.camera_id` instead of failing cryptically.
- **The Video Analysis window froze for the whole job** ("Not Responding") and the progress bar never moved. Analysis now runs on a worker thread with live movie/image progress, remaining time and movies-left counters, buttons disabled while busy, and errors shown in the status line.
- **Every rendered analysis video came out upside down** — `create_video()` flipped unconditionally, ignoring the flip checkboxes — and it crashed on the last frame.
- **A single below-threshold detection discarded the rest of that frame's detections** in offline analysis.
- **The train/val split silently skipped non-PNG datasets**, producing split folders with labels but no images, and aborted on a label file ending in a blank line.
- **Training runs overwrote each other** and wrote checkpoints into the dataset folder (see breaking change 5).
- **The real-time detection process spun a CPU core at full speed** when detection was switched off, and died silently on a bad frame; it now sleeps between checks, and errors are logged and retried.
- **Frame Capture and Refine stole the keyboard.** Left / Right / Alt were registered as a global OS hook, so typing in another application stepped frames and saved images into the dataset. They are now normal window shortcuts that only fire when the YORU window has focus. Each grab also leaked a file handle, and grabbing before choosing an output folder crashed.
- Assorted crashes and leaks: the camera driver property dialog popping up on every real-time start; a full-width character making `ser_recount` unconstructible; `nidaq.dio.stop()` not actually stopping the DAQ task; a divide-by-zero in the evaluation IoU; a SciPy function removed in modern versions; **Quit** raising in the Evaluation and Create-Labels windows; and `yoru gui` opening a second launcher window when an error escaped the GUI.
- `yoru --version` now reports the real version instead of a placeholder, and the packaged source distribution now actually contains `config/`, `trigger_plugins/` and `web/`.

---

### Notes

- This release targets the `develop4` branch and is **not** the stable release. For general lab use, v1.1.1 remains the recommended version.
- The GUI, camera, training and Arduino paths in this release were developed in an environment without a GPU, camera, display or Arduino — they need real-hardware testing. Reports from actual rigs are especially valuable right now.
- **Task-by-task instructions for this release are in the [Beta Guides]({{ site.baseurl }}/beta-guides/00-overview/).** The [user guides]({{ site.baseurl }}/guides/01-install/) and step-by-step protocols elsewhere on this site describe the stable v1.1.1 workflow (Google Chrome, YOLOv5 training, `train/` output folder) and do not apply to Beta 2.

<br>

---

## YORU v2.0.0-beta.1

> Superseded by Beta 2 above. This version targets the `develop2` branch.

To use this version, check out the corresponding tag:

```
git checkout v2.0.0-beta.1
```

### New Features

#### Model Support Expansions

- **YOLOv8 / YOLO11**: Accessible through a unified model wrapper.
- **RT-DETR**: Real-Time Detection Transformer support added.
- **Torchvision models**: Faster R-CNN, Mask R-CNN, and SSD variants now available.

#### Interface Enhancements

- **Real-time configuration tool**: A new configuration creation tool built with DearPyGui allows interactive setup.
- **Training interface improvements**:
  - Progress visualization during training.
  - Automatic state recovery after interruption.
  - Layout refinements for better usability.
  - Automatic model detection.

### Changes

#### Code Organization

- Libraries reorganized into a `yoru/` package structure for cleaner imports and maintainability.
- The [labelImg](https://github.com/HumanSignal/labelImg) annotation tool is now bundled directly into YORU with several bug corrections applied.

### Bug Fixes

- Resolved PyTorch 2.6 compatibility issues specific to YOLOv5 inference.

<br>

---

## Version History

| Version | Date | Notes |
|---------|------|-------|
| [v2.0.0-beta.2](https://github.com/Kamikouchi-lab/YORU/releases/tag/v2.0.0-beta.2) | 2026-08-19 | Pre-release — native launcher, plugin / ONNX backends, YOLOv5 removed |
| [v2.0.0-beta.1](https://github.com/Kamikouchi-lab/YORU/releases/tag/v2.0.0-beta.1) | 2026-03-14 | Pre-release — see above |
| [v1.1.1](https://github.com/Kamikouchi-lab/YORU/releases/tag/v1.1.1) | 2026-03-14 | **Stable release** — PyTorch 2.6 fix, `uv` install support, path corrections |
| [v1.1.0](https://github.com/Kamikouchi-lab/YORU/releases/tag/v1.1.0) | 2025-12-05 | Docs updates, GUI enhancements |
| [v1.0.3](https://github.com/Kamikouchi-lab/YORU/releases/tag/v.1.0.3) | 2025-05-29 | Published DOI release |
| [v1.0.2](https://github.com/Kamikouchi-lab/YORU/releases/tag/v1.0.2) | 2025-02-28 | Confidence threshold for video analysis |
| [v1.0.1](https://github.com/Kamikouchi-lab/YORU/releases/tag/v1.0.1) | 2025-01-16 | Updated instructions, YOLOv5 fix |
| [v1.0.0](https://github.com/Kamikouchi-lab/YORU/releases/tag/v1.0.0) | 2024-11-14 | Initial public release |
