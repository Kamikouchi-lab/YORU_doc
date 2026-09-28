---
layout: page
title: "Beta: Custom Trigger Plugins"
order: 6
---

> Applies to **v2.0.0-beta.3**. This page covers the API changes that affect user-written code. If you only use the bundled plugins, you can skip it — but see [Real-time Process](../05-closed-loop/) for the `trigger_pin` and threshold changes, which affect everyone.

Plugins for the YORU project are listed under [Trigger Plugins]({{ site.baseurl }}/plugins/projector-trigger/).

---

## Detection rows have 13 entries (Beta 3)

The `results` argument of `trigger()` is `m_dict["yolo_results"]`: one row per detection. In Beta 3 each row gained five entries at the **end**:

| Index | 0–3 | 4 | 5 | 6 | 7 | 8–11 | 12 |
|---|---|---|---|---|---|---|---|
| Value | `x1, y1, x2, y2` | `confidence` | `class` | `class_name` | `total_time` | `cx, cy, w, h` | `angle` (radians) |

The first eight entries keep their names and positions, and none of the bundled trigger plugins is affected.

- **Indexing still works:** `row[4]`, `row[6]`.
- **Unpacking exactly eight values breaks:**

    ```python
    x1, y1, x2, y2, conf, cls, name, t = row          # ValueError in Beta 3
    ```

    When that happens, **the trigger stops firing.** Unpack the rest into a list, or index instead:

    ```python
    x1, y1, x2, y2, conf, cls, name, t, *rest = row   # works in Beta 2 and Beta 3
    ```

- For an OBB model, `cx, cy, w, h, angle` are the rotated box. For any other model they describe the same upright box as `x1..y2`, with `angle = 0`.
- Rows passed to `yoru.libs.drawing.draw_detections` changed the same way.

---

## The trigger plugin contract changed

A plugin written for Beta 1 or v1.1.x will not run unchanged on the beta (changed in Beta 2). Check all four points, plus the [13-entry rows](#detection-rows-have-13-entries-beta-3) above:

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

`yoru.libs.yolo_wrapper` is not part of the beta (it was deleted in Beta 2). Replace:

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
- **New in Beta 3:** an OBB model adds the keys `cx, cy, w, h, angle` (radians) for the rotated box. `x1..y2` is still the upright box around it. Other models leave these keys out.

`yoru.libs.file_operation_evaluation` was also removed; it was a duplicate of `yoru.libs.file_operation_create_label`.

### Detection defaults

All backends use the same thresholds: **confidence 0.25, IoU 0.45** (changed in Beta 2). Previously each backend used its own default, so scripts built around torchvision models in particular will see a different number of detections than on Beta 1.

---

## Other paths that moved

| Item | Beta 1 | Beta 2 and later |
|---|---|---|
| Trained weights | `<project>/train/weights/best.pt` | `<project>/exp_<model>/weights/best.pt` |
| Saved window layouts | `config/custom_layout_*.ini` | `logs/custom_layout_*.ini` (plus `logs/yoru_windows.ini` from Beta 3) |
| YOLOv5 sources | `yoru/libs/yolov5/` | Removed |

The stale `config/custom_layout_*.ini` files can be deleted; saved window layouts reset once.

---

## Packaging note

The packaged source distribution now actually contains `config/`, `trigger_plugins/` and `web/`, and `yoru --version` reports the real version instead of a placeholder.

<br>

---

## [Previous](../05-closed-loop/)
