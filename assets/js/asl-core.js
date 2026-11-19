// ASL fingerspelling tutor, browser port of the Python pipeline (github.com/MHVVD/asl-fingerspelling-cv).
// Pure functions only: hand points in, features / letter probabilities / tips out. Each mirrors a Python function
// (named in the comments) and is checked against values the Python code computed (asl-tutor.html?test=1).

const WRIST = 0, MIDDLE_MCP = 9;
const FINGERS = { index: [5, 6, 7, 8], middle: [9, 10, 11, 12], ring: [13, 14, 15, 16], pinky: [17, 18, 19, 20] };
const DIRECTION_WORD = { up: "up", down: "down", side: "sideways" };

// landmarks.to_pixel_space: MediaPipe gives x as a fraction of width and y of height; z is on x's scale.
export function toPixelSpace(landmarks, width, height) {
  return landmarks.map(p => [p[0] * width, p[1] * height, p[2] * width]);
}

// features.normalize_landmarks: mirror left hands, move the wrist to the origin, divide by palm length.
export function normalizeLandmarks(px, handedness = "Right") {
  const pts = px.map(p => [handedness === "Left" ? -p[0] : p[0], p[1], p[2]]);
  const w = pts[WRIST].slice();
  for (const p of pts) { p[0] -= w[0]; p[1] -= w[1]; p[2] -= w[2]; }
  const m = pts[MIDDLE_MCP];
  const scale = Math.hypot(m[0], m[1], m[2]);
  const s = scale > 1e-9 ? scale : 1;
  return pts.flatMap(p => [p[0] / s, p[1] / s, p[2] / s]);
}

// model.LetterModel.predict_proba: ReLU hidden layers, softmax output. W is [in][out].
export function predictProba(model, x) {
  let h = x;
  model.layers.forEach((layer, k) => {
    const { W, b } = layer, out = new Array(b.length);
    for (let j = 0; j < b.length; j++) {
      let s = b[j];
      for (let i = 0; i < h.length; i++) s += h[i] * W[i][j];
      out[j] = k < model.layers.length - 1 ? Math.max(s, 0) : s;
    }
    h = out;
  });
  const mx = Math.max(...h), e = h.map(v => Math.exp(v - mx)), sum = e.reduce((a, v) => a + v, 0);
  return e.map(v => v / sum);
}

const sub = (a, b) => a.map((v, i) => v - b[i]);
function angle(u, v) {                                   // hints._angle, degrees
  const dot = u.reduce((s, x, i) => s + x * v[i], 0);
  const c = dot / (Math.hypot(...u) * Math.hypot(...v) + 1e-9);
  return Math.acos(Math.min(1, Math.max(-1, c))) * 180 / Math.PI;
}

// hints.hand_measures, from the 63 normalised features.
export function handMeasures(features) {
  const p = [];
  for (let i = 0; i < 21; i++) p.push(features.slice(3 * i, 3 * i + 3));
  const fingers = {};
  for (const [name, [m, q, d, t]] of Object.entries(FINGERS)) {
    fingers[name] = angle(sub(p[m], p[0]), sub(p[q], p[m])) + angle(sub(p[q], p[m]), sub(p[d], p[q]))
      + angle(sub(p[d], p[q]), sub(p[t], p[d]));
  }
  const vx = p[9][0] - p[0][0], vy = p[9][1] - p[0][1];  // image y grows downward
  const direction = -vy > Math.abs(vx) ? "up" : vy > Math.abs(vx) ? "down" : "side";
  const spread = angle(sub(p[8], p[5]).slice(0, 2), sub(p[12], p[9]).slice(0, 2));
  return { fingers, thumb_out: Math.hypot(...sub(p[4], p[5])), direction, spread };
}

// hints.hints: short, specific instructions, most important first.
export function hints(m, expected, th, target, seen, maxHints = 2, seenConf = 0.6) {
  const out = [];
  if ((expected.direction === "down" || expected.direction === "side") && m.direction !== expected.direction)
    out.push(`Point your fingers ${DIRECTION_WORD[expected.direction]}`);
  for (const f of Object.keys(FINGERS)) {
    const want = expected.fingers[f], have = m.fingers[f];
    if (want === "straight" && have > th.curled_min) out.push(`Straighten your ${f} finger`);
    else if (want === "curled" && have < th.straight_max) out.push(`Curl your ${f} finger down`);
  }
  if (expected.spread === "apart" && m.spread < th.together_max) out.push("Spread your index and middle fingers apart");
  else if (expected.spread === "together" && m.spread > th.apart_min) out.push("Hold your index and middle fingers together");
  if (expected.thumb === "out" && m.thumb_out < th.thumb_in_max) out.push("Stick your thumb out");
  else if (expected.thumb === "in" && m.thumb_out > th.thumb_out_min) out.push("Tuck your thumb in");
  const res = out.slice(0, maxHints);
  if (seen && target && seen[0] && seen[0] !== target && seen[1] >= seenConf) res.push(`That looks like ${seen[0]}`);
  return res;
}

// pipeline.signing_hand: with two hands in view, the raised one (smallest mean y) is spelling.
export function signingHand(hands) {
  return hands.reduce((best, h) => {
    const y = h.landmarks.reduce((s, p) => s + p[1], 0) / h.landmarks.length;
    return !best || y < best.y ? { ...h, y } : best;
  }, null);
}
