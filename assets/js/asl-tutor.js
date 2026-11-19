// ASL fingerspelling tutor in the browser. Everything runs on the visitor's device: the camera image never leaves it.
//   camera -> MediaPipe hand landmarks -> asl-core.js (same maths as the Python tutor) -> letter + tips
// Practice flow as in the Python tutor (tutor.py): hold the target letter for 0.6 s at >= 60% confidence.
// Extra modes, not linked from the page: ?test=1 checks asl-core.js against values computed in Python;
// ?video=URL uses a video file instead of the camera.
import { handMeasures, hints, normalizeLandmarks, predictProba, signingHand, toPixelSpace } from "./asl-core.js";

const MP = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";
const HAND_MODEL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const BASE = "assets/asl-tutor/";
const HOLD_S = 0.6, MIN_CONF = 0.6, TIMEOUT_S = 12, EMA = 0.4, STORE = "asl-tutor-v1";
const BONES = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]];

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
let model, landmarker, video, ctx, running = false, smoothed = null, attempt = null, side = "Right";
// MediaPipe's browser library needs WebGL even when it runs the model on the CPU, so check before downloading anything.
function hasWebGL() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); }
  catch { return false; }
}
let progress = load();

function load() {
  try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; }
}
function save() {
  try { localStorage.setItem(STORE, JSON.stringify(progress)); } catch { /* private mode: progress just isn't kept */ }
}
function status(text, kind = "") { const s = $("status"); s.textContent = text; s.dataset.kind = kind; }

// --- practice planner (tutor.Planner, simplified): letters you miss come back more often --------------------------
function nextTarget(prev) {
  const w = model.classes.map(c => (c === prev ? 0 : (progress[c]?.weight ?? 1)));
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < w.length; i++) if ((r -= w[i]) <= 0) return model.classes[i];
  return model.classes[0];
}
function record(letter, ok) {
  const p = progress[letter] ?? { weight: 1, tries: 0, right: 0 };
  p.tries += 1; p.right += ok ? 1 : 0; p.weight = Math.min(4, Math.max(0.3, p.weight * (ok ? 0.7 : 2)));
  progress[letter] = p; save(); showScore();
}
function showScore() {
  const vals = Object.values(progress), tries = vals.reduce((a, p) => a + p.tries, 0), right = vals.reduce((a, p) => a + p.right, 0);
  const learned = Object.entries(progress).filter(([, p]) => p.right > 0).map(([l]) => l).sort().join(" ");
  $("score").textContent = tries ? `${right} of ${tries} signed correctly` : "No letters yet";
  $("learned").textContent = learned ? `Letters you've signed: ${learned}` : "";
}

function newAttempt(prev) {
  const target = nextTarget(prev);
  attempt = { target, t0: null, holdStart: null, result: null, progress: 0 };
  $("target").textContent = target;
  $("ref").src = `${BASE}ref/${target}.png`;
  $("ref").alt = `Reference hand shape for the letter ${target}`;
  $("feedback").textContent = "";
  $("feedback").dataset.kind = "";
  setHold(0);
}
function setHold(p) { $("hold").style.width = `${Math.round(p * 100)}%`; }

// tutor.Attempt.update
function updateAttempt(seen, t) {
  const a = attempt;
  if (a.result) return;
  if (a.t0 === null) a.t0 = t;
  if (seen && seen[0] === a.target && seen[1] >= MIN_CONF) {
    if (a.holdStart === null) a.holdStart = t;
    a.progress = Math.min(1, (t - a.holdStart) / HOLD_S);
    if (t - a.holdStart >= HOLD_S - 1e-9) a.result = "success";
  } else {
    a.holdStart = null; a.progress = 0;
    if (t - a.t0 >= TIMEOUT_S) a.result = "missed";
  }
  setHold(a.progress);
  if (a.result) {
    record(a.target, a.result === "success");
    $("feedback").textContent = a.result === "success" ? `✓ ${a.target}! Next letter…` : `Let's try another one. (${a.target} is tricky.)`;
    $("feedback").dataset.kind = a.result;
    setTimeout(() => running && newAttempt(a.target), a.result === "success" ? 900 : 1600);
  }
}

// --- one frame ------------------------------------------------------------------------------------------------------
function frame() {
  if (!running) return;
  try { step(); } catch (e) {
    running = false;
    status(`The hand tracker stopped: ${e && e.message ? e.message : e}. Reload the page to try again.`, "error");
    return;
  }
  requestAnimationFrame(frame);
}

function step() {
  if (video.readyState >= 2) {
    const W = video.videoWidth, H = video.videoHeight;
    const res = landmarker.detectForVideo(video, performance.now());
    if (ctx.canvas.width !== W) { ctx.canvas.width = W; ctx.canvas.height = H; }
    ctx.clearRect(0, 0, W, H);
    const hands = (res.landmarks || []).map(lm => ({ landmarks: lm.map(p => [p.x, p.y, p.z]) }));
    const t = performance.now() / 1000;
    if (hands.length) {
      const h = signingHand(hands);
      draw(h.landmarks, W, H);
      const feats = normalizeLandmarks(toPixelSpace(h.landmarks, W, H), side);
      const probs = predictProba(model, feats);
      smoothed = smoothed ? smoothed.map((v, i) => EMA * probs[i] + (1 - EMA) * v) : probs;
      const order = smoothed.map((p, i) => [p, i]).sort((a, b) => b[0] - a[0]);
      const seen = [model.classes[order[0][1]], order[0][0]];
      $("seen").textContent = `${seen[0]}  ${Math.round(seen[1] * 100)}%`;
      $("top3").textContent = order.slice(1, 3).map(([p, i]) => `${model.classes[i]} ${Math.round(p * 100)}%`).join(" · ");
      const tips = hints(handMeasures(feats), model.finger_states[attempt.target], model.thresholds, attempt.target, seen);
      if (!attempt.result) $("tips").innerHTML = tips.map(s => `<li>${s}</li>`).join("") || "<li>Looks close. Hold it steady</li>";
      updateAttempt(seen, t);
    } else {
      smoothed = null;
      $("seen").textContent = "no hand";
      $("top3").textContent = "";
      if (!attempt.result) $("tips").innerHTML = "<li>Raise your hand so the camera can see it</li>";
      updateAttempt(null, t);
    }
  }
}

