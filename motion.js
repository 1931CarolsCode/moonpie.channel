(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const heroArt = document.querySelector('.hero-art');
  if (heroArt) {
    const sparkPositions = [
      ['12%', '26%'], ['83%', '18%'], ['20%', '72%'],
      ['75%', '78%'], ['50%', '7%'], ['91%', '55%']
    ];

    sparkPositions.forEach(([left, top], index) => {
      const sparkle = document.createElement('span');
      sparkle.className = 'motion-spark';
      sparkle.setAttribute('aria-hidden', 'true');
      sparkle.textContent = index % 2 ? '✦' : '✧';
      sparkle.style.left = left;
      sparkle.style.top = top;
      sparkle.style.setProperty('--spark-delay', `${index * -0.7}s`);
      heroArt.appendChild(sparkle);
    });
  }

  const revealItems = document.querySelectorAll(
    '.story-content, .section-heading, .card, .hello > .eyebrow, .hello h2, .hello > p, .hello .button'
  );

  revealItems.forEach((item, index) => {
    item.dataset.reveal = '';
    if (item.classList.contains('card')) {
      item.style.setProperty('--reveal-delay', `${(index % 3) * 100}ms`);
    }
  });

  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        activeObserver.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -30px 0px' });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
})();

// A decorative wireframe companion. Coordinates stay inside the portrait area.
(() => {
  const host = document.querySelector('.hero-art');
  if (!host || host.querySelector('.wireframe-dog')) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'wireframe-dog';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'absolute', inset: '0', width: '100%', height: '100%',
    zIndex: '3', pointerEvents: 'none'
  });
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  host.appendChild(canvas);

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, frame = 0, lastTime = 0, phase = 0;
  let visible = true, hovering = false;
  let x = 0, targetX = 0, look = 0, targetLook = 0;

  function resize() {
    const rect = host.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }

  function line(points, alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    points.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py));
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    if (!width || !height) return;
    const scale = Math.min(width / 410, 1.1) * 0.65;
    const moving = motion.matches ? 0 : 1;
    const stride = Math.sin(phase * 5) * (hovering ? 10 : 4) * moving;
    const bounce = Math.sin(phase * 10) * (hovering ? 2 : 0.7) * moving;
    const wag = Math.sin(phase * (hovering ? 15 : 8)) * 12 * moving;
    ctx.save();
    ctx.translate(width * 0.18 + x, height * 0.50 + bounce);
    ctx.scale(scale, scale);
    ctx.strokeStyle = '#667c5c';
    ctx.lineWidth = 1.35;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Far legs, then a triangulated torso and near legs.
    line([[-34, -24], [-39 - stride, -4], [-43 - stride, 17], [-32 - stride, 17]], 0.4);
    line([[32, -25], [37 + stride, -5], [34 + stride, 17], [45 + stride, 17]], 0.4);
    const rump = [-49, -51], back = [19, -57], chest = [43, -35];
    const belly = [24, -20], hip = [-34, -22], center = [-6, -39];
    line([rump, back, chest, belly, hip, rump]);
    line([rump, center, back, belly, center, hip], 0.55);
    line([center, chest], 0.55);
    line([hip, [-24 + stride, -4], [-29 + stride, 20], [-16 + stride, 20]]);
    line([chest, [26 - stride, -1], [30 - stride, 20], [42 - stride, 20]]);
    line([rump, [-64, -64 + wag * 0.4], [-78, -78 + wag], [-69, -55 + wag * 0.6], rump]);

    // Upright shepherd ears, muzzle, bright eye, and a tiny panting tongue.
    ctx.save();
    ctx.translate(28, -56);
    ctx.rotate(look);
    line([[0, 0], [2, -24], [8, -46], [17, -27], [26, -43], [29, -21], [45, -14], [48, -6], [29, 0], [17, 19], [0, 0]]);
    line([[2, -24], [17, -27], [29, -21], [17, -10], [0, 0]], 0.55);
    line([[17, -27], [17, -10], [29, 0], [29, -21]], 0.55);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#272821';
    ctx.beginPath(); ctx.arc(29, -15, 1.7, 0, Math.PI * 2); ctx.fill();
    line([[43, -13], [48, -6], [41, -6]]);
    ctx.strokeStyle = '#d47c4d';
    line([[35, 0], [37, 8 + Math.sin(phase * 5) * moving], [41, 7], [41, -2]], 0.9);
    ctx.restore();
    ctx.strokeStyle = '#d47c4d';
    line([[24, -48], [40, -38]], 0.9);
    ctx.restore();
  }

  function tick(time) {
    frame = 0;
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
    lastTime = time;
    phase += dt;
    const ease = 1 - Math.exp(-dt * 6);
    x += (targetX - x) * ease;
    look += (targetLook - look) * ease;
    draw();
    schedule();
  }

  function schedule() {
    if (!frame && visible && !document.hidden && !motion.matches) {
      frame = requestAnimationFrame(tick);
    }
  }

  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (motion.matches) { x = targetX = look = targetLook = 0; }
    draw();
    schedule();
  }

  host.addEventListener('pointermove', (event) => {
    if (motion.matches || event.pointerType === 'touch') return;
    const rect = host.getBoundingClientRect();
    hovering = true;
    const position = (event.clientX - rect.left) / rect.width;
    targetX = (Math.max(0, Math.min(1, position)) - 0.5) * width * 0.06;
    targetLook = Math.max(-0.18, Math.min(0.18, (event.clientY - rect.top - height * 0.6) / height));
  }, { passive: true });
  host.addEventListener('pointerleave', () => {
    hovering = false; targetX = 0; targetLook = 0;
  });
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);
  else window.addEventListener('resize', resize, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }).observe(host);
  }
  resize();
  schedule();
})();
