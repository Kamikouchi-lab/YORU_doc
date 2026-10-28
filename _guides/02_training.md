---
layout: page
title: Training
order: 2
---

1. Run the YORU's Training sub-module.

2. Create a project folder. (Step0)

    > Folders and condition yaml file will be created.

    > To continue with an existing project, select its folder and push "Load YORU project".

3. Extract frames for labeling using Grab GUI. (Step1)

   I. Select a video in the Video file path in the Grab GUI.

   Ⅱ. Select Save directory. (Basically, all_label_images in the project folder is a good choice.)

   Ⅲ. Decide the grabbed frame name.

   IV. Cut out the screenshot.

      i. Play video with Streaming movie.

      ii. Arrow keys to go forward and back.

      iii. Grab Current Frame or Alt key to save frame.


    <br>

    <img src="../../imgs/grab_gui_screenshot.png" width="70%">

    <br>

4. Run LabelImg and label the frames. (Step2)

    > The detailed documents are accessible in [LabelImg](https://github.com/HumanSignal/labelImg).

    > Save format is done in YOLO.

    > It is easier to do so if Auto Save mode is turned on in the View tab.

<img src="../../imgs/labeling_example.png" width="80%">

5. Move all images and txt files to "all_label_images" folder of the project. (Step3)

6. Push "Move Label Images" button. (Step4)

    > Images and text files are copied to the train and val folders in a 4:1 ratio.

7. Select classes.txt file and push "Add class info in YAML file". (Step5)

    > The information in classes.txt will be entered into the config.yml file.

8. Check the "YAML Path" and select training conditions, such as the model, epochs, Image Size, Batch and **Device**.

    > See [Choosing a model](#choosing-a-model) and [Choosing the device](#choosing-the-device) below.

9. Start training by pushing "Train Model".

    > The progress bar shows the current epoch. In the terminal, you should check the initiation of training.

    > If training fails, YORU shows an error message instead of closing silently. The full error is also written to `~/.yoru/logs/yoru.log` (`%USERPROFILE%\.yoru\logs\yoru.log` on Windows).

<br>

---

## Choosing a model

From v1.1.2, the Training GUI can train these models:

| Model family | Options |
|---|---|
| YOLO | YOLOv5, YOLOv8, YOLO11 — sizes `n` / `s` / `m` / `l` / `x` |
| RT-DETR | sizes `l` / `x` |
| Faster R-CNN | ResNet50-FPN backbone |
| Mask R-CNN | ResNet50-FPN backbone |
| SSD | VGG16 backbone |

> The default is **YOLOv5s**, the model used in the YORU paper.

> YOLOv8, YOLO11 and RT-DETR are trained with the [ultralytics](https://docs.ultralytics.com/) package. Faster R-CNN, Mask R-CNN and SSD are trained with torchvision.

The Video Analysis and Real-time Process sub-modules recognise the model type from the weights file, so you can use any of these models there without extra settings.

### Where the trained model is saved

| Model | Weights |
|---|---|
| YOLOv5 | `<project>/exp/weights/best.pt` |
| YOLOv8 / YOLO11 / RT-DETR | `<project>/train2/weights/best.pt` |
| Faster R-CNN / Mask R-CNN / SSD | `<project>/train/fasterrcnn_best.pt` (`maskrcnn_best.pt`, `ssd_best.pt`) |

> Repeat YOLO and RT-DETR runs are saved to new folders (`exp2`, `exp3`, … / `train3`, `train4`, …), so check the folder of the run you mean. The ultralytics runs start at `train2` because `train/` already holds the training images.

> Torchvision runs write into the `train/` folder each time and **overwrite** the previous weights. Copy them elsewhere before you retrain.

---

## Choosing the device

The **Device** selector chooses where training runs:

| Value | Meaning |
|---|---|
| `auto` | CUDA, then Apple MPS, then the CPU (default) |
| `cuda` | NVIDIA GPU |
| `mps` | Apple Silicon GPU |
| `cpu` | CPU only (much slower) |

The text next to the selector shows the device that will actually be used. If the requested device is not available, YORU falls back to the next best one. See [Install]({{ site.baseurl }}/guides/01-install/#choosing-the-compute-device) for the `YORU_DEVICE` environment variable.

<br>

### GUI

<img src="../../imgs/screenshots_description_01.png" width="100%">

<img src="../../imgs/screenshots_description-02.png" width="100%">

<br>

## Q&A

- torch.cuda.OutOfMemoryError: CUDA out of memory.

> This occurs when the mini-batch during training exceeds the GPU's memory capacity. Try a smaller batch size.

More questions are answered on the [Q and A]({{ site.baseurl }}/troubleshootings/) page.

---

## [Next](../03-analysis/)

<br>

---

## [Previous](../01-install/)
