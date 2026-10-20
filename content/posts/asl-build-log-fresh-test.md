---
title: A Fresh Test, Scored Once
series: asl-build-log
seriesNumber: 6
standfirst: Two new signers, answer keys written before any model saw them, one scoring run. CAMPYLOBACTER, read perfectly at six letters a second.
tags: [testing, evaluation, machine-learning, asl]
created: 2026-10-20T19:02:10+01:00
updated: 2026-10-20T19:02:10+01:00
readingTime: 3 min
hasSheet: false
---

In the [last post](post.html?slug=asl-build-log-chicagofswild), a sequence model trained on 87 signers jumped from 25% to 67% on people it had never seen. But one of my own test clips had a problem, and fixing it properly meant building a test I couldn't fool myself with.

## When a test stops being a test

The Travis video from [post #4](post.html?slug=asl-build-log-first-real-world-test) had become too familiar. I'd used it to decide which hand to read, to diagnose a speed problem, and to judge whether a retraining worked. Every time you make a decision based on a test clip, it quietly turns into training data, and the number it gives you stops meaning anything.

## First, a bug in my own fix

Travis spells slowly (about 30 frames per letter) while the training signers use about 5, so I taught the model slow signing by stretching training clips in time. It barely helped. Reading my own code showed why: I stretched the clips, but the **hand-speed numbers were copied unchanged**, so the "slow" clips showed a hand moving fast on frames that barely changed, something no real signer ever does.

| Median hand speed (hand sizes per frame) | |
|---|---|
| Real-world signers, normal speed | 0.041 |
| My "slowed" clips, before the fix | 0.041 (the bug) |
| Slowed clips after the fix | 0.010 at quarter speed |
| A real slow signer | 0.027, now inside the training range |

After the fix and a retrain, accuracy on the 36 real-world test signers held (66.7%), and it did a little better on slow signing, though the evidence for that is still thin.

## A test I can't fool myself with

I found two new clips with free licenses on Wikimedia Commons, both signers no model had seen:

- **"ASL BOOK"** by Richard Goodrow (CC BY 3.0): the word **BOOK** spelled out, including a double letter.
- **USDA Food Safety's "Campylobacter"** video (public domain): a health video signed in ASL, with English captions burned in.

The rules I set myself:

1. **Write the answer key first, by eye.** The captions told me which word was being signed; I then read every letter at full frame rate. The USDA signer spells *CAMPYLOBACTER*, 13 letters, in about 2.2 seconds.
2. **Lock it.** The keys, with a fingerprint of each video file, were saved before any model ran. The scoring script refuses to run if a clip has changed.
3. **Score once.** All three models, same frames, one run.

![The USDA signer's hand at each letter of CAMPYLOBACTER, and the model's output](assets/img/posts/asl/campylobacter-letters.jpg)

## The result

| Word | Per-frame model | Sequence model | + slow signing |
|---|---|---|---|
| CAMPYLOBACTER | 7 / 13 | **13 / 13** | **13 / 13** |
| BACTERIA | 3 / 8 | 8 / 8 (+1 extra letter) | 8 / 8 (+1 extra letter) |
| BOOK | 1 / 4 | 1 / 4 | 2 / 4 |
| **All 25 letters** | **40%** | **84%** | **88%** |

A fluent signer, spelling a technical word at six letters a second, transcribed perfectly by a model running on my laptop's CPU.

## What it doesn't show

- **25 letters from 2 signers is a spot check**, not a benchmark. It points the same way as the 36-signer test, and the three models rank in the same order, which is what makes it believable.
- **Double letters are still broken.** BOOK was the hard one: a tiny 320×240 video, the hand partly out of frame, and the double O shown as one quick hold. No model got the second O. That's the next thing to fix, judged on the large dev set, not on these clips.

## Next

1. Fix double letters.
2. Put the sequence model into the video translator, so the app itself uses the 88% model.

Full write-up, the answer keys and the scores: [GitHub](https://github.com/MHVVD/asl-fingerspelling-cv) (journal 13).
