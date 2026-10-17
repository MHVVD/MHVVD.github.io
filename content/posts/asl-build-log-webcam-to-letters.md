---
title: From Webcam to Letters
series: asl-build-log
seriesNumber: 1
standfirst: How a laptop webcam, 21 hand points and a 73 KB model learned to read the ASL alphabet.
tags: [computer-vision, mediapipe, machine-learning, asl]
created: 2026-10-03T18:00:00+01:00
updated: 2026-10-03T18:00:00+01:00
readingTime: 3 min
hasSheet: false
---

I have never been able to learn sign language, and I couldn't name a single tool that would watch me practise and tell me what I got wrong. So I started building one: a system that recognises **American Sign Language fingerspelling** (the A–Z alphabet) from a webcam, running on my everyday laptop with no GPU.

This series is the build log: what I did, why, and what the numbers said, good or bad. The full code and a step-by-step journal are on [GitHub](https://github.com/MHVVD/asl-fingerspelling-cv).

## Step 1: Don't look at pixels, look at the hand

A camera frame is 300,000 numbers, most of them background. Instead of learning from pixels, I use Google's **MediaPipe**, which finds **21 points on the hand** in every frame: the wrist and four joints on each finger.

That turns a frame into 63 numbers (21 points × x, y, z). Much easier to learn from.

## Step 2: Keep only the shape

The same letter should give the same numbers wherever your hand is, however far from the camera, and whichever hand you use. So every hand is:

1. **mirrored** if it is a left hand, so one model serves both,
2. **moved** so the wrist is at zero (position no longer matters),
3. **scaled** by the wrist-to-knuckle distance (size and distance no longer matter).

What's left is pure hand *shape*. Unit tests check that moving or resizing a hand really doesn't change the numbers.

## Step 3: Data, mine and public

I used two sources:

- **A public dataset** of 78,000 photos of one person signing the letters. MediaPipe found a hand in 84% of them, giving **65,707 examples**. (Adding a black border and retrying rescued 5,425 photos where the hand filled the whole picture.)
- **My own recordings**, made with a small recording app I wrote. It shows a stick-figure reference for each letter next to the live camera:

![Stick-figure reference hands for the alphabet, generated from a small hand model](assets/img/posts/asl/reference-alphabet.jpg)

Those stick figures aren't drawings. They come from a tiny model of finger joints that outputs the same 21 points MediaPipe does, which later lets the tutor compare your hand against them.

## Step 4: A model small enough for a laptop

Importing PyTorch alone takes **21 seconds** on my laptop, so it is not used when the app runs. The classifier is a small neural network, **63 → 128 → 64 → 26**: about 18,000 numbers, **73 KB** on disk. I train it with scikit-learn, then copy the weights into plain NumPy, where predicting a letter takes **0.08 ms**. MediaPipe (15–25 ms per frame) is the only real cost.

## The first honest number

| Tested on | Accuracy |
|---|---|
| The dataset's signer, frames it never saw | **95%** |
| My own hand | **51%**, and 42% on a later session |

95% looked great until I tried it on myself. A model trained on one person learns *that person*. That gap shaped everything that came next: more of my own recordings, a careful look at which letters fail, and, eventually, testing on a complete stranger.

Next: [two mirroring bugs, and why my first fix was wrong →](post.html?slug=asl-build-log-mirroring-bugs)
