/* ================================================================
   Portfolio — script.js   Terminal / Hacker OS Edition
================================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCursor();
  injectRingGradient();
  initAurora();
  initHeroCanvas();
  initNavbar();
  initBootSequence();
  initTyped();
  initReveal();
  initCounters();
  initTabs();
  initSkillBars();
  initProjectFilter();
  initSectionCanvases();
  initContactForm();
  initRipple();
  initBackToTop();
  initFooterYear();
  initSmoothScroll();
});

/* ── 0. THEME ──────────────────────────────────────────────── */
function initTheme() {
  const html = document.documentElement;
  const btn  = document.getElementById('themeToggle');
  const saved = localStorage.getItem('pf-theme') || 'dark';
  html.setAttribute('data-theme', saved);
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('pf-theme', next);
  });
}

/* ── 1. CUSTOM CURSOR ──────────────────────────────────────── */
function initCursor() {
  const dot   = document.getElementById('cursor');
  const trail = document.getElementById('cursorTrail');
  if (!dot || !trail) return;
  let tx = 0, ty = 0;
  document.addEventListener('mousemove', e => {
    dot.style.left   = e.clientX + 'px';
    dot.style.top    = e.clientY + 'px';
    tx = e.clientX; ty = e.clientY;
  });
  // Trail lags behind with lerp
  let cx = 0, cy = 0;
  function lerp() {
    cx += (tx - cx) * 0.14;
    cy += (ty - cy) * 0.14;
    trail.style.left = cx + 'px';
    trail.style.top  = cy + 'px';
    requestAnimationFrame(lerp);
  }
  lerp();
}

