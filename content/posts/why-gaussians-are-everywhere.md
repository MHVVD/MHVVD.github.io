---
title: Why Gaussians Are Everywhere
series: robotics-one-page
seriesNumber: 6
standfirst: Every post in this series so far has been leaning on one quiet assumption. Time to talk about it.
tags: [gaussian, probability, estimation, least-squares, kalman]
created: 2026-10-17T12:00:00+01:00
updated: 2026-10-17T12:00:00+01:00
readingTime: 2 min
hasSheet: true
---

The resistor is back on the desk.

If you have been following this series, you have probably noticed one word that keeps showing up in the background: noise. The multimeter is noisy. The GPS is noisy. The IMU is noisy. But I never really said what that noise looks like.

It looks like a bell.

> *A Gaussian (the bell curve) is basically a way of saying: most of my readings will land close to the true value, a few will land a bit further away, and almost none will land very far.*

Imagine measuring that resistor a hundred times with the same multimeter and plotting every reading. You get a big pile in the middle, around the true value, with thinner tails on both sides. That is the bell.

The nice thing is that you only need two numbers to describe it. The **mean** tells you where the middle is: your best guess. The **variance** tells you how wide the bell is: how much you should trust that guess.

So why does noise almost always come out shaped like this? Because a reading is never off for just one reason. It is a little bit of loose probe, a little bit of heat, a little bit of rounding inside the meter, all added together. Stack enough small random things on top of each other and you get a bell, almost every time.

That is half the story. The other half is that Gaussians are just very easy to work with. Combine two of them and you get another one. That is a big part of why the Kalman filter fits on one page.

Here is the part I like the most. Remember the cheap multimeter and the bench meter from the last post? Treat each one as its own bell and combine them. You get **1001.56 Ω**, the exact same answer weighted least squares gave us. Same answer, different road. The weights were hiding inside the bell curve all along.

But the bell has a weak spot. Take the four readings from the least squares post and add one more where the probe slipped: 1040 Ω. The average jumps from 1001 Ω to 1008.8 Ω. One bad reading, and the whole answer moves. The bell expects small errors, not big surprises.

It also struggles when things stop moving in straight lines, which is exactly where the next post picks up: **The Extended Kalman Filter**.

The full breakdown is in the sheet below 👇
