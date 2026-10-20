---
title: Training on 87 Signers: From 25% to 67%
series: asl-build-log
seriesNumber: 5
standfirst: My system scored 25% on real-world signers it had never seen. A small sequence model trained on 87 other signers scored 67%, on a laptop CPU.
tags: [machine-learning, sequence-models, ctc, datasets, asl]
created: 2026-10-20T14:52:06+01:00
updated: 2026-10-20T14:52:28+01:00
readingTime: 4 min
hasSheet: false
---

After the [first real-world test](post.html?slug=asl-build-log-first-real-world-test), my tool had two clear weaknesses: it had only ever learned two people's hands, and it read one frame at a time with hand-made rules to turn those guesses into letters. This post is about fixing both, and about measuring the result honestly.

## A real-world dataset

**ChicagoFSWild** is a research dataset of fingerspelling "in the wild": 7,304 clips from online videos, signed by 160 different people, each labelled with the word being spelled. The footage is genuinely messy: webcam vlogs, news studios, interpreters in a small corner window, two people in one shot.

Two things made it the right test:

- **Train, dev and test use different people.** 87 signers for training, 37 for choosing settings, and 36 for the final score. The test score is literally "how well does it read strangers".
- **Real signers are fast.** About 5 frames per letter. In my own recordings I held each letter for 150 frames.

(Dataset: B. Shi et al., "American Sign Language fingerspelling recognition in the wild", IEEE SLT 2018. The clips are real people from online videos, so the frames and everything extracted from them stay on my machine; only code and scores are published.)

## Step 1: score what I already had

My existing system, a per-frame letter classifier plus smoothing rules, scored **9.4%**. Most outputs were simply empty: it waits for a letter to be held for 0.2 seconds, and real signers rarely hold one that long. To be fair to it, I tuned its timing on the 37 dev signers: **25.3%**. That was the number to beat.

## Step 2: read the whole sequence

Instead of guessing a letter per frame, a small recurrent network reads the hand's whole movement through a clip and outputs the word. It's trained with **CTC**, the method speech recognition uses to learn from transcripts without knowing which moment each sound happens: here it learns where the letters fall on its own, from just the word labels.

It still runs on the same 21 MediaPipe hand points per frame, it trains on my laptop's CPU in **31 minutes**, and the apps run it in plain NumPy (a test checks it matches PyTorch exactly).

![Accuracy on the dev signers after each training pass](assets/img/posts/asl/chicagofswild-training-curve.jpg)

## The result

![Letter accuracy on the ChicagoFSWild test set](assets/img/posts/asl/chicagofswild-comparison.jpg)

| On 36 signers it has never seen | Letter accuracy |
|---|---|
| My per-frame system, tuned | 25.3% |
| **My sequence model** | **67.3%** |

The dataset's own papers report **41.9%** (2018) and **45.1%** (2019) trained on the same data, and **61.2%** with 50,000 extra clips. So mine scores higher than the original published results. To be fair about why: those were 2018–2019 models learning from raw pixels on a GPU, and most of my advantage comes from MediaPipe, a modern pre-trained hand tracker they didn't have. This is not a state-of-the-art claim; the field has moved on since 2019.

## Mistakes I made along the way

- **Picking the wrong hand, again.** A trial claimed a hand in 100% of frames. Drawing the chosen hand on the frames showed it sometimes jumped to the signer's *other* hand mid-clip. The fix looks at the whole clip: follow both hands over time, then keep the one held higher (or the one the dataset's annotations mark as signing).
- **A contaminated comparison.** In a first sanity check, the "old" model had been trained on the very session I tested on, which flattered it. Re-scored with a clean model.
- **A download that deleted itself.** 6.2 GB in, the connection dropped, and my retry settings rewound the file to zero. The second attempt used a downloader that genuinely resumes.

## What's still wrong

- **Double letters.** "issue" comes out as "isue", "jasll" as "jasl". This kind of model needs a pause between two identical letters, and fast signers rarely leave one.
- **Slow signing.** On the Travis video from the last post, the new model gets **9 / 26** letters, fewer than my old system's 12. Travis spells slowly and clearly, about 30 frames per letter, while the training signers use about 5. Speeding his video up to match gives 18–19 / 26, but I chose that test after seeing the clip, so the official score stays 9 / 26. The real fix is to teach the model slow signing during training, which also matters for the tutor, where learners sign slowly. That run is training now.

## Next

1. Teach it slow signing (training now), and check the test score doesn't drop.
2. Fix double letters.
3. Put the sequence model into the video translator.

Code and the full journal: [GitHub](https://github.com/MHVVD/asl-fingerspelling-cv).
