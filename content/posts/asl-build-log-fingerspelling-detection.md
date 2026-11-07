---
title: Teaching the Translator When to Read Letters
series: asl-build-log
seriesNumber: 9
standfirst: Most signing isn't fingerspelling, but my translator read all of it as letters. A small detector now marks the moments that are spelling: 0.82 AP on signers it has never seen.
tags: [computer-vision, sequence-models, datasets, asl]
created: 2026-11-07T12:48:53+01:00
updated: 2026-11-07T12:48:53+01:00
readingTime: 4 min
hasSheet: false
---

Since [build log #7](post.html?slug=asl-build-log-double-letters-translator), the video translator has had one big flaw: it reads **everything** as letters. Most of what a signer does is ordinary signs, not fingerspelling, and those come out as junk like "reveidisemittar", in the captions and, since [the last post](post.html?slug=asl-build-log-speak), out loud. This post is about the missing piece: knowing *when* someone is fingerspelling.

## Finding the right data

A detector needs two kinds of examples: fingerspelling, and ordinary signing that isn't fingerspelling. Getting the second kind from a *different* dataset is risky. The detector could learn "which dataset is this from" (different cameras, lighting, people) instead of "is this fingerspelling", and then fail on real video.

The answer was already on my laptop. ChicagoFSWild, the 160-signer dataset from [build log #5](post.html?slug=asl-build-log-chicagofswild), only ships the fingerspelled clips. But its spreadsheet records each clip's source video and exact start time. **Between the marked clips is ordinary signing by the same people, with the same cameras.** Researchers at TTIC built their fingerspelling-detection benchmark the same way.

So I went back to the source videos:

- Of 194 source videos, about half were on a site that refuses downloads, and some YouTube ones are now private. **89 were still public.**
- I checked every download against the dataset's own frames: matching videos agree to within one frame. Seven didn't match at all, probably re-edited since, and were dropped.
- Final set: **70 videos**, split so the test signers are people the detector never trains on: 36 signers for training, 13 for tuning, 8 for the final test.

One more worry: what if the annotators missed some fingerspelling, so it sits in the "not fingerspelling" pile? I read 1,359 unmarked two-second windows with the letter model, looking for real words. **None** produced one, while marked clips did. That isn't proof, but a lot of missed spelling should have shown up.

## The detector

For every frame, it looks at both hands: their shapes, where they are, how big they are, how fast they move, and where one is relative to the other. Fingerspelling has a typical look: one raised hand, fairly still, changing shape quickly, the other hand down. But I didn't write those rules; a small network (a BiGRU, the same kind as my letter model) learns its own version from the videos, looking a few seconds forward and back. It trained in **19 minutes on the laptop CPU** and runs in plain NumPy.

![The detector's probability over 75 seconds of a test video, rising inside the stretches annotators marked as fingerspelling; below, average precision for three methods](assets/img/posts/asl/fsdetect-timeline.png)

On the 8 test signers, scored once:

| | Frames correctly marked (precision) | Fingerspelling found (recall) |
|---|---|---|
| "A hand is visible" (what the translator did before) | 12% | 100% |
| Same features, one frame at a time | 58% | 70% |
| **The detector** | **73%** | **78%** |

Seeing a few seconds of context is worth a lot: average precision goes from 0.68 to 0.82. The test set is small (7 videos), so I treat these as rough numbers; the tuning signers gave a similar 0.86.

## Back to the USDA video

The real test is the video the translator struggled with: a USDA food-safety video the detector never saw, with a different signer, camera and setting. As before, I checked every spoken word against the English captions burned into the video.

| | Detector off | Detector on |
|---|---|---|
| Frames read as letters | 92% | **48%** |
| Stretches that come out as one clean word | 5, mostly junk ("scull", "ps") | **12** (bacterial, strain, intestines, feces, antibiotics, campylobacteriosis…) |
| Spoken words that match the caption | 7 of 10 | **12 of 18** |

Words it now finds that it missed before: *meningitis*, *syndrome*, and *campylobacteriosis*, read whole for the first time instead of buried in a run of letters.

## What's still wrong

- **More short wrong words**: "coon", "bus" (really *U.S.*), "purina" (really *urinary*), "sisters" (really *FSIS*). The detector cuts signing into shorter pieces, so a short piece that happens to spell a dictionary word gets spoken. I didn't tune my rules on this same video to hide that: its numbers would then flatter the result.
- **The start and end of the video are still junk.** A few ordinary signs still look enough like spelling to pass.
- **Nothing is published except the code.** The downloaded videos, the hand data and the trained detector stay on my laptop, as the dataset's own material does.

## Next

The detector also marks the opposite: the moments that are **not** fingerspelling. Those are exactly what the next phase needs, recognising whole signs rather than letters.

Code, tests and the full write-up (journal entry 17): [GitHub](https://github.com/MHVVD/asl-fingerspelling-cv).
