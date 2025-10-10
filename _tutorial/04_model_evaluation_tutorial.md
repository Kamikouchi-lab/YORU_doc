---
layout: page
order: 4
title: Step4. Evaluate models
---

1. Run the YORU's Evaluation sub-module.

2. Load a project config.yaml file and a model.
    
    > The model is in the "exp" folder.

    > When loaded, folders are created as shown in the figure.
    <img src="../../imgs/evaluation_files.png" width="80%">

3. Extract frames for labeling using Grab GUI. 

   I. Select a video in the Video file path in the Grab GUI.

   Ⅱ. Select Save directory. (Basically, all_label_images in the project folder is a good choice.)

   Ⅲ. Decide the grabed frame name.

   IV. Cut out the screenshot.

      i. Play video with Streaming movie.

      ii. Arrow keys to go forward and back.

      iii. Grab Current Frame or Alt key to save frame.

   > Images that are not used for creating a model are better.

5. Run LabelImg and label the frames.

    > The detailed documents are accessible in [LabelImg](https://github.com/HumanSignal/labelImg).

    > Save format is done in YOLO. 

    > It is easier to do so if Auto Save mode is turned on in the View tab.



6. Push "Prediction" button.

    <img src="../../imgs/terminal_description_evaluation.png" width="70%">


    > Ultimately, classes.txt, image files, ground-truth labels, and YORU's labels will be placed in the data folder.
    <img src="../../imgs/evaluation_files_of_images.png" width="80%">

7. Push "Calculate APs" button. 

    > YORU calculates APs and IOUs.


<br>

## Evaluation Results

- AP results
<img src="../../imgs/best_ap50-95.png" width="80%">

<br>

<img src="../../imgs/text_result_evaluation.png" width="80%">

<br>

- IoU results
<img src="../../imgs/best_iou_graph.png" width="80%">

<br>

- Evaluation information
<img src="../../imgs/detect_information.png" width="80%">

---

## [Next](../05-closed-loop-tutorial/)

<br>  

---

## [Previous](../03-analyze-video-tutorial/)