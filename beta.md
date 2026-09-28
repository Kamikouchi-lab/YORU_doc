---
layout: page
title: Beta Release Notes
order: 10
---

## YORU v2.0.0-beta.3

> **Pre-release software.** This version targets the `develop4` branch and may contain bugs. For general lab use, **v1.1.2 remains the recommended stable release**. Feedback and bug reports via [GitHub Issues](https://github.com/Kamikouchi-lab/YORU/issues) are welcome.

Released 2026-09-28 — [release page](https://github.com/Kamikouchi-lab/YORU/releases/tag/v2.0.0-beta.3)

To use this beta version, check out the corresponding tag:

```
git checkout v2.0.0-beta.3
```

Task-by-task instructions are in the [Beta Guides]({{ site.baseurl }}/beta-guides/00-overview/).

### Highlights

- **Oriented bounding boxes (OBB), end to end.** Tick *Oriented Bounding Box* when you create a project, and YORU labels, trains and detects with *rotated* boxes. This suits elongated animals that lie at any angle, such as flies, larvae and fish. It works with YOLOv8 and YOLO11 (`yolo11s-obb.pt`), and real-time and offline detection draw rotated rectangles.
- **Faster labelling.** The Training GUI now opens YORU's own copy of LabelImg, already pointed at the project and set to the right format. Its new **Click to Box** tool (`C`) fits a box to an animal from a single click. The Frame Capture GUI adds **Automatic Extraction**, which picks a whole set of frames for labelling (`uniform` or `kmeans`, as in DeepLabCut).
- **Windows fit the screen.** Every YORU screen now opens sized to the monitor it is on. A new **Window** menu fits or maximises the window, changes the text size, and saves or resets the layout.
- **Everything from v1.1.2 is included:** automatic compute-device selection (CUDA, then Apple MPS, then CPU), macOS support through uv, runtime logs in `~/.yoru/logs/yoru.log`, and GUI errors shown on screen instead of being swallowed.

---

### Installation and Upgrading

#### Upgrading from Beta 2 (conda)

Python moved from 3.9 to 3.10 (breaking change 1), so **recreate the environment**:

```
git fetch --tags
git checkout v2.0.0-beta.3
conda deactivate
conda env remove -n yoru
conda env create -f YORU.yml
conda activate yoru
# then install PyTorch for your CUDA version (see the Beta Install guide)
python -m yoru
```

#### Fresh install (conda)

```
git clone https://github.com/Kamikouchi-lab/YORU.git
cd YORU
git checkout v2.0.0-beta.3
conda env create -f YORU.yml
conda activate yoru
# then install PyTorch for your CUDA version (see the Beta Install guide)
python -m yoru
```

#### With uv (Windows, Linux, macOS)

No conda and no manual PyTorch step. uv users upgrading from Beta 2 only need to run `uv sync`.

```
git clone https://github.com/Kamikouchi-lab/YORU.git
cd YORU
git checkout v2.0.0-beta.3
uv sync
uv run yoru
```

#### After upgrading, check

1. Any script that reads analysis CSVs **by column position** (breaking change 2).
2. Any custom trigger plugin that **unpacks** detection rows (breaking change 3).

---

### Breaking Changes

#### 1. Python 3.10 is now required: recreate your conda environment

Beta 2 used Python 3.9. `YORU.yml` and `pyproject.toml` now target **Python 3.10**, and NumPy is capped below 2.0 because `opencv-python` 4.10 is built against NumPy 1.x. Updating a Beta 2 environment in place is not reliable across a Python version change, so recreate it (see above), then reinstall PyTorch. **uv** users only need to run `uv sync`.

#### 2. Analysis result CSVs have three new columns in the middle

For **every** project, not only OBB ones, the Video Analysis tables now have `w, h, angle` between `y_center` and `confidence`. `confidence`, `class`, `class_name` and `tracking_id` therefore move three columns to the right.

- Scripts that read the columns **by name** keep working.
- Scripts that read them **by position** must be updated.
- For a non-OBB model, `angle` is always `0`.

#### 3. Real-time detection rows grew from 8 to 13 columns

The real-time `*_detect.csv` gains `cx, cy, w, h, angle` at the **end**. The first eight columns keep their names and positions, and none of the bundled trigger plugins is affected.

**If you wrote your own trigger plugin:** the rows in `m_dict["yolo_results"]` now have 13 entries. Indexing (`row[4]`, `row[6]`) still works. Unpacking exactly eight values (`x1, y1, x2, y2, conf, cls, name, t = row`) now raises `ValueError`, and when that happens the trigger stops firing. Unpack with `*rest` or index instead. Rows passed to `yoru.libs.drawing.draw_detections` changed the same way. See [Custom Trigger Plugins]({{ site.baseurl }}/beta-guides/06-trigger-plugins/).

#### 4. Video Analysis window layout from Beta 2

The panels on the Video Analysis screen now have stable internal names. If you have a `logs/custom_layout_analysis.ini` saved by Beta 2, the two panels can open on top of each other the first time. Choose **Window → Reset layout to default** once to fix it, or delete that file.

---

### New Features

#### Oriented bounding boxes (OBB)

- **Oriented Bounding Box** checkbox when creating a project in the Training GUI. The choice is stored as `task: obb` in the project's `config.yaml`, and every later step follows it.
- LabelImg edits rotated boxes: `Z` / `X` turn the selected box 1°, and `Shift+Z` / `Shift+X` turn it 15°. Corners resize the box along its own axes, and the status bar shows its own width, height and angle.
- Labels are saved as YOLO-OBB (`class x1 y1 x2 y2 x3 y3 x4 y4`, normalised), the format ultralytics reads for `task="obb"`. LabelImg tells it apart from ordinary YOLO labels by the number of fields on each line.
- In an OBB project the weight gets an `-obb` suffix automatically. Only YOLOv8 and YOLO11 have a rotated-box head, so RT-DETR and the torchvision models cannot be trained on OBB.
- Real-time and offline detection recognise an OBB model by themselves: leave `yolo_model_type: "auto"`. Rotated rectangles are drawn on screen and in rendered videos, and the angle is written to the CSVs (see breaking changes 2 and 3).
- The Evaluation sub-module reads OBB label files. See *Known Issues* for how it scores them.
- See [Beta: Training]({{ site.baseurl }}/beta-guides/02-training/#oriented-bounding-boxes-obb) for the full workflow.

#### Labelling

- The Training, Create Labels and Evaluation GUIs all open the **bundled** LabelImg (`python -m yoru.labelimg.labelimg`) instead of the one on `PATH`. It opens already pointed at the right image folder and `classes.txt`, and in the right format: YOLO for an ordinary project, YOLO-OBB for an OBB one. You no longer set the format by hand.
- **Click to Box:** press `C` (or the *Click to Box* button) and click once on the animal. A box is fitted to its body, leaving out legs, wings and antennae. In an OBB project the box is rotated along the body. It works for dark animals on a light background and the reverse, needs no model, and runs on OpenCV alone.
- The bundled LabelImg has a command line: `python -m yoru.labelimg.labelimg [image_dir] [classes_file] [save_dir] [--obb | --no-obb]`.

#### Frame Capture

- **Automatic Extraction** picks a whole set of frames at once. Set *Frames to pick*, choose an algorithm, and press **Extract Frames**. **Stop** interrupts a run and keeps the frames already saved.
  - **uniform** draws frames at random. It is instant, and the sample mirrors how often each behaviour happens.
  - **kmeans** clusters thumbnails by appearance and takes one frame per cluster, so rare postures are not swamped by long stretches of an animal sitting still.
  - **Video range** (fractions of the video, e.g. `0.25`–`0.75`) skips handling at the start of a recording, or keeps part of the video back as unseen test material.
- If the frame name is left blank, the video's file name is used.

#### Windows and layout

- Every screen opens sized to the monitor it is on, and centred. Windows can be resized and maximised freely; before, 1000×800 did not fit on a 1366×768 laptop.
- The new **Window** menu has *Fit window to this screen*, *Maximize window*, *Text size* (Small / Normal / Large), *Save layout now* and *Reset layout to default*.
- Window size, text size and, on Real-time Process and Video Analysis, the panel arrangement are remembered separately for each screen, in `logs/`.
- Japanese and other non-ASCII text displays correctly, including in path fields.

#### From v1.1.2 (merged into this beta)

- **Automatic compute device:** CUDA, then Apple MPS, then CPU. Override it with the `YORU_DEVICE` environment variable, the `--device` flag of the training scripts, or the new device selector in the Training GUI. The selected device reaches the training subprocess and the detectors.
- **macOS 14+ on Apple Silicon** is supported through the uv route, and a single `uv.lock` now covers Windows, Linux and macOS.
- **Runtime logs** are written to `~/.yoru/logs/yoru.log` (relocatable with `YORU_HOME`). They hold the full traceback of every error the GUIs catch. The last-used condition file is now remembered in `~/.yoru/condition_file_log.json` and is migrated from `logs/` automatically.
- **GUI errors are shown on screen** instead of being lost. Training failures show a popup with the last lines of the training output, and project loading checks its input first.
- CI runs the test suite on Windows, Linux and macOS.

---

### Bug Fixes

- **Frame Capture silently saved nothing into folders with Japanese (non-ASCII) names.** `cv2.imwrite` returns success there but writes no file. Frames are now written with `imencode` + `tofile`.
- A video that reports no frame count now gives a clear error in Automatic Extraction instead of failing obscurely.
- The labelImg settings file (`~/.labelImgSettings.pkl`) written by another labelImg build no longer breaks YORU's bundled copy.
- From v1.1.2: NumPy is capped below 2 so that `import cv2` works on Python 3.10, and several error-handling gaps were closed.

---

### Known Issues

- **OBB evaluation ignores the angle.** The Evaluation sub-module computes IoU on the upright box around each rotated box, so its mAP for an OBB model is not reliable, and for elongated, tilted animals it is usually too **high**. Quote the rotated mAP that ultralytics prints at the end of training instead.
- **Keep ordinary (5-field) label files out of OBB projects.** In an OBB session, opening an axis-aligned label file switches LabelImg to plain YOLO, and boxes saved after that lose their angle. OBB training on such a mixed dataset stops with `OBB dataset incorrectly formatted`. Check the format button in LabelImg's toolbar if in doubt.
- **A screen that crashes while starting up closes its console without writing to `yoru.log`** (the same as Beta 2). Run it directly from a terminal to see the error, e.g. `python -m yoru.train_GUI`. Always launch YORU from the repository root.
- **RTX 50-series (Blackwell) GPUs with the uv route:** `uv.lock` pins torch 2.6.0+cu124, which has no kernels for these cards, so CUDA calls fail with `no kernel image is available`. Set `YORU_DEVICE=cpu`, or use the conda route with a CUDA 12.8 build (see `working-example.md`, torch 2.8.0+cu128).
- The Training GUI's GPU-memory warning still appears when *Device* is set to `cpu`. Choose **Train anyway**.
- Automatic Extraction names files `<frame name>_<frame number>.png`. A second run over the same range rewrites the frames that overlap, and the saved-frame counter counts them twice. Give each video its own frame name when several videos share one output folder.

---

### Notes

- This release targets the `develop4` branch and is **not** the stable release. For general lab use, **v1.1.2** remains the recommended version.
- The test suite passes on Windows, Linux and macOS in CI. The GUIs, cameras, closed-loop hardware and OBB training on real data still need testing on real rigs, and reports from actual experiments are especially valuable.

<br>

---

## YORU v2.0.0-beta.2

> Superseded by Beta 3 above. This version targets the `develop4` branch.

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

- This release targeted the `develop4` branch and was **not** a stable release. At the time, v1.1.1 was the recommended version.
- The GUI, camera, training and Arduino paths in this release were developed in an environment without a GPU, camera, display or Arduino — they need real-hardware testing. Reports from actual rigs are especially valuable right now.
- The [Beta Guides]({{ site.baseurl }}/beta-guides/00-overview/) now describe Beta 3. Everything in them about Beta 2 behaviour still applies, except where a page says it changed in Beta 3.

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
| [v2.0.0-beta.3](https://github.com/Kamikouchi-lab/YORU/releases/tag/v2.0.0-beta.3) | 2026-09-28 | Pre-release — oriented bounding boxes, Click to Box, Automatic Extraction, screen-fitted windows, Python 3.10 |
| [v1.1.2](https://github.com/Kamikouchi-lab/YORU/releases/tag/v1.1.2) | 2026-09-04 | **Stable release** — macOS / Linux via uv, automatic compute device, `~/.yoru` logs, CI on three platforms |
| [v2.0.0-beta.2](https://github.com/Kamikouchi-lab/YORU/releases/tag/v2.0.0-beta.2) | 2026-08-19 | Pre-release — native launcher, plugin / ONNX backends, YOLOv5 removed |
| [v2.0.0-beta.1](https://github.com/Kamikouchi-lab/YORU/releases/tag/v2.0.0-beta.1) | 2026-03-14 | Pre-release — see above |
| [v1.1.1](https://github.com/Kamikouchi-lab/YORU/releases/tag/v1.1.1) | 2026-03-14 | PyTorch 2.6 fix, `uv` install support, path corrections |
| [v1.1.0](https://github.com/Kamikouchi-lab/YORU/releases/tag/v1.1.0) | 2025-12-05 | Docs updates, GUI enhancements |
| [v1.0.3](https://github.com/Kamikouchi-lab/YORU/releases/tag/v.1.0.3) | 2025-05-29 | Published DOI release |
| [v1.0.2](https://github.com/Kamikouchi-lab/YORU/releases/tag/v1.0.2) | 2025-02-28 | Confidence threshold for video analysis |
| [v1.0.1](https://github.com/Kamikouchi-lab/YORU/releases/tag/v1.0.1) | 2025-01-16 | Updated instructions, YOLOv5 fix |
| [v1.0.0](https://github.com/Kamikouchi-lab/YORU/releases/tag/v1.0.0) | 2024-11-14 | Initial public release |
