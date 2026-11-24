/* keep --nav-h equal to the real height of the sticky menu (it changes between laptop and phone) */
(function () {
  var header = document.querySelector('header.d2c_navbar');
  if (!header) return;
  function set() { document.documentElement.style.setProperty('--nav-h', header.offsetHeight + 'px'); }
  set();
  window.addEventListener('load', set);
  window.addEventListener('resize', set);
})();
