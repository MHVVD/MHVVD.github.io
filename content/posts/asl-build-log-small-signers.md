---
title: Finding the Small Signer
series: asl-build-log
seriesNumber: 11
standfirst: When the interpreter is a small box in the corner, the hand tracker barely sees them. Find the person first, then look closer.
tags: [computer-vision, mediapipe, testing, asl]
created: 2026-11-13T22:10:12+01:00
updated: 2026-11-13T22:10:12+01:00
readingTime: 3 min
hasSheet: false
---

The [real-world benchmark](post.html?slug=asl-build-log-real-world-benchmark) found one clear weakness: when the interpreter is a small inset in the corner of the screen, as in many public-information videos, the translator reads almost nothing. The hands are only a few dozen pixels across, and the hand tracker misses most of them.

The fix sounds obvious: find the signer first, then look closer.

## Find the person, then the hands

I didn't want to download another model, so the signer is found with the hand model I already use, just more carefully:

1. On about 40 frames spread through the video, run the hand detector on the full frame **and** on nine overlapping tiles, each half the frame and enlarged two times. A small hand that's missed in the full frame is often found in an enlarged tile.
2. If the full frame already finds the hands, and they're a reasonable size, do nothing.
3. Otherwise, draw a box around the place where the hands keep appearing, with room for the head and the signing space, and from then on track hands only in that box, enlarged.

![On the left, a CDC video where the interpreter is a small inset next to the presenter, with an orange box around the interpreter; on the right, the enlarged crop with both hands tracked](assets/img/posts/asl/small-signer-crop.jpg)

My first version drew the box around *all* the detections. That failed: stray detections in the background footage, plus another signer's hand at the edge of the frame, stretched the box over the whole screen, so it never cropped. Using the **densest cluster** of detections, the spot the hands keep coming back to, fixed it.

## Tested on a fake inset first

Both real inset videos are in the benchmark's test set, and tuning on test videos is cheating. So I made a fake inset from a *tuning* video: the microwave-safety interpreter shrunk to 40% and placed in the corner over other footage. Its answer key still applies.

| Microwave interpreter | Hand found in a frame |
|---|---|
| Full size | 96% |
| Fake inset, no crop | 32% |
| **Fake inset, with the crop** | **95%** |

Hand finding came all the way back, and the decoded letters look like the original's again. The score recovered only partly: a signer at 40% size is noisier to read, and my scorer is strict.

## On the real videos

With the settings fixed, I ran the five test videos once. The three full-size signers got no crop, so nothing changed for them. For the two CDC inset videos:

| CDC inset videos | Both hands found, before | After |
|---|---|---|
| Radiation: "get inside" | 15% | **35%** |
| Radiation: decontamination | 23% | **37%** |

The output went from junk like `e · lar · or · cc · mop` to text that contains the videos' main word: `radiaton`, `radion`. The gain is smaller than on the fake inset. In the real videos the inset overlaps the main footage, the interpreter's edges are cut off, and in one video hands in the dramatised scenes made the box too big.

## The benchmark didn't move, and why

The headline numbers stayed exactly the same: 26 of 45 terms read, 12 of 18 spoken words right. That isn't because the crop does nothing. When I wrote the answer key, I couldn't judge the tiny inset signers by eye either, so every term in those two videos was marked "unclear", and there's nothing for the benchmark to score.

It's a useful lesson: **a test can only measure what its answer key can confirm.** The next step is to re-check those videos' terms on the enlarged crop, without looking at what the translator produced, and label it clearly as a revised key.

## Next

Re-check the inset answer key, keep the crop box from drifting onto the main footage, and then the bigger phase: recognising whole signs, not just letters.

Code, tests and the full write-up (journal entry 19): [GitHub](https://github.com/MHVVD/asl-fingerspelling-cv).
