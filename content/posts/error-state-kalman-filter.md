---
title: The Error State Kalman Filter
series: robotics-one-page
seriesNumber: 2
standfirst: Continuing "Robotics Concepts" with a natural follow-up to the Kalman Filter post — what happens when the thing you're tracking doesn't move in a straight, predictable line?
tags: [kalman, eskf, nonlinear, linearization, localization]
created: 2026-09-09T14:38:00+01:00
updated: 2026-09-09T14:38:00+01:00
readingTime: 5 min
hasSheet: true
---

Continuing **"Robotics Concepts"** with a natural follow-up to the Kalman Filter post: what happens when the thing you're tracking doesn't move in a straight, predictable line?

For the readers who do not really care for the "maths" and "technicalities":

> *The regular Kalman Filter (from my last post) has one big assumption baked in: everything behaves in a straight, predictable way. Double your input, you double your output. No surprises, No curves.*

Real robots don't work like that. A drone turning, a car cornering, a robot arm rotating. These all involve curves and angles, not straight lines. So the "magic" formula from the last post can't be applied directly here.

This is where **linearization** comes in, and honestly, the idea is simpler than the word sounds.

Imagine you're standing on a hill. The hill is curvy, hard to describe with simple math. But if you zoom in close enough on the exact spot where you're standing, that tiny patch of ground looks almost flat. A straight line.

That's linearization: instead of trying to describe the whole curvy hill at once, you just describe the small, flat-looking patch right where you currently are. It's not the whole truth, but it's a very good local approximation — and straight lines are things we know how to work with.

The **Error State Kalman Filter (ESKF)** uses exactly this trick. Instead of tracking the robot's full, messy, curvy state directly, it keeps a "best guess" (nominal state) and only tracks the small error around that guess.

That error is small enough that the curvy world looks flat around it, so the regular, straight-line Kalman Filter math can be reused on just that small piece.

Zoom in, treat the small patch as flat, correct it, then zoom in again on the next patch. Repeat, forever, as the robot moves.

Find the complete breakdown in the sheet below 👇 Still using the self-driving car as our running example.
