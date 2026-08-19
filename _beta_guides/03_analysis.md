---
layout: page
title: "Beta: Video Analysis"
order: 3
---

> Applies to **v2.0.0-beta.2**. For the stable v1.1.1 procedure, see the [User Guides]({{ site.baseurl }}/guides/03-analysis/).

---

## Procedure

1. Select a model to analyze videos.

    > Beta 2 accepts YOLOv8 / YOLO11, RT-DETR and torchvision checkpoints, and `.onnx` files. The backend is chosen from the weights file. **YOLOv5 `.pt` files no longer load** — export them to ONNX first, or retrain. See [Training](../02-training/#existing-yolov5-projects).

2. Select movies.

3. Select a folder to save results.

4. Check the previews.

    > When a video is loaded, the first video appears in PREVIEW.

    > Check for flips, etc., and adjust vertical and horizontal flips if any are present.

5. Push "YOLO analysis" and start an analysis.

    > If you check "Create videos", YORU will save the videos shown in the box.

    > If you check "Tracking algorithm", YORU will save the IDs in the results csv file.

    > YORU has the option of individual identification in multi-animal scenarios, applying the Kuhn-Munkres method (Bashar et al., 2022) to assign IDs based on positional information following object detection. This function is still a beta function.

---

## What changed in Beta 2

- **The window no longer freezes.** In Beta 1 the Video Analysis window showed "Not Responding" for the whole job and the progress bar never moved. Analysis now runs on a worker thread with live movie/image progress, remaining time and movies-left counters. Buttons are disabled while busy, and errors are shown in the status line.
- **Rendered videos are no longer upside down.** `create_video()` flipped unconditionally, ignoring the flip checkboxes, and crashed on the last frame. Both are fixed — but check the preview flip settings in step 4, because they now take effect as configured.
- **Detections are no longer lost.** A single below-threshold detection used to discard the rest of that frame's detections in offline analysis.
- **Detection thresholds are uniform across backends** (confidence 0.25, IoU 0.45). Previously each backend used its own default, so **torchvision models in particular will report a different number of detections than in Beta 1.**
- **ONNX inference letterboxes** instead of stretching the frame, so boxes on non-square inputs are geometrically correct but numerically different from Beta 1.

> Because of the last two points, results produced under Beta 2 are not always directly comparable with results produced under Beta 1 or v1.1.1. Do not mix them within one dataset.

---

### Data example

- Default

<img src="../../imgs/defalut_results.png" width="70%">

<br>

- Default with tracking

<img src="../../imgs/tracking_results.png" width="70%">

<br>

- Result video frame

<img src="../../imgs/individual_no_images00001.png" width="70%">

<br>

---

## [Next](../04-evaluation/)

<br>

---

## [Previous](../02-training/)
