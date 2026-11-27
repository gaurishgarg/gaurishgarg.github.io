/* Smooth scrolling for links that point to somewhere on the same page (menu items, "Find Me Online", back to top).
   Plain JavaScript, no libraries. It animates the scroll itself, so it also works where the browser's own smooth scrolling is
   switched off (for example Windows with "Show animations" turned off). */
(function () {
  var RESPECT_REDUCED_MOTION = false;           /* true = people who asked their system for reduced motion get a direct jump instead */
  var root = document.documentElement, running = null;

  function reduced() {
    return RESPECT_REDUCED_MOTION && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function stickyOffset() {                      /* the menu bar stays at the top while scrolling, so stop just below it */
    var h = document.querySelector('header.sticky-top, header.fixed-top');
    return h ? h.getBoundingClientRect().height : 0;
  }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function scrollToY(y, done) {
    if (running) cancelAnimationFrame(running);
    var start = window.pageYOffset, max = Math.max(0, root.scrollHeight - window.innerHeight);
    y = Math.max(0, Math.min(y, max));
    var dist = y - start;
    if (Math.abs(dist) < 2 || reduced()) { window.scrollTo(0, y); if (done) done(); return; }
    var dur = Math.min(900, Math.max(450, Math.abs(dist) * 0.35)), t0 = null;
    var prev = root.style.scrollBehavior; root.style.scrollBehavior = 'auto';   /* the page CSS also smooths scrolling: do not stack the two */
    function stop() { cancelAnimationFrame(running); running = null; root.style.scrollBehavior = prev; cleanup(); }
    function cleanup() { ['wheel', 'touchstart', 'keydown'].forEach(function (e) { window.removeEventListener(e, stop); }); }
    ['wheel', 'touchstart', 'keydown'].forEach(function (e) { window.addEventListener(e, stop, { passive: true }); });   /* the visitor takes over: stop */
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      window.scrollTo(0, start + dist * ease(p));
      if (p < 1) { running = requestAnimationFrame(step); }
      else { running = null; root.style.scrollBehavior = prev; cleanup(); if (done) done(); }
    }
    running = requestAnimationFrame(step);
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || a.hasAttribute('data-bs-toggle') || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var url;
    try { url = new URL(a.getAttribute('href'), location.href); } catch (err) { return; }
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash && a.getAttribute('href') !== '#') return;
    var id = decodeURIComponent(url.hash.slice(1)), target = null;
    if (id) { target = document.getElementById(id); if (!target) return; }     /* unknown target: leave it to the browser */
    e.preventDefault();
    var y = target ? target.getBoundingClientRect().top + window.pageYOffset - stickyOffset() : 0;
    scrollToY(y, function () {
      if (target) {
        if (history.pushState && location.hash !== url.hash) history.pushState(null, '', url.hash);
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });
})();
