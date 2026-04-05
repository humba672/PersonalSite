// ===== Scroll Reveal =====
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
);

revealElements.forEach((el) => revealObserver.observe(el));

// ===== Nav Scroll Effect =====
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  if (currentScroll > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
});

// ===== Mobile Nav Toggle =====
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Close mobile nav when a link is clicked
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ===== Active Nav Link Highlight =====
const sections = document.querySelectorAll('section[id]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.querySelectorAll('a').forEach((a) => {
          a.classList.toggle(
            'active',
            a.getAttribute('href') === `#${id}`
          );
        });
      }
    });
  },
  { threshold: 0.3 }
);

sections.forEach((section) => sectionObserver.observe(section));

// ===== Smooth Scroll for Safari =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ===== Work Explorer =====
const workCategories = document.getElementById('work-categories');
const workDetail = document.getElementById('work-detail');
const workDetailClose = document.getElementById('work-detail-close');
const workPanels = document.querySelectorAll('.work-detail-panel');

document.querySelectorAll('.work-category-card').forEach((card) => {
  card.addEventListener('click', () => {
    const category = card.getAttribute('data-category');
    // Hide categories, show detail
    workCategories.style.display = 'none';
    workDetail.classList.add('open');
    // Activate the matching panel
    workPanels.forEach((p) => {
      p.classList.toggle('active', p.getAttribute('data-panel') === category);
    });
    // Scroll to top of section
    document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
  });
});

workDetailClose.addEventListener('click', () => {
  workDetail.classList.remove('open');
  workCategories.style.display = '';
  workPanels.forEach((p) => p.classList.remove('active'));
  document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
});

