/* ── Register GSAP plugins ── */
if (typeof gsap !== 'undefined') {
  try { gsap.registerPlugin(ScrollTrigger, ScrollToPlugin); } catch (e) {}
}

/* ── Smooth anchor scroll handled by js/nav.js ── */

/* ── Who We Are — scroll-in + parallax ── */
(function () {
  const left  = document.querySelector('[data-wwa-left]');
  const right = document.querySelector('[data-wwa-right]');
  if (!left || !right) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  io.observe(left);
  io.observe(right);

  const visual = right.querySelector('.wwa__visual');
  let wwaRafPending = false;
  window.addEventListener('scroll', () => {
    if (wwaRafPending) return;
    wwaRafPending = true;
    requestAnimationFrame(() => {
      const rect   = right.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      visual.style.transform = `translateY(${center * 0.08}px)`;
      wwaRafPending = false;
    });
  }, { passive: true });
})();

/* ── Who We Are — Content Ecosystem Orbital Animation ── */
(function () {
  const canvas = document.getElementById('wwa-visual-canvas');
  if (!canvas) return;
  const visual = canvas.parentElement;
  if (!visual) return;
  const ctx = canvas.getContext('2d');

  let W, H, CX, CY;

  function setup() {
    const dpr = window.devicePixelRatio || 1;
    W = visual.offsetWidth;
    H = visual.offsetHeight;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    CX = W / 2;
    CY = H / 2;
  }
  setup();
  new ResizeObserver(setup).observe(visual);

  /* ── Orbit ring definitions ── */
  const RINGS = [
    { frac: 0.38, n: 3, spd:  0.00042, off: 0,            nr: 5.5, lbls: ['Strategy', 'Production', 'Analytics'] },
    { frac: 0.62, n: 5, spd: -0.00026, off: Math.PI/5,    nr: 4,   lbls: ['UGC Ads', 'Scripting', 'Branding', 'Scaling', 'Reach'] },
    { frac: 0.86, n: 8, spd:  0.00015, off: Math.PI/8,    nr: 2.5, lbls: [] },
  ];

  /* ── Floating particles ── */
  const PARTS = Array.from({ length: 45 }, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - 0.5) * 0.00011,
    vy: (Math.random() - 0.5) * 0.00011,
    r:  Math.random() * 1.3 + 0.3,
    a:  Math.random() * 0.30 + 0.07,
    ph: Math.random() * Math.PI * 2,
  }));

  /* ── Logo image ── */
  var logoImg = new Image();
  logoImg.src = 'assets/images/logo-icon.avif';

  let rafId = null;

  function draw(ts) {
    ctx.clearRect(0, 0, W, H);
    const R = Math.min(W, H) * 0.52;

    /* ── Subtle dot grid ── */
    const gs = 30;
    for (let x = gs; x < W; x += gs) {
      for (let y = gs; y < H; y += gs) {
        ctx.beginPath();
        ctx.arc(x, y, 0.7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,212,200,0.07)';
        ctx.fill();
      }
    }

    /* ── Particles ── */
    PARTS.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
      const pulse = 0.5 + 0.5 * Math.sin(ts * 0.0013 + p.ph);
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,212,200,' + (p.a * pulse).toFixed(2) + ')';
      ctx.fill();
    });

    /* ── Orbit rings + nodes ── */
    RINGS.forEach(function(ring) {
      var r   = ring.frac * R;
      var rot = ts * ring.spd + ring.off;

      /* ring track */
      ctx.beginPath();
      ctx.arc(CX, CY, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,212,200,0.07)';
      ctx.lineWidth = 1;
      ctx.stroke();

      for (var i = 0; i < ring.n; i++) {
        var angle = (Math.PI * 2 / ring.n) * i + rot;
        var nx = CX + Math.cos(angle) * r;
        var ny = CY + Math.sin(angle) * r;

        /* spoke to center */
        var lg = ctx.createLinearGradient(CX, CY, nx, ny);
        lg.addColorStop(0, 'rgba(0,212,200,0.00)');
        lg.addColorStop(1, 'rgba(0,212,200,0.20)');
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = lg;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        /* node glow halo */
        var ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, ring.nr * 5);
        ng.addColorStop(0, 'rgba(0,212,200,0.40)');
        ng.addColorStop(1, 'rgba(0,212,200,0.00)');
        ctx.beginPath();
        ctx.arc(nx, ny, ring.nr * 5, 0, Math.PI * 2);
        ctx.fillStyle = ng;
        ctx.fill();

        /* node core */
        ctx.beginPath();
        ctx.arc(nx, ny, ring.nr, 0, Math.PI * 2);
        ctx.fillStyle = '#00D4C8';
        ctx.shadowColor = '#00D4C8';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        /* label */
        if (ring.lbls[i]) {
          var labelDist = ring.nr + 14;
          var lx = CX + Math.cos(angle) * (r + labelDist);
          var ly = CY + Math.sin(angle) * (r + labelDist);
          ctx.save();
          ctx.font = '500 9px Inter, sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.55)';
          ctx.textAlign = 'center';
          ctx.fillText(ring.lbls[i], lx, ly + 3);
          ctx.restore();
        }
      }
    });

    /* ── Central hub ── */
    var pt = ts * 0.0017;
    [0.055, 0.040, 0.028].forEach(function(f, i) {
      var pr = (f + 0.007 * Math.sin(pt + i * 1.3)) * R;
      ctx.beginPath();
      ctx.arc(CX, CY, pr, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,212,200,' + (0.14 - i * 0.04).toFixed(2) + ')';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    var hg = ctx.createRadialGradient(CX, CY, 0, CX, CY, R * 0.12);
    hg.addColorStop(0,   'rgba(0,212,200,0.75)');
    hg.addColorStop(0.4, 'rgba(0,212,200,0.18)');
    hg.addColorStop(1,   'rgba(0,212,200,0.00)');
    ctx.beginPath();
    ctx.arc(CX, CY, R * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = hg;
    ctx.fill();

    /* logo or fallback white dot */
    var logoSize = R * 0.22;
    if (logoImg.complete && logoImg.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, logoSize * 0.72, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logoImg, CX - logoSize * 0.72, CY - logoSize * 0.72, logoSize * 1.44, logoSize * 1.44);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(CX, CY, R * 0.045, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00D4C8';
      ctx.shadowBlur = 24;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    rafId = requestAnimationFrame(draw);
  }

  new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting) {
      if (!rafId) rafId = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }, { rootMargin: '120px' }).observe(visual);
})();

