// ===== ART ===== Functions that RETURN SVG strings. Animation lives in css/style.css (classes).
const SKY = { fog:["#2a3040","#59647a"], sun:["#ffb347","#ff7e5f"], train:["#1a1530","#4a3570"], night:["#0f1d2a","#1d4a55"] };

function scene(theme) {
  const [a, b] = SKY[theme] || SKY.fog;
  let fx = "";
  if (theme === "fog") fx = `<circle class="flicker" cx="90" cy="70" r="14" fill="#ffd36b"/><rect x="88" y="80" width="4" height="70" fill="#111"/>
    <ellipse class="drift" cx="150" cy="118" rx="120" ry="14" fill="#fff" opacity=".2"/><ellipse class="drift slow" cx="440" cy="130" rx="140" ry="12" fill="#fff" opacity=".16"/>`;
  if (theme === "sun") fx = `<g class="spin" style="transform-origin:490px 50px"><circle cx="490" cy="50" r="24" fill="#fff3b0"/>
    ${[...Array(8)].map((_, i) => `<rect x="487" y="8" width="6" height="14" fill="#fff3b0" transform="rotate(${i * 45} 490 50)"/>`).join("")}</g>
    <g class="sway" style="transform-origin:90px 150px"><rect x="86" y="80" width="8" height="70" fill="#6b4a2b"/><ellipse cx="90" cy="76" rx="34" ry="10" fill="#2f8f4e"/></g>`;
  if (theme === "train") fx = `<g class="rush">${[...Array(9)].map((_, i) => `<rect x="${i * 80}" y="60" width="44" height="30" rx="4" fill="#ffd36b" opacity=".8"/>`).join("")}</g>
    <rect x="0" y="100" width="600" height="6" fill="#111" opacity=".5"/>`;
  if (theme === "night") fx = [...Array(16)].map((_, i) => `<line class="rain" style="animation-delay:${(i % 8) * .12}s" x1="${i * 38 + 8}" y1="0" x2="${i * 38}" y2="22" stroke="#9fd6e8" stroke-width="1.5"/>`).join("") +
    `<ellipse cx="480" cy="146" rx="90" ry="8" fill="#2d6a73"/><rect x="430" y="112" width="100" height="26" rx="5" fill="#caa86a"/>`;
  const sleuth = `<g class="sway" style="transform-origin:300px 152px"><ellipse cx="300" cy="86" rx="26" ry="5" fill="#111"/><rect x="287" y="68" width="26" height="20" rx="4" fill="#111"/>
    <circle cx="300" cy="104" r="14" fill="#e8c39e"/><path d="M280 152 L285 118 H315 L320 152Z" fill="#222"/>
    <g class="glass"><circle cx="338" cy="126" r="11" fill="#fff" fill-opacity=".15" stroke="#e0b84a" stroke-width="3"/><line x1="346" y1="134" x2="358" y2="150" stroke="#e0b84a" stroke-width="3"/></g></g>`;
  return `<svg class="scene" viewBox="0 0 600 160" role="img" aria-label="Animated case scene"><defs><linearGradient id="g${theme}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="600" height="160" fill="url(#g${theme})"/>${fx}<rect y="150" width="600" height="10" fill="#0008"/>${sleuth}</svg>`;
}

// Suspect portrait: colours chosen by index so every suspect looks different.
function avatar(i) {
  const skin = ["#e8c39e", "#c68b59", "#f1d3b3"][i % 3], hair = ["#2b2118", "#7a4a21", "#aaa"][i % 3];
  const hat = [`<path d="M14 24 Q30 6 46 24Z" fill="${hair}"/>`, `<rect x="15" y="14" width="30" height="10" rx="5" fill="#334"/><rect x="11" y="23" width="38" height="3" fill="#334"/>`, `<path d="M12 30 Q12 8 30 8 Q48 8 48 30 Q40 18 30 18 Q20 18 12 30Z" fill="${hair}"/>`][i % 3];
  return `<svg class="av" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="34" r="18" fill="${skin}"/>${hat}
    <g class="blink" style="transform-origin:30px 32px"><circle cx="23" cy="32" r="2.5" fill="#222"/><circle cx="37" cy="32" r="2.5" fill="#222"/></g>
    <path d="M24 42 Q30 46 36 42" stroke="#833" stroke-width="2" fill="none"/></svg>`;
}
