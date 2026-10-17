---
title: Two Mirroring Bugs, and Why My First Fix Was Wrong
series: asl-build-log
seriesNumber: 2
standfirst: My right hand kept turning into a left hand. Finding out why took two tries.
tags: [debugging, computer-vision, asl]
created: 2026-10-11T18:00:00+01:00
updated: 2026-10-11T18:00:00+01:00
readingTime: 3 min
hasSheet: false
---

After recording my own sessions, a few letters behaved strangely. **P and Q were confused 100% of the time**, not sometimes, *always*. Random mistakes are scattered. All-or-nothing mistakes usually mean a bug.

## Bug one: P and Q were stored as mirror images

I compared the average hand shape of each letter across my sessions. Most letters barely moved. P and Q were far apart, and one session's P matched the other session's P almost perfectly **once mirrored**.

To tell a software mirror from a physically turned hand, I used depth: turning your hand around flips both left-right *and* depth, while a software mirror flips only left-right. The data said software mirror.

The pipeline trusted MediaPipe's "left hand / right hand" label on every frame and mirrored "left" hands. For P and Q, where the hand points down, that label wobbled. My fix: stop trusting the per-frame label and use the hand you declare. I repaired the data (mirroring is exactly reversible, so nothing was lost) and moved on.

**That fix was wrong**, and the next session proved it.

## Bug two: my right hand became a left hand

My third session came out as an exact mirror image of the first two, and MediaPipe labelled every single frame "left hand", although I used my right hand, palm to the camera.

I first suspected the webcam had been flipped by some other app. I checked the camera's driver settings directly: it has no flip setting at all. Wrong guess, so back to the evidence.

The real story:

- My recorder mirrored each webcam frame **before** detection, so the window felt like a mirror.
- In a mirrored picture, a right hand *looks like* a left hand, so MediaPipe always said "left". It had been saying that all along.
- The original code mirrored "left" hands, which **accidentally flipped them back**. Two mirrorings cancelled out, and my first two sessions were only right by luck.
- My "fix" removed one of the two mirrorings, and broke everything.

I tested the explanation on real photos: flipping an image flips MediaPipe's label more than 90% of the time. The label describes the *image*, not the person.

**The real fix:** detection always runs on the camera's real, unmirrored image; only what's drawn on screen is mirrored. Mirroring happens in exactly one place.

![My average hand per session for the letters that kept swapping](assets/img/posts/asl/session-consistency.jpg)

With the bugs gone, drawing my average hand per session showed what was left: some letters I had simply signed differently from one session to the next (R with fingers spread like a V, a flat C instead of a curved one). That's a data problem, not a code problem.

## What it taught me

- A fix that makes a symptom disappear can still be wrong if the explanation is wrong.
- Save the raw data. I could repair a whole session without re-recording because I had kept the original hand points.
- Measure, then guess. Every step here started with a number that looked impossible.

Next: [a tutor and a translator →](post.html?slug=asl-build-log-tutor-and-translator)

*Dated to when this stage of the work happened; written up on 17 October 2026 from the project journal.*