/* ── Services — GSAP pipeline + card animations ── */
(function () {
  if (typeof gsap === 'undefined') return;

  const section  = document.getElementById('services');
  if (!section) return;

  const tag      = section.querySelector('.svc__tag');
  const heading  = section.querySelector('.svc__heading');
  const subtext  = section.querySelector('.svc__subtext');
  const pipeline = section.querySelector('[data-svc-pipeline]');
  const cards    = section.querySelectorAll('[data-svc-card]');
  const pipeSvg  = section.querySelector('[data-svc-svg]');
  const pipeTrack= section.querySelector('.svc__pipe-track');
  const pipeLine = section.querySelector('.svc__pipe-line');
  const footer   = section.querySelector('[data-svc-footer]');
  const isMobile = () => window.innerWidth <= 900;

  ScrollTrigger.create({
    trigger: section.querySelector('.svc__header'),
    start: 'top 82%',
    once: true,
    onEnter: () => {
      gsap.timeline()
        .to(tag,     { opacity:1, y:0, duration:0.7, ease:'power3.out' })
        .to(heading, { opacity:1, y:0, duration:0.7, ease:'power3.out' }, '-=0.45')
        .to(subtext, { opacity:1, y:0, duration:0.7, ease:'power3.out' }, '-=0.45');
    }
  });

  function buildPipeline() {
    if (isMobile() || !pipeSvg) return;
    const pR  = pipeline.getBoundingClientRect();
    pipeSvg.setAttribute('width',  pR.width);
    pipeSvg.setAttribute('height', pR.height);

    const nodeY = 130;
    const xs    = Array.from(cards).map(c => {
      const r = c.getBoundingClientRect();
      return r.left - pR.left + r.width / 2;
    });

    [pipeTrack, pipeLine].forEach(el => {
      el.setAttribute('x1', xs[0]); el.setAttribute('y1', nodeY);
      el.setAttribute('x2', xs[2]); el.setAttribute('y2', nodeY);
    });
    const len = xs[2] - xs[0];
    gsap.set(pipeLine, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
  }

  function animatePipeline() {
    if (isMobile()) return;

    gsap.timeline()
      .to(pipeLine, { strokeDashoffset: 0, opacity: 0.85, duration: 0.6, ease: 'power2.out' })
      .to(pipeLine, { opacity: 0.2, duration: 0.6 }, 1.3);

    gsap.to(pipeLine, {
      opacity: 0.65, duration: 1.0,
      yoyo: true, repeat: -1, repeatDelay: 1.8,
      delay: 2.5, ease: 'power1.inOut'
    });
  }

  ScrollTrigger.create({
    trigger: pipeline,
    start: 'top 70%',
    once: true,
    onEnter: () => {
      buildPipeline();

      cards.forEach((card, i) => {
        const delay  = i * 0.4;
        const sweep  = card.querySelector('.svc__card-sweep');
        const desc   = card.querySelector('.svc__card-desc');

        gsap.timeline({ delay })
          .to(card, { opacity:1, scale:1, y:0, duration:0.6, ease:'cubic-bezier(0.22,1,0.36,1)' })
          .to(card, {
            boxShadow: '0 0 28px rgba(0,255,200,0.28), 0 0 2px rgba(0,212,200,0.25)',
            duration: 0.5, ease: 'power2.out'
          }, '-=0.15')
          .fromTo(sweep, { x:'-100%' }, { x:'320%', duration:0.85, ease:'power2.out' }, '-=0.3')
          .to(card, {
            boxShadow: '0 0 14px rgba(0,255,200,0.1)',
            duration: 0.5, ease: 'power2.out'
          });

        gsap.to(desc, { opacity:1, y:0, duration:0.5, delay: delay + 0.55, ease:'power2.out' });
      });

      setTimeout(animatePipeline, 1050);
      gsap.to(footer, { opacity:1, y:0, duration:0.7, delay:1.5, ease:'power2.out' });
    }
  });

  const compass = section.querySelector('.svc__icon-compass');
  if (compass) gsap.to(compass, { rotation:3, duration:3, yoyo:true, repeat:-1, ease:'power1.inOut', transformOrigin:'center' });

  const shutter = section.querySelector('.svc__shutter');
  if (shutter) gsap.to(shutter, { scale:1.25, duration:1.4, yoyo:true, repeat:-1, ease:'power1.inOut', transformOrigin:'center' });

  const arrow = section.querySelector('.svc__icon-arrow');
  if (arrow) gsap.to(arrow, { y:-3, duration:1.8, yoyo:true, repeat:-1, ease:'power1.inOut' });

  cards.forEach(card => {
    const sweep = card.querySelector('.svc__card-sweep');

    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        scale: 1.03,
        boxShadow: '0 0 48px rgba(0,255,200,0.45), 0 24px 60px rgba(0,0,0,0.5)',
        duration: 0.3, ease: 'power2.out'
      });
      gsap.fromTo(sweep, { x:'-100%' }, { x:'320%', duration:0.75, ease:'power2.out' });
      if (!isMobile()) gsap.to(pipeLine, { opacity:0.8, duration:0.25 });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        scale: 1,
        boxShadow: '0 0 14px rgba(0,255,200,0.1)',
        duration: 0.35, ease: 'power2.out'
      });
      if (!isMobile()) gsap.to(pipeLine, { opacity:0.2, duration:0.3 });
    });
  });

  window.addEventListener('resize', () => { if (!isMobile()) buildPipeline(); }, { passive: true });
})();

