---
title: A Tutor and a Translator
series: asl-build-log
seriesNumber: 3
standfirst: Turning flickering frame-by-frame guesses into feedback you can act on and subtitles you can read.
tags: [computer-vision, accessibility, asl]
created: 2026-10-13T18:00:00+01:00
updated: 2026-10-13T18:00:00+01:00
readingTime: 2 min
hasSheet: false
---

The model guesses a letter on every frame, about 30 times a second. Those guesses flicker, especially while the hand moves from one letter to the next. Both things I wanted to build need something steadier.

## Smoothing: from flicker to letters

A small piece of logic sits between the model and everything else:

1. **Average** recent predictions, with the newest frames counting most.
2. **Commit** a letter only once it has been confidently on top for about 0.2 seconds.
3. **Double letters** (the two L's in HELLO) need a "release" in between: a dip in confidence, a small bounce of the hand, or the hand briefly disappearing. Without it, HELLO comes out HELO, or HELLLLLO.
4. **No hand for a third of a second** ends a word.

I tested it by spelling words with real frames from a recording the model had never seen. HELLO, BOOK and LOVE came out perfectly, double letters included. Overall about 1 character in 5 was wrong, and every remaining error was one of the model's known weak letters, not the smoothing.

## Mode 1: the tutor

![The tutor running on my laptop: target letter, my hand tracked live, reference shape on the right](assets/img/posts/asl/tutor-in-use.jpg)

The tutor shows a letter and its reference hand. You hold the sign until a bar fills. If you're stuck, it gives **specific tips**, not just right or wrong:

- *"Straighten your index finger"*, *"Curl your ring finger down"*, from measuring how bent each finger is
- *"Hold your index and middle fingers together"*, from the angle between them (U vs V)
- *"That looks like a V"*, from the model itself

The expected shape for each letter is learned from **real hands**, not from my stick-figure drawings, which turned out to be wrong for letters like X. A correct sign gets an unnecessary tip only 2.4% of the time.

It also picks your next letter by favouring the ones you miss (spaced repetition), and a **teach key** lets you save examples when you know you're right and the model disagrees, so practising builds better training data.

## Mode 2: the video translator

Give it any fingerspelling video and it returns a **captioned video** and an **.srt subtitle file** that plays in any video player. It works out on its own whether the signer is left- or right-handed, and runs faster than real time on my laptop.

By this point, the model reached **73% on a full session of my own hand that it had never seen**, trained on the public data plus my earlier sessions.

The question left was the one that matters: what happens with a real video of someone else?

Next: [first real-world test →](post.html?slug=asl-build-log-first-real-world-test)

*Dated to when this stage of the work happened; written up on 17 October 2026 from the project journal.*
