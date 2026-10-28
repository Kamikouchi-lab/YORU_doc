---
layout: page
title: "Beta: Training"
order: 2
---

> Applies to **v2.0.0-beta.4**. For the stable v1.1.2 procedure, see the [User Guides]({{ site.baseurl }}/guides/02-training/).

---

## Procedure

1. Run the YORU's Training sub-module.

2. Create a project folder. (Step0)

    > Folders and a condition yaml file will be created.

    > **New in Beta 3 — Oriented Bounding Box (OBB).** Tick this box *before* creating the project if your animals are elongated and lie at every angle (a fly, a larva, a fish). The project is then labelled, trained and run with *rotated* boxes instead of upright ones. See [Oriented bounding boxes (OBB)](#oriented-bounding-boxes-obb) below.

    > The choice is written into the project's `config.yaml` as `task: obb` (`task: detect` otherwise). It cannot be changed afterwards without relabelling, because the two label formats are different.

3. Extract frames for labeling using Grab GUI. (Step1)

   I. Select a video in the Video file path in the Grab GUI.

   Ⅱ. Select Save directory. (Basically, all_label_images in the project folder is a good choice.)

   Ⅲ. Decide the grabbed frame name. (If you leave it blank, the video's file name is used.)

   IV. Cut out the screenshot, by hand or automatically.

      i. Play video with Streaming movie.

      ii. Arrow keys to go forward and back.

      iii. Grab Current Frame or Alt key to save frame.

      iv. **Or** pick a whole set of frames at once with [Automatic Extraction](#automatic-extraction) (new in Beta 3).

    > Left / Right / Alt are normal window shortcuts and only fire when the YORU window has focus (changed in Beta 2).

    > **Fixed in Beta 3:** Frame Capture silently saved nothing into folders with Japanese (non-ASCII) names. Such folders now work.

    <br>

    <img src="../../imgs/grab_gui_screenshot.png" width="70%">

    <br>

4. Push "Run LabelImg" and label the frames. (Step2)

    > **Changed in Beta 3:** YORU opens its **own copy** of LabelImg, already pointed at the project's `all_label_images` folder and its `classes.txt`, and already in the format the project needs — YOLO for an ordinary project, YOLO-OBB for an OBB one. You no longer set the save format by hand.

    > Two tools are new: [Click to Box](#click-to-box) and, in OBB projects, [rotated boxes](#oriented-bounding-boxes-obb). The general LabelImg documentation is at [LabelImg](https://github.com/HumanSignal/labelImg).

    > It is easier to label if Auto Save mode is turned on in the View tab.

    <img src="../../imgs/labeling_example.png" width="80%">

5. Move all images and txt files to the "all_label_images" folder of the project. (Step3)

6. Push the "Move Label Images" button. (Step4)

    > Images and text files are copied to the train and val folders in a 4:1 ratio.

    > The split is deterministic (seeded), and `.jpg` / `.jpeg` / `.bmp` / `.tif` / `.tiff` datasets are handled as well as `.png` (changed in Beta 2). **Do not re-split a project mid-experiment** — the split will differ from the one Beta 1 produced.

7. Select the classes.txt file and push "Add class info in YAML file". (Step5)

    > The information in classes.txt will be entered into the config.yml file.

8. Check the "YAML Path" and select training conditions — model, epochs, Image Size, Batch and **Device**.

    > **Changed in Beta 4:** a new project starts on **YOLOv5** (`yolov5s.pt`), as in YORU v1, instead of YOLO11. Choose another version here if you want one. See [YOLOv5](#yolov5).

    > In an OBB project, the model family is fixed to YOLO, the version to YOLOv8 or YOLO11, and the weight gets an `-obb` suffix (for example `yolo11s-obb.pt`).

    > **Device** is `auto` (CUDA, then Apple MPS, then CPU), `cuda`, `mps` or `cpu`. See [Install](../01-install/#choosing-the-compute-device).

9. Check the **GPU memory estimate**, then start training by pushing **"Train Model"**. (Step6)

    > See [GPU memory estimate](#gpu-memory-estimate) and [Stopping a run](#stopping-a-run) below.

    > In the terminal, you should check the initiation of training. If training fails, a popup shows the last lines of the training output.

---

## Automatic Extraction

New in Beta 3. Instead of looking for frames one at a time, **Automatic Extraction** in the Frame Capture (Grab) GUI picks a whole set at once, the way DeepLabCut's `extract_frames` does.

1. Set *Frames to pick*.
2. Choose an algorithm (`uniform` or `kmeans`).
3. Optionally set the *Video range*.
4. Press **Extract Frames**.

The frames are written into the same folder, with the same names, as the ones grabbed by hand. **Stop** interrupts a run and keeps what it has already saved.

| Algorithm | How it works | When to use it |
|---|---|---|
| **uniform** | Draws frames at random from the range. Instant, and the sample mirrors how often each behaviour happens. | The behaviour you are labelling is common. |
| **kmeans** | Shrinks every frame to a thumbnail, clusters the thumbnails by appearance and takes one frame per cluster. It reads the range once, so it takes a few seconds per thousand frames. | The behaviour is rare, or a uniform sample came back looking all the same. |

- **Video range** is given as fractions of the video, so `0.25` to `0.75` is the middle half. Use it to skip the handling at the start of a recording, or to keep the end of a video back as unseen test material for [Evaluation](../04-evaluation/).
- Extracting more than once adds new frames rather than replacing them, so a second run is a reasonable way to enlarge a training set that turned out too small.

> **Known issue:** files are named `<frame name>_<frame number>.png`. A second run over the same range rewrites the frames that overlap, and the saved-frame counter counts them twice. Give each video its own frame name when several videos share one output folder.

---

## Click to Box

New in Beta 3. Instead of dragging a rectangle around each animal, press **C** (or the *Click to Box* button) in LabelImg and click once on the animal. A box is fitted to its body and given the current label.

- The fit finds the animal's body axis and leaves its legs, wings and antennae out of the box. In an OBB project the box comes out rotated along the body; in an ordinary project you get the upright box around the same fit.
- It works on a dark animal on a light plate and on a pale animal on a dark plate, deciding which from the pixels under the cursor. No model is needed — it runs on OpenCV alone.
- The tool disarms itself as soon as a box appears, so your next click can grab a corner to adjust it. Press **C** again for the next animal, or **Escape** to cancel.
- If it cannot find an animal where you clicked, it says so in the status bar and stays armed, so you can click again a little further over. Drawing the box by hand with **W** always works.

---

## Oriented bounding boxes (OBB)

New in Beta 3. In an OBB project a box can be turned to lie along the animal:

| Key | Action |
|---|---|
| `Z` / `X` | Turn the selected box 1° left / right |
| `Shift+Z` / `Shift+X` | Turn it 15° left / right |

- Dragging a corner still resizes the box, and it stays square to its own axes rather than to the image, so a tilted box is adjusted exactly like an upright one.
- The status bar shows the box's own width, height and angle, not those of the upright box around it.
- OBB labels are saved as `class x1 y1 x2 y2 x3 y3 x4 y4` (four corners, normalised) — the format ultralytics reads for `task="obb"`. The file extension is `.txt`, the same as ordinary YOLO labels; LabelImg tells the two apart by counting the numbers on a line.
- Only **YOLOv8 and YOLO11** have a rotated-box head. YOLOv5, RT-DETR, Faster R-CNN, Mask R-CNN and SSD cannot be trained on oriented boxes. Ticking OBB moves a YOLOv5 selection to YOLO11.

### What an OBB project changes, end to end

| Stage | Ordinary project | OBB project |
|---|---|---|
| `config.yaml` | `task: detect` | `task: obb` |
| LabelImg format | YOLO (`class cx cy w h`) | YOLO-OBB (`class x1 y1 … y4`) |
| Weight | `yolov5s.pt` (default) or e.g. `yolo11s.pt` | `yolo11s-obb.pt` |
| Model families | all of them | YOLOv8 / YOLO11 only |
| Real-time / analysis drawing | upright rectangle | rotated rectangle |
| `*_detect.csv` | `… total_time, cx, cy, w, h, angle` (`angle = 0`) | `… total_time, cx, cy, w, h, angle` |

Detection needs no special setting: leave `yolo_model_type: "auto"` and YORU recognises an OBB model by itself.

> **Keep ordinary (5-field) label files out of OBB projects.** In an OBB session, opening an axis-aligned label file switches LabelImg to plain YOLO, and boxes saved after that lose their angle. Check the format button in LabelImg's toolbar if in doubt.

> **Changed in Beta 4:** the Evaluation sub-module scores OBB models by the rotated boxes themselves. See [Evaluation](../04-evaluation/#how-ap-is-calculated-changed-in-beta-4).

---

## Choosing a model

The beta selects a backend through a plugin registry (`yoru/libs/plugins/`):

| Backend | Models |
|---|---|
| `yolov5` | YOLOv5, run by the bundled YOLOv5 code as in v1 (new in Beta 4) |
| `ultralytics` | YOLOv8 / YOLO11 (including `-obb` weights), and ultralytics' YOLOv5u |
| `rtdetr` | RT-DETR |
| `torchvision` | Faster R-CNN / Mask R-CNN / SSD |
| `onnx` | `.onnx` exports (inference only) |
| `auto` | Picks one from the weights file |

- `auto` does not unpickle the checkpoint to identify it. It reads the module names a YOLOv5 checkpoint was saved with, then the file name and, if needed, the class-name table out of the archive. A v1 weight named `best.pt` therefore reaches the YOLOv5 backend without being renamed.
- If a backend's dependency is missing, the error names the backends that *are* available and why the others failed.
- The ONNX backend is **inference only**; use it for analysis and real-time processing, not for training.

### YOLOv5

New in Beta 4 (Betas 2 and 3 could not use YOLOv5). YORU bundles upstream YOLOv5 — the anchor-based model from [ultralytics/yolov5](https://github.com/ultralytics/yolov5) that YORU v1 trained with — in `yoru/libs/yolov5/`. It is a first-class backend and the default for a new project: training, real-time detection, analysis and evaluation all work with it, and nothing has to be exported.

- **Opening a v1 project.** Open the project folder in the Training GUI as usual. The GUI restores its YOLOv5 selection instead of substituting a different model.
- **Using a v1 model for detection.** Set `yolo_model_type: "yolov5"` in the condition file, or leave it on `auto`. The boxes are the same as in v1: on three v1 models every box matched exactly, and with the same confidence threshold video analysis agrees with v1, tracking IDs included.
- **YOLOv5 and YOLOv5u are different models.** The *YOLOv5* entry in the Version selector always means upstream YOLOv5 (`yolov5s.pt` and friends). Ultralytics' **YOLOv5u** (`yolov5su.pt`) puts the same backbone under YOLOv8's anchor-free head; it has different weights and a different output format, and it runs on the `ultralytics` backend. YORU tells them apart by the `u` in the file name.
- **Colour order.** YORU v1 gave its YOLOv5 models the BGR frames OpenCV reads, although YOLOv5 trains on RGB, and the beta does the same by default so that v1 models reproduce their results. To give YOLOv5 models RGB frames instead, set `YORU_YOLOV5_RGB=1` before launching (`set YORU_YOLOV5_RGB=1` on Windows). The order in use is printed and written to `yoru.log` each time a model loads.
- **What YOLOv5 cannot do.** It predicts upright boxes only, so it cannot be used in an [OBB project](#oriented-bounding-boxes-obb).

> **A `.pt` file runs code when it is opened.** Loading a YOLOv5 checkpoint means unpickling it, which executes whatever the file says to. Train your own weights, or get them from someone you trust.

---

## GPU memory estimate

Step 6 shows a live line such as:

```
~9.4 GB needed / 7.6 GB free (NVIDIA RTX 4070)
```

- It comes with a breakdown, is colour-coded green / orange / red, and is recalculated as the model, Image Size and Batch change.
- It counts **free** VRAM, so another training run or a live detection session on the same card is taken into account.
- Pressing **Train Model** while the line is red offers **"Use Batch *n*"** (the largest batch expected to fit), **"Train anyway"** or **"Cancel"**.
- The estimate is accurate to roughly **±30%**, so treat it as guidance rather than a guarantee. From Beta 4 it covers YOLOv5 n/s/m/l/x too; it gives no estimate for ultralytics' YOLOv5u.

> **Known issue:** the warning still appears when *Device* is set to `cpu`. Choose **Train anyway**.

---

## Stopping a run

- **"Stop after this epoch"** ends the run gracefully: the current epoch finishes and is saved, the final validation pass runs, and both `best.pt` and `last.pt` stay usable.
- A red **Force stop** appears while a stop is pending. Its confirmation spells out what is lost, and it kills the dataloader workers too, so nothing is left holding the GPU.
- A run started from a terminal can be stopped the same way by creating an empty `.yoru_stop_request` file in the project directory.
- Step 6 reports how the run ended — **Complete!!**, or **Stopped at epoch N / M** with a message giving the weights location.
- **Train Model** is disabled during a run, so a second training subprocess cannot be started by accident.
- **Closing the Training window stops the training** (changed in Beta 4). It asks the run to stop at the end of the epoch, waits 3 s, and then ends the training process along with its data-loader workers. Checkpoints already saved remain, but the unfinished epoch may be lost. To keep it, use **Stop after this epoch** and wait for the run to finish.
- With YOLOv5, *Stop after this epoch* works the same way, and the epoch count starts from 1 as for the other models.

---

## Where the trained model is saved

Results go to `exp_<model>/` (changed in Beta 2):

| Backend | Weights |
|---|---|
| YOLOv5 | `<project>/exp_yolov5s/weights/best.pt` |
| YOLO / RT-DETR | `<project>/exp_yolo11s/weights/best.pt` |
| YOLO OBB | `<project>/exp_yolo11s-obb/weights/best.pt` |
| torchvision | `<project>/exp_fasterrcnn/fasterrcnn_best.pt` |

- Repeat runs go to `exp_yolo11s2`, `exp_yolo11s3`, … so retraining does not overwrite earlier weights, and checkpoints are not written into the training-image folder.
- Existing `train/` folders from earlier versions are untouched. Update any scripts or notes that point at `<project>/train/weights/best.pt`.

---

## Other behaviour of the Training GUI

- The training console shows **one line per epoch** instead of ~161 (ultralytics' progress-bar redraws used to arrive as separate lines). From Beta 4, YOLOv5's progress bars are also shown one row each.
- Training subprocesses use the Python interpreter YORU is running under, so training works when YORU is started from another directory, or when `python` is not the environment's interpreter.

---

## Q&A

- **torch.cuda.OutOfMemoryError: CUDA out of memory.**

> This occurs when the mini-batch during training exceeds the GPU's memory capacity. Try a smaller batch size — the GPU memory estimate warns about this before the run starts, and offers the largest batch expected to fit.

- **OBB training stops with `OBB dataset incorrectly formatted`.**

> The dataset mixes ordinary (5-field) and OBB (9-field) label files. Relabel the ordinary files as rotated boxes in the OBB session, or remove them from the dataset.

<br>

---

## [Next](../03-analysis/)

<br>

---

## [Previous](../01-install/)