/* ── 2. SVG RING GRADIENT ──────────────────────────────────── */
function injectRingGradient() {
  const svg = document.querySelector('.ring-svg');
  if (!svg) return;
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#00ffb3"/>
      <stop offset="100%" stop-color="#00d4ff"/>
    </linearGradient>`;
  svg.prepend(defs);
}

/* ── 3. AURORA BACKGROUND CANVAS ──────────────────────────── */
function initAurora() {
  const canvas = document.getElementById('auroraCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;

  const blobs = Array.from({ length: 5 }, (_, i) => ({
    x: Math.random(), y: Math.random(),
    rx: 0.3 + Math.random() * 0.25,
    ry: 0.18 + Math.random() * 0.15,
    vx: (Math.random() - 0.5) * 0.00018,
    vy: (Math.random() - 0.5) * 0.00012,
    hue: i < 2 ? 'green' : i < 4 ? 'cyan' : 'purple',
    phase: Math.random() * Math.PI * 2,
    spd: 0.003 + Math.random() * 0.002,
  }));

  function getColor(hue, alpha) {
    const dark = document.documentElement.getAttribute('data-theme') !== 'light';
    const map = dark
      ? { green: `rgba(0,255,179,${alpha})`, cyan: `rgba(0,212,255,${alpha})`, purple: `rgba(140,80,255,${alpha})` }
      : { green: `rgba(10,122,78,${alpha})`,  cyan: `rgba(0,102,204,${alpha})`, purple: `rgba(100,50,200,${alpha})` };
    return map[hue];
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function draw() {
    t += 0.008;
    ctx.clearRect(0, 0, W, H);

    blobs.forEach(b => {
      b.x += b.vx; b.y += b.vy;
      if (b.x < -0.2) b.x = 1.2;
      if (b.x > 1.2)  b.x = -0.2;
      if (b.y < -0.2) b.y = 1.2;
      if (b.y > 1.2)  b.y = -0.2;

      const pulse = 0.7 + 0.3 * Math.sin(t * b.spd * 100 + b.phase);
      const px = b.x * W, py = b.y * H;
      const rx = b.rx * W * pulse, ry = b.ry * H * pulse;

      ctx.save();
      ctx.translate(px, py);
      ctx.scale(1, ry / rx);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      grad.addColorStop(0,   getColor(b.hue, 0.055));
      grad.addColorStop(0.5, getColor(b.hue, 0.025));
      grad.addColorStop(1,   getColor(b.hue, 0));
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
}

/* ── 3b. HERO CANVAS — 5-layer cinematic bg ────────────────── */
function initHeroCanvas() {
  const canvas  = document.getElementById('heroCanvas');
  const section = document.getElementById('hero');
  if (!canvas || !section) return;
  const ctx = canvas.getContext('2d');

  let W, H, frame = 0;
  const mouse = { x: -9999, y: -9999 };

  /* ── resize ─────────────────────────────────────────── */
  function resize() {
    W = canvas.width  = section.offsetWidth;
    H = canvas.height = section.offsetHeight;
    buildAll();
  }

  /* ── helpers ─────────────────────────────────────────── */
  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  /* ══════════════════════════════════════════════════════
     LAYER 1 — Deep star field (3 depth layers)
  ══════════════════════════════════════════════════════ */
  let starLayers;
  function buildStars() {
    starLayers = [
      { stars: [], speed: 0.015, r: 0.6, a: 0.35 },
      { stars: [], speed: 0.028, r: 1.1, a: 0.55 },
      { stars: [], speed: 0.048, r: 1.7, a: 0.75 },
    ];
    starLayers.forEach((layer, li) => {
      const count = li === 0 ? 260 : li === 1 ? 120 : 55;
      layer.stars = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        twinkleOff: Math.random() * Math.PI * 2,
        twinkleSpd: 0.015 + Math.random() * 0.025,
      }));
    });
  }

  function drawStars() {
    starLayers.forEach(layer => {
      layer.stars.forEach(s => {
        // Very slow drift downward (parallax)
        s.y += layer.speed;
        if (s.y > H + 4) { s.y = -4; s.x = Math.random() * W; }

        const twinkle = 0.5 + 0.5 * Math.sin(frame * s.twinkleSpd + s.twinkleOff);
        const alpha   = layer.a * twinkle;
        const col     = isDark()
          ? `rgba(180,230,255,${alpha})`
          : `rgba(0,90,180,${alpha * 0.5})`;

        ctx.beginPath();
        ctx.arc(s.x, s.y, layer.r * twinkle, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     LAYER 2 — Rotating 3D wireframe sphere
  ══════════════════════════════════════════════════════ */
  const SPHERE = { lat: 14, lon: 22, R: 0, cx: 0, cy: 0 };
  let sphereVerts = [], sphereEdges = [];
  let sphereRY = 0, sphereRX = 0.22;

  function buildSphere() {
    // Sphere sits dead-centre of the hero, large and ghost-like behind content
    SPHERE.R  = Math.min(W, H) * 0.38;
    SPHERE.cx = W * 0.5;
    SPHERE.cy = H * 0.52;
    sphereVerts = [];
    sphereEdges = [];

    // Generate vertices at lat/lon intersections
    for (let la = 0; la <= SPHERE.lat; la++) {
      for (let lo = 0; lo < SPHERE.lon; lo++) {
        const phi   = (la / SPHERE.lat) * Math.PI;
        const theta = (lo / SPHERE.lon) * Math.PI * 2;
        sphereVerts.push({
          x0: SPHERE.R * Math.sin(phi) * Math.cos(theta),
          y0: SPHERE.R * Math.cos(phi),
          z0: SPHERE.R * Math.sin(phi) * Math.sin(theta),
        });
      }
    }

    // Connect longitude rings
    for (let la = 0; la <= SPHERE.lat; la++) {
      for (let lo = 0; lo < SPHERE.lon; lo++) {
        const a = la * SPHERE.lon + lo;
        const b = la * SPHERE.lon + ((lo + 1) % SPHERE.lon);
        if (a < sphereVerts.length && b < sphereVerts.length)
          sphereEdges.push([a, b]);
      }
    }
    // Connect latitude rings (meridians)
    for (let la = 0; la < SPHERE.lat; la++) {
      for (let lo = 0; lo < SPHERE.lon; lo++) {
        const a = la * SPHERE.lon + lo;
        const b = (la + 1) * SPHERE.lon + lo;
        if (a < sphereVerts.length && b < sphereVerts.length)
          sphereEdges.push([a, b]);
      }
    }
  }

  function project(x, y, z) {
    // Rotate Y
    const cosY = Math.cos(sphereRY), sinY = Math.sin(sphereRY);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;
    // Rotate X
    const cosX = Math.cos(sphereRX), sinX = Math.sin(sphereRX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;
    // Perspective project
    const fov  = 500;
    const scale = fov / (fov + z2 + SPHERE.R);
    return {
      px: SPHERE.cx + x1 * scale,
      py: SPHERE.cy + y2 * scale,
      z:  z2,
      scale,
    };
  }

  function drawSphere() {
    sphereRY += 0.0028;

    const dark = isDark();
    sphereEdges.forEach(([ai, bi]) => {
      const a = sphereVerts[ai], b = sphereVerts[bi];
      if (!a || !b) return;
      const pa = project(a.x0, a.y0, a.z0);
      const pb = project(b.x0, b.y0, b.z0);

      // Depth-based alpha — very subtle, lives in background
      const depth = ((pa.z + pb.z) * 0.5 + SPHERE.R) / (2 * SPHERE.R);
      const alpha = dark
        ? 0.02 + depth * 0.07
        : 0.015 + depth * 0.045;
      const color = dark
        ? `rgba(0,255,179,${alpha})`
        : `rgba(0,100,180,${alpha})`;

      ctx.beginPath();
      ctx.moveTo(pa.px, pa.py);
      ctx.lineTo(pb.px, pb.py);
      ctx.strokeStyle = color;
      ctx.lineWidth   = 0.6 + depth * 0.4;
      ctx.stroke();
    });

    // Glow dot at sphere center
    const cg = ctx.createRadialGradient(SPHERE.cx, SPHERE.cy, 0, SPHERE.cx, SPHERE.cy, SPHERE.R * 0.5);
    cg.addColorStop(0, dark ? 'rgba(0,255,179,0.04)' : 'rgba(0,120,200,0.03)');
    cg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(SPHERE.cx, SPHERE.cy, SPHERE.R * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ══════════════════════════════════════════════════════
     LAYER 3 — Mouse-reactive constellation particles
  ══════════════════════════════════════════════════════ */
  let conParts;
  const CON_COUNT = 90, CON_DIST = 130, MOUSE_R = 100;

  function buildConParts() {
    conParts = Array.from({ length: CON_COUNT }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r:  Math.random() * 1.4 + 0.6,
      a:  Math.random() * 0.4 + 0.2,
    }));
  }

  function drawConParts() {
    const dark = isDark();

    // Lines between close particles
    for (let i = 0; i < conParts.length; i++) {
      for (let j = i + 1; j < conParts.length; j++) {
        const dx = conParts[i].x - conParts[j].x;
        const dy = conParts[i].y - conParts[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < CON_DIST) {
          const a = dark
            ? (1 - d / CON_DIST) * 0.12
            : (1 - d / CON_DIST) * 0.07;
          ctx.beginPath();
          ctx.moveTo(conParts[i].x, conParts[i].y);
          ctx.lineTo(conParts[j].x, conParts[j].y);
          ctx.strokeStyle = dark ? `rgba(0,212,255,${a})` : `rgba(0,80,180,${a})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }
    }

    // Particles
    conParts.forEach(p => {
      // Mouse repulsion
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < MOUSE_R && d > 0) {
        const f = (MOUSE_R - d) / MOUSE_R;
        p.vx += (dx / d) * f * 0.7;
        p.vy += (dy / d) * f * 0.7;
      }
      // Dampen & move
      p.vx *= 0.97; p.vy *= 0.97;
      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (spd > 1.8) { p.vx = (p.vx / spd) * 1.8; p.vy = (p.vy / spd) * 1.8; }
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      const col  = dark ? `rgba(0,255,179,${p.a})` : `rgba(0,90,180,${p.a * 0.6})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.shadowColor = dark ? 'rgba(0,255,179,0.6)' : 'transparent';
      ctx.shadowBlur  = dark ? 6 : 0;
      ctx.fill();
      ctx.shadowBlur  = 0;
    });
  }

  /* ══════════════════════════════════════════════════════
     LAYER 4 — Falling code rain (subtle, sparse)
  ══════════════════════════════════════════════════════ */
  const CODE_CHARS = '01{}[]<>/\\;:=+#@!?∑ΩαβγδλπΔ∇01010110';
  let codeDrops;

  function buildCodeDrops() {
    const cols = Math.floor(W / 28);
    codeDrops = Array.from({ length: Math.min(cols, 38) }, (_, i) => ({
      x:     (i / Math.min(cols, 38)) * W + Math.random() * 28,
      y:     Math.random() * H,
      speed: 0.4 + Math.random() * 0.6,
      alpha: 0.04 + Math.random() * 0.08,
      len:   Math.floor(Math.random() * 12) + 5,
      chars: [],
    }));
    codeDrops.forEach(d => {
      d.chars = Array.from({ length: d.len }, () =>
        CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
      );
    });
  }

  function drawCodeRain() {
    const dark  = isDark();
    const charH = 18;

    codeDrops.forEach((d, di) => {
      d.y += d.speed;
      if (d.y - d.len * charH > H) {
        d.y  = -d.len * charH;
        d.speed = 0.4 + Math.random() * 0.6;
        d.alpha = 0.04 + Math.random() * 0.08;
      }
      // Occasionally scramble a char
      if (Math.random() < 0.02) {
        const ri = Math.floor(Math.random() * d.len);
        d.chars[ri] = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
      }

      ctx.font = `500 ${charH - 2}px 'JetBrains Mono', monospace`;

      d.chars.forEach((ch, ci) => {
        const cy   = d.y - ci * charH;
        if (cy < -charH || cy > H + charH) return;
        const fade = (d.len - ci) / d.len;
        const head = ci === 0;
        ctx.fillStyle = head
          ? (dark ? `rgba(180,255,230,${d.alpha * 2.5})` : `rgba(0,120,80,${d.alpha * 3})`)
          : (dark ? `rgba(0,255,179,${d.alpha * fade})` : `rgba(0,100,60,${d.alpha * fade * 0.7})`);
        ctx.shadowColor = head && dark ? 'rgba(0,255,179,0.7)' : 'transparent';
        ctx.shadowBlur  = head && dark ? 8 : 0;
        ctx.fillText(ch, d.x, cy);
        ctx.shadowBlur  = 0;
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     LAYER 5 — Sweeping light beams
  ══════════════════════════════════════════════════════ */
  let beams;
  function buildBeams() {
    beams = Array.from({ length: 3 }, (_, i) => ({
      angle:  (i / 3) * Math.PI * 2,
      speed:  0.0006 + Math.random() * 0.0004,
      width:  Math.PI / 22,
      alpha:  0.025 + Math.random() * 0.02,
    }));
  }

  function drawBeams() {
    const dark = isDark();
    if (!dark) return;
    beams.forEach(b => {
      b.angle += b.speed;
      const len = Math.max(W, H) * 1.6;
      // Origin: bottom-centre — beams sweep upward like stadium spotlights
      const ox  = W * 0.5, oy = H * 1.05;

      const a1 = b.angle - b.width;
      const a2 = b.angle + b.width;

      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + Math.cos(a1) * len, oy + Math.sin(a1) * len);
      ctx.lineTo(ox + Math.cos(a2) * len, oy + Math.sin(a2) * len);
      ctx.closePath();

      const tx = ox + Math.cos(b.angle) * len * 0.5;
      const ty = oy + Math.sin(b.angle) * len * 0.5;
      const g  = ctx.createLinearGradient(ox, oy, tx, ty);
      g.addColorStop(0,   `rgba(0,255,179,${b.alpha * 1.8})`);
      g.addColorStop(0.35,`rgba(0,212,255,${b.alpha * 0.9})`);
      g.addColorStop(1,   'rgba(0,180,255,0)');
      ctx.fillStyle = g;
      ctx.fill();
    });
  }

  /* ══════════════════════════════════════════════════════
     BUILD + LOOP
  ══════════════════════════════════════════════════════ */
  function buildAll() {
    buildStars();
    buildSphere();
    buildConParts();
    buildCodeDrops();
    buildBeams();
  }

  function loop() {
    frame++;
    ctx.clearRect(0, 0, W, H);

    drawBeams();        // Layer 5 — stadium spotlights from bottom
    drawStars();        // Layer 1 — 3-depth parallax star field
    drawSphere();       // Layer 2 — ghost wireframe sphere
    drawPanelGlow();    // Layer 2b — ambient bloom behind content panels
    drawCodeRain();     // Layer 4 — sparse falling code
    drawConParts();     // Layer 3 — mouse-reactive constellation (front)

    requestAnimationFrame(loop);
  }

  /* Panel bloom — soft radial glow anchored behind terminal (left) and headline (right) */
  function drawPanelGlow() {
    const dark = isDark();
    if (!dark) return;

    const lx = W * 0.25, ly = H * 0.5;  // terminal side
    const rx = W * 0.75, ry = H * 0.45; // headline side

    const rL = Math.min(W, H) * 0.35;
    const gL = ctx.createRadialGradient(lx, ly, 0, lx, ly, rL);
    gL.addColorStop(0,   'rgba(0,255,179,0.055)');
    gL.addColorStop(0.5, 'rgba(0,255,179,0.018)');
    gL.addColorStop(1,   'rgba(0,255,179,0)');
    ctx.fillStyle = gL;
    ctx.beginPath();
    ctx.arc(lx, ly, rL, 0, Math.PI * 2);
    ctx.fill();

    const rR = Math.min(W, H) * 0.38;
    const gR = ctx.createRadialGradient(rx, ry, 0, rx, ry, rR);
    gR.addColorStop(0,   'rgba(0,212,255,0.05)');
    gR.addColorStop(0.5, 'rgba(0,212,255,0.015)');
    gR.addColorStop(1,   'rgba(0,212,255,0)');
    ctx.fillStyle = gR;
    ctx.beginPath();
    ctx.arc(rx, ry, rR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouse tracking scoped to hero section only
  section.addEventListener('mousemove', e => {
    const rect = section.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  section.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  window.addEventListener('resize', resize);
  resize();
  loop();
}

/* ── 4. NAVBAR ─────────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hbg    = document.getElementById('hamburger');
  const links  = document.getElementById('navLinks');
  const navAs  = links ? links.querySelectorAll('.nav-link') : [];

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
    updateActive();
  }, { passive: true });

  if (hbg && links) {
    hbg.addEventListener('click', () => {
      hbg.classList.toggle('open');
      links.classList.toggle('open');
    });
    navAs.forEach(a => a.addEventListener('click', () => {
      hbg.classList.remove('open');
      links.classList.remove('open');
    }));
  }

  function updateActive() {
    let cur = '';
    document.querySelectorAll('section[id]').forEach(s => {
      if (window.scrollY >= s.offsetTop - 90) cur = s.id;
    });
    navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  }
}

/* ── 5. TERMINAL BOOT SEQUENCE ─────────────────────────────── */
function initBootSequence() {
  const body = document.getElementById('terminalBody');
  if (!body) return;

  const lines = [
    { type: 'cmd',  prompt: 'visitor@portfolio:~$', cmd: 'whoami' },
    { type: 'out',  text: 'YourName — CS Engineer',  cls: 'green' },
    { type: 'cmd',  prompt: 'visitor@portfolio:~$', cmd: 'cat skills.txt' },
    { type: 'out',  text: 'Python · JavaScript · C++ · React · Node.js', cls: '' },
    { type: 'out',  text: 'Docker · Linux · Git · Cloud · SQL',           cls: '' },
    { type: 'cmd',  prompt: 'visitor@portfolio:~$', cmd: 'git log --oneline -3' },
    { type: 'out',  text: 'a3f9c2e  feat: launched Project Alpha',   cls: 'amber' },
    { type: 'out',  text: '8b1d74a  wip:  building Project Beta',    cls: 'amber' },
    { type: 'out',  text: '2e05f1c  init: Project Gamma scaffolded', cls: 'amber' },
    { type: 'cmd',  prompt: 'visitor@portfolio:~$', cmd: 'echo $STATUS' },
    { type: 'out',  text: '✓ Open to new opportunities',             cls: 'green' },
    { type: 'cursor' },
  ];

  let lineIdx = 0;

  function renderNext() {
    if (lineIdx >= lines.length) return;
    const item = lines[lineIdx++];

    const el = document.createElement('div');

    if (item.type === 'cmd') {
      el.className = 't-line';
      el.innerHTML = `<span class="t-prompt">${item.prompt}</span>`;
      body.appendChild(el);
      // Type the command character by character
      let ci = 0;
      const cmdSpan = document.createElement('span');
      cmdSpan.className = 't-cmd';
      el.appendChild(cmdSpan);
      const typeChar = () => {
        if (ci <= item.cmd.length) {
          cmdSpan.textContent = item.cmd.slice(0, ci++);
          setTimeout(typeChar, 42 + Math.random() * 30);
        } else {
          setTimeout(renderNext, 180);
        }
      };
      setTimeout(typeChar, 60);
      return; // don't fall through
    }

    if (item.type === 'out') {
      el.className = `t-line t-out${item.cls ? ' ' + item.cls : ''}`;
      el.textContent = item.text;
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;
      setTimeout(renderNext, 90);
      return;
    }

    if (item.type === 'cursor') {
      el.className = 't-line t-cursor-line';
      el.innerHTML = `<span class="t-prompt">visitor@portfolio:~$</span>&nbsp;<span class="t-cursor-block"></span>`;
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;
      return;
    }
  }

  // Delay start for dramatic effect
  setTimeout(renderNext, 600);
}

/* ── 6. TYPED ROLE ─────────────────────────────────────────── */
function initTyped() {
  const el = document.getElementById('typedRole');
  if (!el) return;

  const roles = [
    'CS Engineer',
    'AI Enthusiast',
    'Systems Programmer',
    'Problem Solver',
    'Open Source Dev',
  ];

  let ri = 0, ci = 0, deleting = false;
  const TSPD = 75, DSPD = 38, PAUSE = 1800, PRSE = 300;

  function tick() {
    const cur = roles[ri];
    if (!deleting) {
      el.textContent = cur.slice(0, ++ci);
      if (ci === cur.length) { deleting = true; return setTimeout(tick, PAUSE); }
    } else {
      el.textContent = cur.slice(0, --ci);
      if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; return setTimeout(tick, PRSE); }
    }
    setTimeout(tick, deleting ? DSPD : TSPD);
  }
  setTimeout(tick, 1400);
}

/* ── 7. SCROLL REVEAL ──────────────────────────────────────── */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = entry.target.parentElement.querySelectorAll('.reveal');
      let idx = 0;
      siblings.forEach((s, i) => { if (s === entry.target) idx = i; });
      setTimeout(() => entry.target.classList.add('visible'), Math.min(idx * 75, 300));
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
  els.forEach(el => io.observe(el));
}

/* ── 8. ANIMATED COUNTERS — Odometer Roll-Up ──────────────── */
function initCounters() {
  const slots = document.querySelectorAll('.stat-slot[data-target]');
  if (!slots.length) return;

  /* Build the DOM for each slot:
     one .stat-digit-wrap per digit of the target number,
     each containing a vertical strip of 0–9 that scrolls upward */
  function buildSlot(slot) {
    const target    = parseInt(slot.dataset.target, 10);
    const digits    = String(target).split('');
    const track     = slot.querySelector('.stat-slot-track');
    const suffix    = slot.querySelector('.stat-suffix');
    if (!track) return;

    // Clear placeholder content
    track.innerHTML = '';

    // Create one digit column per digit in the final number
    digits.forEach((digitChar, di) => {
      const finalDigit = parseInt(digitChar, 10);

      const wrap  = document.createElement('div');
      wrap.className = 'stat-digit-wrap';

      const inner = document.createElement('div');
      inner.className = 'stat-digit-inner';
      // Fill 0–9 plus the final digit again at the top so it lands cleanly
      for (let n = 0; n <= 10; n++) {
        const s = document.createElement('span');
        s.textContent = n < 10 ? n : finalDigit;
        inner.appendChild(s);
      }

      wrap.appendChild(inner);
      track.appendChild(wrap);

      // Store refs for animation
      wrap._inner      = inner;
      wrap._finalDigit = finalDigit;
      wrap._delay      = di * 80; // stagger each digit column
    });

    slot._digitWraps = track.querySelectorAll('.stat-digit-wrap');
    slot._suffix     = suffix;
    slot._built      = true;
  }

  /* Run the animation for a slot */
  function animateSlot(slot) {
    if (!slot._built) buildSlot(slot);
    const ROW_H   = 33.6; // 2.1rem in px (matches CSS height: 2.1rem)
    const TOTAL   = 11;   // rows 0–10 (row 10 = final digit again)
    const FINAL_Y = -(TOTAL - 1) * ROW_H; // translateY to show last row

    slot._digitWraps.forEach((wrap, i) => {
      const delay    = wrap._delay || i * 80;
      const duration = 900 + i * 60; // slightly longer for later digits

      setTimeout(() => {
        // Spring-style easing via CSS transition
        wrap._inner.style.transition =
          `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
        wrap._inner.style.transform = `translateY(${FINAL_Y}px)`;
      }, delay);
    });

    // Show the "+" suffix after all digits land
    const totalDelay = (slot._digitWraps.length - 1) * 80 + 960;
    setTimeout(() => {
      if (slot._suffix) slot._suffix.classList.add('visible');
    }, totalDelay);
  }

  // Build all slots immediately (so layout is correct), then observe
  slots.forEach(slot => buildSlot(slot));

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateSlot(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  slots.forEach(slot => io.observe(slot));
}

