/* ==========================================================================
   Hero — tarmoq topologiyasi animatsiyasi (canvas)
   Faqat #hero-network mavjud sahifada ishga tushadi (hozircha bosh sahifa).
   prefers-reduced-motion hurmat qilinadi: harakatsiz, bitta statik kadr.
   ========================================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('hero-network');
  if (!canvas || !canvas.getContext) return;

  var hero = canvas.closest('.hero');
  if (!hero) return;

  var ctx = canvas.getContext('2d');
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var LINK_DIST = 150;
  var width = 0;
  var height = 0;
  var nodes = [];
  var raf = null;

  function seedNodes() {
    var count = Math.max(14, Math.min(42, Math.round((width * height) / 26000)));
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() < 0.15 ? 2.6 : 1.6
      });
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    for (var a = 0; a < nodes.length; a++) {
      for (var b = a + 1; b < nodes.length; b++) {
        var dx = nodes[a].x - nodes[b].x;
        var dy = nodes[a].y - nodes[b].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.strokeStyle = 'rgba(31, 208, 138, ' + ((1 - dist / LINK_DIST) * 0.35).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[a].x, nodes[a].y);
          ctx.lineTo(nodes[b].x, nodes[b].y);
          ctx.stroke();
        }
      }
    }

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99, 230, 180, 0.85)';
      ctx.fill();
    }
  }

  function tick() {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    }
    render();
    raf = requestAnimationFrame(tick);
  }

  function resize() {
    var rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * DPR;
    canvas.height = height * DPR;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    seedNodes();
    render();
  }

  function start() {
    if (raf || reduceMotion) return;
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });

  resize();
  start();
})();
