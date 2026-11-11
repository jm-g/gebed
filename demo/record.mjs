// Plays a scripted tour of gebed in headless Chromium and saves the frames.
//
//   node record.mjs CDP_PORT APP_PORT FRAMES_DIR
//
// The page gets two overlays: the keys being pressed and a one-line caption.
// Frames are PNGs; frames.txt lists them with how long each was on screen, for
// ffmpeg's concat demuxer.
import fs from "node:fs";

const [, , cdpPort, appPort, framesDir] = process.argv;
const W = 1280;
const H = 720;
const FRAME_MS = 110;

const targets = await (await fetch(`http://127.0.0.1:${cdpPort}/json`)).json();
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let nextId = 0;
const pending = new Map();
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) pending.get(d.id)(d);
};
const send = (method, params = {}) =>
  new Promise((res) => {
    const id = ++nextId;
    pending.set(id, res);
    ws.send(JSON.stringify({ id, method, params }));
  });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ------------------------------------------------------------------ frames
const frames = [];
let recording = false;
async function capture() {
  let n = 0;
  while (recording) {
    const t0 = Date.now();
    const r = await send("Page.captureScreenshot", { format: "png" });
    const name = `f${String(++n).padStart(5, "0")}.png`;
    fs.writeFileSync(`${framesDir}/${name}`, Buffer.from(r.result.data, "base64"));
    frames.push({ name, at: t0 });
    await sleep(Math.max(0, FRAME_MS - (Date.now() - t0)));
  }
}
function writeList() {
  const lines = [];
  frames.forEach((f, i) => {
    const next = frames[i + 1] ? frames[i + 1].at : f.at + FRAME_MS;
    lines.push(`file '${f.name}'`, `duration ${((next - f.at) / 1000).toFixed(3)}`);
  });
  lines.push(`file '${frames[frames.length - 1].name}'`); // concat needs the last file repeated
  fs.writeFileSync(`${framesDir}/frames.txt`, lines.join("\n") + "\n");
}

// ------------------------------------------------------------------- input
const SHIFTED = new Set([..."ABCDEFGHIJKLMNOPQRSTUVWXYZ<>?+{}:\"~!@#$%^&*()_|"]);
const CODES = { Enter: 13, Escape: 27, Backspace: 8, Tab: 9, " ": 32 };
async function press(k, mods = 0) {
  const code = CODES[k] ?? k.toUpperCase().charCodeAt(0);
  const text = k === "Enter" ? "\r" : k.length === 1 ? k : undefined;
  const m = mods | (SHIFTED.has(k) ? 8 : 0);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: k, code: k, windowsVirtualKeyCode: code, modifiers: m, text });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code: k, windowsVirtualKeyCode: code, modifiers: m });
}
// keys("g t") presses g then t; "SPC" is the space bar.
async function keys(seq, gap = 330) {
  for (const k of seq.split(" ")) {
    await press(k === "SPC" ? " " : k);
    await sleep(gap);
  }
}
async function type(text, gap = 55) {
  for (const ch of text) {
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: ch, text: ch, unmodifiedText: ch });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: ch });
    await sleep(gap);
  }
}
const ctrlEnter = () => press("Enter", 2);
const run = (js) => send("Runtime.evaluate", { expression: js, returnByValue: true });

// Overlays live in the page, above the app, and never take mouse or keyboard input.
async function installOverlays() {
  await run(`(() => {
    const css = document.createElement('style');
    css.textContent = \`
      #kc { position: fixed; right: 14px; bottom: 14px; display: flex; gap: 6px; z-index: 99999; pointer-events: none; }
      #kc span { font: 600 15px ui-monospace, monospace; background: #f9e2af; color: #1e1e2e; padding: 4px 10px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,.5); }
      #cap { position: fixed; left: 50%; transform: translateX(-50%); bottom: 14px; z-index: 99999; pointer-events: none; font: 600 16px ui-sans-serif, system-ui, sans-serif; background: rgba(17,17,27,.92); color: #cdd6f4; padding: 7px 16px; border-radius: 999px; border: 1px solid #585b70; box-shadow: 0 4px 16px rgba(0,0,0,.5); opacity: 0; transition: opacity .25s; white-space: nowrap; }
    \`;
    document.head.appendChild(css);
    const kc = document.createElement('div'); kc.id = 'kc'; document.body.appendChild(kc);
    const cap = document.createElement('div'); cap.id = 'cap'; document.body.appendChild(cap);
    const names = { ' ': 'SPC', Enter: '⏎', Escape: 'Esc', Backspace: '⌫', Tab: 'Tab' };
    document.addEventListener('keydown', (e) => {
      if (e.key.length > 1 && !names[e.key]) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') { if (!(e.key === 'Enter' || e.key === 'Escape' || e.key === 'Tab')) return; }
      const s = document.createElement('span');
      s.textContent = (e.ctrlKey ? 'Ctrl+' : '') + (names[e.key] || e.key);
      kc.appendChild(s);
      while (kc.children.length > 4) kc.removeChild(kc.firstChild);
      setTimeout(() => s.remove(), 1500);
    }, true);
    window.__cap = (t) => { cap.textContent = t; cap.style.opacity = t ? 1 : 0; };
  })()`);
}
const caption = (t) => run(`window.__cap(${JSON.stringify(t)})`);
const view = async () => (await run(`document.querySelector('.tab.current .tabname')?.textContent`)).result.result.value;

