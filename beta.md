---
layout: page
title: Beta Release Notes
order: 10
---

## YORU v2.0.0-beta.1

> **Pre-release software.** This version targets the `develop2` branch and may contain bugs. Feedback and bug reports via [GitHub Issues](https://github.com/Kamikouchi-lab/YORU/issues) are welcome.

To use the beta version, check out the corresponding tag:

```
git checkout v2.0.0-beta.1
```

---

### New Features

#### Model Support Expansions

- **YOLOv8 / YOLO11**: Accessible through a unified model wrapper.
- **RT-DETR**: Real-Time Detection Transformer support added.
- **Torchvision models**: Faster R-CNN, Mask R-CNN, and SSD variants now available.

#### Interface Enhancements

- **Real-time configuration tool**: A new configuration creation tool built with DearPyGui allows interactive setup.
- **Training interface improvements**:
  - Progress visualization during training.
  - Automatic state recovery after interruption.
  - Layout refinements for better usability.
  - Automatic model detection.

---

### Changes

#### Code Organization

- Libraries reorganized into a `yoru/` package structure for cleaner imports and maintainability.
- The [labelImg](https://github.com/HumanSignal/labelImg) annotation tool is now bundled directly into YORU with several bug corrections applied.

---

### Bug Fixes

- Resolved PyTorch 2.6 compatibility issues specific to YOLOv5 inference.

---

## Version History

| Version | Date | Notes |
|---------|------|-------|
| [v2.0.0-beta.1](https://github.com/Kamikouchi-lab/YORU/releases/tag/v2.0.0-beta.1) | 2025-03-14 | Pre-release — see above |
| [v1.1.1](https://github.com/Kamikouchi-lab/YORU/releases/tag/v1.1.1) | 2025-03-14 | PyTorch 2.6 fix, `uv` install support, path corrections |
| [v1.1.0](https://github.com/Kamikouchi-lab/YORU/releases/tag/v1.1.0) | 2024-12-05 | Docs updates, GUI enhancements |
| [v1.0.3](https://github.com/Kamikouchi-lab/YORU/releases/tag/v1.0.3) | 2024-05-29 | Published DOI release |
| [v1.0.2](https://github.com/Kamikouchi-lab/YORU/releases/tag/v1.0.2) | 2024-02-28 | Confidence threshold for video analysis |
| [v1.0.1](https://github.com/Kamikouchi-lab/YORU/releases/tag/v1.0.1) | 2024-01-16 | Updated instructions, YOLOv5 fix |
| [v1.0.0](https://github.com/Kamikouchi-lab/YORU/releases/tag/v1.0.0) | 2023-11-14 | Initial public release |
