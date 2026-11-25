/* keep --nav-h equal to the real height of the sticky menu (it changes between laptop and phone) */
(function () {
  var header = document.querySelector('header.d2c_navbar');
  if (!header) return;
  function set() { document.documentElement.style.setProperty('--nav-h', header.offsetHeight + 'px'); }
  set();
  window.addEventListener('load', set);
  window.addEventListener('resize', set);
})();

/* certificates open in an on-site viewer; without JavaScript the link simply opens the file */
(function () {
  var box = document.getElementById('certViewer');
  if (!box) return;
  var body = document.getElementById('certViewerBody'), title = document.getElementById('certViewerTitle'), dl = document.getElementById('certViewerDl');
  var lastFocus = null;
  function close() { box.hidden = true; body.innerHTML = ''; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  function open(a) {
    lastFocus = a; body.innerHTML = '';
    var src = a.getAttribute('href');
    if (a.dataset.cert === 'pdf') {
      var f = document.createElement('iframe'); f.src = src + '#view=FitH'; f.title = a.dataset.title || 'Certificate'; body.appendChild(f);
    } else {
      var im = document.createElement('img'); im.src = src; im.alt = a.dataset.title || 'Certificate'; body.appendChild(im);
    }
    title.textContent = a.dataset.title || 'Certificate'; dl.href = src;
    box.hidden = false; document.body.style.overflow = 'hidden';
    document.getElementById('certViewerClose').focus();
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.cert-link[data-cert]');
    if (a) { e.preventDefault(); open(a); return; }
    if (e.target === box || e.target.id === 'certViewerClose') close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) close(); });
})();
