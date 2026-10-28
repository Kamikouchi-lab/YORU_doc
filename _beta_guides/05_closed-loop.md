---
layout: page
title: "Beta: Real-time Process"
order: 5
---

> Applies to **v2.0.0-beta.4**. For the stable v1.1.2 procedure, see the [User Guides]({{ site.baseurl }}/guides/05-closed-loop/).

> ⚠️ **Read this before your next closed-loop experiment.** Two settings that Beta 1 and v1.1.x silently ignore are honoured in the beta: `trigger_pin` and `trigger_threshold_configuration`. An unchanged condition file will not behave the way it did before.

> **New in Beta 3:** each row of `*_detect.csv` (and of `m_dict["yolo_results"]`) has 13 columns instead of 8. See [Detection results](#detection-results-_detectcsv) below. Custom trigger plugins that unpack rows must be updated — see [Custom Trigger Plugins](../06-trigger-plugins/#detection-rows-have-13-entries-beta-3).

> **New in Beta 4:** the trigger fires only on **fresh** results — never on boxes left over after detection is switched off, the model reloads or the camera stops, and never on a frame older than `trigger.result_max_age` seconds. See [Stopping, recording and capture](#stopping-recording-and-capture-changed-in-beta-4) below.

---

## Before you start: two settings that now take effect

### `trigger_pin`

Beta 1 hard-coded the TTL output to digital pin **13** and ignored whatever `trigger_pin` said in your file. **Since Beta 2, the beta uses the value in the file.**

- If any of your condition files sets `trigger_pin` to something other than 13, **that pin is what will now fire.** Edit the YAML or rewire before your next experiment.
- Files with no `trigger_pin` key still default to 13.

### `trigger_threshold_configuration`

Beta 1 loaded this value but never read it, so the trigger fired on **any** detection of the trigger class regardless of confidence — effectively a threshold of 0.

- The beta applies it (since Beta 2). With the shipped values (0.3–0.5), expect **fewer firings** from an unchanged config.
- If you had raised the threshold to compensate for it being ignored, lower it back to the value you actually want.

---

## Procedure

1. Edit a condition YAML file.

    > [condition YAML file template](https://github.com/Kamikouchi-lab/YORU/blob/main/config/template.yaml)

    > All shipped condition files under `config/` were rewritten in Beta 2: developer-machine paths and the dead `root:` key were removed, `export` defaults to `./results/`, a model path pointing at a non-existent file was fixed, `Arduino_COM: 13` (a pin number in the COM field) was fixed, curly quotes around `“COM3”` were fixed, a `trigger_style` naming a plugin that does not exist was fixed, and every key was given an inline comment.

    > Your existing condition files still load — the new keys are optional and unknown keys are ignored.

   ```yaml
   name: fly_copulation_project   # Experimental name.
   export: ./results/   # Output folder for videos and experiment information.
   export_name: fly_copulation_real_time_analysis   # Specifying the file name of the output video.

   model:
     yolo_detection: False   # If you want to start YORU's inference immediately after starting YORU's real-time process, set this to True.
     yolo_model_path: Path/to/YORU/model   # Specify the YORU model (.pt or .onnx file).
     yolo_model_type: auto   # Optional. Auto-detected from the weights file, including OBB models. Leave it as auto.
     Trigger: False

   capture_style:
     stream_MSS: False   # When using the screen capture function, set to True.

   trigger:
     result_max_age: 1.0   # New in Beta 4. Optional. Maximum age (seconds) of the frame a trigger may act on.
     trigger_threshold_configuration: 0.3   # Confidence threshold when detecting YORU. APPLIED since Beta 2 (ignored in Beta 1).
     trigger_class: copulation   # Which action class to trigger.

     Arduino_COM: "COM3"   # COM to which Arduino is connected. Use "None" when no board is connected. Straight quotes only.
     trigger_pin: 13   # Pin number for outputting TTL signals with Arduino. HONOURED since Beta 2 (always 13 in Beta 1).
     trigger_style: standard_arduino   # Select which trigger plugin to use.

   hardware:
     use_camera: True   # Specify whether to use the camera.
     camera_id: 0   # Specifying the camera ID.
     camera_width: 640   # Specify the width (px) of images captured by the camera.
     camera_height: 480   # Specify the height (px) of images captured by the camera.
     camera_scale: 1   # If you want to change the scale of the camera image, change this setting.
     camera_fps: 30   # Specifying camera fps.
     camera_imshow: False   # When set to True, the opencv window opens.
     camera_settings_dialog: False   # New in Beta 2. Opt-in camera driver property dialog.
   ```

    > A configuration creation tool built with DearPyGui is available for setting condition files up interactively.

2. Write the "Standard Firmata" program, located within the Example programs section of the Arduino IDE, to the Arduino.

3. Connect a camera and Arduino to the PC.

4. Select the condition YAML file on the YORU start page.

    > The launcher shows the selected condition file in the window at startup, and remembers the last-used config (in `~/.yoru/condition_file_log.json`) instead of resetting to `config/template.yaml`.

5. Run "Real-time Process".

    > The window fits the monitor it is on, and the panel arrangement is remembered (new in Beta 3). Use the **Window** menu to fit, maximise or reset the layout — see [The YORU window](../00-overview/#the-yoru-window-new-in-beta-3).

    > It can also be started directly from the command line:
    >
    > ```
    > python -m yoru.realtime_yoru_GUI path/to/condition.yaml
    > ```

6. Operate the Real-time Process GUI.

   i. Check the "YORU detection" box to start YORU's real-time analysis. Frames analyzed by YORU will be displayed on the right.

   ii. Check the "Trigger condition" box to start the YORU trigger. A TTL signal is then output on the Arduino pin given by `trigger_pin` when the trigger class is detected **above `trigger_threshold_configuration`** in a frame at most `result_max_age` seconds old.

   iii. Save videos by checking "Streaming data".

    > An [OBB model](../02-training/#oriented-bounding-boxes-obb) draws rotated rectangles on screen and in the recorded video. It needs no special setting.

---

## Detection results (`*_detect.csv`)

One row per detection per recorded frame. **Changed in Beta 3:** five columns were added at the end.

| Column | Meaning |
|---|---|
| `x1, y1, x2, y2` | The upright box, in pixels |
| `confidence` | Detection score |
| `class`, `class_name` | Class index and its name |
| `total_time` | Seconds since the run started, at which the frame used for the detection was captured (Beta 4). A result can be written for later recorded frames until it expires |
| `cx, cy, w, h` | New in Beta 3. The box's centre, and its own width and height |
| `angle` | New in Beta 3. Rotation of the `w` axis, in **radians** |

- A model trained on an OBB project fills the last five columns with the rotated box it predicted. Any other model fills them with the same upright box as `x1..y2` and an `angle` of `0`.
- The first eight columns are unchanged in both name and position, so existing analysis scripts and the bundled trigger plugins keep working.

---

## Stopping, recording and capture (changed in Beta 4)

- **Fresh results only.** Turning detection off or reloading the model invalidates its previous results, and the trigger ignores a result whose frame is older than `trigger.result_max_age` seconds (default `1.0`). Set this optional value to the largest delay your experiment can accept, allowing for the model's inference time. The trigger, the recorded `_detect.csv` and the preview all use the same check, so old boxes disappear from the preview.
- **The workers stop together.** Closing the window, choosing Quit, or losing the camera stops all of them. One that does not respond within 30 s is stopped by force and reported as an error, because its recording may be incomplete.
- **The trigger output is reset at the end.** The plugin is called once with no detections, which the bundled plugins take as output OFF, and then its `close()` if it has one. See [Custom Trigger Plugins](../06-trigger-plugins/#shutting-down-beta-4).
- **Recording does not drop frames.** Video and CSVs are written by a separate thread through a bounded queue. If the disk falls behind, acquisition waits instead of dropping frames, and write errors are reported. The AVI uses the configured constant FPS; `*_log.csv` records the actual acquisition time of each saved frame. The condition YAML is copied when recording starts.
- **Camera.** It opens with DirectShow on Windows, AVFoundation on macOS or V4L2 on Linux, falling back to the automatic backend, with a one-frame driver buffer. The driver settings dialog is available only on Windows.
- **Screen capture** runs at `hardware.camera_fps`, sleeping between frames. The screen region can be dragged in any direction; `Escape` cancels the selection, and a click that selects no area is ignored. It no longer resets `camera_width` / `camera_height` to 640×480.

---

## Configuration keys new or changed since Beta 2

| Key | Change |
|---|---|
| `trigger.result_max_age` | New in Beta 4, optional, default `1.0`. Maximum age in seconds of the frame a trigger may act on |
| `trigger.trigger_pin` | Now honoured (Beta 1 always used pin 13) |
| `trigger.trigger_threshold_configuration` | Now applied (Beta 1 ignored it) |
| `trigger.Arduino_COM` | `"None"` is supported for running with no board connected. Use straight quotes |
| `model.yolo_model_path` | Accepts `.onnx` as well as `.pt`. YOLOv5 `.pt` files, including those from YORU v1, load again from Beta 4 (not in Beta 2 / 3) |
| `model.yolo_model_type` | `yolov5` selects the bundled YOLOv5 backend (Beta 4; in Beta 2 / 3 it was an alias of `ultralytics`); `onnx` selects the ONNX backend. `auto` also recognises OBB models (Beta 3) and YOLOv5 checkpoints (Beta 4) |
| `hardware.camera_settings_dialog` | New, optional, default `False`. The camera driver's property dialog is now opt-in |
| `export` | Defaults to `./results/` in the shipped files |
| `root:` | Removed from the shipped files (was unused) |

---

## What changed in Beta 2

- **Three of the five bundled trigger plugins could not run at all** in Beta 1 — `standard_nidaq`, `state_convert` and `state_convert_for_copulation_attempts` could not even be constructed, so the trigger never engaged. The two `state_convert` plugins also still wrote to a serial port that had become a pyfirmata board. All are fixed.
- **The Arduino plugins no longer crash the trigger process when no board is connected.**
- **Turning the trigger off no longer crashes the trigger process** and no longer leaves the COM port held open, so re-enabling it in the same session works.
- **`nidaq.dio.stop()` now actually stops the DAQ task**, and a full-width character that made `ser_recount` unconstructible was fixed.
- **Screen-capture mode (`stream_MSS: True`) works.** Beta 1 fed 4-channel BGRA frames to the detector, the recorder and the display, producing broken output.
- **Recorded video plays back at the right speed.** It was written at the measured frame rate rather than the configured one.
- **Camera errors are legible.** A camera that cannot be opened, or that returns no frame, now says so and names `hardware.camera_id`.
- **The camera driver property dialog no longer pops up on every real-time start** — it is opt-in via `hardware.camera_settings_dialog`.
- **The detection process no longer spins a CPU core at full speed** when detection is switched off, and no longer dies silently on a bad frame; it sleeps between checks, and errors are logged and retried.
- The Real-time Process window was a fixed 1000×800 in Beta 2. From Beta 3 it fits the monitor it is on.

<br>

---

## [Next](../06-trigger-plugins/)

<br>

---

## [Previous](../04-evaluation/)
