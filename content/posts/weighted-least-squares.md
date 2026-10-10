---
title: Weighted Least Squares
series: robotics-one-page
seriesNumber: 5
standfirst: The resistor from the last post is still on the desk. This time there are two instruments next to it, and one of them is far more trustworthy than the other.
tags: [least-squares, weighted-least-squares, estimation, state-estimation, kalman]
created: 2026-10-10T23:39:41+01:00
updated: 2026-10-10T23:39:53+01:00
readingTime: 1 min
hasSheet: true
---

The resistor from the last post is still on the desk. This time there are two instruments next to it: a cheap multimeter, and a precise bench meter borrowed from the lab.

For the readers who do not really care for the "maths" and "technicalities":

Measure the resistor twice with each. The cheap multimeter says 1010 Ω and 1006 Ω. The bench meter says 1001 Ω and 1002 Ω.

Last time, the answer was to take the average. Do that here and you get 1004.75 Ω.

Something about that feels wrong. Four readings went in, and all four were treated the same, even though two of them came from an instrument we know is much noisier. The cheap multimeter got exactly the same vote as the bench meter.

> *Weighted Least Squares fixes that with one small change. Every measurement gets a weight, and the weight depends on how noisy the instrument is. A noisy meter gets a quiet voice. A precise meter gets a loud one.*

Here the bench meter is ten times less noisy, so each of its readings counts a hundred times more. The answer moves from 1004.75 Ω to 1001.56 Ω, right next to the bench meter. The cheap multimeter is not ignored, just trusted less.

The full breakdown, with the maths, is in the sheet below 👇
