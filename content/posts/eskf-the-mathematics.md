---
title: "ESKF: The Mathematics"
series: robotics-one-page
seriesNumber: 3
standfirst: We can't really avoid the technical reader. To actually understand how the ESKF works — not just the idea behind it — we need to walk through the math a little closer.
tags: [kalman, eskf, nonlinear, linearization, mathematics, state-estimation]
created: 2026-09-10T11:05:00+01:00
updated: 2026-09-10T11:05:00+01:00
readingTime: 5 min
hasSheet: true
---

Now, we can't really avoid the technical reader. As much as I like keeping things simple, to actually understand how the ESKF works, not just the idea behind it, we do need to walk through the math a little closer.

## The problem

$$x_{k+1} = f(x_k, u_k) + w_k$$
$$z_k = h(x_k) + v_k$$

The robot's next state depends on its current state and control input, plus noise. What the sensor reads depends on the current state, plus sensor noise. $f$ and $h$ are nonlinear, curvy, not straight-line. That's the whole problem: everything here is curvy, and the plain Kalman Filter only knows straight lines.

## The key idea

$$x_k = \hat{x}_k \oplus \delta x_k$$

True state = best guess + small correction. $\hat{x}_k$ is the nominal state (your best guess). $\delta x_k$ is the error state (the small leftover mistake). $\oplus$ means "combine correctly". Plain addition for numbers, proper rotational combination for things like orientation. The full state moves in complicated curves, but the error, if your guess is decent, stays small and small things are easy to approximate with straight lines.

## Step 1: Propagate

$$\hat{x}_{k+1} = f(\hat{x}_k, u_k)$$

Push your best guess forward using the real, full nonlinear model. No approximation here.

## Step 2: Linearize

$$f(x_k, u_k) \approx f(\hat{x}_k, u_k) + F_k \delta x_k$$
$$h(x_k) \approx h(\hat{x}_k) + H_k \delta x_k$$

$F_k$ and $H_k$ describe how sensitive the function is right at your current guess, how much the outcome changes if the error nudges slightly. That sensitivity is a derivative, hence $F_k = \partial f / \partial x$, $H_k = \partial h / \partial x$. Just the slope of the small patch you're standing on, not the whole curve.

## The trick

$$\delta x_{k+1} = F_k \delta x_k + G_k w_k$$
$$r_k = z_k - h(\hat{x}_k) \approx H_k \delta x_k + v_k$$

The error now evolves through a straight, linear equation. $r_k$ is the residual, sensor reading minus what we expected, the clue telling us how wrong our guess is.

## Step 3: Kalman update

$$K_k = P_k H_k^T (H_k P_k H_k^T + R)^{-1}$$
$$\delta \hat{x}_k = K_k r_k$$

Same Kalman gain formula as before, deciding how much to trust the new reading vs. the existing estimate. Multiply it by the residual to get the best estimate of the error.

## Step 4: Correct & reset

$$\hat{x}_k \leftarrow \hat{x}_k \oplus \delta \hat{x}_k$$
$$\delta \hat{x}_k \rightarrow 0$$

Fold the estimated error back into the nominal state. Reset the error to zero. You just corrected for it, nothing left to carry forward.

The loop repeats: predict with the real model, linearize around it, run standard Kalman math on the small error, correct, reset, repeat. Nothing here forces the real, curvy world to be straight. It just finds the one small, honest patch where a straight line works, and stays there.

One-pager attached for reference 👇