/* ── 9. SKILLS TABS ────────────────────────────────────────── */
function initTabs() {
  const btns = document.querySelectorAll('.stab');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.spanel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('tab-' + btn.dataset.tab);
      if (!panel) return;
      panel.classList.add('active');
      // Re-animate bars and reveals
      panel.querySelectorAll('.skcard').forEach(c => {
        const fill = c.querySelector('.skfill');
        if (fill) { fill.style.width = '0'; void fill.offsetWidth; setTimeout(() => { fill.style.width = (c.dataset.level || 0) + '%'; }, 80); }
        c.classList.remove('visible');
        setTimeout(() => c.classList.add('visible'), 20);
      });
    });
  });
}

/* ── 10. SKILL BARS ────────────────────────────────────────── */
function initSkillBars() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const fill = entry.target.querySelector('.skfill');
      if (fill) setTimeout(() => { fill.style.width = (entry.target.dataset.level || 0) + '%'; }, 120);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.skcard').forEach(c => io.observe(c));
}

/* ── 11. PROJECT FILTER ────────────────────────────────────── */
function initProjectFilter() {
  const btns  = document.querySelectorAll('.pfilt');
  const cards = document.querySelectorAll('.pcard');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(card => {
        const show = f === 'all' || card.dataset.category === f;
        if (show) {
          card.classList.remove('hidden');
          card.style.opacity = '0'; card.style.transform = 'translateY(16px)';
          requestAnimationFrame(() => requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            card.style.opacity = '1'; card.style.transform = 'translateY(0)';
          }));
        } else {
          card.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
          card.style.opacity = '0'; card.style.transform = 'translateY(10px)';
          setTimeout(() => card.classList.add('hidden'), 230);
        }
      });
    });
  });
}