/* ── Our Creative Process — Sequential Canvas Line Reveal ── */
(function () {
  if (typeof gsap === 'undefined') return;

  const section = document.getElementById('process');
  if (!section) return;

  const tag     = section.querySelector('.process__tag');
  const heading = section.querySelector('.process__heading');
  const sub     = section.querySelector('.process__sub');
  const tl      = section.querySelector('.process__tl');
  const steps   = section.querySelectorAll('.process__step');
  const cards   = section.querySelectorAll('.process__card');
  const lineCanvas = section.querySelector('.process__line-canvas');
  const lineCtx    = lineCanvas.getContext('2d');
  const footer     = section.querySelector('.process__footer');

  const isMob = () => window.innerWidth < 900;
  let revealed = false;

  ScrollTrigger.create({
    trigger: section.querySelector('.process__header'),
    start: 'top 82%', once: true,
    onEnter() {
      gsap.timeline()
        .to(tag,     { opacity:1, y:0, duration:0.7, ease:'power3.out' })
        .to(heading, { opacity:1, y:0, duration:0.7, ease:'power3.out' }, '-=0.45')
        .to(sub,     { opacity:1, y:0, duration:0.7, ease:'power3.out' }, '-=0.45');
    }
  });

  function activateStep(i) {
    const step      = steps[i];
    const node      = step.querySelector('.process__node');
    const label     = step.querySelector('.process__label');
    const connector = step.querySelector('.process__step-connector');

    step.classList.add('is-active');

    gsap.to(connector, { opacity: 1, duration: 0.35, ease: 'power2.out' });

    gsap.fromTo(node,
      { opacity: 0, scale: 0.55 },
      { opacity: 1, scale: 1, duration: 0.75, ease: 'back.out(2.6)' }
    );

    gsap.timeline({ delay: 0.1 })
      .to(node, {
        boxShadow: '0 0 55px rgba(0,212,200,1), 0 0 100px rgba(0,212,200,0.55)',
        duration: 0.22, ease: 'power3.out'
      })
      .to(node, {
        boxShadow: '0 0 22px rgba(0,212,200,0.45), 0 0 50px rgba(0,212,200,0.15)',
        duration: 0.7, ease: 'power2.in',
        onComplete() { gsap.set(node, { clearProps: 'boxShadow' }); }
      });

    gsap.to(label, { opacity: 1, duration: 0.55, ease: 'power2.out', delay: 0.18 });

    gsap.fromTo(cards[i],
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'power3.out', delay: 0.12 }
    );
  }

  function getNodeXs() {
    const tlRect = tl.getBoundingClientRect();
    return Array.from(steps).map(s => {
      const r = s.querySelector('.process__node-row').getBoundingClientRect();
      return (r.left - tlRect.left) + r.width / 2;
    });
  }

  let lineProgress = 0;
  let lineX1 = 0, lineX2 = 0;
  let rafId  = null;
  let rafT0  = 0;

  function setupCanvas() {
    const dpr    = window.devicePixelRatio || 1;
    const tlRect = tl.getBoundingClientRect();
    lineCanvas.style.width  = tlRect.width + 'px';
    lineCanvas.style.height = '60px';
    lineCanvas.width        = Math.round(tlRect.width * dpr);
    lineCanvas.height       = Math.round(60 * dpr);
  }

  function renderLine(ts) {
    const dpr  = window.devicePixelRatio || 1;
    const W    = lineCanvas.width  / dpr;
    const cy   = 30;
    const x1   = lineX1, x2 = lineX2;
    const cx   = x1 + (x2 - x1) * lineProgress;
    const t    = (ts - rafT0) / 1000;
    const pulse = 0.5 + 0.5 * Math.sin(t * 4.5);

    lineCtx.save();
    lineCtx.scale(dpr, dpr);
    lineCtx.clearRect(0, 0, W, 60);

    /* Faint full-length track */
    lineCtx.beginPath();
    lineCtx.moveTo(x1, cy);
    lineCtx.lineTo(x2, cy);
    lineCtx.strokeStyle = 'rgba(0,212,200,0.12)';
    lineCtx.lineWidth   = 1.5;
    lineCtx.shadowBlur  = 0;
    lineCtx.stroke();

    if (lineProgress > 0) {
      /* Outer bloom */
      lineCtx.beginPath();
      lineCtx.moveTo(x1, cy);
      lineCtx.lineTo(cx, cy);
      lineCtx.strokeStyle = 'rgba(0,212,200,0.13)';
      lineCtx.lineWidth   = 16;
      lineCtx.shadowColor = 'rgba(0,212,200,0.18)';
      lineCtx.shadowBlur  = 20;
      lineCtx.stroke();

      /* Mid glow */
      lineCtx.beginPath();
      lineCtx.moveTo(x1, cy);
      lineCtx.lineTo(cx, cy);
      lineCtx.strokeStyle = 'rgba(0,212,200,0.5)';
      lineCtx.lineWidth   = 4;
      lineCtx.shadowColor = '#00D4C8';
      lineCtx.shadowBlur  = 10;
      lineCtx.stroke();

      /* Sharp core */
      lineCtx.beginPath();
      lineCtx.moveTo(x1, cy);
      lineCtx.lineTo(cx, cy);
      lineCtx.strokeStyle = '#00D4C8';
      lineCtx.lineWidth   = 2;
      lineCtx.shadowColor = '#00D4C8';
      lineCtx.shadowBlur  = 4;
      lineCtx.stroke();
    }

    /* Pulsing head */
    const headR      = 4.5 + pulse * 1.5;
    const outerR     = 10  + pulse * 5;
    const outerAlpha = 0.15 + pulse * 0.15;

    lineCtx.beginPath();
    lineCtx.arc(cx, cy, outerR, 0, Math.PI * 2);
    lineCtx.fillStyle   = `rgba(0,212,200,${outerAlpha.toFixed(2)})`;
    lineCtx.shadowColor = '#00D4C8';
    lineCtx.shadowBlur  = 20;
    lineCtx.fill();

    lineCtx.beginPath();
    lineCtx.arc(cx, cy, headR, 0, Math.PI * 2);
    lineCtx.fillStyle   = '#ffffff';
    lineCtx.shadowColor = '#00D4C8';
    lineCtx.shadowBlur  = 18;
    lineCtx.fill();

    lineCtx.shadowBlur = 0;
    lineCtx.restore();
  }

  function startRaf() {
    cancelAnimationFrame(rafId);
    rafT0 = performance.now();
    function loop(ts) {
      renderLine(ts);
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
  }

  function desktopReveal() {
    const nodeXs = getNodeXs();
    lineX1 = nodeXs[0];
    lineX2 = nodeXs[3];
    const span = lineX2 - lineX1;

    setupCanvas();
    lineProgress = 0;

    const p1  = (nodeXs[1] - lineX1) / span;
    const p2  = (nodeXs[2] - lineX1) / span;
    const SEG = 1.1;
    const prog = { v: 0 };

    const tick = () => { lineProgress = prog.v; };
    gsap.ticker.add(tick);

    startRaf();

    const seq = gsap.timeline({
      onComplete() { gsap.ticker.remove(tick); }
    });

    seq.call(() => activateStep(0));

    seq.to(prog, { v: p1, duration: SEG, ease: 'power1.inOut' }, '+=0.55');
    seq.call(() => activateStep(1));

    seq.to(prog, { v: p2, duration: SEG, ease: 'power1.inOut' }, '+=0.1');
    seq.call(() => activateStep(2));

    seq.to(prog, { v: 1,  duration: SEG, ease: 'power1.inOut' }, '+=0.1');
    seq.call(() => {
      activateStep(3);
      cancelAnimationFrame(rafId);
      lineProgress = 1;
      renderLine(performance.now());
    });

    seq.to(footer, { opacity:1, y:0, duration:0.8, ease:'power2.out' }, '+=0.45');
  }

  function mobileReveal() {
    const seq = gsap.timeline();
    steps.forEach((step, i) => {
      seq.call(() => activateStep(i));
      if (i < steps.length - 1) seq.to({}, { duration: 0.65 });
    });
    seq.to(footer, { opacity:1, y:0, duration:0.7, ease:'power2.out' }, '+=0.3');
  }

  ScrollTrigger.create({
    trigger: tl, start: 'top 72%', once: true,
    onEnter() {
      if (revealed) return;
      revealed = true;
      if (isMob()) mobileReveal();
      else desktopReveal();
    }
  });

  steps.forEach(step => {
    const node = step.querySelector('.process__node');
    step.addEventListener('mouseenter', () => {
      gsap.to(node, { scale:1.1, duration:0.3, ease:'power2.out' });
    });
    step.addEventListener('mouseleave', () => {
      gsap.to(node, { scale:1,   duration:0.35, ease:'power2.out' });
    });
  });

  window.addEventListener('resize', () => {
    if (!isMob() && revealed) {
      const xs = getNodeXs();
      lineX1 = xs[0]; lineX2 = xs[3];
      setupCanvas();
      renderLine(performance.now());
    }
  }, { passive:true });
})();

