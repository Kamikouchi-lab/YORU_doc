---
layout: page
title: "Beta: Custom Trigger Plugins"
order: 6
---

> Applies to **v2.0.0-beta.2**. This page covers the API changes that affect user-written code. If you only use the bundled plugins, you can skip it — but see [Real-time Process](../05-closed-loop/) for the `trigger_pin` and threshold changes, which affect everyone.

Plugins for the YORU project are listed under [Trigger Plugins]({{ site.baseurl }}/plugins/projector-trigger/).

---

## The trigger plugin contract changed

A plugin written for Beta 1 or v1.1.1 will not run unchanged on Beta 2. Check all four points:

### 1. The constructor must accept `m_dict`

```python
def __init__(self, m_dict=None):   # not: def __init__(self):
```

### 2. The 3rd argument of `trigger()` is a pyfirmata board, not a serial port

```python
arduino.writeDO_all(1)   # not: ser.write(b"1")
arduino.writeDO_all(0)   # not: ser.write(b"0")
```

### 3. Handle a missing board

Condition files may set `Arduino_COM: "None"`, in which case no board is passed:

```python
if arduino is None:
    return
```

### 4. Fix the import path

```python
import yoru.libs.arduino as ard   # not: import libs.arduino as ard
```

> Libraries were reorganized into a `yoru/` package in Beta 1, so the top-level `libs` import no longer resolves.

For the full signature, use a bundled plugin under `trigger_plugins/` in the repository as the reference implementation — `standard_arduino` is the simplest one.

### Why this matters

In Beta 1, three of the five bundled plugins — `standard_nidaq`, `state_convert` and `state_convert_for_copulation_attempts` — hit exactly these problems and **could not be constructed at all, so the trigger silently never engaged.** If your own plugin was written against the same pattern, it was likely affected too.

---

## Using YORU from your own scripts

`yoru.libs.yolo_wrapper` was deleted in Beta 2. Replace:

```python
from yoru.libs.yolo_wrapper import load_yolo_model
```

with:

```python
from yoru.libs.plugins import get_detector

det = get_detector("auto", model_path)   # or "ultralytics", "rtdetr", "torchvision", "onnx"
```

The detector exposes:

- `.names` — the class-name table.
- `.detect(image)` — takes a **BGR** image and returns a list of dicts with the keys `x1, y1, x2, y2, conf, class_id, class_name`.

`yoru.libs.file_operation_evaluation` was also removed; it was a duplicate of `yoru.libs.file_operation_create_label`.

### Detection defaults

All backends now use the same thresholds: **confidence 0.25, IoU 0.45**. Previously each backend used its own default, so scripts built around torchvision models in particular will see a different number of detections than on Beta 1.

---

## Other paths that moved

| Item | Beta 1 | Beta 2 |
|---|---|---|
| Trained weights | `<project>/train/weights/best.pt` | `<project>/exp_<model>/weights/best.pt` |
| Saved window layouts | `config/custom_layout_*.ini` | `logs/custom_layout_*.ini` |
| YOLOv5 sources | `yoru/libs/yolov5/` | Removed |

The stale `config/custom_layout_*.ini` files can be deleted; saved window layouts reset once.

---

## Packaging note

The packaged source distribution now actually contains `config/`, `trigger_plugins/` and `web/`, and `yoru --version` reports the real version instead of a placeholder.

<br>

---

## [Previous](../05-closed-loop/)
