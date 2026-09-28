---
layout: page
title: Video Analysis
order: 3
---

1. Select a model to analyze videos.

    > From v1.1.2, YORU accepts YOLOv5, YOLOv8, YOLO11, RT-DETR, Faster R-CNN, Mask R-CNN and SSD models. The model type is recognised from the weights file.

2. Select movies.

3. Select a folder to save results.

4. Check the previews.
    
    > When a video is loaded, the first video appears in PREVIEW.

    > Check for flips, etc., and adjust vertical and horizontal flips if any are present.

5. Push the "YOLO analysis" and start an analysis.

    > If you check "Create videos", YORU will save the videos shown in the box.

    > If you check "Tracking algorithm", YORU will save the IDs in the results csv file.

    > Although YOLOv5 does not support assigning unique IDs to detected objects, YORU has the option of individual identification in multi-animal scenarios. YORU applies the Kuhn-Munkres method (Bashar et al., 2022) to assign IDs based on positional information following object detection. This function is still a beta function.


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


### GUI  

<img src="../../imgs/screenshots_description-04.png" width="100%">

<br>

---

## [Next](../04-evaluation/)

<br>  

---

## [Previous](../02-training/)