---
layout: page
title: "Beta: Real-time Process"
order: 5
---

> Applies to **v2.0.0-beta.2**. For the stable v1.1.1 procedure, see the [User Guides]({{ site.baseurl }}/guides/05-closed-loop/).

> ⚠️ **Read this before your next closed-loop experiment.** Two settings that Beta 1 silently ignored are now honoured: `trigger_pin` and `trigger_threshold_configuration`. An unchanged condition file will not behave the way it did on Beta 1.

---

## Before you start: two settings that now take effect

### `trigger_pin`

Beta 1 hard-coded the TTL output to digital pin **13** and ignored whatever `trigger_pin` said in your file. **Beta 2 uses the value in the file.**

- If any of your condition files sets `trigger_pin` to something other than 13, **that pin is what will now fire.** Edit the YAML or rewire before your next experiment.
- Files with no `trigger_pin` key still default to 13.

### `trigger_threshold_configuration`

Beta 1 loaded this value but never read it, so the trigger fired on **any** detection of the trigger class regardless of confidence — effectively a threshold of 0.

- Beta 2 applies it. With the shipped values (0.3–0.5), expect **fewer firings** from an unchanged config.
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
     yolo_model_type: auto   # Optional. auto / ultralytics / rtdetr / torchvision / onnx. Auto-detected from the weights file if omitted.
     Trigger: False

   capture_style:
     stream_MSS: False   # When using the screen capture function, set to True.

   trigger:
     trigger_threshold_configuration: 0.3   # Confidence threshold when detecting YORU. APPLIED in Beta 2 (ignored in Beta 1).
     trigger_class: copulation   # Which action class to trigger.

     Arduino_COM: "COM3"   # COM to which Arduino is connected. Use "None" when no board is connected. Straight quotes only.
     trigger_pin: 13   # Pin number for outputting TTL signals with Arduino. HONOURED in Beta 2 (always 13 in Beta 1).
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

    > The launcher shows the selected condition file in the window at startup, and remembers the last-used config instead of resetting to `config/template.yaml`.

5. Run "Real-time Process".

    > It can also be started directly from the command line:
    >
    > ```
    > python -m yoru.realtime_yoru_GUI path/to/condition.yaml
    > ```

6. Operate the Real-time Process GUI.

   i. Check the "YORU detection" box to start YORU's real-time analysis. Frames analyzed by YORU will be displayed on the right.

   ii. Check the "Trigger condition" box to start the YORU trigger. A TTL signal is then output on the Arduino pin given by `trigger_pin` when the trigger class is detected **above `trigger_threshold_configuration`**.

   iii. Save videos by checking "Streaming data".

---

## Configuration keys new or changed in Beta 2

| Key | Change |
|---|---|
| `trigger.trigger_pin` | Now honoured (Beta 1 always used pin 13) |
| `trigger.trigger_threshold_configuration` | Now applied (Beta 1 ignored it) |
| `trigger.Arduino_COM` | `"None"` is supported for running with no board connected. Use straight quotes |
| `model.yolo_model_path` | Accepts `.onnx` as well as `.pt`. YOLOv5 `.pt` files no longer load |
| `model.yolo_model_type` | `yolov5` is aliased to `ultralytics`; `onnx` selects the ONNX backend |
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
- The Real-time Process window is 1000×800, narrower than in Beta 1 (it was 1280×700).

<br>

---

## [Next](../06-trigger-plugins/)

<br>

---

## [Previous](../04-evaluation/)