// ===== Feynman Diagram Animation =====
// e⁻e⁺ → γ → e⁻e⁺ scattering — draws once, stays permanent
(function () {
  const canvas = document.getElementById('feynman-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  const accent = '#6c63ff';
  const accentLight = '#8b83ff';

  // Diagram coordinates
  const v1 = { x: 120, y: 180 }; // left vertex
  const v2 = { x: 280, y: 180 }; // right vertex
  const inTop  = { x: 30,  y: 40  };
  const inBot  = { x: 30,  y: 320 };
  const outTop = { x: 370, y: 40  };
  const outBot = { x: 370, y: 320 };

  const DRAW_FRAMES = 300; // ~5s at 60fps
  let frame = 0;
  let done = false;

  function lerp(a, b, t) { return a + (b - a) * clamp(t); }
  function clamp(t) { return Math.max(0, Math.min(1, t)); }
  function ease(t) {
    t = clamp(t);
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function drawLine(from, to, progress, color, width, glowAlpha) {
    if (progress <= 0) return;
    const p = ease(progress);
    const ex = lerp(from.x, to.x, p);
    const ey = lerp(from.y, to.y, p);
    // Optional glow pass
    if (glowAlpha && glowAlpha > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = `rgba(108, 99, 255, ${glowAlpha * 0.3})`;
      ctx.lineWidth = (width || 2) + 4;
      ctx.stroke();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 2;
    ctx.stroke();
  }

  function drawPhoton(progress, glowAlpha) {
    if (progress <= 0) return;
    const segments = 50;
    const drawn = Math.floor(segments * clamp(progress));
    function tracePath() {
      ctx.beginPath();
      for (let i = 0; i <= drawn; i++) {
        const t = i / segments;
        const x = lerp(v1.x, v2.x, t);
        const y = v1.y + Math.sin(t * Math.PI * 6) * 14;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }
    if (glowAlpha && glowAlpha > 0) {
      tracePath();
      ctx.strokeStyle = `rgba(108, 99, 255, ${glowAlpha * 0.35})`;
      ctx.lineWidth = 6;
      ctx.stroke();
    }
    tracePath();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  function drawParticle(x, y, radius, alpha) {
    if (alpha <= 0) return;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius * 4);
    grad.addColorStop(0, `rgba(108, 99, 255, ${alpha * 0.6})`);
    grad.addColorStop(1, 'rgba(108, 99, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(139, 131, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawVertex(x, y, flashProg, persist, pulse) {
    if (flashProg <= 0 && !persist) return;
    const p = pulse || 0;
    if (persist || flashProg > 0) {
      // Breathing glow — radius and intensity scale with pulse
      const glowR = 20 + p * 10;
      const glowA = 0.3 + p * 0.25;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, glowR);
      grad.addColorStop(0, `rgba(108, 99, 255, ${glowA})`);
      grad.addColorStop(1, 'rgba(108, 99, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, glowR, 0, Math.PI * 2);
      ctx.fill();
      // Core dot
      const dotR = 5 + p * 1.5;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(x, y, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
    if (flashProg > 0 && flashProg < 1) {
      const fp = clamp(flashProg);
      ctx.beginPath();
      ctx.arc(x, y, 5 + fp * 25, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(108, 99, 255, ${(1 - fp) * 0.7})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function drawArrow(from, to, t, alpha) {
    if (alpha <= 0) return;
    const x = lerp(from.x, to.x, t);
    const y = lerp(from.y, to.y, t);
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = `rgba(139, 131, 255, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(9, 0);
    ctx.lineTo(-9, -5.5);
    ctx.lineTo(-9, 5.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawLabel(text, x, y, alpha) {
    if (alpha <= 0) return;
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.fillStyle = `rgba(136, 136, 164, ${alpha})`;
    ctx.fillText(text, x, y);
  }

  // Timeline:
  // 0.00–0.20: Incoming particles travel to left vertex
  // 0.18–0.30: Left vertex flash
  // 0.25–0.50: Photon propagator draws across
  // 0.48–0.58: Right vertex flash
  // 0.55–0.75: Outgoing particles travel away
  // 0.75–0.90: Labels + arrows fade in
  // 0.90+:     Done, permanent

  // pulse is 0 during drawing, then oscillates 0–1 after completion
  function render(t, pulse) {
    ctx.clearRect(0, 0, W, H);
    const glow = pulse; // 0–1 glow intensity for idle breathing

    // Incoming lines + particles
    const inProg = t / 0.20;
    drawLine(inTop, v1, inProg, accentLight, 2, glow);
    drawLine(inBot, v1, inProg, accentLight, 2, glow);
    if (inProg > 0 && inProg < 1) {
      const p = ease(inProg);
      drawParticle(lerp(inTop.x, v1.x, p), lerp(inTop.y, v1.y, p), 5, 1);
      drawParticle(lerp(inBot.x, v1.x, p), lerp(inBot.y, v1.y, p), 5, 1);
    }

    // Incoming arrows
    if (inProg >= 1) {
      const aa = clamp((t - 0.20) / 0.05);
      drawArrow(inTop, v1, 0.5, aa);
      drawArrow(inBot, v1, 0.5, aa);
    }

    // Left vertex — pulse the glow radius when idle
    const v1Flash = (t - 0.18) / 0.12;
    drawVertex(v1.x, v1.y, v1Flash, t >= 0.22, glow);

    // Photon propagator
    const photonProg = (t - 0.25) / 0.25;
    drawPhoton(photonProg, glow);

    // Photon label
    if (photonProg > 0.4) {
      const la = clamp((photonProg - 0.4) / 0.3);
      drawLabel('\u03B3', (v1.x + v2.x) / 2 - 5, v1.y - 22, la);
    }

    // Right vertex
    const v2Flash = (t - 0.48) / 0.12;
    drawVertex(v2.x, v2.y, v2Flash, t >= 0.52, glow);

    // Outgoing lines + particles
    const outProg = (t - 0.55) / 0.20;
    drawLine(v2, outTop, outProg, accentLight, 2, glow);
    drawLine(v2, outBot, outProg, accentLight, 2, glow);
    if (outProg > 0 && outProg < 1) {
      const p = ease(outProg);
      drawParticle(lerp(v2.x, outTop.x, p), lerp(v2.y, outTop.y, p), 5, 1);
      drawParticle(lerp(v2.x, outBot.x, p), lerp(v2.y, outBot.y, p), 5, 1);
    }

    // Outgoing arrows
    if (outProg >= 1) {
      const aa = clamp((t - 0.75) / 0.05);
      drawArrow(v2, outTop, 0.5, aa);
      drawArrow(v2, outBot, 0.5, aa);
    }

    // Labels
    const labelProg = (t - 0.78) / 0.12;
    if (labelProg > 0) {
      const la = clamp(labelProg);
      drawLabel('e\u207B', inTop.x - 5, inTop.y - 10, la);
      drawLabel('e\u207A', inBot.x - 5, inBot.y + 22, la);
      drawLabel('e\u207B', outTop.x - 15, outTop.y - 10, la);
      drawLabel('e\u207A', outBot.x - 15, outBot.y + 22, la);
    }
  }

  function animate() {
    frame++;
    const t = Math.min(frame / DRAW_FRAMES, 1);
    // After drawing completes, pulse glow using a slow sine wave (~3s period)
    const pulse = t >= 1 ? 0.5 + 0.5 * Math.sin((frame - DRAW_FRAMES) / 90 * Math.PI) : 0;
    render(t, pulse);
    requestAnimationFrame(animate);
  }

  animate();
})();
