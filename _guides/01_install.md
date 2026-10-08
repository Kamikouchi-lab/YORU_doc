---
layout: page
title: Install
order: 1
---

> These guides cover the **stable release (v1.1.2)**. If you are installing **v2.0.0-beta.4**, follow the [Beta Guides]({{ site.baseurl }}/beta-guides/01-install/) instead. The beta does not use Google Chrome, and the procedure differs.

YORU can be installed in two ways:

- **[Install with uv](#install-with-uv)** builds the whole environment, including Python itself, with one command on Windows, Linux and macOS. This is the only supported route on macOS.
- **[Install with conda](#install-with-conda)** is the original route, for Windows and Linux with an NVIDIA GPU.

Whichever you choose, read [Prerequisites](#prerequisites) first. Neither uv nor conda can install these for you.

---

## Prerequisites

### 1. A Chromium browser (all platforms)

The YORU launcher is a web page served by [Eel](https://github.com/python-eel/Eel), which opens it in **[Google Chrome](https://www.google.com/chrome/) or Chromium**. Eel looks for the browser here:

| OS | Where Eel looks for it |
|----|------------------------|
| Windows | the `App Paths\chrome.exe` registry key |
| macOS | `/Applications/Google Chrome.app`, then `Chromium.app`, then `mdfind` |
| Linux | `chromium-browser`, `chromium`, `google-chrome` or `google-chrome-stable` on `PATH` |

If no browser is found, YORU stops at startup with:

```
EnvironmentError: Can't find Google Chrome/Chromium installation
```

Microsoft Edge is built on Chromium, but Eel does not find it. Safari is not supported. Only the launcher needs the browser: the training, evaluation, analysis and real-time windows are native windows.

### 2. An NVIDIA driver, to use a GPU (Windows / Linux)

Install the GPU driver. It has to support CUDA 12.x: **527.41 or newer on Windows, 525.60.13 or newer on Linux**. Check the installed version with:

```
nvidia-smi
```

The **[CUDA toolkit](https://developer.nvidia.com/cuda-toolkit) is not required** by either route. The PyTorch wheels carry their own CUDA runtime (`cudart`, cuBLAS and cuDNN are inside the `torch` package). Install the toolkit only if you need `nvcc` to compile CUDA extensions of your own, or want the profiling tools.

The `CUDA Version` that `nvidia-smi` reports is the highest version your driver supports, not the version in use. A driver reporting 13.x runs the CUDA 12.4 wheels without a toolkit installed.

Without a usable GPU, YORU runs on the CPU. Everything works, but more slowly.

### 3. macOS extras (Apple Silicon)

- YORU needs **macOS 14 (Sonoma) or later on Apple Silicon**. Intel Macs are not supported, because the macOS wheels of the PyTorch and Qt versions YORU pins are arm64 only.
- Install the **Xcode Command Line Tools** before `uv sync`. Two dependencies (`imgui` and `gevent`) have no arm64 wheels and are compiled during the sync:

    ```
    xcode-select --install
    ```

- macOS asks for permission the first time YORU uses a camera (**Camera**), the key-press triggers (**Input Monitoring** / **Accessibility**, via `pynput`) or screen capture (**Screen Recording**, via `mss`). The prompts are for the terminal application you launched YORU from. Grant them in *System Settings > Privacy & Security*, then relaunch.
- The NI-DAQ closed-loop path needs a driver that NI ships for Windows only, so it is not available on macOS.

---

## Install with uv

[uv](https://docs.astral.sh/uv/) builds the environment from the `pyproject.toml` and `uv.lock` in the repository. It picks the right PyTorch build for your platform: the CUDA wheels on Windows and Linux, and the MPS-enabled build on macOS. You do not need a system Python or conda, because uv downloads Python 3.10 for the project.

1. Install uv.

    Windows (PowerShell):

    ```
    winget install --id=astral-sh.uv -e
    ```

    macOS / Linux:

    ```
    curl -LsSf https://astral.sh/uv/install.sh | sh
    ```

    `brew install uv` also works on macOS. The [uv installation guide](https://docs.astral.sh/uv/getting-started/installation/) lists the other installers. Open a new terminal afterwards so that `uv` is on `PATH`.

2. Download or clone the YORU project.

    ```
    cd "Path/to/download"
    git clone https://github.com/Kamikouchi-lab/YORU.git
    ```

    If you do not have git, you can download the ZIP from GitHub instead.

3. Build the environment.

    ```
    cd YORU
    uv sync
    ```

    The first sync downloads PyTorch and takes a few minutes.

4. Run YORU **from the repository root**. The launcher looks for `web/` and `config/` relative to the working directory.

    ```
    uv run yoru
    ```

    `uv run python -m yoru` does the same thing. There is no `uv init` step: the project is already initialised.

To check that the GPU was picked up:

```
uv run python -c "import torch; print(torch.cuda.is_available())"
```

---

## Install with conda

1. Check that [Google Chrome](https://www.google.com/chrome/) is installed (see [Prerequisites](#prerequisites)).

2. Check the installation of [Miniconda](https://docs.anaconda.com/miniconda/).

    > Anaconda's [TERMS OF SERVICE](https://legal.anaconda.com/policies/en?name=terms-of-service#terms-of-service) was changed. If you use Anaconda in an organization that has two hundred (200) or more employees or contractors, you have to be careful.

    > Currently, you can use miniconda freely.

3. Download or clone the YORU project.

    a. Install git

    ```
    conda install git
    ```

    b. Clone the repository

    ```
    cd "Path/to/download"
    git clone https://github.com/Kamikouchi-lab/YORU.git
    ```

4. Install the GPU driver. The CUDA toolkit is not needed: the PyTorch wheels in step 7 carry their own CUDA runtime, so the `cu118` / `cu121` choice there only has to be one that your driver supports.

5. Create a virtual environment using [YORU.yml](https://github.com/Kamikouchi-lab/YORU/blob/main/YORU.yml) in the command prompt or Anaconda prompt.

     ```
     conda env create -f "Path/to/YORU.yml"
     ```

    > The environment file pins **Python 3.10** (v1.1.1 used Python 3.9). If you are upgrading from v1.1.1, recreate the environment: `conda env remove -n yoru`, then create it again.

6. Activate the virtual environment in the command prompt or miniconda prompt.

     ```
     conda activate yoru
     ```

7. Install [PyTorch](https://pytorch.org) for a CUDA version that your driver supports.

    - For CUDA==11.8

    ```
    pip install torch==2.4.1 torchvision==0.19.1 torchaudio==2.4.1 --index-url https://download.pytorch.org/whl/cu118
    ```

   - For CUDA==12.1

    ```
    pip install torch==2.4.1 torchvision==0.19.1 torchaudio==2.4.1 --index-url https://download.pytorch.org/whl/cu121
    ```

    > (torch, torchvision and torchaudio will be installed.)

    > **RTX 50-series (Blackwell) cards need a newer build.** See [working-example.md](https://github.com/Kamikouchi-lab/YORU/blob/main/working-example.md) in the repository, which records a working RTX 5070 Ti setup on torch 2.8.0+cu128.

8. Run YORU in a command prompt or miniconda prompt.

    ```
    conda activate yoru
    cd "Path/to/YORU/project/folder"
    python -m yoru
    ```

<br>

<img src="../../imgs/kidou_yoru.gif" width="100%">

<br>

---

## Choosing the compute device

YORU picks its compute device automatically, in this order: **CUDA, then Apple MPS, then the CPU**.

To choose the device yourself, set the `YORU_DEVICE` environment variable before launching (`cuda`, `mps`, `cpu`, or a CUDA index such as `0`), or use the **Device** selector in the Training GUI:

```
YORU_DEVICE=cpu uv run yoru
```

On Windows, run `set YORU_DEVICE=cpu` before the launch command.

- `YORU_DEVICE` applies to YOLOv8, YOLO11, RT-DETR and the torchvision detectors. YOLOv5 inference loads through `torch.hub`, which always uses CUDA when it is available and the CPU otherwise.
- If the requested device is not available, YORU falls back to the next best one and writes a warning to the log file (see below).
- On Apple Silicon, MPS clearly speeds up training, but it is *not* faster than the CPU for real-time inference with the small YOLO models (60.8 FPS on MPS against 68.7 FPS on CPU for yolov8n at 640×480). For real-time detection on a Mac, try `YORU_DEVICE=cpu`.
- Faster R-CNN / Mask R-CNN / SSD need torchvision 0.29 or newer to train on MPS. The uv environment pins a new enough build. With an older one, YORU falls back to the CPU and shows a message.

---

## Log files

YORU writes runtime errors and work logs to a user directory:

| OS | Log file |
|----|----------|
| Windows | `%USERPROFILE%\.yoru\logs\yoru.log` |
| macOS / Linux | `~/.yoru/logs/yoru.log` |

The log holds the full traceback of every error that the GUIs catch, so attach it when you report a problem on [GitHub Issues](https://github.com/Kamikouchi-lab/YORU/issues). Set the `YORU_HOME` environment variable to move the directory somewhere else.

<br>

---

## [Next](../02-training/)
