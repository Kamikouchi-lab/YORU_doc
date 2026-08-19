---
layout: page
title: "Beta: Install"
order: 1
---

> Applies to **v2.0.0-beta.2**. For the stable v1.1.1 procedure, see the [User Guides]({{ site.baseurl }}/guides/01-install/).

**Google Chrome is no longer required.** The launcher opens in a native window (pywebview) instead of a browser page served over `localhost:8889`, and nothing opens a network port any more.

---

## Upgrading from Beta 1

**This step is required.** The launcher moved from Eel to pywebview and `onnxruntime` was added, so a Beta 1 environment has neither. Without it, `python -m yoru` stops with:

```
[yoru] failed to import yoru.app.main: No module named 'webview'
```

```
conda activate yoru
conda env update -f YORU.yml --prune
python -m yoru
```

The launch command itself is unchanged.

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
    git checkout v2.0.0-beta.2
    ```

3. Install the GPU driver and the [CUDA toolkit](https://developer.nvidia.com/cuda-toolkit).

4. Create a virtual environment using [YORU.yml](https://github.com/Kamikouchi-lab/YORU/blob/main/YORU.yml).

    ```
    conda env create -f YORU.yml
    ```

5. Activate the virtual environment.

    ```
    conda activate yoru
    ```

6. Install [PyTorch](https://pytorch.org) corresponding to your CUDA version.

    - For CUDA==11.8

    ```
    pip install torch==2.4.1 torchvision==0.19.1 torchaudio==2.4.1 --index-url https://download.pytorch.org/whl/cu118
    ```

    - For CUDA==12.1

    ```
    pip install torch==2.4.1 torchvision==0.19.1 torchaudio==2.4.1 --index-url https://download.pytorch.org/whl/cu121
    ```

    > (torch, torchvision and torchaudio will be installed.)

    > **RTX 50-series (Blackwell) cards need a newer build.** See `working-example.md` in the repository, which records a working RTX 5070 Ti setup on torch 2.8.0+cu128.

7. Run YORU.

    ```
    conda activate yoru
    cd "Path/to/YORU/project/folder"
    python -m yoru
    ```

---

## Alternative: install with uv

`uv` resolves everything from `pyproject.toml` / `uv.lock`, so the conda environment creation (step 4) and the manual PyTorch step (step 6) are not needed.

```
cd Path/to/YORU
uv sync
uv run python -m yoru
```

---

## Starting YORU

| What you want | Command |
|---|---|
| Launcher (default) | `python -m yoru` or `yoru` |
| Launcher with a specific condition file | `yoru gui --config path/to/condition.yaml` |
| Real-time process directly | `python -m yoru.realtime_yoru_GUI path/to/condition.yaml` |
| Check the installed version | `yoru --version` |

Notes on the launcher in Beta 2:

- It is a native window, renders correctly offline, and no browser is involved.
- The selected condition file is shown in the window at startup.
- It remembers the last-used config instead of resetting to `config/template.yaml`.
- Selecting a config file that no longer exists shows an error dialog instead of only printing to the console.
- All windows are a uniform 1000×800. The Real-time Process window is therefore narrower than in Beta 1 (it was 1280×700).

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
