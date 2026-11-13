---
title: Seven Videos, Answers First
series: asl-build-log
seriesNumber: 10
standfirst: Every result so far came from one video. Now there are seven, with seven signers, and the answer key was published before any model saw them.
tags: [testing, evaluation, computer-vision, asl]
created: 2026-11-13T21:37:46+01:00
updated: 2026-11-13T21:37:50+01:00
readingTime: 4 min
hasSheet: false
---

In the [last post](post.html?slug=asl-build-log-fingerspelling-detection), the translator got a fingerspelling detector, and I judged the result on one video. One video can't tell you much: you end up tuning to its quirks without noticing. So this post is about building a proper test, and about what happened to my laptop along the way.

## Seven videos, seven signers

I found eleven openly licensed ASL videos on Wikimedia Commons, all made by US government agencies and so in the public domain. Seven had English captions or subtitles I could use:

- two USDA food-safety videos, each with its own interpreter;
- a FEMA hurricane briefing;
- a White House tour signed by **Leah Katz-Hernandez**, a Deaf native signer rather than an interpreter, filmed full-length while walking;
- two CDC radiation-emergency videos, where the interpreter is a **small inset** in the corner;
- a National Weather Service lightning-safety video.

Two are for tuning, five for testing. That split was fixed before anything ran.

## Answers first

The rule from [the fresh test](post.html?slug=asl-build-log-fresh-test) still applies: write the answer key before any model sees the videos.

1. I transcribed every caption with its timing: about 280 caption lines, read off the video frames.
2. From the English, I picked **77 words likely to be fingerspelled**: names, acronyms and technical terms without a common sign.
3. I checked each one on the video itself. Fingerspelling was visible for **50** of them. For 17 I couldn't tell, and 10 were signed or not spelled ("rose" and "shampoo" have their own signs).
4. I pushed the key to GitHub **before running anything**, so the public history shows the answers came first.

## One change, chosen on the tuning videos

On the two tuning videos, every wrong word the translator spoke was a short dictionary word that happened to fill a whole stretch of signing: "ada", "hikes", "tale". It's the same failure as "bus" for *U.S.* in the last post. So short dictionary words are no longer spoken on their own; they need six or more letters like any other dictionary word. I committed that setting, *then* ran the test videos, once.

## Results on the five test videos

| | Fingerspelled terms read (of 45) | Spoken words that were right |
|---|---|---|
| Without the detector | 21 | 3 of 9 |
| **With the detector** | **26 (58%)** | **12 of 18 (67%)** |

![What the translator read on three test videos: a full decoding of "dehydration hemolytic uremic syndrome", "Franklin D. Roosevelt" from a Deaf native signer, and almost nothing from a small inset signer](assets/img/posts/asl/benchmark-reads.jpg)

The detector helps on every measure: more terms read, far more correct speech, and most ordinary signing is no longer turned into letters. Some highlights:

- *E. coli*, *Escherichia*, *FEMA*, *Harvey*, *Franklin*, *Roosevelt* and *Karen* read correctly.
- A whole caption, *dehydration and hemolytic uremic syndrome*, came out in one stretch as `DEHYDRATIONHEMOLYTICUREMICAYNDROME`.
- Spoken words that were right: *bacteria*, *dehydration*, *kidney*, *pathogens*, *spinach*, *cabinet*, *Theodore* and more.

And what doesn't work:

- **Small signers.** When the interpreter is a corner inset, the hand tracker rarely finds the hands, and almost nothing is read. The fix is to find the person first and crop around them before tracking hands.
- **Names are seldom spoken.** They're often read in the captions ("FEMAC", "HAVEYCA"), but they aren't in the dictionary, so the voice stays quiet unless you give it a topic word list.
- **Six spoken words were counted wrong.** Two of those are arguably right: "contaminate" (the caption says *contaminated*) and "website" (*Web site*). I didn't loosen the scoring after seeing the results, so the strict number stands.

The test is still small: with 45 spelled terms, each one moves the score by about 2 points.

## My laptop kept switching itself off

Midway through, the laptop started powering off. Its logs showed no crash and no shutdown, just a hard power cut, and the firmware can't warn Linux when it gets too hot. Two causes:

1. **A memory bug in my own code.** A function that reloads saved hand data used **more than 3 GB** on a 76-second video: it decompressed the whole file again for every single frame. Now it uses 117 MB and takes five seconds, and a test makes sure it stays that way.
2. **Heat.** Earlier jobs ran all eight CPU threads flat out for hours on a thin laptop.

Heavy jobs now go through a small runner script: two CPU threads at most, a memory limit, a pause whenever the CPU passes 88 °C, and a temperature log saved to disk every ten seconds. The whole benchmark ran that way, peaking at **73 °C**, without a single shutdown.

## Next

Crop around small signers before tracking their hands, and grow the benchmark so its numbers get less noisy.

Code, the answer key and the full write-up (journal entry 18): [GitHub](https://github.com/MHVVD/asl-fingerspelling-cv).
