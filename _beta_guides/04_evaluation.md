---
layout: page
title: "Beta: Evaluation"
order: 4
---

> Applies to **v2.0.0-beta.3**. For the stable v1.1.2 procedure, see the [User Guides]({{ site.baseurl }}/guides/04-evaluation/).

---

## Procedure

1. Run the YORU's Evaluation sub-module.

2. Load a project config.yaml file and a model.

    > The model is in the **`exp_<model>/`** folder, not `train/` (changed in Beta 2).
    >
    > - YOLO / RT-DETR: `<project>/exp_yolo11s/weights/best.pt`
    > - YOLO OBB: `<project>/exp_yolo11s-obb/weights/best.pt`
    > - torchvision: `<project>/exp_fasterrcnn/fasterrcnn_best.pt`
    >
    > Repeat training runs go to `exp_yolo11s2`, `exp_yolo11s3`, … so make sure you pick the run you mean.

3. Extract frames for labeling using Grab GUI.

   I. Select a video in the Video file path in the Grab GUI.

   Ⅱ. Select Save directory. (Basically, all_label_images in the project folder is a good choice.)

   Ⅲ. Decide the grabbed frame name.

   IV. Cut out the screenshot.

      i. Play video with Streaming movie.

      ii. Arrow keys to go forward and back.

      iii. Grab Current Frame or Alt key to save frame.

   > Images that are not used for creating a model are better. **Automatic Extraction** (new in Beta 3) can pick them for you — set the *Video range* to a part of the video that the training frames did not come from. See [Automatic Extraction](../02-training/#automatic-extraction).

   > Left / Right / Alt only fire when the YORU window has focus, and grabbing before an output folder has been chosen no longer crashes (changed in Beta 2).

4. Push "Run LabelImg" and label the frames.

    > **Changed in Beta 3:** this button opens YORU's bundled LabelImg, like the Training GUI does. It opens the evaluation images in the project's format — YOLO-OBB for an OBB project — so OBB evaluation images can now be labelled. [Click to Box](../02-training/#click-to-box) is available here too.

    > It is easier to label if Auto Save mode is turned on in the View tab.

5. Push the "Prediction" button.

6. Push the "Calculate APs" button.

    > YORU calculates APs and IOUs.

---

## Evaluating an OBB model

The Evaluation sub-module reads OBB label files, but it computes IoU on the *upright* box around each rotated box. **The angle is not evaluated at all.**

- The mAP it reports for an OBB model is therefore not reliable, and for elongated, tilted animals it is usually **too high**. For example, a 100×10 box at +45° and the same box at −45° share one upright box and score an IoU of 1.0, although as rotated boxes they barely overlap.
- **Quote the rotated mAP that ultralytics prints at the end of training instead.**

---

## What changed in Beta 2

- **A divide-by-zero in the evaluation IoU** was fixed.
- **Quit no longer raises** in the Evaluation and Create-Labels windows.
- A **SciPy function that was removed in modern versions** is no longer used, so evaluation works on current SciPy.
- `yoru.libs.file_operation_evaluation` was removed — it was a duplicate of `yoru.libs.file_operation_create_label`. This only matters if you import YORU from your own scripts.
- Detection thresholds are uniform across backends (confidence 0.25, IoU 0.45). **AP and IoU numbers from the beta are therefore not directly comparable with numbers produced under Beta 1**, especially for torchvision models.

<br>

---

## [Next](../05-closed-loop/)

<br>

---

## [Previous](../03-analysis/)
