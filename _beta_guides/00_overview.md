---
layout: page
title: "Beta: Overview"
order: 0
---

These pages describe how to use **YORU v2.0.0-beta.2**.

> **This is pre-release software.** It targets the `develop4` branch. For general lab use, [v1.1.1](https://github.com/Kamikouchi-lab/YORU/releases/tag/v1.1.1) remains the recommended stable release, and its workflow is documented in the [User Guides]({{ site.baseurl }}/guides/01-install/).
>
> Do not switch a running experiment to Beta 2 halfway through. See [Behaviour that changed](#behaviour-that-changed-numbers-may-differ) below.

The full change list is on the [Beta Release Notes]({{ site.baseurl }}/beta/) page. These guides are the task-by-task version of the same information.

---

## Which version should I use?

| | Stable v1.1.1 | Beta v2.0.0-beta.2 |
|---|---|---|
| Launcher | Google Chrome + local server | Native window (pywebview), no browser, no port |
| Detection / training backends | YOLOv5 | ultralytics (YOLOv8 / YOLO11), RT-DETR, torchvision, ONNX |
| YOLOv5 `.pt` weights | Supported | **Not loadable** (export to ONNX, or retrain) |
| Trained model output | `<project>/train/` | `<project>/exp_<model>/` |
| `trigger_pin` in condition file | Ignored (always pin 13) | Honoured |
| `trigger_threshold_configuration` | Ignored (fires at any confidence) | Applied |
| Guides | [User Guides]({{ site.baseurl }}/guides/01-install/) | These pages |

---

## Guide pages

1. [Install](../01-install/) — conda or uv, environment update from Beta 1
2. [Training](../02-training/) — model selection, GPU-memory estimate, stopping a run
3. [Video Analysis](../03-analysis/) — offline analysis
4. [Evaluation](../04-evaluation/) — AP / IoU evaluation
5. [Real-time Process](../05-closed-loop/) — condition YAML and closed-loop experiments
6. [Custom Trigger Plugins](../06-trigger-plugins/) — writing your own trigger

---

## Migration checklist

### Coming from Beta 1

1. **Update the conda environment — this is required.** Beta 1 environments have neither pywebview nor onnxruntime, and the launcher will not start. See [Install](../01-install/#upgrading-from-beta-1).
2. **Check `trigger_pin` in every condition file.** Beta 1 always used pin 13 regardless of this value; Beta 2 uses what the file says. Edit the YAML or rewire before your next experiment.
3. **Check `trigger_threshold_configuration`.** Beta 1 never read it, so the trigger fired on any detection of the trigger class. It is now applied, so the trigger fires less often. If the value was raised to compensate, lower it back.
4. **Update paths to trained weights.** Training now writes to `exp_<model>/`, not `train/`.
5. **Update your own trigger plugins**, if any — see [Custom Trigger Plugins](../06-trigger-plugins/).
6. **Delete stale `config/custom_layout_*.ini` files.** Saved window layouts moved to `logs/`, so layouts reset once.

### Coming from v1.1.1 (stable)

Everything above applies, plus:

1. **YOLOv5 weights no longer load.** Export them to ONNX with the upstream YOLOv5 repository and point `yolo_model_path` at the `.onnx` file, or retrain with YOLOv8 / YOLO11. See [Training](../02-training/#existing-yolov5-projects).
2. **Google Chrome is no longer needed** and no longer used.
3. Condition files still load unchanged — new keys are optional and unknown keys are ignored.

---

## Behaviour that changed (numbers may differ)

Results produced under Beta 2 are not always directly comparable with earlier versions:

- **Detection thresholds are uniform across backends** (confidence 0.25, IoU 0.45). Torchvision models in particular report a different number of detections than in Beta 1.
- **ONNX inference letterboxes** instead of stretching the frame, so boxes on non-square inputs are geometrically correct but numerically different from Beta 1.
- **The train/val split is deterministic (seeded)** and now includes `.jpg` / `.jpeg` / `.bmp` / `.tif` / `.tiff` as well as `.png`. Do not re-split a project mid-experiment — the split will differ from the one Beta 1 produced.
- **The closed-loop trigger now respects the confidence threshold**, so it fires less often than on Beta 1 with the same config.

---

## Known limitations

- The GUI, camera, training and Arduino paths in this release were developed in an environment without a GPU, camera, display or Arduino. **They need real-hardware testing.** Reports from actual rigs are especially valuable — please open a [GitHub Issue](https://github.com/Kamikouchi-lab/YORU/issues).
- Screenshots on these pages are carried over from v1.1.1 where the workflow itself is unchanged. Window sizes and the launcher look different in Beta 2 (all windows are a uniform 1000×800).

---

## [Next](../01-install/)
