---
layout: page
title: "Beta: Training"
order: 2
---

> Applies to **v2.0.0-beta.3**. For the stable v1.1.2 procedure, see the [User Guides]({{ site.baseurl }}/guides/02-training/).

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

    > In an OBB project, the model family is fixed to YOLO and the weight gets an `-obb` suffix (for example `yolo11s-obb.pt`).

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
- Only **YOLOv8 and YOLO11** have a rotated-box head. RT-DETR, Faster R-CNN, Mask R-CNN and SSD cannot be trained on oriented boxes.

### What an OBB project changes, end to end

| Stage | Ordinary project | OBB project |
|---|---|---|
| `config.yaml` | `task: detect` | `task: obb` |
| LabelImg format | YOLO (`class cx cy w h`) | YOLO-OBB (`class x1 y1 … y4`) |
| Weight | `yolo11s.pt` | `yolo11s-obb.pt` |
| Model families | all of them | YOLOv8 / YOLO11 only |
| Real-time / analysis drawing | upright rectangle | rotated rectangle |
| `*_detect.csv` | `… total_time, cx, cy, w, h, angle` (`angle = 0`) | `… total_time, cx, cy, w, h, angle` |

Detection needs no special setting: leave `yolo_model_type: "auto"` and YORU recognises an OBB model by itself.

> **Keep ordinary (5-field) label files out of OBB projects.** In an OBB session, opening an axis-aligned label file switches LabelImg to plain YOLO, and boxes saved after that lose their angle. Check the format button in LabelImg's toolbar if in doubt.

> **Evaluate OBB models with the rotated mAP that ultralytics prints at the end of training.** The Evaluation sub-module ignores the angle. See [Evaluation](../04-evaluation/#evaluating-an-obb-model).

---

## Choosing a model

The beta selects a backend through a plugin registry (`yoru/libs/plugins/`):

| Backend | Models |
|---|---|
| `ultralytics` | YOLOv8 / YOLO11 (including `-obb` weights) |
| `rtdetr` | RT-DETR |
| `torchvision` | Faster R-CNN / Mask R-CNN / SSD |
| `onnx` | `.onnx` exports (inference only) |
| `auto` | Picks one from the weights file |

- `auto` does not unpickle the checkpoint to identify it — it reads the file name and, if needed, the class-name table out of the archive.
- If a backend's dependency is missing, the error names the backends that *are* available and why the others failed.
- The ONNX backend is **inference only**; use it for analysis and real-time processing, not for training.

### Existing YOLOv5 projects

The bundled YOLOv5 code was removed in Beta 2. **YOLOv5 cannot be trained in the beta, and old YOLOv5 `.pt` weights do not load.**

- **To keep using an existing YOLOv5 model for detection:** export it to ONNX with the upstream YOLOv5 repository, then point `yolo_model_path` at the `.onnx` file. The ONNX backend understands the YOLOv5 output layout and is selected automatically from the file extension.
- **Otherwise:** retrain with YOLOv8 or YOLO11. Opening a v1.x / Beta 1 project does not error — the GUI swaps `yolov5s.pt` for `yolo11s.pt` (same size letter) and prints a notice — but **the run starts from scratch and the results are not comparable to the YOLOv5 baseline.**
- Condition files that still say `yolo_model_type: yolov5` keep loading; the name is aliased to `ultralytics`. It is the old weight *file* that cannot be read.
- If you need YOLOv5, use the stable [v1.1.2]({{ site.baseurl }}/guides/02-training/).

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

> **Known issue:** the warning still appears when *Device* is set to `cpu`. Choose **Train anyway**.

---

## Stopping a run

- **"Stop after this epoch"** ends the run gracefully: the current epoch finishes and is saved, the final validation pass runs, and both `best.pt` and `last.pt` stay usable.
- A red **Force stop** appears while a stop is pending. Its confirmation spells out what is lost, and it kills the dataloader workers too, so nothing is left holding the GPU.
- A run started from a terminal can be stopped the same way by creating an empty `.yoru_stop_request` file in the project directory.
- Step 6 reports how the run ended — **Complete!!**, or **Stopped at epoch N / M** with a message giving the weights location.
- **Train Model** is disabled during a run, so a second training subprocess cannot be started by accident.

---

## Where the trained model is saved

Results go to `exp_<model>/` (changed in Beta 2):

| Backend | Weights |
|---|---|
| YOLO / RT-DETR | `<project>/exp_yolo11s/weights/best.pt` |
| YOLO OBB | `<project>/exp_yolo11s-obb/weights/best.pt` |
| torchvision | `<project>/exp_fasterrcnn/fasterrcnn_best.pt` |

- Repeat runs go to `exp_yolo11s2`, `exp_yolo11s3`, … so retraining does not overwrite earlier weights, and checkpoints are not written into the training-image folder.
- Existing `train/` folders from earlier versions are untouched. Update any scripts or notes that point at `<project>/train/weights/best.pt`.

---

## Other behaviour of the Training GUI

- The training console shows **one line per epoch** instead of ~161 (ultralytics' progress-bar redraws used to arrive as separate lines).
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
