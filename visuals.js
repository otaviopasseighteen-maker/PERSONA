(() => {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const particles = [];
  const sparks = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let last = performance.now();
  let pointer = { x: -1000, y: -1000, active: false };
  let pulse = 0;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const accent = () => getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#e50920';

  function hexRgb(hex) {
    const clean = hex.replace('#', '').trim();
    if (clean.length !== 6) return [255, 255, 255];
    return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildParticles();
  }

  function buildParticles() {
    particles.length = 0;
    const count = reduced ? 24 : Math.min(115, Math.max(42, Math.floor(width * height / 13500)));
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        ox: Math.random() * width,
        oy: Math.random() * height,
        r: Math.random() * 1.7 + 0.35,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22 - 0.035,
        a: Math.random() * 0.5 + 0.08,
        phase: Math.random() * Math.PI * 2,
        drift: Math.random() * 0.7 + 0.25
      });
    }
  }

  function spawnSparks(x, y, amount = 18) {
    if (reduced) return;
    for (let i = 0; i < amount; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.8 + 0.5;
      sparks.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: Math.random() * 2 + 0.5
      });
    }
  }

  function drawGlow(x, y, radius, rgb, alpha) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`);
    gradient.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGrid(rgb) {
    const spacing = window.innerWidth < 680 ? 42 : 58;
    const offset = (pulse * 8) % spacing;
    ctx.save();
    ctx.globalAlpha = 0.055;
    ctx.strokeStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
    ctx.lineWidth = 1;
    for (let x = -spacing + offset; x < width + spacing; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - height * 0.12, height);
      ctx.stroke();
    }
    for (let y = -spacing + offset; y < height + spacing; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPersonaHUD(rgb) {
    const isP5 = document.body.classList.contains('theme-p5r');
    const isP4 = document.body.classList.contains('theme-p4g');
    const isP3 = document.body.classList.contains('theme-p3r');
    ctx.save();
    ctx.strokeStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
    ctx.lineWidth = 1;

    if (isP5) {
      ctx.globalAlpha = 0.16;
      ctx.beginPath();
      ctx.moveTo(width * 0.72, 0);
      ctx.lineTo(width * 0.28, height);
      ctx.moveTo(width * 0.9, 0);
      ctx.lineTo(width * 0.45, height);
      ctx.stroke();
      ctx.globalAlpha = 0.08;
      ctx.beginPath();
      ctx.arc(width * 0.83, height * 0.28, Math.min(width, height) * 0.22, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (isP4) {
      ctx.globalAlpha = 0.12;
      for (let y = 0; y < height; y += 7) {
        ctx.fillRect(0, y, width, 1);
      }
      ctx.globalAlpha = 0.08 + Math.sin(pulse * 3) * 0.025;
      ctx.beginPath();
      ctx.rect(width * 0.06, height * 0.2, width * 0.88, height * 0.6);
      ctx.stroke();
    }

    if (isP3) {
      ctx.globalAlpha = 0.12;
      const cx = width * 0.76;
      const cy = height * 0.3;
      [0.13, 0.2, 0.29].forEach((scale, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, Math.min(width, height) * scale + Math.sin(pulse + i) * 5, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.globalAlpha = 0.08;
      ctx.beginPath();
      ctx.moveTo(cx - 240, cy);
      ctx.lineTo(cx + 240, cy);
      ctx.moveTo(cx, cy - 240);
      ctx.lineTo(cx, cy + 240);
      ctx.stroke();
    }
    ctx.restore();
  }

  function draw(now) {
    const dt = clamp((now - last) / 16.666, 0.4, 2.5);
    last = now;
    pulse += 0.006 * dt;
    ctx.clearRect(0, 0, width, height);
    const rgb = hexRgb(accent());

    drawGrid(rgb);
    drawPersonaHUD(rgb);
    drawGlow(width * 0.78, height * 0.22, Math.min(width, height) * 0.45, rgb, 0.055);

    particles.forEach((p) => {
      if (!reduced) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.phase += 0.012 * dt;
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
      }

      const dx = pointer.x - p.x;
      const dy = pointer.y - p.y;
      const distance = Math.hypot(dx, dy);
      const influence = pointer.active && distance < 190 ? (1 - distance / 190) : 0;
      const wave = Math.sin(p.phase) * 0.7;
      const x = p.x - dx * influence * 0.035 + wave * p.drift;
      const y = p.y - dy * influence * 0.035;
      const alpha = clamp(p.a + Math.sin(p.phase) * 0.055 + influence * 0.35, 0.03, 0.85);

      ctx.beginPath();
      ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      ctx.globalAlpha = alpha;
      ctx.arc(x, y, p.r + influence * 1.6, 0, Math.PI * 2);
      ctx.fill();

      if (influence > 0.45) {
        ctx.globalAlpha = influence * 0.18;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.strokeStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
        ctx.stroke();
      }
    });

    sparks.forEach((s) => {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= 0.985;
      s.vy *= 0.985;
      s.life -= 0.035 * dt;
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    for (let i = sparks.length - 1; i >= 0; i -= 1) if (sparks[i].life <= 0) sparks.splice(i, 1);

    ctx.globalAlpha = 1;
    if (!reduced) requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', (event) => {
    updatePointer(event.clientX, event.clientY);
    if (Math.random() < 0.055) spawnSparks(event.clientX, event.clientY, 1);
  }, { passive: true });
  window.addEventListener('pointerleave', () => { pointer.active = false; }, { passive: true });
  window.addEventListener('blur', () => { pointer.active = false; });
  document.addEventListener('click', (event) => spawnSparks(event.clientX, event.clientY, 12));

  resize();
  draw(performance.now());
})();