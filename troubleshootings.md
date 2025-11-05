---
layout: page
title: Q and A
order: 2
---

***
## Training steps

- We found "tourch.cuda.Out.OfMemoryError: CUDA out of memory" on terminal.

> This occurs when the mini-batch during training exceeds the GPU's memory capacity. Try smaler batch size.