function draw(lm, W, H) {
  ctx.lineWidth = Math.max(2, W / 240);
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  for (const [a, b] of BONES) {
    ctx.beginPath(); ctx.moveTo(lm[a][0] * W, lm[a][1] * H); ctx.lineTo(lm[b][0] * W, lm[b][1] * H); ctx.stroke();
  }
  ctx.fillStyle = "#e0764f";
  for (const p of lm) { ctx.beginPath(); ctx.arc(p[0] * W, p[1] * H, Math.max(3, W / 160), 0, 2 * Math.PI); ctx.fill(); }
}

// --- start-up --------------------------------------------------------------------------------------------------------
async function loadModel() {
  model = await (await fetch(`${BASE}asl-model.json`)).json();
}

async function loadLandmarker() {
  const { FilesetResolver, HandLandmarker } = await import(`${MP}/vision_bundle.mjs`);
  const files = await FilesetResolver.forVisionTasks(`${MP}/wasm`);
  const opts = d => ({ baseOptions: { modelAssetPath: HAND_MODEL, delegate: d }, runningMode: "VIDEO", numHands: 2,
    minHandDetectionConfidence: 0.5, minHandPresenceConfidence: 0.5, minTrackingConfidence: 0.5 });
  try { return await HandLandmarker.createFromOptions(files, opts("GPU")); }
  catch { return await HandLandmarker.createFromOptions(files, opts("CPU")); }
}

async function start() {
  const btn = $("start");
  if (!hasWebGL()) {
    status("This browser has graphics acceleration (WebGL) turned off, and the hand tracker needs it. "
      + "Try Chrome, Edge, Firefox or Safari with hardware acceleration on.", "error");
    return;
  }
  btn.disabled = true;
  try {
    status("Loading the hand tracker (about 10 MB, once)…");
    [landmarker] = await Promise.all([loadLandmarker(), model ? null : loadModel()]);
    video = $("video");
    if (params.get("video")) {
      video.src = params.get("video"); video.loop = true; video.muted = true;
    } else {
      status("Waiting for camera permission…");
      video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" }, audio: false });
    }
    await video.play();
    ctx = $("overlay").getContext("2d");
    $("tutor").hidden = false;
    $("intro").hidden = true;
    status("Running on your device. Nothing is uploaded.", "ok");
    running = true;
    newAttempt(null);
    showScore();
    requestAnimationFrame(frame);
  } catch (e) {
    btn.disabled = false;
    const denied = e && (e.name === "NotAllowedError" || e.name === "SecurityError");
    const nocam = e && (e.name === "NotFoundError" || e.name === "OverconstrainedError");
    status(denied ? "Camera permission was declined. Allow it in your browser's address bar and try again."
      : nocam ? "No camera found on this device."
      : `Couldn't start: ${e && e.message ? e.message : e}`, "error");
  }
}

function stop() {
  running = false;
  if (video && video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
  $("tutor").hidden = true; $("intro").hidden = false; $("start").disabled = false;
  status("Camera off.");
}

// ?test=1 : compare asl-core.js with values computed by the Python code (tools/export_web.py)
async function selfTest() {
  await loadModel();
  const cases = await (await fetch(`${BASE}test-vectors.json`)).json();
  let maxF = 0, maxP = 0, top = 0, tips = 0;
  for (const c of cases) {
    const f = normalizeLandmarks(toPixelSpace(c.landmarks, c.width, c.height), c.side);
    const p = predictProba(model, f);
    maxF = Math.max(maxF, ...f.map((v, i) => Math.abs(v - c.features[i])));
    maxP = Math.max(maxP, ...p.map((v, i) => Math.abs(v - c.probs[i])));
    const best = model.classes[p.indexOf(Math.max(...p))];
    top += best === c.top;
    const h = hints(handMeasures(f), model.finger_states[c.target], model.thresholds, c.target, [best, Math.max(...p)]);
    tips += JSON.stringify(h) === JSON.stringify(c.hints);
  }
  const ok = maxF < 1e-5 && maxP < 1e-4 && top === cases.length && tips === cases.length;
  const out = `${ok ? "PASS" : "FAIL"}: ${cases.length} hands from the Python code. Max feature difference ${maxF.toExponential(1)}, `
    + `max probability difference ${maxP.toExponential(1)}, same letter ${top}/${cases.length}, same tips ${tips}/${cases.length}.`;
  status(out, ok ? "ok" : "error");
  document.body.dataset.selftest = ok ? "pass" : "fail";
}

$("start").addEventListener("click", start);
$("stop").addEventListener("click", stop);
$("skip").addEventListener("click", () => attempt && !attempt.result && newAttempt(attempt.target));
for (const r of document.querySelectorAll("input[name=hand]")) r.addEventListener("change", e => { side = e.target.value; smoothed = null; });
$("reset").addEventListener("click", () => { progress = {}; save(); showScore(); });
if (params.get("test")) selfTest();