/* ── 12. SECTION CANVASES (Skills, Projects, Contact) ──────── */
function initSectionCanvases() {
  initSkillsCanvas();
  initProjectsCanvas();
  initContactCanvas();
}

/* Skills — dot grid + detailed auto-jumping dino scene */
function initSkillsCanvas() {
  const canvas  = document.getElementById('skillsCanvas');
  const section = document.getElementById('skills');
  if (!canvas || !section) return;
  const ctx = canvas.getContext('2d');
  let W, H, dots, t = 0;

  /* ─── helpers ───────────────────────────────────────── */
  function isLight() { return document.documentElement.getAttribute('data-theme') === 'light'; }
  function dc(a) { return isLight() ? `rgba(10,100,60,${a})` : `rgba(0,255,179,${a})`; }
  function cc(a) { return isLight() ? `rgba(0,80,160,${a})` : `rgba(0,212,255,${a})`; }
  function pc(a) { return isLight() ? `rgba(80,40,160,${a})` : `rgba(180,100,255,${a})`; }
  function GY()  { return H * 0.72; }

  /* ─── dot grid ──────────────────────────────────────── */
  function buildDots() {
    const cols = Math.ceil(W/52)+1, rows = Math.ceil(H/52)+1;
    dots = [];
    for (let r=0;r<rows;r++) for (let c=0;c<cols;c++)
      dots.push({ x:c*52, y:r*52, ph:Math.random()*Math.PI*2, sp:0.012+Math.random()*0.01 });
  }
  function drawDots() {
    dots.forEach(d=>{
      const a = 0.055 + 0.08*(0.5+0.5*Math.sin(t*d.sp+d.ph));
      ctx.beginPath(); ctx.arc(d.x,d.y,1.6,0,Math.PI*2);
      ctx.fillStyle = isLight()?`rgba(10,122,78,${a})`:`rgba(0,255,179,${a})`; ctx.fill();
    });
  }

  /* ─── day/night cycle ───────────────────────────────── */
  let dayPhase = 0; // 0=day,1=dusk,2=night,3=dawn — slow cycle
  const SKY_CYCLE = 0.00012;

  function drawSky() {
    const p = (Math.sin(t * SKY_CYCLE) + 1) / 2; // 0–1
    // Sky gradient overlay at top portion only
    const skyH = GY();
    const grad = ctx.createLinearGradient(0, 0, 0, skyH);
    if (!isLight()) {
      const nightA = 0.06 + 0.10 * (1 - p);
      grad.addColorStop(0, `rgba(0,20,60,${nightA})`);
      grad.addColorStop(1, `rgba(0,0,0,0)`);
    } else {
      grad.addColorStop(0, `rgba(180,220,255,0.08)`);
      grad.addColorStop(1, `rgba(180,220,255,0)`);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, skyH);
  }

  /* ─── moon ──────────────────────────────────────────── */
  let moonX = 9999;
  function drawMoon() {
    if (isLight()) return;
    moonX -= 0.12;
    if (moonX < -30) moonX = W + 30;
    const my = H * 0.14;
    // Outer glow
    const mg = ctx.createRadialGradient(moonX, my, 0, moonX, my, 28);
    mg.addColorStop(0,   cc(0.18));
    mg.addColorStop(0.5, cc(0.06));
    mg.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(moonX, my, 28, 0, Math.PI*2); ctx.fill();
    // Moon disc
    ctx.beginPath(); ctx.arc(moonX, my, 11, 0, Math.PI*2);
    ctx.fillStyle = cc(0.55); ctx.fill();
    // Crescent shadow
    ctx.beginPath(); ctx.arc(moonX+5, my-3, 9, 0, Math.PI*2);
    ctx.fillStyle = isLight()?'rgba(180,220,255,0.6)':'rgba(8,12,20,0.85)'; ctx.fill();
    // Craters
    [[moonX-3,my+2,2],[moonX+3,my-1,1.5],[moonX-1,my-4,1]].forEach(([cx,cy,cr])=>{
      ctx.beginPath(); ctx.arc(cx,cy,cr,0,Math.PI*2);
      ctx.fillStyle = cc(0.18); ctx.fill();
    });
  }

  /* ─── shooting stars ────────────────────────────────── */
  const shooters = Array.from({length:3},()=>({ x:-1, y:0, active:false, timer:Math.random()*400+100 }));
  function drawShooters() {
    if (isLight()) return;
    shooters.forEach(s=>{
      if (!s.active) {
        s.timer--;
        if (s.timer <= 0) { s.x=Math.random()*W*0.6; s.y=Math.random()*H*0.3; s.active=true; s.timer=Math.random()*400+200; }
        return;
      }
      s.x += 5; s.y += 2.2;
      if (s.x > W || s.y > H*0.5) { s.active=false; return; }
      const tail = 40;
      const g = ctx.createLinearGradient(s.x-tail,s.y-tail*0.44,s.x,s.y);
      g.addColorStop(0,'rgba(180,240,255,0)');
      g.addColorStop(1,cc(0.7));
      ctx.strokeStyle=g; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(s.x-tail,s.y-tail*0.44); ctx.lineTo(s.x,s.y); ctx.stroke();
      ctx.beginPath(); ctx.arc(s.x,s.y,2,0,Math.PI*2); ctx.fillStyle=cc(0.9); ctx.fill();
    });
  }

  /* ─── parallax mountains ────────────────────────────── */
  const mtns = [
    { pts:[], spd:0.25, a:0.07, col:'c' },
    { pts:[], spd:0.55, a:0.12, col:'d' },
  ];
  function buildMountains() {
    mtns.forEach((m,mi)=>{
      m.pts=[];
      const n = 10 + mi*4;
      for (let i=0;i<=n+1;i++) m.pts.push({ bx:(i/n)*W*1.2 - W*0.1, by:H*(0.35+mi*0.10)+(Math.random()-0.5)*H*0.14 });
    });
  }
  let mtnOff = [0,0];
  function drawMountains() {
    mtns.forEach((m,mi)=>{
      mtnOff[mi] = (mtnOff[mi] + m.spd) % W;
      const col = m.col==='c' ? cc(m.a) : dc(m.a);
      for (let pass=0;pass<2;pass++) {
        const ox = pass===0 ? -mtnOff[mi] : W - mtnOff[mi];
        ctx.beginPath(); ctx.moveTo(ox+m.pts[0].bx, GY());
        m.pts.forEach(p=>ctx.lineTo(ox+p.bx, p.by));
        ctx.lineTo(ox+m.pts[m.pts.length-1].bx, GY());
        ctx.closePath(); ctx.fillStyle=col; ctx.fill();
      }
    });
  }

  /* ─── clouds ────────────────────────────────────────── */
  const clouds = [
    {x:0.15,y:0.11,w:100,h:26,sp:0.22},
    {x:0.42,y:0.07,w:70, h:18,sp:0.13},
    {x:0.70,y:0.15,w:82, h:22,sp:0.17},
    {x:0.88,y:0.05,w:55, h:14,sp:0.25},
  ];
  function drawClouds() {
    clouds.forEach(c=>{
      c.x -= c.sp/W;
      if (c.x < -c.w/W) c.x = 1+c.w/W;
      const cx=c.x*W, cy=c.y*H;
      // Shadow
      ctx.fillStyle = isLight()?'rgba(0,0,0,0.03)':cc(0.04);
      ctx.beginPath(); ctx.ellipse(cx+4,cy+4,c.w*0.5,c.h*0.5,0,0,Math.PI*2); ctx.fill();
      // Body puffs
      [[0,0,0.5,0.5],[-.28,.15,.32,.4],[.28,.15,.32,.4],[-.14,-.1,.25,.35],[.14,-.1,.25,.35]].forEach(([dx,dy,rw,rh])=>{
        ctx.fillStyle = cc(isLight()?0.08:0.14);
        ctx.beginPath(); ctx.ellipse(cx+dx*c.w,cy+dy*c.h,c.w*rw,c.h*rh,0,0,Math.PI*2); ctx.fill();
      });
      // Highlight
      ctx.fillStyle = cc(isLight()?0.04:0.07);
      ctx.beginPath(); ctx.ellipse(cx-c.w*0.1,cy-c.h*0.15,c.w*0.28,c.h*0.25,0,0,Math.PI*2); ctx.fill();
    });
  }

  /* ─── ground ────────────────────────────────────────── */
  let gOff=0; const SPEED=2.8;
  function drawGround() {
    const gy=GY();
    // Gradient ground strip
    const gg = ctx.createLinearGradient(0,gy,0,gy+28);
    gg.addColorStop(0, dc(0.30)); gg.addColorStop(1, dc(0.05));
    ctx.fillStyle=gg; ctx.fillRect(0,gy,W,28);
    // Top line
    ctx.strokeStyle=dc(0.55); ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke();
    // Scrolling ticks
    ctx.lineWidth=1;
    for (let x=(gOff%32)-32; x<W+32; x+=32) {
      const big=(Math.floor((x+gOff)/32)%4===0);
      ctx.strokeStyle=dc(big?0.28:0.14);
      ctx.beginPath(); ctx.moveTo(x,gy+3); ctx.lineTo(x,gy+3+(big?8:4)); ctx.stroke();
    }
  }

  /* ─── detailed pixel dino ───────────────────────────── */
  // 18-wide × 20-tall pixel map
  // 0=empty  1=body  2=eye-white  3=eye-pupil  4=highlight  5=shadow  6=spike
  const D_BODY = [
    [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,1,1,2,2,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,1,1,2,3,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,1,1,1,1,1,1,4,1,0,0],
    [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,6,0,0,0,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,6,1,6,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,5,5,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,5,5,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,5,5,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,1,1,5,5,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // legs row
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ];
  // Three leg animation frames
  const LEGS = [
    [[0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
    [[0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0]],
    [[0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
  ];
  // Jump pose legs (tucked)
  const LEGS_JUMP = [
    [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
  ];

  const DINO_X = 90, PX = 5;
  let dino = { y:0, vy:0, onGround:true, frame:0, legPhase:0 };

  function drawDino(screenShake) {
    const gy   = GY();
    const dinoH = D_BODY.length * PX;
    const baseY = gy - dinoH + dino.y + (screenShake||0);
    const baseX = DINO_X;

    const col   = dc(0.82);
    const hi    = dc(0.95);
    const sh    = dc(0.45);
    const spike = cc(0.70);

    const legs = dino.onGround ? LEGS[dino.legPhase] : LEGS_JUMP[0];

    // Draw body
    D_BODY.forEach((row,ri)=>{
      row.forEach((cell,ci)=>{
        if (!cell) return;
        let c;
        if (cell===2) c = isLight()?'rgba(255,255,255,0.9)':cc(0.9);
        else if (cell===3) c = isLight()?'rgba(0,0,0,0.8)':'rgba(0,0,0,0.9)';
        else if (cell===4) c = hi;
        else if (cell===5) c = sh;
        else if (cell===6) c = spike;
        else c = col;
        ctx.fillStyle=c;
        ctx.fillRect(baseX+ci*PX, baseY+ri*PX, PX-0.5, PX-0.5);
      });
    });

    // Draw legs
    legs.forEach((row,ri)=>{
      row.forEach((cell,ci)=>{
        if (!cell) return;
        ctx.fillStyle = col;
        ctx.fillRect(baseX+ci*PX, baseY+(D_BODY.length-4+ri)*PX, PX-0.5, PX-0.5);
      });
    });

    // Eye glow
    if (!isLight()) {
      const eg = ctx.createRadialGradient(baseX+10*PX+2, baseY+3*PX, 0, baseX+10*PX+2, baseY+3*PX, 10);
      eg.addColorStop(0, cc(0.18)); eg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=eg; ctx.beginPath(); ctx.arc(baseX+10*PX+2,baseY+3*PX,10,0,Math.PI*2); ctx.fill();
    }
  }

  /* ─── dino hitbox ───────────────────────────────────── */
  function dinoBox() {
    const gy=GY(), h=D_BODY.length*PX;
    return { x:DINO_X+2*PX, y:gy-h+dino.y+4*PX, w:10*PX, h:h-4*PX };
  }

  /* ─── obstacles ─────────────────────────────────────── */
  const obs = [
    { x:9999,  type:0, w:22, h:52 },
    { x:9999, type:1, w:30, h:64 },
    { x:9999, type:0, w:18, h:44 },
  ];

  function resetObs(o) {
    o.x = W + 120 + Math.random()*320;
    o.type = Math.random()>0.35 ? 0 : 1;
    o.w  = o.type===0 ? 18+Math.floor(Math.random()*12) : 28+Math.floor(Math.random()*10);
    o.h  = o.type===0 ? 42+Math.floor(Math.random()*22) : 55+Math.floor(Math.random()*20);
  }

  function drawObstacle(o) {
    const gy=GY(), col=dc(0.65), hi=dc(0.80), sh=dc(0.35);
    if (o.type===0) {
      // Single cactus — detailed
      const x=o.x, h=o.h, w=o.w;
      // Main trunk gradient
      const tg=ctx.createLinearGradient(x,gy-h,x+w,gy);
      tg.addColorStop(0,hi); tg.addColorStop(1,sh);
      ctx.fillStyle=tg; ctx.fillRect(x,gy-h,w,h);
      // Left arm
      ctx.fillStyle=col;
      ctx.fillRect(x-w*0.7, gy-h*0.62, w*0.7, w*0.7);
      ctx.fillRect(x-w*0.7, gy-h*0.80, w*0.55, w*0.7);
      // Right arm
      ctx.fillRect(x+w,     gy-h*0.50, w*0.65, w*0.7);
      ctx.fillRect(x+w*0.5, gy-h*0.68, w*0.55, w*0.7);
      // Spine highlights
      ctx.fillStyle=hi;
      ctx.fillRect(x+w*0.3, gy-h, w*0.15, h*0.3);
      ctx.fillRect(x+w*0.15,gy-h*0.6, w*0.12, h*0.2);
    } else {
      // Triple cactus group
      const x=o.x, h=o.h, w=o.w;
      const tg=ctx.createLinearGradient(x,gy-h,x+w,gy); tg.addColorStop(0,hi); tg.addColorStop(1,sh);
      ctx.fillStyle=tg;
      ctx.fillRect(x,      gy-h,      w*0.5, h);
      ctx.fillRect(x+w*0.6,gy-h*0.75, w*0.45, h*0.75);
      ctx.fillRect(x-w*0.4,gy-h*0.82, w*0.42, h*0.82);
      // Arms
      ctx.fillStyle=col;
      ctx.fillRect(x-w*0.3, gy-h*0.55, w*0.35, w*0.4);
      ctx.fillRect(x+w*0.5, gy-h*0.45, w*0.3,  w*0.4);
    }
  }

  function obsBox(o) { return { x:o.x+2, y:GY()-o.h+4, w:o.w-4, h:o.h-4 }; }

  function boxOverlap(a,b) {
    return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;
  }

  /* ─── auto-jump AI ──────────────────────────────────── */
  const JUMP_V  = -13.5;
  const GRAVITY = 0.55;
  const JUMP_LOOKAHEAD = 190; // px ahead to trigger jump

  function aiJump() {
    if (!dino.onGround) return;
    for (const o of obs) {
      const dist = o.x - (DINO_X + 14*PX);
      if (dist > 0 && dist < JUMP_LOOKAHEAD) {
        dino.vy = JUMP_V;
        dino.onGround = false;
        spawnDust();
        break;
      }
    }
  }

  /* ─── dust particles ────────────────────────────────── */
  const dustParts = [];
  function spawnDust() {
    const gy=GY();
    for (let i=0;i<10;i++) dustParts.push({
      x: DINO_X+5*PX + (Math.random()-0.5)*16,
      y: gy,
      vx:(Math.random()-0.5)*2.5,
      vy:-Math.random()*2.5-0.5,
      life:1, decay:0.04+Math.random()*0.04,
    });
  }
  function updateDust() {
    for (let i=dustParts.length-1;i>=0;i--) {
      const d=dustParts[i];
      d.x+=d.vx; d.y+=d.vy; d.vy+=0.12; d.life-=d.decay;
      if (d.life<=0) { dustParts.splice(i,1); continue; }
      ctx.beginPath(); ctx.arc(d.x,d.y,2.5*d.life,0,Math.PI*2);
      ctx.fillStyle=dc(0.45*d.life); ctx.fill();
    }
  }

  /* ─── screen shake ──────────────────────────────────── */
  let shake=0;
  function triggerShake(amt) { shake=amt; }

  /* ─── score + hi-score ──────────────────────────────── */
  let score=0, hiScore=0;
  function drawScore() {
    score = Math.floor(t*0.22);
    if (score>hiScore) hiScore=score;
    ctx.font = `bold 13px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'right';
    ctx.fillStyle = dc(0.18);
    ctx.fillText(`HI ${String(hiScore).padStart(5,'0')}`, W-80, 28);
    ctx.fillStyle = dc(0.32);
    ctx.fillText(String(score).padStart(5,'0'), W-18, 28);
    ctx.textAlign='left';
  }

  /* ─── birds ─────────────────────────────────────────── */
  const birds = [
    {x:9999, y:0.36, sp:1.6},
    {x:9999, y:0.43, sp:2.1},
    {x:9999, y:0.28, sp:1.3},
  ];
  function drawBird(bx,by) {
    ctx.fillStyle=cc(0.55);
    const S=4, fw=Math.floor(t/10)%2===0;
    const wingY = fw ? -S : 0;
    ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(bx-S*2,by+wingY); ctx.lineTo(bx-S,by); ctx.fill();
    ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(bx+S*2,by+wingY); ctx.lineTo(bx+S,by); ctx.fill();
    ctx.fillRect(bx-S*0.5,by,S,S*0.6);
    // Glow
    const bg=ctx.createRadialGradient(bx,by,0,bx,by,12);
    bg.addColorStop(0,cc(0.08)); bg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(bx,by,12,0,Math.PI*2); ctx.fill();
  }
  function updateBirds() {
    birds.forEach(b=>{ b.x-=b.sp; if(b.x<-20){b.x=W+40+Math.random()*300;b.y=0.22+Math.random()*0.28;} drawBird(b.x,b.y*H); });
  }

  /* ─── main loop ─────────────────────────────────────── */
  function draw() {
    t++; gOff+=SPEED;
    if (shake>0) shake*=0.8;

    // Physics
    if (!dino.onGround) {
      dino.vy += GRAVITY;
      dino.y  += dino.vy;
      if (dino.y >= 0) { dino.y=0; dino.vy=0; dino.onGround=true; triggerShake(3); spawnDust(); }
    }

    // Leg animation (only on ground)
    if (dino.onGround) { dino.frame++; if(dino.frame%10===0) dino.legPhase=(dino.legPhase+1)%3; }

    // AI jump
    aiJump();

    const shakeOff = shake>0.5 ? (Math.random()-0.5)*shake : 0;

    ctx.clearRect(0,0,W,H);
    drawDots();
    drawSky();
    drawMoon();
    drawShooters();
    drawMountains();
    drawScore();
    drawClouds();
    drawGround();

    // Obstacles
    obs.forEach(o=>{ o.x-=SPEED; if(o.x<-60) resetObs(o); drawObstacle(o); });

    updateDust();
    updateBirds();
    drawDino(shakeOff);

    requestAnimationFrame(draw);
  }

  function resize() {
    W=canvas.width  = section.offsetWidth;
    H=canvas.height = section.offsetHeight;
    // Initialise / re-space everything that depends on W / H
    obs[0].x=W+80;  obs[1].x=W+340; obs[2].x=W+580;
    birds[0].x=W*1.1; birds[1].x=W*1.55; birds[2].x=W*1.9;
    if (moonX===9999) moonX = W*0.85;
    buildDots();
    buildMountains();
  }

  window.addEventListener('resize', resize);
  resize(); draw();
}

/* Projects — moving starfield with grid lines */
function initProjectsCanvas() {
  const canvas  = document.getElementById('projectsCanvas');
  const section = document.getElementById('projects');
  if (!canvas || !section) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars, t = 0;

  function build() {
    stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.08,
      a: Math.random() * 0.5 + 0.1,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function draw() {
    t += 0.012;
    ctx.clearRect(0, 0, W, H);
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    const starC = light ? '0,102,204' : '100,200,255';
    const gridC = light ? '10,122,78' : '0,255,179';

    // Grid
    const gs = 80, gridA = light ? 0.04 : 0.05;
    ctx.strokeStyle = `rgba(${gridC},${gridA})`; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Stars
    stars.forEach(s => {
      s.x += s.vx; s.y += s.vy;
      if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
      const twinkle = 0.55 + 0.45 * Math.sin(t * 1.3 + s.phase);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * twinkle, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${starC},${s.a * twinkle})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  function resize() {
    W = canvas.width  = section.offsetWidth;
    H = canvas.height = section.offsetHeight;
    build();
  }
  window.addEventListener('resize', resize);
  resize(); draw();
}

/* Contact — floating circuit traces */
function initContactCanvas() {
  const canvas  = document.getElementById('contactCanvas');
  const section = document.getElementById('contact');
  if (!canvas || !section) return;
  const ctx = canvas.getContext('2d');
  let W, H, traces, t = 0;

  function makeTrace() {
    return {
      x: Math.random() * W, y: -20,
      len: Math.floor(Math.random() * 6) + 3,
      seg: Math.random() > 0.5 ? 'v' : 'h',
      speed: Math.random() * 0.8 + 0.3,
      alpha: Math.random() * 0.22 + 0.06,
      col: Math.random() > 0.5 ? '0,255,179' : '0,212,255',
    };
  }

  function build() {
    traces = Array.from({ length: 40 }, makeTrace);
  }

  function draw() {
    t++;
    ctx.clearRect(0, 0, W, H);
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    traces.forEach((tr, i) => {
      tr.y += tr.speed;
      if (tr.y > H + 40) traces[i] = makeTrace();
      const col = light
        ? (tr.col === '0,255,179' ? '10,122,78' : '0,102,204')
        : tr.col;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${col},${tr.alpha})`;
      ctx.lineWidth = 1;
      const step = 16;
      let cx = tr.x, cy = tr.y;
      ctx.moveTo(cx, cy);
      for (let s = 0; s < tr.len; s++) {
        if (tr.seg === 'v') cy -= step;
        else cx += (s % 2 === 0 ? step : -step * 0.5);
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
      // Head dot
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${col},${tr.alpha * 1.5})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  function resize() {
    W = canvas.width  = section.offsetWidth;
    H = canvas.height = section.offsetHeight;
    build();
  }
  window.addEventListener('resize', resize);
  resize(); draw();
}

/* ── 13. CONTACT FORM ──────────────────────────────────────── */
function initContactForm() {
  const form    = document.getElementById('contactForm');
  const submitB = document.getElementById('submitBtn');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  const fields = {
    name:    { el: document.getElementById('name'),    err: document.getElementById('nameError') },
    email:   { el: document.getElementById('email'),   err: document.getElementById('emailError') },
    subject: { el: document.getElementById('subject'), err: document.getElementById('subjectError') },
    message: { el: document.getElementById('message'), err: document.getElementById('messageError') },
  };

  Object.values(fields).forEach(({ el, err }) => {
    if (!el) return;
    el.addEventListener('blur',  () => validate(el, err));
    el.addEventListener('input', () => { if (el.classList.contains('error')) validate(el, err); });
  });

  function validate(el, err) {
    const v = el.value.trim(); let msg = '';
    if (!v) msg = 'Required.';
    else if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Invalid email.';
    else if (el.tagName === 'TEXTAREA' && v.length < 20) msg = 'Too short (20 chars min).';
    el.classList.toggle('error', !!msg);
    if (err) err.textContent = msg;
    return !msg;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!Object.values(fields).every(({ el, err }) => validate(el, err))) return;
    submitB.classList.add('loading'); submitB.disabled = true;
    await new Promise(r => setTimeout(r, 1600));
    submitB.classList.remove('loading'); submitB.disabled = false;
    form.reset(); success.classList.add('show');
    setTimeout(() => success.classList.remove('show'), 5000);
  });
}

/* ── 14. RIPPLE ────────────────────────────────────────────── */
function initRipple() {
  document.addEventListener('click', e => {
    const t = e.target.closest('.ripple');
    if (!t) return;
    const r    = t.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2;
    const el   = document.createElement('span');
    el.className = 'ripple-circle';
    el.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-r.left-size/2}px;top:${e.clientY-r.top-size/2}px`;
    const old = t.querySelector('.ripple-circle');
    if (old) old.remove();
    t.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  });
}

/* ── 15. BACK TO TOP ───────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    const show = window.scrollY > 400;
    btn.style.opacity      = show ? '1' : '0';
    btn.style.pointerEvents = show ? 'auto' : 'none';
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── 16. FOOTER YEAR ───────────────────────────────────────── */
function initFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ── 17. SMOOTH SCROLL (offset for fixed nav) ──────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
    });
  });
}
