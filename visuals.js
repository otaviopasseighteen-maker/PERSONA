(() => {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const particles = [];
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let pointer = { x: -1000, y: -1000, active: false };

  function accent() {
    return getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#e50920';
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
    const count = reduced ? 18 : Math.min(80, Math.max(30, Math.floor(width * height / 18000)));
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18 - 0.04,
        a: Math.random() * 0.5 + 0.08,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const color = accent();
    particles.forEach((p) => {
      if (!reduced) {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.008;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      }
      const dx = pointer.x - p.x;
      const dy = pointer.y - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const influence = pointer.active && distance < 150 ? (1 - distance / 150) : 0;
      const x = p.x - dx * influence * 0.018;
      const y = p.y - dy * influence * 0.018;
      const alpha = p.a + Math.sin(p.phase) * 0.05 + influence * 0.25;
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.globalAlpha = Math.max(0.03, Math.min(0.7, alpha));
      ctx.arc(x, y, p.r + influence * 1.2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (!reduced) requestAnimationFrame(draw);
  }

  function updatePointer(x, y) {
    pointer.x = x;
    pointer.y = y;
    pointer.active = true;
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', (event) => updatePointer(event.clientX, event.clientY), { passive: true });
  window.addEventListener('pointerleave', () => { pointer.active = false; }, { passive: true });
  window.addEventListener('blur', () => { pointer.active = false; });

  resize();
  draw();
})();
