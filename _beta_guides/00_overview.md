---
layout: page
title: "Beta: Overview"
order: 0
---

These pages describe how to use **YORU v2.0.0-beta.4**.

> **This is pre-release software.** It targets the `develop4` branch. For general lab use, [v1.1.2](https://github.com/Kamikouchi-lab/YORU/releases/tag/v1.1.2) remains the recommended stable release, and its workflow is documented in the [User Guides]({{ site.baseurl }}/guides/01-install/).
>
> Do not switch a running experiment to the beta halfway through. See [Behaviour that changed](#behaviour-that-changed-numbers-may-differ) below.

The full change list is on the [Beta Release Notes]({{ site.baseurl }}/beta/) page. These guides are the task-by-task version of the same information.

---

## Which version should I use?

| | Stable v1.1.2 | Beta v2.0.0-beta.4 |
|---|---|---|
| Launcher | Google Chrome + local server (Eel) | Native window (pywebview), no browser, no port |
| Python | 3.10 | 3.10 |
| Detection / training backends | YOLOv5, YOLOv8 / YOLO11, RT-DETR, torchvision | YOLOv5 (bundled, as in v1), YOLOv8 / YOLO11, RT-DETR, torchvision, ONNX |
| YOLOv5 `.pt` weights from v1 | Supported | Supported again from Beta 4, with the same boxes as v1 |
| Default model of a new project | YOLOv5 (`yolov5s.pt`) | YOLOv5 (`yolov5s.pt`); YOLO11 in an OBB project |
| PyTorch build (uv) | CUDA 12.4 | CUDA 12.8 — RTX 50-series supported, driver 570 or newer |
| Oriented bounding boxes (OBB) | — | YOLOv8 / YOLO11 |
| LabelImg | The one on `PATH` | Bundled copy, with Click to Box and rotated boxes |
| Frame Capture | By hand | By hand, or Automatic Extraction (`uniform` / `kmeans`), in three dockable windows |
| Compute device | Automatic (CUDA → MPS → CPU) | Automatic (CUDA → MPS → CPU) |
| Trained model output | `<project>/exp/` (YOLOv5), `<project>/train2/` (ultralytics) | `<project>/exp_<model>/` |
| `trigger_pin` in condition file | Ignored (always pin 13) | Honoured |
| `trigger_threshold_configuration` | Ignored (fires at any confidence) | Applied |
| Evaluation of OBB models | — | Scored by the rotated boxes (polygon IoU, from Beta 4) |
| Guides | [User Guides]({{ site.baseurl }}/guides/01-install/) | These pages |

---

## Guide pages

1. [Install](../01-install/) — conda or uv, upgrading from Beta 3, Beta 2 or Beta 1
2. [Training](../02-training/) — OBB projects, Automatic Extraction, Click to Box, model selection, YOLOv5, GPU-memory estimate, stopping a run
3. [Video Analysis](../03-analysis/) — offline analysis and the result CSV
4. [Evaluation](../04-evaluation/) — AP / IoU evaluation
5. [Real-time Process](../05-closed-loop/) — condition YAML and closed-loop experiments
6. [Custom Trigger Plugins](../06-trigger-plugins/) — writing your own trigger

---

## The YORU window (new in Beta 3)

Every YORU screen opens sized to the monitor it is on, and centred. You can resize or maximise the window freely. Each screen has a **Window** menu:

| Item | What it does |
|------|--------------|
| Fit window to this screen | Resizes and re-centres the window for the display it is on now. Use this after moving YORU to a different monitor. |
| Maximize window | Fills the screen. |
| Text size | Small / Normal / Large, applied immediately. |
| Save layout now | Saves the current arrangement without waiting for you to close the window. |
| Reset layout to default | Forgets the saved arrangement and goes back to the built-in one. |

- YORU remembers each screen's window size and text size. On Real-time Process and Video Analysis, it also remembers where you put the panels, and on Frame Capture where you put its three windows (new in Beta 4: *Preview*, *Save Frame* and *Automatic Extraction* can be resized, re-tiled or stacked into tabs).
- On those screens the panels are tiled side by side and follow the window as you resize it, until you first move or resize one yourself. **Reset layout to default** restores the tiling.
- The settings are saved in `logs/` (`yoru_windows.ini`, and one `custom_layout_<screen>.ini` for each of those screens). If YORU cannot write there, they go to `%LOCALAPPDATA%\YORU`. Deleting the files has the same effect as **Reset layout to default**.
- Japanese and other non-ASCII text now displays correctly, including in path fields.

---

## Migration checklist

### Coming from Beta 3

1. **Check the NVIDIA driver.** PyTorch moved to the CUDA 12.8 build, which needs driver 570 or newer. uv users get it with `uv sync`; conda users install it by hand. The conda environment does not have to be recreated. See [Install](../01-install/#upgrading-from-beta-3).
2. **Do not compare `tracking_id` across versions.** Video Analysis tracking was fixed, so re-analysing a movie can give different IDs. See [Video Analysis](../03-analysis/#tracking-changed-in-beta-4).
3. **Do not compare evaluation figures across versions, and rerun Prediction for OBB models.** See [Evaluation](../04-evaluation/#how-ap-is-calculated-changed-in-beta-4).
4. **Check custom trigger plugins.** They now receive one call with no detections when the process ends, and may define `close()`. See [Custom Trigger Plugins](../06-trigger-plugins/#shutting-down-beta-4).
5. New training projects start on YOLOv5 instead of YOLO11. Pick the version you want in the Training GUI.

### Coming from Beta 2

Everything above applies, plus the Beta 3 changes:

1. **Recreate the conda environment — this is required.** Beta 3 moved from Python 3.9 to 3.10. See [Install](../01-install/#upgrading-from-beta-2). uv users only need to run `uv sync`.
2. **Check scripts that read analysis CSVs by column position.** `w, h, angle` were inserted between `y_center` and `confidence`. See [Video Analysis](../03-analysis/#result-csv-changed-in-beta-3).
3. **Check custom trigger plugins that unpack detection rows.** Rows now have 13 entries instead of 8. See [Custom Trigger Plugins](../06-trigger-plugins/#detection-rows-have-13-entries-beta-3).
4. **If the Video Analysis panels open on top of each other**, choose **Window → Reset layout to default** once, or delete `logs/custom_layout_analysis.ini`.

### Coming from Beta 1

Everything above applies, plus the Beta 2 changes:

1. **Check `trigger_pin` in every condition file.** Beta 1 always used pin 13 regardless of this value; the beta now uses what the file says. Edit the YAML or rewire before your next experiment.
2. **Check `trigger_threshold_configuration`.** Beta 1 never read it, so the trigger fired on any detection of the trigger class. It is now applied, so the trigger fires less often. If the value was raised to compensate, lower it back.
3. **Update paths to trained weights.** Training now writes to `exp_<model>/`, not `train/`.
4. **Update your own trigger plugins**, if any — see [Custom Trigger Plugins](../06-trigger-plugins/).
5. **Delete stale `config/custom_layout_*.ini` files.** Saved window layouts moved to `logs/`, so layouts reset once.

### Coming from v1.1.x (stable)

Everything above applies, plus:

1. **YOLOv5 weights from v1 load and train as before** (from Beta 4). A condition file with `yolo_model_type: yolov5` or `auto` uses the bundled YOLOv5. See [Training](../02-training/#yolov5).
2. **Google Chrome is no longer needed** and no longer used.
3. Condition files still load unchanged — new keys are optional and unknown keys are ignored.

---

## Behaviour that changed (numbers may differ)

Results produced under the beta are not always directly comparable with earlier versions:

- **Detection thresholds are uniform across backends** (confidence 0.25, IoU 0.45). Torchvision models in particular report a different number of detections than in Beta 1.
- **ONNX inference letterboxes** instead of stretching the frame, so boxes on non-square inputs are geometrically correct but numerically different from Beta 1.
- **The train/val split is deterministic (seeded)** and now includes `.jpg` / `.jpeg` / `.bmp` / `.tif` / `.tiff` as well as `.png`. Do not re-split a project mid-experiment — the split will differ from the one Beta 1 produced.
- **The closed-loop trigger now respects the confidence threshold**, so it fires less often than on Beta 1 with the same config. From Beta 4 it also ignores results older than `trigger.result_max_age`.
- **Video Analysis `tracking_id` changed in Beta 4.** Matching now uses only real distances and numbers IDs without gaps. See [Video Analysis](../03-analysis/#tracking-changed-in-beta-4).
- **Evaluation AP changed in Beta 4.** The earlier figures were wrong, and an OBB model is now scored by its rotated boxes. See [Evaluation](../04-evaluation/#how-ap-is-calculated-changed-in-beta-4).
- **YOLOv5 results match v1 again** (Beta 4): the same boxes, and with the same confidence threshold the same video analysis, tracking IDs included.

---

## Known limitations

- The test suite passes on Windows, Linux and macOS in CI, but the GUIs, cameras, closed-loop hardware and training on real data **still need testing on real rigs**. Reports from actual experiments are especially valuable — please open a [GitHub Issue](https://github.com/Kamikouchi-lab/YORU/issues).
- A screen that crashes while starting up closes its console without writing to `yoru.log`. Run it directly from a terminal to see the error, e.g. `python -m yoru.train_GUI`, and always launch YORU from the repository root.
- Screenshots on these pages are carried over from v1.1.x where the workflow itself is unchanged. The launcher and window sizes look different in the beta.

---

## [Next](../01-install/)
