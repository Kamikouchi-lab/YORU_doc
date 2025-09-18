---
layout: page
order: 4
title: Step4. Evaluate models
---

## Example hardware conditions
 - OS: Windows 11
 - RAM: 32GB
 - GPU: NVIDIA GeForce RTX 3080

 - Dataset: Fruit fly copulation behaviour (Yamanouchi, H., 2025). [Fruit Fly Copulation Dataset](https://doi.org/10.5281/zenodo.15653581) 


# Training

1. Start YORU and open the “Training” module.
  
2. Run "Training".

3. Create a project.

4. Move labeled data and classes.txt to "all_label_images" folder in the project.

5. Push "Move Label Images" button.

6. Select classes.txt files path and push "Add class info in YAML file".

7. Select training conditions and start training.

### Analyze a model

1. Select "Model Path", "Movie Path",and "Result Directory". "test_video_fly_copulation.mp4" is used as a movie.

2. Start analysis.


## Data references

These data ware used in the previous paper.

- [Paper](https://ieeexplore.ieee.org/document/10150245)

- H. M. Yamanouchi, R. Tanaka and A. Kamikouchi, "Event-triggered feedback system using YOLO for optogenetic manipulation of neural activity," 2023 IEEE International Conference on Pervasive Computing and Communications Workshops and other Affiliated Events (PerCom Workshops), Atlanta, GA, USA, 2023, pp. 184-187, doi: 10.1109/PerComWorkshops56833.2023.10150245.

<br>

## [Next](./05_closed_loop_tutorial.md)

<br>  

## [Previous](./03_analyze_video_tutorial.md)