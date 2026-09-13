const canvas = document.getElementById('ambientCanvas');

if (canvas) {
  const ctx = canvas.getContext('2d', { alpha: true });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  const pointer = { x: 0, y: 0, active: false };
  const particles = [];
  const sparks = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationId = 0;
  let lastFrame = 0;

  const game = document.body.classList.contains('theme-p4g')
    ? 'p4g'
    : document.body.classList.contains('theme-p3r')
      ? 'p3r'
      : 'p5r';

  const settings = {
    p5r: { accent: 'rgba(235, 25, 48, 0.34)', particle: 'rgba(235, 25, 48, 0.62)', grid: 'rgba(235, 25, 48, 0.055)' },
    p4g: { accent: 'rgba(255, 190, 40, 0.30)', particle: 'rgba(255, 190, 40, 0.58)', grid: 'rgba(255, 190, 40, 0.05)' },
    p3r: { accent: 'rgba(55, 145, 255, 0.30)', particle: 'rgba(55, 145, 255, 0.58)', grid: 'rgba(55, 145, 255, 0.05)' }
  }[game];

  function updatePointer(x, y) {
    pointer.x = x;
    pointer.y = y;
    pointer.active = true;
  }

  function createParticles() {
    particles.length = 0;
    const area = width * height;
    const target = isTouch
      ? Math.min(38, Math.max(18, Math.round(area / 36000)))
      : Math.min(72, Math.max(28, Math.round(area / 24000)));

    for (let i = 0; i < target; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.45 + 0.2
      });
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, isTouch ? 1.25 : 1.5);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createParticles();
  }

  function spawnSparks(x, y, count = 4) {
    const limit = isTouch ? 18 : 32;
    for (let i = 0; i < count && sparks.length < limit; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.4 + 0.5;
      sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: Math.random() * 1.4 + 0.6
      });
    }
  }

  function drawGrid() {
    const step = isTouch ? 90 : 70;
    ctx.strokeStyle = settings.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = 0; x <= width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    for (let y = 0; y <= height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    ctx.stroke();
  }

  function drawGlow() {
    const gradient = ctx.createRadialGradient(width * 0.72, height * 0.28, 0, width * 0.72, height * 0.28, Math.max(width, height) * 0.75);
    gradient.addColorStop(0, settings.accent);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function draw(time) {
    if (document.hidden) {
      animationId = requestAnimationFrame(draw);
      return;
    }

    if (time - lastFrame < (isTouch ? 33 : 20)) {
      animationId = requestAnimationFrame(draw);
      return;
    }
    lastFrame = time;

    ctx.clearRect(0, 0, width, height);
    drawGrid();
    drawGlow();

    for (let i = 0; i < particles.length; i += 1) {
      const particle = particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = height + 10;
      if (particle.y > height + 10) particle.y = -10;

      let radius = particle.radius;
      if (pointer.active && !isTouch) {
        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < 9000) radius += (1 - distanceSquared / 9000) * 1.8;
      }

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = settings.particle;
      ctx.globalAlpha = particle.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (pointer.active && !isTouch) {
      ctx.strokeStyle = settings.accent;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i];
        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        if (dx * dx + dy * dy < 7000) {
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(pointer.x, pointer.y);
        }
      }
      ctx.stroke();
    }

    for (let i = sparks.length - 1; i >= 0; i -= 1) {
      const spark = sparks[i];
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.life -= 0.045;
      if (spark.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = spark.life;
      ctx.fillStyle = settings.particle;
      ctx.fillRect(spark.x, spark.y, spark.size, spark.size);
      ctx.globalAlpha = 1;
    }

    animationId = requestAnimationFrame(draw);
  }

  resize();

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', (event) => {
    if (isTouch) return;
    updatePointer(event.clientX, event.clientY);
    if (Math.random() < 0.025) spawnSparks(event.clientX, event.clientY, 1);
  }, { passive: true });
  window.addEventListener('pointerleave', () => { pointer.active = false; }, { passive: true });
  window.addEventListener('blur', () => { pointer.active = false; });
  document.addEventListener('click', (event) => {
    if (!isTouch) spawnSparks(event.clientX, event.clientY, 6);
  });

  if (!reducedMotion.matches) {
    animationId = requestAnimationFrame(draw);
  } else {
    ctx.clearRect(0, 0, width, height);
    drawGrid();
    drawGlow();
  }

  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches) {
      cancelAnimationFrame(animationId);
      ctx.clearRect(0, 0, width, height);
      drawGrid();
      drawGlow();
    } else {
      animationId = requestAnimationFrame(draw);
    }
  });
}
