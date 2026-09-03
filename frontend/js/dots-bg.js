/* ============================================================
   LUMIÈRE — Moving Dots Architecture (dots-bg.js)
   Full-screen canvas particle network — gold luxury aesthetic
   ============================================================ */

(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────────── */
  const CFG = {
    dotCount:       88,          // number of particles
    dotMinR:        1.2,         // min dot radius
    dotMaxR:        2.8,         // max dot radius
    speed:          0.38,        // base movement speed
    linkDist:       145,         // max distance to draw a line
    mouseRadius:    160,         // mouse influence radius
    mouseStrength:  0.06,        // how hard dots avoid mouse
    dotColor:       [201,169,110],  // --gold RGB
    dotAlphaMin:    0.25,
    dotAlphaMax:    0.85,
    lineAlpha:      0.18,        // base line opacity
    bgAlpha:        0.0,         // canvas bg fill (0 = transparent)
    pulseSpeed:     0.018,       // dot shimmer speed
    zIndex:         0,
  };

  /* ── Globals ─────────────────────────────────────────── */
  let canvas, ctx, W, H, dpr, animId;
  let dots = [];
  let mouse = { x: -9999, y: -9999 };
  let running = false;

  /* ── Dot class ───────────────────────────────────────── */
  class Dot {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : (Math.random() < 0.5 ? -10 : H + 10);
      const angle = Math.random() * Math.PI * 2;
      const spd   = (0.3 + Math.random() * 0.7) * CFG.speed;
      this.vx = Math.cos(angle) * spd;
      this.vy = Math.sin(angle) * spd;
      this.r  = CFG.dotMinR + Math.random() * (CFG.dotMaxR - CFG.dotMinR);
      this.baseAlpha = CFG.dotAlphaMin + Math.random() * (CFG.dotAlphaMax - CFG.dotAlphaMin);
      this.phase = Math.random() * Math.PI * 2;   // shimmer phase offset
      this.alpha = this.baseAlpha;
    }

    update() {
      /* shimmer */
      this.phase += CFG.pulseSpeed;
      this.alpha  = this.baseAlpha + Math.sin(this.phase) * 0.18;

      /* mouse repulsion */
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CFG.mouseRadius && dist > 0) {
        const force = (1 - dist / CFG.mouseRadius) * CFG.mouseStrength;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }

      /* dampen velocity so it doesn't accelerate forever */
      this.vx *= 0.998;
      this.vy *= 0.998;

      /* clamp speed */
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      const maxSpeed = CFG.speed * 2.2;
      if (speed > maxSpeed) {
        this.vx = (this.vx / speed) * maxSpeed;
        this.vy = (this.vy / speed) * maxSpeed;
      }

      this.x += this.vx;
      this.y += this.vy;

      /* wrap edges */
      if (this.x < -20) this.x = W + 20;
      if (this.x > W + 20) this.x = -20;
      if (this.y < -20) this.y = H + 20;
      if (this.y > H + 20) this.y = -20;
    }

    draw() {
      const [r, g, b] = CFG.dotColor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(1, Math.max(0, this.alpha))})`;
      ctx.fill();
    }
  }

  /* ── Draw connections ────────────────────────────────── */
  function drawLines() {
    const [r, g, b] = CFG.dotColor;
    const len = dots.length;
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const dx   = dots[i].x - dots[j].x;
        const dy   = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CFG.linkDist) {
          const alpha = CFG.lineAlpha * (1 - dist / CFG.linkDist);
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  /* ── Mouse-dot highlight lines ───────────────────────── */
  function drawMouseLines() {
    const [r, g, b] = CFG.dotColor;
    dots.forEach(dot => {
      const dx   = dot.x - mouse.x;
      const dy   = dot.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CFG.mouseRadius) {
        const alpha = 0.28 * (1 - dist / CFG.mouseRadius);
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(dot.x, dot.y);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth   = 0.8;
        ctx.stroke();
      }
    });
  }

  /* ── Animation loop ──────────────────────────────────── */
  function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    drawLines();
    drawMouseLines();
    dots.forEach(d => { d.update(); d.draw(); });
    animId = requestAnimationFrame(tick);
  }

  /* ── Resize handler ──────────────────────────────────── */
  function resize() {
    dpr    = window.devicePixelRatio || 1;
    W      = window.innerWidth;
    H      = window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ── Init ────────────────────────────────────────────── */
  function init() {
    /* Create canvas */
    canvas = document.createElement('canvas');
    canvas.id = 'dotsBgCanvas';
    canvas.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'width:100%',
      'height:100%',
      `z-index:${CFG.zIndex}`,
      'pointer-events:none',
      'will-change:transform',
    ].join(';');

    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');

    resize();

    /* Spawn dots */
    dots = [];
    for (let i = 0; i < CFG.dotCount; i++) dots.push(new Dot());

    /* Events */
    window.addEventListener('resize', () => {
      resize();
      /* Re-clamp dot positions */
      dots.forEach(d => {
        d.x = Math.min(d.x, W);
        d.y = Math.min(d.y, H);
      });
    }, { passive: true });

    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    /* Touch support */
    window.addEventListener('touchmove', e => {
      if (e.touches[0]) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    /* Start */
    running = true;
    tick();
  }

  /* ── Boot when DOM ready ─────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── Page visibility pause/resume ───────────────────── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(animId);
    } else {
      running = true;
      tick();
    }
  });

})();
