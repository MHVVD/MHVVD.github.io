---
title: Linear Kalman Filter
series: robotics-one-page
seriesNumber: 1
standfirst: Starting this series on a very strong note with something I believe is truly magical.
tags: [kalman, estimation, state-space, localization]
created: 2026-08-14T21:52:00+01:00
updated: 2026-08-14T21:52:00+01:00
readingTime: 6 min
excerpt: "The Kalman filter is basically a tool used to combine information from different sources to get a more accurate estimate of something. Starting the series with a self-driving car case study."
sheetImages:
  - "/assets/img/posts/kalman/Linear Kalman Filter — Robotics Concepts in One Page_page-0001.jpg"
sheetHtml: /Kalman_Filter_Sheet.html
---

Starting this series **"Robotics Concepts"** on a very strong note with something which I believe is truly magical: The Kalman Filter.

For the readers who do not really care for the "maths" and "technicalities":

> *"The Kalman filter is basically a tool used to combine information from different sources to get a more accurate estimate of something."*

Imagine you have a robot, and you are trying to estimate its position. You can use information from either the GPS or the IMU to estimate that. However, you can decide to combine the information from both the GPS & IMU for a much better estimate. That's where the Kalman filter comes into play.

You may be tempted to ask: **How does the Kalman filter combine these two distinct pieces of information and magically generate a much better estimate?**

Find the complete breakdown in the sheets below. We will be using a self-driving car as a case study!