/* ── Per-section Three.js particle factory ── */
(function () {
  if (typeof THREE === 'undefined') return;

  function spriteBokeh() {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(64,64,0,64,64,64);
    g.addColorStop(0,    'rgba(255,255,255,0.95)');
    g.addColorStop(0.18, 'rgba(255,255,255,0.72)');
    g.addColorStop(0.45, 'rgba(255,255,255,0.28)');
    g.addColorStop(0.78, 'rgba(255,255,255,0.05)');
    g.addColorStop(1,    'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0,0,128,128); return c;
  }
  function spriteDot() {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,    'rgba(255,255,255,1.0)');
    g.addColorStop(0.28, 'rgba(255,255,255,0.72)');
    g.addColorStop(0.62, 'rgba(255,255,255,0.12)');
    g.addColorStop(1,    'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0,0,64,64); return c;
  }
  function spriteSparkle() {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'); x.translate(32,32);
    const h = x.createRadialGradient(0,0,0,0,0,28);
    h.addColorStop(0,'rgba(255,255,255,0.4)'); h.addColorStop(1,'rgba(255,255,255,0)');
    x.fillStyle = h; x.beginPath(); x.arc(0,0,28,0,Math.PI*2); x.fill();
    x.fillStyle = 'rgba(255,255,255,1)'; x.beginPath();
    for (let i=0; i<8; i++) {
      const a = (i*Math.PI)/4 - Math.PI/2, r = i%2===0 ? 28 : 4;
      i===0 ? x.moveTo(Math.cos(a)*r, Math.sin(a)*r) : x.lineTo(Math.cos(a)*r, Math.sin(a)*r);
    }
    x.closePath(); x.fill(); return c;
  }

  const SRC_BOKEH   = spriteBokeh();
  const SRC_DOT     = spriteDot();
  const SRC_SPARKLE = spriteSparkle();

  const VS = `
    attribute float aSize;
    attribute float aOpacity;
    attribute float aPhase;
    uniform   float uTime;
    varying   float vOpacity;
    void main() {
      float pulse = 0.68 + 0.32 * sin(uTime * 0.9 + aPhase);
      vOpacity    = aOpacity * pulse;
      gl_PointSize= aSize;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }`;

  const FS = `
    uniform sampler2D uSprite;
    varying float vOpacity;
    void main() {
      vec4 t = texture2D(uSprite, gl_PointCoord);
      gl_FragColor = vec4(0.0, 0.863, 0.784, t.a * vOpacity);
    }`;

  function initSection(canvasEl, sectionEl, cfg) {
    if (!canvasEl || !sectionEl) return;

    let W = sectionEl.offsetWidth;
    let H = sectionEl.offsetHeight;
    const mobile = W < 768;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H);

    const camera = new THREE.OrthographicCamera(0, W, 0, H, -1, 1);
    const scene  = new THREE.Scene();

    function buildGroup(count, szMin, szMax, opMin, opMax, spdMin, spdMax, src) {
      const pos = new Float32Array(count*3), sz = new Float32Array(count),
            op  = new Float32Array(count),   ph = new Float32Array(count),
            vx  = new Float32Array(count),   vy = new Float32Array(count);
      for (let i=0; i<count; i++) {
        pos[i*3]   = Math.random()*W;
        pos[i*3+1] = Math.random()*H;
        const a = Math.random()*Math.PI*2, spd = Math.random()*(spdMax-spdMin)+spdMin;
        vx[i] = Math.cos(a)*spd; vy[i] = Math.sin(a)*spd;
        sz[i] = Math.random()*(szMax-szMin)+szMin;
        op[i] = Math.random()*(opMax-opMin)+opMin;
        ph[i] = Math.random()*Math.PI*2;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
      geo.setAttribute('aSize',    new THREE.BufferAttribute(sz,1));
      geo.setAttribute('aOpacity', new THREE.BufferAttribute(op,1));
      geo.setAttribute('aPhase',   new THREE.BufferAttribute(ph,1));
      const mat = new THREE.ShaderMaterial({
        uniforms: { uSprite:{value:new THREE.CanvasTexture(src)}, uTime:{value:0} },
        vertexShader: VS, fragmentShader: FS,
        transparent:true, blending:THREE.AdditiveBlending, depthWrite:false,
      });
      scene.add(new THREE.Points(geo, mat));
      return { geo, mat, vx, vy, count };
    }

    const m = mobile;
    const groups = [
      buildGroup(m?cfg.bokehM:cfg.bokeh,   cfg.bsMin, cfg.bsMax, cfg.boMin, cfg.boMax, 0.10,0.26, SRC_BOKEH),
      buildGroup(m?cfg.dotM  :cfg.dot,     cfg.dsMin, cfg.dsMax, cfg.doMin, cfg.doMax, 0.08,0.30, SRC_DOT),
      buildGroup(m?cfg.sparkM:cfg.spark,   cfg.ssMin, cfg.ssMax, cfg.soMin, cfg.soMax, 0.05,0.16, SRC_SPARKLE),
    ];

    let mx=-9999, my=-9999;
    sectionEl.addEventListener('mousemove', e=>{
      const r=sectionEl.getBoundingClientRect(); mx=e.clientX-r.left; my=e.clientY-r.top;
    },{passive:true});
    sectionEl.addEventListener('mouseleave',()=>{mx=-9999;my=-9999;});

    const REPEL_R=125, REPEL_F=1.5, clock=new THREE.Clock();

    /* Cancel RAF when off-screen, restart when visible — eliminates idle loops */
    let rafId = null;

    function tick() {
      const t = clock.getElapsedTime();
      groups.forEach(({geo,mat,vx,vy,count}) => {
        mat.uniforms.uTime.value = t;
        const p = geo.attributes.position;
        for (let i = 0; i < count; i++) {
          let x = p.array[i*3], y = p.array[i*3+1];
          x += vx[i]; y += vy[i];
          if (mx > -100) {
            const dx=x-mx, dy=y-my, d2=dx*dx+dy*dy;
            if (d2 < REPEL_R*REPEL_R && d2 > 0.01) {
              const d=Math.sqrt(d2), f=(1-d/REPEL_R)*REPEL_F;
              x += (dx/d)*f; y += (dy/d)*f;
            }
          }
          if (x<-65) x=W+65; if (x>W+65) x=-65;
          if (y<-65) y=H+65; if (y>H+65) y=-65;
          p.array[i*3]=x; p.array[i*3+1]=y;
        }
        p.needsUpdate = true;
      });
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    }

    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (!rafId) { clock.start(); rafId = requestAnimationFrame(tick); }
      } else {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; clock.stop(); }
      }
    }, { rootMargin: '200px 0px' }).observe(sectionEl);

    new ResizeObserver(()=>{
      W=sectionEl.offsetWidth; H=sectionEl.offsetHeight;
      renderer.setSize(W,H); camera.right=W; camera.bottom=H; camera.updateProjectionMatrix();
    }).observe(sectionEl);
  }

  const PARTICLE_CFG = {
    bokeh:14, bokehM:7,  bsMin:18, bsMax:44, boMin:0.18, boMax:0.55,
    dot:48,   dotM:24,   dsMin:1.2, dsMax:3.8, doMin:0.28, doMax:0.72,
    spark:5,  sparkM:3,  ssMin: 8,  ssMax:16,  soMin:0.50, soMax:0.88,
  };

  initSection(document.getElementById('wwa-canvas'),     document.getElementById('who-we-are'),  PARTICLE_CFG);
  initSection(document.getElementById('svc-canvas'),     document.getElementById('services'),    PARTICLE_CFG);
  initSection(document.getElementById('process-canvas'), document.getElementById('process'),     PARTICLE_CFG);
  initSection(document.getElementById('cs-canvas'),      document.getElementById('case-studies'),PARTICLE_CFG);
  initSection(document.getElementById('orb-canvas'),     document.getElementById('testimonials'),PARTICLE_CFG);
  initSection(document.getElementById('cta-canvas'),     document.getElementById('contact'),     PARTICLE_CFG);
})();

