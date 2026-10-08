---
layout: page
title: "Beta: Install"
order: 1
---

> Applies to **v2.0.0-beta.4**. For the stable v1.1.2 procedure, see the [User Guides]({{ site.baseurl }}/guides/01-install/).

YORU can be installed in two ways:

- **[Install with uv](#install-with-uv)** builds the whole environment, including Python itself, with one command on Windows, Linux and macOS. This is the only supported route on macOS.
- **[Fresh install with conda](#fresh-install-with-conda)** is the original route, for Windows and Linux with an NVIDIA GPU.

---

## Prerequisites

### No browser needed

The launcher opens in a native window ([pywebview](https://pywebview.flowrl.com/), the OS WebView) instead of a browser page served over `localhost:8889`. **Google Chrome is no longer required**, and nothing opens a network port any more.

### An NVIDIA driver, to use a GPU (Windows / Linux)

Install the GPU driver. It has to support CUDA 12.x: **527.41 or newer on Windows, 525.60.13 or newer on Linux**. Check the installed version with:

```
nvidia-smi
```

The **[CUDA toolkit](https://developer.nvidia.com/cuda-toolkit) is not required** by either route: the PyTorch wheels carry their own CUDA runtime. The `CUDA Version` that `nvidia-smi` reports is the highest version your driver supports, not the version in use.

> **Changed in Beta 4:** the beta uses the **CUDA 12.8** build of PyTorch, which needs **driver 570 or newer** (572.xx on Windows). It covers every card from the GTX 10-series to the RTX 50-series (Blackwell). If the driver cannot be updated, use the CUDA 12.6 build in [step 6](#fresh-install-with-conda) instead; it has no kernels for the RTX 50-series.

Without a usable GPU, YORU runs on the CPU. Everything works, but more slowly.

### macOS extras (Apple Silicon)

- YORU needs **macOS 14 (Sonoma) or later on Apple Silicon**. Intel Macs are not supported.
- Install the **Xcode Command Line Tools** before `uv sync`, because `imgui` has no arm64 wheel and is compiled during the sync:

    ```
    xcode-select --install
    ```

- macOS asks for **Camera**, **Input Monitoring** / **Accessibility** and **Screen Recording** permission the first time YORU uses a camera, the key-press triggers or screen capture. Grant them to your terminal application in *System Settings > Privacy & Security*, then relaunch.
- The NI-DAQ closed-loop path needs a Windows-only driver, so it is not available on macOS.

---

## Upgrading from Beta 3

Python stays at 3.10 and `YORU.yml` has not changed, so **the conda environment does not have to be recreated**. Check out the tag, then update PyTorch:

```
git fetch --tags
git checkout v2.0.0-beta.4
conda activate yoru
pip install torch==2.8.0 torchvision==0.23.0 --index-url https://download.pytorch.org/whl/cu128
```

> **uv** users only need to run `uv sync` after checking out the tag; it installs the CUDA 12.8 build.

Check the driver first: the CUDA 12.8 build needs driver 570 or newer (see [Prerequisites](#an-nvidia-driver-to-use-a-gpu-windows--linux)).

---

## Upgrading from Beta 2

**Recreate the environment — this is required.** Beta 3 moved from Python 3.9 to 3.10, and updating an environment in place is not reliable across a Python version change.

```
git fetch --tags
git checkout v2.0.0-beta.4
conda deactivate
conda env remove -n yoru
conda env create -f YORU.yml
conda activate yoru
```

Then install PyTorch as in [step 6](#fresh-install-with-conda) below, and start YORU with `python -m yoru`.

> **uv** users only need to run `uv sync` after checking out the tag.

---

## Upgrading from Beta 1

Beta 1 environments have neither pywebview nor onnxruntime, and use Python 3.9. Recreate the environment exactly as in [Upgrading from Beta 2](#upgrading-from-beta-2). Without it, `python -m yoru` stops with:

```
[yoru] failed to import yoru.app.main: No module named 'webview'
```

---

## Fresh install with conda

1. Check the installation of [Miniconda](https://docs.anaconda.com/miniconda/).

    > Anaconda's [TERMS OF SERVICE](https://legal.anaconda.com/policies/en?name=terms-of-service#terms-of-service) was changed. If you use Anaconda in an organization that has two hundred (200) or more employees or contractors, you have to be careful.

    > Currently, you can use miniconda freely.

2. Download or clone the YORU project and check out the beta tag.

    a. Install git

    ```
    conda install git
    ```

    b. Clone the repository

    ```
    cd "Path/to/download"
    git clone https://github.com/Kamikouchi-lab/YORU.git
    cd YORU
    git checkout v2.0.0-beta.4
    ```

3. Install the GPU driver (see [Prerequisites](#prerequisites)). The CUDA toolkit is not needed.

4. Create a virtual environment using `YORU.yml` in the repository. It pins **Python 3.10**.

    ```
    conda env create -f YORU.yml
    ```

5. Activate the virtual environment.

    ```
    conda activate yoru
    ```

6. Install [PyTorch](https://pytorch.org) (changed in Beta 4).

    - **CUDA 12.8** — the build the beta is developed against, and the one the uv route installs

    ```
    pip install torch==2.8.0 torchvision==0.23.0 --index-url https://download.pytorch.org/whl/cu128
    ```

    > It covers every card from the GTX 10-series to the RTX 50-series (Blackwell), and needs driver 570 or newer. torchaudio is not used by YORU.

    - **CUDA 12.6** — only if the driver cannot be updated

    ```
    pip install torch==2.8.0 torchvision==0.23.0 --index-url https://download.pytorch.org/whl/cu126
    ```

    > This build stops at `sm_90`, so on an RTX 50-series card every CUDA call fails with *"no kernel image is available for execution on the device"*.

    Check that the card is usable, not merely detected — `torch.cuda.is_available()` returns True even on a card the build has no kernels for:

    ```
    python -c "import torch; print(torch.cuda.get_arch_list()); print(torch.zeros(1).cuda() + 1)"
    ```

    > The list must contain your GPU's architecture (`sm_120` for the RTX 50-series, `sm_89` for the 40-series, `sm_86` for the 30-series).

7. Run YORU **from the repository root**.

    ```
    conda activate yoru
    cd "Path/to/YORU"
    python -m yoru
    ```

---

## Install with uv

`uv` builds everything from `pyproject.toml` / `uv.lock`, so the conda environment and the manual PyTorch step are not needed. It downloads Python 3.10 itself, and picks the CUDA wheels on Windows / Linux and the MPS build on macOS.

1. Install uv.

    Windows (PowerShell):

    ```
    winget install --id=astral-sh.uv -e
    ```

    macOS / Linux:

    ```
    curl -LsSf https://astral.sh/uv/install.sh | sh
    ```

2. Clone the repository, check out the beta tag and build the environment.

    ```
    git clone https://github.com/Kamikouchi-lab/YORU.git
    cd YORU
    git checkout v2.0.0-beta.4
    uv sync
    ```

3. Run YORU from the repository root.

    ```
    uv run yoru
    ```

> From Beta 4 the uv route installs the **CUDA 12.8** build of PyTorch on Windows and Linux, so RTX 50-series (Blackwell) GPUs work; it needs driver 570 or newer. On Linux the uv route covers x86_64 only, because dearpygui publishes no aarch64 wheel.

---

## Starting YORU

| What you want | Command |
|---|---|
| Launcher (default) | `python -m yoru` or `yoru` (`uv run yoru` with uv) |
| Launcher with a specific condition file | `yoru gui --config path/to/condition.yaml` |
| Real-time process directly | `python -m yoru.realtime_yoru_GUI path/to/condition.yaml` |
| A single screen, to see its startup error | e.g. `python -m yoru.train_GUI` |
| Check the installed version | `yoru --version` |

Always launch YORU **from the repository root**.

Notes on the launcher:

- It is a native window, renders correctly offline, and no browser is involved.
- The selected condition file is shown in the window at startup.
- It remembers the last-used config (in `~/.yoru/condition_file_log.json`) instead of resetting to `config/template.yaml`.
- Every screen opens sized to the monitor it is on. See [The YORU window](../00-overview/#the-yoru-window-new-in-beta-3).

---

## Choosing the compute device

YORU picks **CUDA, then Apple MPS, then the CPU**. To choose yourself, set `YORU_DEVICE` (`cuda`, `mps`, `cpu`, or a CUDA index such as `0`) before launching, or use the **Device** selector in the Training GUI. On Windows, run `set YORU_DEVICE=cpu` before the launch command.

An unavailable device falls back to the next best one, with a warning in the log file.

---

## Log files

Runtime errors are written to `~/.yoru/logs/yoru.log` (`%USERPROFILE%\.yoru\logs\yoru.log` on Windows), with the full traceback of every error that the GUIs catch. Set `YORU_HOME` to move the directory. Attach this file when you report a problem.

---

## Verifying the install

1. `yoru --version` prints the version.
2. `python -m yoru` opens the launcher window (no browser).
3. Open the Training sub-module — if a backend's dependency is missing, the error names the backends that *are* available and why the others failed.

---

## Licensing note

Ultralytics YOLO is dual-licensed. It is **AGPL-3.0 by default, and that extends to models trained with it**, so commercial use requires an Ultralytics Enterprise licence. `THIRD_PARTY_LICENSES.md` in the repository lists every dependency and its licence.

<br>

---

## [Next](../02-training/)

<br>

---

## [Previous](../00-overview/)
