---
layout: page
title: "Beta: Video Analysis"
order: 3
---

> Applies to **v2.0.0-beta.4**. For the stable v1.1.2 procedure, see the [User Guides]({{ site.baseurl }}/guides/03-analysis/).

> ⚠️ **Beta 3 changed the column order of the result CSV.** If you read it by column position in your own scripts, see [Result CSV](#result-csv-changed-in-beta-3) below.

> ⚠️ **Beta 4 changed how `tracking_id` is assigned.** Re-analysing a movie can give different IDs. See [Tracking](#tracking-changed-in-beta-4) below.

---

## Procedure

1. Select a model to analyze videos.

    > The beta accepts YOLOv5 (including models trained with YORU v1, again from Beta 4), YOLOv8 / YOLO11 (including OBB models), RT-DETR and torchvision checkpoints, and `.onnx` files. The backend is chosen from the weights file. See [Training](../02-training/#yolov5).

2. Select movies.

3. Select a folder to save results.

4. Check the previews.

    > When a video is loaded, the first video appears in PREVIEW.

    > Check for flips, etc., and adjust vertical and horizontal flips if any are present.

5. Push "YOLO analysis" and start an analysis.

    > If you check "Create videos", YORU will save the videos shown in the box. For an [OBB model](../02-training/#oriented-bounding-boxes-obb), the rendered video shows rotated rectangles.

    > If you check "Tracking algorithm", YORU will save the IDs in the results csv file. **Max move/frame (px)** (new in Beta 4) appears with it: see [Tracking](#tracking-changed-in-beta-4).

    > YORU has the option of individual identification in multi-animal scenarios, applying the Kuhn-Munkres method (Bashar et al., 2022) to assign IDs based on positional information following object detection. This function is still a beta function. For persistent IDs through crossings and missed detections, see the sister application [YORU Tracker](https://kamikouchi-lab.github.io/YORU-Tracker_doc/).

---

## Result CSV (changed in Beta 3)

The results CSV describes each box twice: as `x1, y1, x2, y2` (the upright box), and as `x_center, y_center, w, h, angle` (the box's own centre, size and rotation in **radians**).

| Version | Columns |
|---|---|
| Beta 2 | `frame, x1, y1, x2, y2, x_center, y_center, confidence, class, class_name[, tracking_id]` |
| Beta 3 | `frame, x1, y1, x2, y2, x_center, y_center, w, h, angle, confidence, class, class_name[, tracking_id]` |

- This applies to **every** project, not only OBB ones. `confidence`, `class`, `class_name` and `tracking_id` move three columns to the right.
- Scripts that read the columns **by name** keep working. Scripts that read them **by position** must be updated.
- For an OBB model, `w, h, angle` are the rotated box it predicted. For every other model, `angle` is always `0` and the two forms describe the same box.

---

## Tracking (changed in Beta 4)

*Tracking algorithm* matches the detection centres of consecutive frames. Two things changed in Beta 4:

- **Only real distances decide the matching.** When two frames had different numbers of detections, the shorter side used to be padded with dummy points at (-1000, -1000), and the distance to them counted. The detection nearest the image's top-left corner was therefore the one most likely to lose its ID — an animal moving 70 px toward that corner could lose its ID to a newcomer far away.
- **IDs are numbered without gaps.** A new ID is drawn only for a detection that starts a track. Before, every track that ended also used up an ID.

**Max move/frame (px)** limits how far a centre may move between frames. A detection that moves farther starts a new track. The default, `0`, means no limit, and then only the two fixes above apply.

> Re-analysing a movie with Beta 4 can change `tracking_id`: frames where the detection count changes may pair differently, and IDs after a track has ended are lower. Compare `tracking_id` only between results made with the same version.

---

## The Video Analysis window

- The window **fits the monitor it is on** (new in Beta 3). Use the **Window** menu to fit, maximise, change the text size or reset the panel layout. See [The YORU window](../00-overview/#the-yoru-window-new-in-beta-3).
- **If the two panels open on top of each other** the first time after upgrading from Beta 2, choose **Window → Reset layout to default** once, or delete `logs/custom_layout_analysis.ini`. The panels now have stable internal names, so an old saved layout no longer matches.
- Analysis runs on a worker thread with live movie/image progress, remaining time and movies-left counters. Buttons are disabled while busy, and errors are shown in the status line (changed in Beta 2).

---

## What changed in Beta 4

- **YOLOv5 models give the same results as in v1.** v1 applied a confidence threshold above 0.25 after NMS, and the beta does the same again. Video analysis of the same video and model then agrees with v1 at thresholds 0.25, 0.5 and 0.7, tracking IDs included.
- **Quit, Back to Home and the window's close button** take the same way out: a running analysis stops, its worker is joined, and the layout is saved before the window closes.

---

## What changed in Beta 2

- **The window no longer freezes.** In Beta 1 the Video Analysis window showed "Not Responding" for the whole job and the progress bar never moved.
- **Rendered videos are no longer upside down.** `create_video()` flipped unconditionally, ignoring the flip checkboxes, and crashed on the last frame. Both are fixed — but check the preview flip settings in step 4, because they now take effect as configured.
- **Detections are no longer lost.** A single below-threshold detection used to discard the rest of that frame's detections in offline analysis.
- **Detection thresholds are uniform across backends** (confidence 0.25, IoU 0.45). Previously each backend used its own default, so **torchvision models in particular report a different number of detections than in Beta 1.**
- **ONNX inference letterboxes** instead of stretching the frame, so boxes on non-square inputs are geometrically correct but numerically different from Beta 1.

> Because of the last two points, results produced under the beta are not always directly comparable with results produced under Beta 1 or v1.1.x. Do not mix them within one dataset.

---

### Data example

> These examples were produced by v1.1.x and do not have the `w, h, angle` columns.

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
