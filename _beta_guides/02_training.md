---
layout: page
title: "Beta: Training"
order: 2
---

> Applies to **v2.0.0-beta.2**. For the stable v1.1.1 procedure, see the [User Guides]({{ site.baseurl }}/guides/02-training/).

---

## Procedure

1. Run the YORU's Training sub-module.

2. Create a project folder. (Step0)

    > Folders and a condition yaml file will be created.

3. Extract frames for labeling using Grab GUI. (Step1)

   I. Select a video in the Video file path in the Grab GUI.

   Ⅱ. Select Save directory. (Basically, all_label_images in the project folder is a good choice.)

   Ⅲ. Decide the grabbed frame name.

   IV. Cut out the screenshot.

      i. Play video with Streaming movie.

      ii. Arrow keys to go forward and back.

      iii. Grab Current Frame or Alt key to save frame.

    > **Changed in Beta 2:** Left / Right / Alt are now normal window shortcuts and only fire when the YORU window has focus. In Beta 1 they were a global OS hook, so typing in another application stepped frames and saved images into your dataset. Launching Frame Capture no longer freezes the window that launched it.

    <br>

    <img src="../../imgs/grab_gui_screenshot.png" width="70%">

    <br>

4. Run LabelImg and label the frames. (Step2)

    > The detailed documents are accessible in [LabelImg](https://github.com/HumanSignal/labelImg).

    > Save format is done in YOLO.

    > It is easier to do so if Auto Save mode is turned on in the View tab.

    <img src="../../imgs/labeling_example.png" width="80%">

5. Move all images and txt files to the "all_label_images" folder of the project. (Step3)

6. Push the "Move Label Images" button. (Step4)

    > Images and text files are copied to the train and val folders in a 4:1 ratio.

    > **Changed in Beta 2:** the split is deterministic (seeded), and `.jpg` / `.jpeg` / `.bmp` / `.tif` / `.tiff` datasets are handled as well as `.png`. In Beta 1 a non-PNG dataset silently produced split folders with labels but no images. **Do not re-split a project mid-experiment** — the split will differ from the one Beta 1 produced.

7. Select the classes.txt file and push "Add class info in YAML file". (Step5)

    > The information in classes.txt will be entered into the config.yml file.

8. Check the "YAML Path" and select training conditions — epochs, network, Image Size, Batch and so on.

9. Check the **GPU memory estimate**, then start training by pushing **"Train Model"**. (Step6)

    > See the two sections below.

    > In the terminal, you should check the initiation of training.

---

## Choosing a model

Beta 2 selects a backend through a plugin registry (`yoru/libs/plugins/`):

| Backend | Models |
|---|---|
| `ultralytics` | YOLOv8 / YOLO11 |
| `rtdetr` | RT-DETR |
| `torchvision` | Faster R-CNN / Mask R-CNN / SSD |
| `onnx` | `.onnx` exports (inference only) |
| `auto` | Picks one from the weights file |

- `auto` no longer unpickles the checkpoint to identify it — it reads the file name and, if needed, the class-name table out of the archive.
- If a backend's dependency is missing, the error names the backends that *are* available and why the others failed.
- The ONNX backend is **inference only**; use it for analysis and real-time processing, not for training.

### Existing YOLOv5 projects

The bundled YOLOv5 code was removed in Beta 2. **YOLOv5 can no longer be trained, and old YOLOv5 `.pt` weights no longer load.**

- **To keep using an existing YOLOv5 model for detection:** export it to ONNX with the upstream YOLOv5 repository, then point `yolo_model_path` at the `.onnx` file. The ONNX backend understands the YOLOv5 output layout and is selected automatically from the file extension.
- **Otherwise:** retrain with YOLOv8 or YOLO11. Opening a v1.x / Beta 1 project does not error — the GUI swaps `yolov5s.pt` for `yolo11s.pt` (same size letter) and prints a notice — but **the run starts from scratch and the results are not comparable to the YOLOv5 baseline.**
- Condition files that still say `yolo_model_type: yolov5` keep loading; the name is aliased to `ultralytics`. It is the old weight *file* that cannot be read.

---

## GPU memory estimate

Step 6 shows a live line such as:

```
~9.4 GB needed / 7.6 GB free (NVIDIA RTX 4070)
```

- It comes with a breakdown, is colour-coded green / orange / red, and is recalculated as the model, Image Size and Batch change.
- It counts **free** VRAM, so another training run or a live detection session on the same card is taken into account.
- Pressing **Train Model** while the line is red offers **"Use Batch *n*"** (the largest batch expected to fit), **"Train anyway"** or **"Cancel"**.
- The estimate is accurate to roughly **±30%**, so treat it as guidance rather than a guarantee.

---

## Stopping a run

- **"Stop after this epoch"** ends the run gracefully: the current epoch finishes and is saved, the final validation pass runs, and both `best.pt` and `last.pt` stay usable.
- A red **Force stop** appears while a stop is pending. Its confirmation spells out what is lost, and it kills the dataloader workers too, so nothing is left holding the GPU.
- A run started from a terminal can be stopped the same way by creating an empty `.yoru_stop_request` file in the project directory.
- Step 6 reports how the run ended — **Complete!!**, or **Stopped at epoch N / M** with a message giving the weights location.
- **Train Model** is disabled during a run, so a second training subprocess can no longer be started by accident.

---

## Where the trained model is saved

**Changed in Beta 2:** results go to `exp_<model>/`, not `train/`.

| Backend | Weights |
|---|---|
| YOLO / RT-DETR | `<project>/exp_yolo11s/weights/best.pt` |
| torchvision | `<project>/exp_fasterrcnn/fasterrcnn_best.pt` |

- Repeat runs go to `exp_yolo11s2`, `exp_yolo11s3`, … so retraining no longer overwrites earlier weights, and checkpoints are no longer written into the training-image folder.
- Existing `train/` folders from earlier versions are untouched. Update any scripts or notes that point at `<project>/train/weights/best.pt`.

---

## Other changes in the Training GUI

- The training console shows **one line per epoch** instead of ~161 — ultralytics' progress-bar redraws were previously arriving as separate lines.
- Training subprocesses use the Python interpreter YORU is running under, so training works when YORU is started from another directory, or when `python` is not the environment's interpreter.

---

## Q&A

- **torch.cuda.OutOfMemoryError: CUDA out of memory.**

> This occurs when the mini-batch during training exceeds the GPU's memory capacity. Try a smaller batch size — in Beta 2 the GPU memory estimate warns about this before the run starts, and offers the largest batch expected to fit.

- **Training aborts on a label file ending in a blank line.**

> Fixed in Beta 2.

<br>

---

## [Next](../03-analysis/)

<br>

---

## [Previous](../01-install/)
