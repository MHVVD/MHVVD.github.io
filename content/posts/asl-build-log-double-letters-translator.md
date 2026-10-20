---
title: Double Letters, and the Translator Gets the New Model
series: asl-build-log
seriesNumber: 7
standfirst: One fix worked, one failed, and a bug that made spaces free. The video translator now runs the 70% model.
tags: [decoding, language-models, debugging, asl]
created: 2026-10-20T22:20:10+01:00
updated: 2026-10-20T22:20:10+01:00
readingTime: 3 min
hasSheet: false
---

The [fresh test](post.html?slug=asl-build-log-fresh-test) read *CAMPYLOBACTER* perfectly, but it couldn't spell *BOOK*: the double O vanished. This post is about double letters, and about finally putting the better model into the app people actually use.

## How bad were double letters?

On the 37 dev signers (the people I tune on, never the final test), 13% of clips contain a double letter. The model reproduced **6 of 136** of them: "mall" became "mal", "hell" became "hel".

The cause is how this kind of model (CTC) works: it outputs a symbol per frame and merges identical neighbours, unless there's a "no letter" moment between them. Fast signers show a double as one hold with a slight bounce, so that gap almost never appears.

## Two fixes, one failed

**Fix 1: a "repeat" symbol.** Train on "mall" written as `mal+`, so a double can't be merged away. The model found 3 more doubles and invented 28 false ones. The visual hint for a double is too subtle to learn from the 594 examples I had. **It didn't work.**

**Fix 2: spelling-aware decoding.** Instead of taking the single best letter per frame, search over the most likely spellings and ask a small character model, trained on real words, which ones look like plausible spelling.

| | Letter accuracy (36 unseen test signers) | Doubles found |
|---|---|---|
| Before | 66.6% | 2 of 111 |
| **With spelling-aware decoding** | **70.3%** | 17 of 111 |

Better, but most doubles are still missed. And it has a side effect: on the fresh clips, *BEK* became ***BED***, because the character model knows "bed" is a common word. A spelling model can push towards the *wrong* common word, which matters most for names.

## The translator gets the new model

Until now the video translator still used my old per-frame model (25% on unseen signers). The new model reads whole stretches of signing at once, so the translator now works in two passes: find the hands in every frame, split the video into signing segments, decode each segment, then draw the captions.

![The translator's caption building up CAMPYLOBACTER on the USDA video](assets/img/posts/asl/translator-usda.jpg)

## A bug only real video could show

Translating the full 3.6-minute USDA video produced "**campyl obacter**", with a space, every single time. Two causes combined: the model puts a little probability on "space" mid-word, and my decoder's bonus for each output symbol was also rewarding spaces, which made inserting one almost free. My earlier scoring had removed spaces before comparing, so it never showed. Spaces now get their own setting, chosen on the dev signers, and *campylobacter* comes out whole.

## What real video makes obvious

Run on the whole video, the translator picks out the fingerspelled vocabulary all the way through: *campylobacter*, *jejuni*, *campylobacteriosis*, *meningitis*, *urinary tract*, *Guillain*, *FSIS*, *Ask Karen*. But:

- **It reads everything as letters.** Most of what the interpreter signs are ordinary signs, not spelling, and they come out as junk like "REVEIDISEMITTAR" in the image above. A real translator first needs to know *when* someone is fingerspelling.
- **Words run together** inside a stretch of signing, because the model rarely outputs spaces.

## Next

Either teach it to detect when someone is fingerspelling, or start the next phase: recognising whole signs, not just letters.

Code and the full journal (entries 14 and 15): [GitHub](https://github.com/MHVVD/asl-fingerspelling-cv).
