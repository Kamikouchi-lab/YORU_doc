---
layout: page
title: "Beta: Evaluation"
order: 4
---

> Applies to **v2.0.0-beta.2**. For the stable v1.1.1 procedure, see the [User Guides]({{ site.baseurl }}/guides/04-evaluation/).

---

## Procedure

1. Run the YORU's Evaluation sub-module.

2. Load a project config.yaml file and a model.

    > **Changed in Beta 2:** the model is in the **`exp_<model>/`** folder, not `train/`.
    >
    > - YOLO / RT-DETR: `<project>/exp_yolo11s/weights/best.pt`
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

   > Images that are not used for creating a model are better.

   > **Changed in Beta 2:** Left / Right / Alt only fire when the YORU window has focus, and grabbing before an output folder has been chosen no longer crashes.

4. Run LabelImg and label the frames.

    > The detailed documents are accessible in [LabelImg](https://github.com/HumanSignal/labelImg).

    > Save format is done in YOLO.

    > It is easier to do so if Auto Save mode is turned on in the View tab.

5. Push the "Prediction" button.

6. Push the "Calculate APs" button.

    > YORU calculates APs and IOUs.

---

## What changed in Beta 2

- **A divide-by-zero in the evaluation IoU** was fixed.
- **Quit no longer raises** in the Evaluation and Create-Labels windows.
- A **SciPy function that was removed in modern versions** is no longer used, so evaluation works on current SciPy.
- `yoru.libs.file_operation_evaluation` was removed — it was a duplicate of `yoru.libs.file_operation_create_label`. This only matters if you import YORU from your own scripts.
- Detection thresholds are uniform across backends (confidence 0.25, IoU 0.45). **AP and IoU numbers from Beta 2 are therefore not directly comparable with numbers produced under Beta 1**, especially for torchvision models.

<br>

---

## [Next](../05-closed-loop/)

<br>

---

## [Previous](../03-analysis/)
