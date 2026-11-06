---
title: Making the Translator Speak
series: asl-build-log
seriesNumber: 8
standfirst: The translator now says the words it reads, using ElevenLabs. The hard part wasn't the voice; it was deciding what deserved to be said.
tags: [text-to-speech, elevenlabs, developer-experience, asl]
created: 2026-11-06T10:12:50+01:00
updated: 2026-11-06T10:13:12+01:00
readingTime: 5 min
hasSheet: false
---

Until now the video translator only wrote captions. Now it can also **say** the words it reads, as a narration track timed to the video, using [ElevenLabs](https://elevenlabs.io) text-to-speech. Getting a voice to talk was the easy part. The hard part was deciding which words deserved to be said.

<video controls preload="none" playsinline poster="assets/img/posts/asl/spoken-demo-poster.jpg">
  <source src="assets/video/asl-spoken-demo.mp4" type="video/mp4">
</video>
<p class="caption">30 seconds of the USDA video, with sound. The caption bar shows every letter the model reads; the voice says only the real words found in them (shown top left). Video: USDA Food Safety and Inspection Service, public domain.</p>

## How it works

The translator already splits a video into stretches of signing and decodes each one into letters, with timestamps. Speech is one more layer on top; the model and decoder are untouched (both test runs produced the identical transcript).

1. Pick the words worth speaking (more on that below).
2. Send each word to ElevenLabs and get an MP3 back.
3. Place each clip on a timeline at the moment its signing starts. If a clip would overlap the next one, the next one waits; cutting words in half or speeding the voice up both sound worse.
4. Mix the clips into one narration track and attach it to the captioned video with ffmpeg.

```
python -m aslcv.translate clips/usda_campylobacter.webm --speak --vocab examples/usda_campylobacter_vocab.txt
```

You get the captioned video with narration, the narration as an MP3, and a small report of what was spoken, what was skipped and why.

## Built so the next person can set it up in a minute

I treated setup as part of the feature, not an afterthought:

- **It's optional.** The ElevenLabs package is a separate install. Without it, or without a key, the translator runs exactly as before and every test passes; only `--speak` asks for it, with one message saying what to do.
- **The key** comes from an environment variable or a `.env` file that git ignores, with an example file to copy. It is never printed.
- **One small module** is the only code that knows about ElevenLabs. The rest of the project just calls "turn this text into audio".
- **A cache** stores every clip on disk, keyed by the text, voice and model. Re-running a video costs nothing.
- **Errors are one readable line**: a wrong key, no credits left, rate limits (retried automatically), no internet. No stack traces, and no half-written files.
- **Tests** fake ElevenLabs, so they run without a network or a key. One extra test talks to the real API only when a key is set.

I checked the current SDK documentation and the installed package rather than trusting memory, since the API changes between versions.

## The hard part: what should it say?

From the [last post](post.html?slug=asl-build-log-double-letters-translator): the model turns *all* signing into letters, including ordinary signs that aren't fingerspelling at all. One stretch of the USDA video decodes as `strainhumanicampylobacterjejunis`; another as `reveidisemittar`. Reading those out loud is worse than silence. I tried three filters:

1. **The model's confidence.** It was 0.69 to 0.89 for nearly every stretch, junk included, so it can't tell them apart. It does catch short junk below 0.6, so I kept it for that.
2. **How word-like the letters look**, using the decoder's character model. Every long stretch scored low, because real words and junk are glued together. **It didn't work**, so I removed it.
3. **Word spotting.** Look for real words *inside* the letters and speak only those, each at its own moment. Words come from the system dictionary. Inside a longer string a word needs 6 or more letters, because short ones appear by chance ("goof" inside "goofeces"). An optional list of topic words adds names and technical terms a dictionary doesn't have, the same idea as a custom vocabulary for speech recognition.

I checked every spoken word against the English captions burned into the original video:

| Words searched | Spoken | Match the caption |
|---|---|---|
| Dictionary only | 10 | **7** (bacteria, strain, antibiotic, reactive, website…) |
| + 9 topic words (campylobacter, jejuni, FSIS…) | 22 | **19** |

Two are wrong: "ps", two stray letters that happen to be a word, and "sisters", which was really *FSIS*. One more, "emails", isn't in the caption but fits the topic. The topic list was written knowing what the video is about, so read the second row as "what you get if you know the subject". The first row needs no help.

## Cost

For the full 3.6-minute video: 22 spoken words, but only **106 characters** were sent to ElevenLabs, because repeats ("campylobacter" is spotted 7 times) are made once and reused. The second run sent **0 characters**: all 22 clips came from the cache. The speech step takes about 10 seconds, a small fraction of the 5-minute run; hand detection on a laptop CPU is the slow part.

## Rough edges

- **The voice speaks a little early.** Each word is said when its spelling *starts*, so you hear it before the caption has finished spelling it out. Speaking at the end of the word would line up better.
- **It can only say words it knows.** Names need the topic list, and a real-but-wrong word ("sisters") gets through.
- **A setup trap I hit myself.** ElevenLabs API keys can be limited to certain features, and a key without the Text to Speech permission is refused. My first error message called that an "invalid key", which sends you looking in the wrong place. It now names the missing permission and where to switch it on.

## Next

The real fix for the junk is upstream: detecting *when* someone is fingerspelling, before any letters reach the voice. That's the next step for the translator.

Code, tests and the full write-up (journal entry 16): [GitHub](https://github.com/MHVVD/asl-fingerspelling-cv).
