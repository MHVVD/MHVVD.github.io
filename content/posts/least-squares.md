---
title: Least Squares
series: robotics-one-page
seriesNumber: 4
standfirst: Before going any further with "Robotics Concepts", we need to take a step back. The Kalman filter did not come out of nowhere — it is built on a much older and much simpler idea.
tags: [least-squares, estimation, state-estimation, kalman]
created: 2026-10-10T23:25:22+01:00
updated: 2026-10-10T23:25:34+01:00
readingTime: 2 min
hasSheet: true
---

Before going any further with **"Robotics Concepts"**, we need to take a step back.

The Kalman filter from the last three posts did not come out of nowhere. It is built on a much older and much simpler idea: **Least Squares**.

For the readers who do not really care for the "maths" and "technicalities":

> *Least squares is basically a way of taking many imperfect measurements of the same thing and finding the one answer that disagrees with all of them the least.*

Imagine you have a resistor on your desk and you want to know its resistance. You pick up a multimeter and measure it four times. You get 1003 Ω, 998 Ω, 1001 Ω and 1002 Ω.

The resistor has not changed. The multimeter is just a little noisy. None of the readings is exactly right. None of them is badly wrong either. So which number do you write down?

Most people would simply take the average: 1001 Ω. And that instinct is correct. That average is the least squares answer.

You may be tempted to ask: why the average? Why not just pick the one in the middle, or the one you like best?

Because every other choice leaves you further away from the readings as a whole. Pick any number, check how far it is from each reading, square those distances and add them up. At 1001 Ω that total is 14. Move to 999 Ω or 1003 Ω and it climbs to 30. The average is the number that makes the total as small as it can possibly be.

Least squares. The name is the whole method.

There is one catch. Plain least squares assumes every measurement is equally trustworthy. That is fine for four readings from the same multimeter. It is wrong the moment some of those readings come from a cheap multimeter and the others from a precise bench meter.

That is the next post: **Weighted Least Squares**.

Find the complete breakdown in the sheet below 👇
