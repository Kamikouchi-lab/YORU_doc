---
layout: page
title: Real-time Process
order: 6
---

1. Edit a condition YAML file.

  > [condition YAML file template](https://github.com/Kamikouchi-lab/YORU/blob/main/config/yoru_default.yaml)

   ```
  name: Experiment name
  export: Folde path for video exporting
  export_name: Name of exporting videos
  
  model:
   yolo_model_path: Path to YORU mode
  
  capture_style:
   stream_MSS: False # If True, YORU start screen capture mode
  
  trigger:
   trigger_threshold_configuration: The threshold of detection
   trigger_class: The class of trigger
   trigger_style: Trigger plugin name
   ```

2. Select the condition YAML file in YORU start page.

3. Run "Real-time Process".

4. Operate Real-time Process GUI.


## Plugin List

YORU projector operation
[GitHub](https://github.com/Kamikouchi-lab/YORU-projector)
