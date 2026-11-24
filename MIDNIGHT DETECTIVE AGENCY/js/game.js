// ===== GAME ENGINE =====
// Pattern: one state object (S) -> render() rebuilds the screen from S -> click handlers change S and call render().

const STEPS = ["Cover", "Case files", "Briefing", "Investigate", "Evidence board", "Verdict"];
const $ = s => document.querySelector(s);
const app = $("#app");

// Saved progress (best stars per case) survives page refresh via localStorage.
const load = () => { try { return JSON.parse(localStorage.getItem("MIDNIGHT") || "{}"); } catch (e) { return {}; } };
const save = () => { try { localStorage.setItem("MIDNIGHT", JSON.stringify(S.done)); } catch (e) {} };

const S = {
  scr: 0,      // current screen index 0..5
  ci: 0,       // chosen case index
  tab: 0,      // active tab in Investigate
  found: {},   // clues discovered: id -> {t:text, k:isKey, src:source}
  used: 0,     // actions spent
  links: [],   // red strings: [clueId, suspectIndex]
  sel: null,   // clue currently selected on the board
  res: null,   // verdict result
  done: load() // best stars per case
};
const C = () => CASES[S.ci];
const left = () => C().acts - S.used;
const stars = n => "★".repeat(n) + "☆".repeat(3 - n);
const reduceMotion = matchMedia("(prefers-reduced-motion:reduce)").matches;

// ---- Convert a clue id back into its data. ids look like "l0_1" (location 0, item 1) or "s2_0" (suspect 2, question 0)
function lookup(id) {
  const [, kind, a, b] = id.match(/^([ls])(\d+)_(\d+)$/), c = C();
  if (kind === "l") { const it = c.locs[a].i[b]; return { t: it[1], k: !!it[2], src: c.locs[a].n }; }
  const q = c.sus[a].q[b]; return { t: `"${q[1]}"`, k: !!q[2], src: c.sus[a].n };
}

// One clickable action; once used it turns into a result note.
function action(id, label, src) {
  const f = S.found[id];
  if (f) return `<div class="res"><b>${f.src}</b>${f.t}</div>`;
  return `<button class="act" data-a="ex" data-v="${id}" ${left() <= 0 ? "disabled" : ""}>${label}</button>`;
}