// ------------------------------------------------------------------- tour
await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: `http://127.0.0.1:${appPort}/` });
// The server warms every repo in the background; asking for a search waits for it.
await fetch(`http://127.0.0.1:${appPort}/api/search?mode=exact&q=token`);
for (const name of ["orbit", "orbit-infra", "orbit-web"]) await fetch(`http://127.0.0.1:${appPort}/api/repos/${name}/metrics`);
await sleep(2500); // the app loads
await installOverlays();

// next(caption, hold): step to the next view, then say what it is
async function next(text, hold) {
  await keys("g t", 220);
  await caption(text);
  await sleep(hold);
}

recording = true;
const capturing = capture();

await caption("gebed: every bead of every repo in one place. Kanban, with epics as tags and labels as chips");
await sleep(3000);
await keys("l j j h j l", 380);
await caption("hjkl move around, like vim");
await sleep(900);
await keys("L", 300);
await caption("HJKL move the card: open to in progress…");
await sleep(1400);
await keys("K", 300);
await caption("…and K raises its priority");
await sleep(1400);

await caption("f: fuzzy find across every repo: ids, titles, text, comments, dates");
await keys("f", 500);
await type("tokrace");
await sleep(1600);
await press("Enter");
await sleep(2200);
await caption("The discussion lives in the bead, with the agent's own report");
await sleep(3000);
await keys("a", 600);
await type("@impl what is left before this can merge?", 40);
await caption("@name sends the message to the live Claude session");
await sleep(500);
await ctrlEnter();
await sleep(2200);
await press("Escape");
await sleep(250);
await press("Escape");
await sleep(500);

await caption("s: exact search finds text inside comments");
await keys("s", 500);
await type("maintenance window", 40);
await sleep(1700);
await press("Escape");
await sleep(400);

await next("Every view is a tab with its counts: gt, gT or Tab. List", 1700);
await next("Epics: progress of each epic", 2200);
await next("Story map: epics by priority", 2000);
await next("Roadmap: now, next, later", 2000);
await next("Iterations: weekly plan with capacity", 2000);
await next("Waterfall: a time ruler. Drag or HJKL to re-plan", 2000);
await caption("Agents finish in minutes, so + zooms from days down to 5 minutes");
await keys("+ + +", 800);
await sleep(1700);
await caption("H and L slide a task, < and > shorten or extend it");
await keys("L L", 600);
await keys("> >", 600);
await sleep(1000);
await keys("H", 600);
await sleep(900);
await keys("0", 500);
await sleep(900);

await next("Dependency graph, with links across repos", 2400);
await next("Flow: burnup, throughput, lead time", 2400);
await next("Metrics from what agents report: velocity, forecast, success, rework, cost", 4200);
await next("Impact and effort matrix", 2000);

await caption("SPC opens a menu for everything: which-key");
await keys("SPC", 900);
await keys("v", 1300);
await press("Escape");
await sleep(250);
await caption("SPC then Backspace lists every key");
await keys("SPC Backspace", 400);
await sleep(3000);
await press("Escape");
await sleep(300);

await keys("SPC v k", 220);
await caption("Several repos, br and bd side by side: ] r and [ r");
await keys("] r", 300);
await sleep(1600);
await keys("] r", 300);
await sleep(4200); // the bd repo takes longer to load
await keys("[ r", 300);
await keys("[ r", 300);
await sleep(1200);

await caption("base16 and base24 themes");
for (const _ of [0, 1, 2]) {
  await keys("SPC t n", 220);
  await sleep(1100);
}
await keys("SPC t n", 220);
await keys("SPC t n", 220);
await keys("SPC v k", 220);
await caption("All of it from the keyboard. Agents get the same power through MCP.");
await sleep(3000);
await caption("");
await sleep(600);

recording = false;
await capturing;
writeList();
console.log(`${frames.length} frames over ${((frames[frames.length - 1].at - frames[0].at) / 1000).toFixed(1)} s; last view ${await view()}`);
ws.close();
