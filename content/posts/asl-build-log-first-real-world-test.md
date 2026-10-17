---
title: First Real-World Test: 1 to 12 Out of 26
series: asl-build-log
seriesNumber: 4
standfirst: Can my model read someone it has never seen? At first, it read the wrong hand.
tags: [testing, debugging, computer-vision, asl]
created: 2026-10-16T18:00:00+01:00
updated: 2026-10-16T18:00:00+01:00
readingTime: 3 min
hasSheet: false
---

Testing a model on your own hands is easy to get wrong: it learns your hands, your camera and your lighting, and the scores look great. So I went looking for a video of someone else.

I found one on Wikimedia Commons, openly licensed: **Travis Dougherty fingerspelling the alphabet A to Z**. A signer my model had never seen, a different camera and room, and his hand is small in the frame. I checked the video frame by frame to confirm the answer key, then ran it through the translator.

<video controls preload="none" playsinline poster="assets/img/projects/asl-fingerspelling-poster.jpg">
  <source src="assets/video/asl-fingerspelling-demo.mp4" type="video/mp4">
</video>
<p class="caption">Before and after, side by side. Green letters are right, red are wrong. Test video: Travis Dougherty, ASL demo, by Fuzheado, <a href="https://commons.wikimedia.org/wiki/File:American_Sign_Language_demo_-_Travis_Dougherty.ogv">CC BY-SA 3.0</a>, via Wikimedia Commons. This demo video is CC BY-SA 3.0 too.</p>

## Run 1: 1 out of 26

```
correct: ABCDEFGHIJKLMNOPQRSTUVWXYZ
output:  ZZSZSZSZSSJIO
```

A hand was found in 98.5% of frames, so detection wasn't the problem. Drawing the hand skeleton onto the output video showed it straight away: **the tracker was locked onto his resting hand at his waist**, not the hand doing the spelling. For 30 seconds the model was confidently reading a relaxed fist, which mostly looks like S or Z.

It had never shown up before, because in all my own recordings only one hand was ever in view.

## The fix

Detect **both** hands, and read the **raised** one. Fingerspelling happens around shoulder height; the other hand usually rests lower. A test checks that a resting hand listed first still loses to the raised one.

## Run 2: 12 out of 26

```
correct: ABCDEFGHIJKLMNOPQRSTUVWXYZ
output:  OIRTHZIARLONONNRSZTUVWZYZACLC
```

Same model, same video, one root-cause fix. I, L, N, O, R, S, T, U, V, W, Y and Z came out right. The weak spots are clear:

- the first letters of the alphabet (A to H) are almost all wrong,
- P and Q, signed pointing down, read as N,
- extra letters appear while the hand moves between positions and drops at the end.

## Where it stands

| Test | Result |
|---|---|
| The dataset's signer | 95% |
| An unseen session of my own hand | 73% |
| **A stranger, real footage** | **12 / 26 letters** |

![Confusion matrix on an unseen session of my own hand](assets/img/posts/asl/confusion-session4.jpg)

I deliberately **stopped tuning after the fix**. Adjusting settings until this one clip scores well would turn my test into training data, and the number would stop meaning anything.

## What's next

12/26 is a starting point. I'm committed to keep improving it:

- **More signers.** The single biggest lever: a model of two people's hands won't generalise to everyone.
- **A "no letter" state** for the moments between letters, to stop the extra letters.
- **J and Z**, which are signed with motion and need the hand's path over time, not one frame.
- **A much larger real-world test**, such as a slice of the ChicagoFSWild dataset (160 signers, labelled), with every result published.

Fingerspelling is only a small part of ASL, and nothing replaces learning from Deaf signers. But every bug like this one is a step closer to a tool people could actually use. If you sign and would record a few letters, that would help more than anything. The code is on [GitHub](https://github.com/MHVVD/asl-fingerspelling-cv).