/* ── Case Studies — Physical Envelope Reveal ── */
(function () {
  if (typeof gsap === 'undefined') return;

  const section    = document.getElementById('case-studies');
  if (!section) return;

  const tag        = section.querySelector('.cs__tag');
  const heading    = section.querySelector('.cs__heading');
  const sub        = section.querySelector('.cs__sub');
  const envelope   = document.getElementById('csEnvelope');
  const envFlap    = document.getElementById('csEnvFlap');
  const envLetter  = document.getElementById('csEnvLetter');
  const envLabel   = document.getElementById('csEnvLabel');
  const card       = document.getElementById('csCard');
  const cardTag    = document.getElementById('csCardTag');
  const cardTitle  = document.getElementById('csCardTitle');
  const cardDesc   = document.getElementById('csCardDesc');
  const cardCta    = document.getElementById('csCardCta');
  const nav        = document.getElementById('csNav');
  const prevBtn    = document.getElementById('csPrev');
  const nextBtn    = document.getElementById('csNext');
  const dots       = document.querySelectorAll('.cs__dot');
  const mVals      = [
    document.getElementById('csM0'),
    document.getElementById('csM1'),
    document.getElementById('csM2'),
  ];
  const mLbls      = [
    document.getElementById('csM0l'),
    document.getElementById('csM1l'),
    document.getElementById('csM2l'),
  ];
  const quoteText  = document.getElementById('csQuoteText');
  const quotePanel = document.getElementById('csQuotePanel');

  const N = 3;

  /* card slides up this many px — stops so ~50% of card is above envelope */
  const CARD_OPEN_Y = -130;

  const STUDIES = [
    {
      client:  'Digimad',
      title:   'From Invisible to Viral: A Brand Redefined',
      desc:    'We built a full content system — engineered hooks, scripted viral formats, and produced reels that consistently hit the algorithm sweet spot.',
      metrics: [
        { val: '3.2M+', lbl: 'Views Generated' },
        { val: '41K',   lbl: 'New Followers'   },
        { val: '8.4×',  lbl: 'Reach Multiplier'},
      ],
      quote: '"We went from posting occasionally to having a real content engine. Leads started coming in within weeks of launch."',
      ig: 'https://instagram.com',
    },
    {
      client:  'Grannis Kitchen',
      title:   'Food Content That Drives Real Reservations',
      desc:    'Cinematic food storytelling paired with platform-native strategy. Every reel had a purpose — appetite appeal, social proof, and a CTA to book.',
      metrics: [
        { val: '4.1M+', lbl: 'Views Generated' },
        { val: '28K',   lbl: 'New Followers'   },
        { val: '312%',  lbl: 'Audience Growth' },
      ],
      quote: '"Our tables started filling up from Instagram. People were coming in saying they found us through a reel — that never happened before."',
      ig: 'https://instagram.com',
    },
    {
      client:  'Nourish by Dr Nazish',
      title:   'Authority Content That Converts',
      desc:    'We turned her medical expertise into a high-trust content brand — educational content designed to build authority and drive consultation bookings.',
      metrics: [
        { val: '2.4M+', lbl: 'Views Generated' },
        { val: '19K',   lbl: 'New Followers'   },
        { val: '5.9×',  lbl: 'Lead Growth'     },
      ],
      quote: '"My inbox completely changed. People come to consultations already trusting me because of the content — the conversion rate is unreal."',
      ig: 'https://instagram.com',
    },
  ];

  let active    = 0;
  let animating = false;
  let opened    = false;

  function populateCard(data) {
    if (cardTag)   cardTag.textContent   = data.client;
    if (cardTitle) cardTitle.textContent = data.title;
    if (cardDesc)  cardDesc.textContent  = data.desc;
    if (cardCta)   cardCta.href          = data.ig;
    data.metrics.forEach((m, i) => {
      if (mVals[i]) mVals[i].textContent = m.val;
      if (mLbls[i]) mLbls[i].textContent = m.lbl;
    });
    if (quoteText) quoteText.textContent = data.quote;
    if (envLetter) envLetter.textContent = data.client.charAt(0);
  }

  function updateDots() {
    dots.forEach((d, i) => d.classList.toggle('cs__dot--active', i === active));
  }

  /* Initial state: card invisible at natural position (bottom:0 in wrapper).
     Envelope body's overflow:hidden clips the portion inside — no y push needed. */
  gsap.set(card, { xPercent: -50, autoAlpha: 0 });

  /* Hide metrics + quote until envelope is opened */
  gsap.set(mVals, { autoAlpha: 0, x: -20 });
  gsap.set(mLbls, { autoAlpha: 0, x: -12 });
  gsap.set(quotePanel, { autoAlpha: 0 });

  /* Populate first study */
  populateCard(STUDIES[0]);

  /* Gentle float */
  gsap.to(envelope, {
    y: -10, duration: 2.5, ease: 'power1.inOut', yoyo: true, repeat: -1,
  });

  /* ── Header scroll-in ── */
  if (tag && heading && sub) {
    ScrollTrigger.create({
      trigger: section.querySelector('.cs__header'),
      start: 'top 82%', once: true,
      onEnter() {
        gsap.timeline()
          .to(tag,     { opacity:1, y:0, duration:0.7, ease:'power3.out' })
          .to(heading, { opacity:1, y:0, duration:0.7, ease:'power3.out' }, '-=0.45')
          .to(sub,     { opacity:1, y:0, duration:0.7, ease:'power3.out' }, '-=0.45');
      }
    });
  }

  /* ── Envelope click → card slides up, stops halfway ── */
  envelope.addEventListener('click', () => {
    if (opened) return;
    opened = true;

    gsap.killTweensOf(envelope);
    gsap.set(envelope, { y: 0 });
    envFlap.classList.add('is-open');

    const tl = gsap.timeline();

    tl.to(envelope, {
      filter: 'drop-shadow(0 0 44px rgba(0,212,200,0.9))',
      duration: 0.3, ease: 'power2.out',
    });

    tl.to(envLabel, { opacity: 0, duration: 0.25, ease: 'power2.in' }, 0.15);

    /* Card slides UP and fades in — STRICT max CARD_OPEN_Y, bottom stays inside envelope */
    tl.to(card, {
      autoAlpha: 1, y: CARD_OPEN_Y,
      duration: 1.0, ease: 'power3.out',
      onComplete() { card.classList.add('is-open'); },
    }, 0.45);

    /* Stagger card content in */
    tl.from(
      [cardTag, cardTitle, card.querySelector('.cs__card-rule'), cardDesc, cardCta],
      { opacity: 0, y: 12, stagger: 0.1, duration: 0.5, ease: 'power2.out' },
      0.75,
    );

    /* Metrics animate in from left */
    tl.to(mVals, { autoAlpha: 1, x: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out' }, 0.65);
    tl.to(mLbls, { autoAlpha: 1, x: 0, stagger: 0.1, duration: 0.4, ease: 'power2.out' }, 0.75);

    /* Quote panel fades in on right */
    tl.to(quotePanel, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, 0.9);

    /* Nav appears below */
    tl.to(nav, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.1);

    /* Settle glow */
    tl.to(envelope, {
      filter: 'drop-shadow(0 0 18px rgba(0,212,200,0.22))',
      duration: 0.8, ease: 'power1.inOut',
    }, 0.9);
  });

  /* ── Navigation ── */
  function navigate(dir) {
    if (!opened || animating) return;
    animating = true;

    gsap.to(card, {
      x: dir * -40, opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete() {
        active = (active + dir + N) % N;
        updateDots();
        populateCard(STUDIES[active]);

        gsap.fromTo(card,
          { x: dir * 40, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.5, ease: 'power3.out',
            onComplete() { animating = false; }
          }
        );
      },
    });
  }

  /* Auto-timer: advances every 5s after envelope is opened; resets on user interaction */
  let autoTimer   = null;
  const timerBar  = document.getElementById('csTimerBar');

  function restartTimerBar() {
    if (!timerBar) return;
    timerBar.classList.remove('is-running');
    /* Force reflow so the animation restarts cleanly */
    void timerBar.offsetWidth;
    timerBar.classList.add('is-running');
  }

  function startAutoTimer() {
    clearInterval(autoTimer);
    restartTimerBar();
    autoTimer = setInterval(() => {
      if (!animating) {
        navigate(1);
        restartTimerBar();
      }
    }, 5000);
  }

  function resetAutoTimer() {
    if (opened) startAutoTimer();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { navigate(-1); resetAutoTimer(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { navigate(1);  resetAutoTimer(); });

  dots.forEach(d => {
    d.addEventListener('click', () => {
      const idx = parseInt(d.dataset.idx, 10);
      if (idx === active || animating) return;
      navigate(idx > active ? 1 : -1);
      resetAutoTimer();
    });
  });

  let touchX = 0;
  card.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  card.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) { navigate(dx < 0 ? 1 : -1); resetAutoTimer(); }
  });

  /* Start auto-timer once envelope open animation finishes (~1.6s) */
  envelope.addEventListener('click', () => {
    setTimeout(startAutoTimer, 1600);
  }, { once: true });
})();

/* ── Testimonials — Orbital System ── */
(function () {
  if (typeof gsap === 'undefined') return;
  const section = document.getElementById('testimonials');
  if (!section) return;

  const stage    = document.getElementById('tsStage');
  const content  = document.getElementById('tsContent');
  const textEl   = document.getElementById('tsText');
  const authorEl = document.getElementById('tsAuthor');
  const nodes    = Array.from(section.querySelectorAll('.ts-node'));
  const N        = nodes.length;

  /* ── 7 testimonials — 4 real + 3 dummy ── */
  const TESTI = [
    {
      text:   'Our brand finally started looking like a brand. Not just random posts — a real identity.',
      author: 'Ahmed Raza · CEO, Digimad',
    },
    {
      text:   'We went from invisible to fully booked in under 60 days. Truth Arc is a genuine growth engine.',
      author: 'Sara Khalid · Owner, Grannis Kitchen',
    },
    {
      text:   'The content system they built converted my expertise into real client bookings overnight.',
      author: 'Dr. Nazish · Founder, Nourish by Dr. Nazish',
    },
    {
      text:   'Our Instagram became our biggest sales channel within 3 months. Results speak for themselves.',
      author: 'Bilal Tariq · Director, The Toy Company',
    },
    {
      text:   'Sophisticated strategy, cinematic execution — Truth Arc delivered beyond every expectation.',
      author: 'Marcus Lee · CMO, Veloce Agency',
    },
    {
      text:   'Finally a content partner that actually understands visual storytelling. Simply outstanding.',
      author: 'Priya Singh · Creative Director, Studio Bloom',
    },
    {
      text:   'Our engagement tripled in 90 days. The ROI is unmatched across our entire marketing stack.',
      author: 'Omar Farooq · Founder, BrandCraft',
    },
  ];

  /* Active zone: top-right (~330° = -30° = -π/6 from east = 11 o'clock) */
  const ACTIVE_ANGLE     = -Math.PI / 6;   // ~330° — top-right
  const ACTIVE_THRESHOLD = 0.5;            // radians

  let rotation      = 0;
  let currentActive = -1;
  let tweenProxy    = null;
  let autoTimer     = null;
  const ORBIT_SPEED = 0.004; // radians per frame at 60fps → ~24s full rotation

  /* ── Responsive radius ── */
  function getRadius() {
    const w = stage.offsetWidth;
    if (w < 500) return 130;
    if (w < 900) return 210;
    return 290;
  }

  /* ── Angle utilities ── */
  function normAngle(a) {
    let n = a % (2 * Math.PI);
    if (n < 0) n += 2 * Math.PI;
    return n;
  }

  function angDist(a, b) {
    const d = Math.abs(normAngle(a) - normAngle(b));
    return d > Math.PI ? 2 * Math.PI - d : d;
  }

  /* ── Orbit update — runs every RAF tick ── */
  function updateOrbit() {
    const r = getRadius();

    let newActive = 0;
    let minDist   = Infinity;

    for (let i = 0; i < N; i++) {
      const baseAngle = (2 * Math.PI / N) * i;
      const angle     = baseAngle + rotation;
      const x         = r * Math.cos(angle);
      const y         = r * Math.sin(angle);

      /* Depth: top of orbit = dim/small, bottom = bright/large */
      const t       = (Math.sin(angle) + 1) / 2; // 0=top, 1=bottom
      const scale   = 0.68 + 0.46 * t;
      const opacity = 0.35 + 0.65 * t;
      const zi      = Math.round(t * 8) + 2;

      const dist     = angDist(angle, ACTIVE_ANGLE);
      const isActive = dist < ACTIVE_THRESHOLD;
      if (dist < minDist) { minDist = dist; newActive = i; }

      gsap.set(nodes[i], {
        xPercent: -50, yPercent: -50,
        x, y,
        scale:   isActive ? 1.22 : scale,
        opacity: isActive ? 1.0  : opacity,
        zIndex:  isActive ? 20   : zi,
      });

      nodes[i].classList.toggle('is-active', isActive);
    }

    if (newActive !== currentActive) {
      currentActive = newActive;
      showTestimonial(TESTI[currentActive]);
    }
  }

  /* ── Content crossfade ── */
  function showTestimonial(data) {
    gsap.timeline()
      .to(content, { autoAlpha: 0, y: -8, duration: 0.22, ease: 'power2.in' })
      .call(() => {
        textEl.textContent   = data.text;
        authorEl.textContent = data.author;
      })
      .to(content, { autoAlpha: 1, y: 0, duration: 0.38, ease: 'power2.out' });
  }

  /* ── Auto-rotation tick function ── */
  function autoRotate() {
    rotation += ORBIT_SPEED;
    updateOrbit();
  }

  gsap.ticker.add(autoRotate);

  /* ── Click to focus — shortest-path snap ── */
  nodes.forEach((node, i) => {
    node.addEventListener('click', () => {
      if (tweenProxy) gsap.killTweensOf(tweenProxy);

      const baseAngle = (2 * Math.PI / N) * i;
      let currAngle   = normAngle(baseAngle + rotation);
      let targetAngle = normAngle(ACTIVE_ANGLE);
      let delta       = targetAngle - currAngle;
      if (delta >  Math.PI) delta -= 2 * Math.PI;
      if (delta < -Math.PI) delta += 2 * Math.PI;

      tweenProxy = { rot: rotation };
      gsap.to(tweenProxy, {
        rot:      rotation + delta,
        duration: 1.1,
        ease:     'power3.inOut',
        onUpdate() { rotation = tweenProxy.rot; updateOrbit(); },
      });
    });
  });

  /* ── Header scroll-in ── */
  const tag     = section.querySelector('.ts-tag');
  const heading = section.querySelector('.ts-heading');
  const sub     = section.querySelector('.ts-sub');

  ScrollTrigger.create({
    trigger: section.querySelector('.ts-top'),
    start: 'top 82%', once: true,
    onEnter() {
      gsap.timeline()
        .to(tag,     { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' })
        .to(heading, { opacity: 1, y: 0, duration: 0.7,  ease: 'power3.out' }, '-=0.4')
        .to(sub,     { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, '-=0.4');
    },
  });

  /* Rotation never pauses — hover has no effect on ticker */

  /* ── Initial render ── */
  updateOrbit();
  showTestimonial(TESTI[0]);

  window.addEventListener('resize', updateOrbit, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════════
   CTA SECTION — Focus Mode + Form Validation
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const section  = document.getElementById('contact');
  if (!section) return;

  const overlay  = document.getElementById('ctaOverlay');
  const form     = document.getElementById('ctaForm');
  const submitBtn = form ? form.querySelector('.cta-submit') : null;
  const ctaRight = document.getElementById('ctaRight');

  /* ── Scroll-in animation ── */
  const ctaTag     = section.querySelector('.cta-tag');
  const ctaHeading = section.querySelector('.cta-heading');
  const ctaCopy    = section.querySelector('.cta-copy');
  const ctaStats   = section.querySelector('.cta-stats');
  const ctaBtnAlt  = section.querySelector('.cta-btn-alt');
  const ctaTrust   = section.querySelector('.cta-trust');

  if (ctaTag && typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 78%',
      once: true,
      onEnter() {
        gsap.timeline()
          .to(ctaTag,     { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out' })
          .to(ctaHeading, { opacity: 1, y: 0, duration: 0.7,  ease: 'power3.out' }, '-=0.35')
          .to(ctaCopy,    { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, '-=0.4')
          .to(ctaStats,   { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out' }, '-=0.35')
          .to(ctaBtnAlt,  { opacity: 1, y: 0, duration: 0.5,  ease: 'power3.out' }, '-=0.3')
          .to(ctaTrust,   { opacity: 1,       duration: 0.5,  ease: 'power2.out' }, '-=0.2')
          .to(ctaRight,   { opacity: 1, y: 0, duration: 0.7,  ease: 'power3.out' }, '-=0.55');
      },
    });
  } else if (ctaRight) {
    /* fallback if GSAP/ST not available */
    [ctaTag, ctaHeading, ctaCopy, ctaStats, ctaBtnAlt, ctaTrust, ctaRight].forEach(el => {
      if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
    });
  }

  /* ── Focus mode — dims left panel, spotlights form ── */
  let focusCount = 0;

  function enterFocus() {
    if (focusCount++ > 0) return;
    section.classList.add('form-focused');
    form.classList.add('is-focused');
  }

  function leaveFocus() {
    focusCount = Math.max(0, focusCount - 1);
    if (focusCount > 0) return;
    section.classList.remove('form-focused');
    form.classList.remove('is-focused');
  }

  if (form) {
    form.addEventListener('focusin',  enterFocus);
    form.addEventListener('focusout', () => setTimeout(leaveFocus, 80));
  }

  /* ── Validation helpers ── */
  function showError(field, msg) {
    field.classList.add('is-error');
    const span = field.closest('.cta-field').querySelector('.cta-err');
    if (span) span.textContent = msg;
  }

  function clearError(field) {
    field.classList.remove('is-error');
    const span = field.closest('.cta-field').querySelector('.cta-err');
    if (span) span.textContent = '';
  }

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  /* clear error on input */
  if (form) {
    form.querySelectorAll('.cta-input, .cta-select, .cta-textarea').forEach(el => {
      el.addEventListener('input', () => clearError(el));
      el.addEventListener('change', () => clearError(el));
    });
  }

  /* ── Submit ── */
  if (form && submitBtn) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let valid = true;

      const name    = form.querySelector('#ctaName');
      const email   = form.querySelector('#ctaEmail');
      const phone   = form.querySelector('#ctaPhone');

      if (name && !name.value.trim()) {
        showError(name, 'Please enter your name.'); valid = false;
      }
      if (email) {
        if (!email.value.trim()) {
          showError(email, 'Please enter your email.'); valid = false;
        } else if (!validateEmail(email.value)) {
          showError(email, 'Please enter a valid email.'); valid = false;
        }
      }
      if (phone && !phone.value.trim()) {
        showError(phone, 'Please enter your phone number.'); valid = false;
      }

      if (!valid) return;

      submitBtn.classList.add('is-loading');

      const nameVal    = form.querySelector('#ctaName').value.trim();
      const emailVal   = form.querySelector('#ctaEmail').value.trim();
      const phoneVal   = (form.querySelector('#ctaPhone')   || {}).value || '';
      const brandVal   = (form.querySelector('#ctaBrand')   || {}).value || '';
      const serviceVal = (form.querySelector('#ctaService') || {}).value || '';
      const messageVal = (form.querySelector('#ctaMessage') || {}).value || '';

      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    nameVal,
          email:   emailVal,
          phone:   phoneVal,
          brand:   brandVal,
          service: serviceVal,
          message: messageVal,
        }),
      })
      .then(res => {
        if (!res.ok) throw new Error('Server error ' + res.status);
        return res.json();
      })
      .then(() => {
        submitBtn.classList.remove('is-loading');

        const successEl = form.querySelector('.cta-success');
        if (successEl) {
          Array.from(form.children).forEach(c => {
            if (!c.classList.contains('cta-success')) c.style.display = 'none';
          });
          successEl.style.display = 'flex';
          gsap.fromTo(successEl,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
          );
        }

        leaveFocus();
        focusCount = 0;
      })
      .catch(err => {
        console.error('Email send failed:', err);
        submitBtn.classList.remove('is-loading');
        const lbl = submitBtn.querySelector('.cta-submit__label');
        if (lbl) { lbl.textContent = 'Something went wrong — try again'; setTimeout(() => { lbl.textContent = 'Send Message'; }, 3500); }
      });
    });
  }
})();

/* ═══════════════════════════════════════════════════════════════
   FOOTER — Entrance animation + back-to-top
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const footer = document.getElementById('footer');
  const fab    = document.getElementById('footerTopBtn');

  /* Back to top — use GSAP (CSS scroll-behavior removed) */
  if (fab) {
    fab.addEventListener('click', () => {
      gsap.to(window, { scrollTo: { y: 0, autoKill: true }, duration: 1.1, ease: 'power3.inOut' });
    });
  }

  if (!footer || typeof ScrollTrigger === 'undefined') return;

  /* Footer entrance */
  ScrollTrigger.create({
    trigger: footer,
    start: 'top 92%',
    once: true,
    onEnter() {
      gsap.to(footer, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });

      const cols = footer.querySelectorAll('.footer-brand-block, .footer-col, .footer-metrics');
      gsap.fromTo(cols,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', stagger: 0.08, delay: 0.15 }
      );
    },
  });
})();