// ---- Screens: each is a function returning an HTML string ----
const VIEWS = [
  () => `<section class="cover"><h1 class="t">MIDNIGHT<br>DETECTIVE AGENCY</h1>
    <p>Five case files across fog, sunshine and snow. Interview suspects, collect clues, tie red string and name the culprit.</p>
    <div class="lens" id="lens"><span class="a">Everyone lies. Look closer.</span><span class="b" aria-hidden="true">Everyone lies. Look closer.</span></div>
    <div><button class="btn" data-a="go" data-v="1">Open the case files</button></div></section>`,

  () => `<h2 class="t" style="font-size:36px">Case files</h2><p>Harder cases give fewer actions and more red herrings.</p>
    <div class="cases">${CASES.map((c, i) => `<button class="card" data-a="pick" data-v="${i}">${scene(c.theme)}
      <span class="badge ${c.diff}">${c.diff}</span><h3 class="t" style="font-size:22px">${c.title}</h3>
      <span>${c.tag}</span><span class="dim">${c.style} · ${c.acts > 50 ? "unlimited actions" : c.acts + " actions"}</span>
      <span class="stars">${stars(S.done[i] || 0)}</span></button>`).join("")}</div>`,

  () => `<div class="folder" data-tab="Case ${S.ci + 1} · ${C().diff}">${scene(C().theme)}
    <h2 class="t" style="font-size:32px;margin-top:14px">${C().title}</h2><div class="typed" id="typed"></div>
    <div class="row"><button class="btn" data-a="go" data-v="3">Start investigating</button><button class="btn ghost" data-a="go" data-v="1">Back</button></div></div>`,

  () => {
    const c = C(), tabs = [...c.locs.map(l => l.n), "Interrogate"], n = Object.keys(S.found).length;
    let body;
    if (S.tab < c.locs.length) body = c.locs[S.tab].i.map((it, j) => action(`l${S.tab}_${j}`, it[0])).join("");
    else body = c.sus.map((s, i) => `<div class="person">${avatar(i)}<div><h3 class="t">${s.n} <span class="dim">${s.r}</span></h3>
      ${s.q.map((q, j) => action(`s${i}_${j}`, "Ask: " + q[0])).join("")}</div></div>`).join("");
    return `<div class="hud"><h2 class="t" style="font-size:28px">${c.title}</h2>
      <span class="paper" style="padding:6px 12px">${c.acts > 50 ? "Actions: unlimited" : "Actions left: <b>" + left() + "</b>"} · Clues: <b>${n}</b></span></div>
      <div class="folder" data-tab="Investigation"><div class="tabs">${tabs.map((t, i) => `<button class="${i == S.tab ? "on" : ""}" data-a="tab" data-v="${i}">${t}</button>`).join("")}</div>${body}
      ${c.acts > 50 ? `<p class="dim"><button class="btn ghost" data-a="hint">Need a hint?</button> <span id="hint"></span></p>` : ""}
      <div class="row"><button class="btn red" data-a="go" data-v="4" ${n ? "" : "disabled"}>To the evidence board</button></div></div>`;
  },

  () => {
    const c = C(), ids = Object.keys(S.found);
    return `<div class="hud"><h2 class="t" style="font-size:28px">Evidence board</h2><span class="dim">Select a clue, then a suspect to tie red string. Then accuse.</span></div>
      <div class="board" id="board"><svg id="svg"></svg>
      <div>${ids.map(id => `<button class="note ${S.sel == id ? "sel" : ""}" data-a="selc" data-v="${id}" id="n_${id}"><b>${S.found[id].src}</b><br>${S.found[id].t}</button>`).join("")}</div>
      <div>${c.sus.map((s, i) => `<div class="sus" id="s_${i}">${avatar(i)}<button class="pick" data-a="link" data-v="${i}"><b>${s.n}</b><small>${s.r}</small></button>
        <button class="btn red" data-a="acc" data-v="${i}" style="font-size:14px;padding:4px 10px">Accuse</button></div>`).join("")}</div></div>
      <div class="row"><button class="btn ghost" data-a="go" data-v="3">Back to investigate</button></div>`;
  },

  () => {
    const r = S.res, c = C();
    return `<div class="paper" style="text-align:center"><div class="stamp ${r.ok ? "win" : "lose"}">${r.ok ? "CASE CLOSED" : "WRONG PERSON"}</div>
      <h2 class="t" style="margin:18px 0 6px">You accused ${c.sus[r.who].n}</h2>
      ${r.ok ? `<div class="stars">${stars(r.st)}</div><p><b>Score: ${r.score}/100</b> · ${r.rank}</p>` : `<p>The real culprit walked free: <b>${c.sus[c.cul].n}</b>.</p>`}
      <p style="max-width:56ch;margin:12px auto">${c.sol}</p>
      <div class="row" style="justify-content:center"><button class="btn" data-a="pick" data-v="${S.ci}">Replay</button>
      ${S.ci < CASES.length - 1 ? `<button class="btn red" data-a="pick" data-v="${S.ci + 1}">Next case</button>` : ""}
      <button class="btn ghost" data-a="go" data-v="1">All cases</button></div></div>`;
  }
];

// ---- Click handlers, looked up by the data-a attribute of the clicked element ----
const ACT = {
  go: v => { S.scr = +v; render(); },
  pick: v => { Object.assign(S, { ci: +v, tab: 0, found: {}, used: 0, links: [], sel: null, scr: 2 }); render(); },
  tab: v => { S.tab = +v; render(); },
  ex: v => { if (left() <= 0) return; S.found[v] = lookup(v); S.used++; render(); },
  hint: () => { $("#hint").textContent = C().hint; },
  selc: v => { S.sel = S.sel == v ? null : v; render(); },
  link: v => {   // toggle a string between the selected clue and this suspect
    if (!S.sel) return;
    const i = S.links.findIndex(l => l[0] == S.sel && l[1] == +v);
    i >= 0 ? S.links.splice(i, 1) : S.links.push([S.sel, +v]);
    S.sel = null; render();
  },
  acc: v => {
    const c = C(), who = +v, ok = who === c.cul; let score = 0;
    if (ok) {
      const good = S.links.filter(l => l[1] == who && S.found[l[0]].k).length;   // key clues tied to the culprit
      const bad = S.links.filter(l => l[1] == who && !S.found[l[0]].k).length;   // junk clues tied to the culprit
      const bonus = c.acts > 50 ? 10 : Math.round(left() / c.acts * 10);          // efficiency bonus
      score = Math.max(40, Math.min(100, 50 + Math.min(good, 4) * 10 - bad * 10 + bonus));
    }
    const st = !ok ? 0 : score >= 85 ? 3 : score >= 60 ? 2 : 1;
    const rank = !ok ? "" : ["Rookie", "Detective", "Inspector", "Chief Inspector"][score >= 90 ? 3 : score >= 75 ? 2 : score >= 55 ? 1 : 0];
    S.res = { ok, who, score, st, rank };
    if (st > (S.done[S.ci] || 0)) { S.done[S.ci] = st; save(); }
    S.scr = 5; render();
  }
};
// Event delegation: ONE listener for the whole page instead of one per button.
document.addEventListener("click", e => { const b = e.target.closest("[data-a]"); if (b && !b.disabled) ACT[b.dataset.a](b.dataset.v); });

// ---- Side effects that must run AFTER the HTML exists ----
function drawStrings() {   // draw curved SVG paths between clue notes and suspect cards
  const board = $("#board"); if (!board) return;
  const R = board.getBoundingClientRect(), svg = $("#svg"); svg.innerHTML = "";
  S.links.forEach(([cid, si]) => {
    const a = $("#n_" + cid), b = $("#s_" + si); if (!a || !b) return;
    const p = a.getBoundingClientRect(), q = b.getBoundingClientRect();
    const x1 = p.right - R.left - 12, y1 = p.top - R.top + p.height / 2, x2 = q.left - R.left + 6, y2 = q.top - R.top + 14, m = (x1 + x2) / 2;
    svg.innerHTML += `<path d="M${x1} ${y1} C${m} ${y1 + 30},${m} ${y2 - 30},${x2} ${y2}"/>`;
  });
}
function typewriter() {
  const el = $("#typed"); if (!el) return; const t = C().brief;
  if (reduceMotion) { el.textContent = t; return; }
  let i = 0; (function step() { el.textContent = t.slice(0, i += 2); if (i < t.length && $("#typed") === el) setTimeout(step, 18); })();
}
function lensEffect() {   // magnifier that follows the pointer (sets CSS variables --x --y)
  const l = $("#lens"), move = (cx, cy) => { const r = l.getBoundingClientRect(); l.style.setProperty("--x", cx - r.left + "px"); l.style.setProperty("--y", cy - r.top + "px"); };
  l.onmousemove = e => move(e.clientX, e.clientY); l.ontouchmove = e => move(e.touches[0].clientX, e.touches[0].clientY);
}

let prevScr = -1;
function render() {
  app.innerHTML = VIEWS[S.scr]();
  $("#nav").innerHTML = STEPS.map((s, i) => `<span class="${i == S.scr ? "on" : i < S.scr ? "ok" : ""}">${i + 1}. ${s}</span>`).join("");
  if (S.scr === 0) lensEffect();
  if (S.scr === 2) typewriter();
  if (S.scr === 4) drawStrings();
  if (prevScr !== S.scr) { window.scrollTo(0, 0); prevScr = S.scr; }   // only jump to top on screen change
}
addEventListener("resize", drawStrings);
render();
