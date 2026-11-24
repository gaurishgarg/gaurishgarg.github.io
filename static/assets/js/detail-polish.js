/* Detail pages: images are laid out with object-fit: contain inside a fixed-height box, which can leave empty
   space around the picture.  Shrink each box to the picture itself so the rounded corners sit on the picture. */
(function () {
  function fit(img) {
    if (img.closest('.fold-gallery')) return;                       // galleries are sized by CSS (one row of up to 4)
    if (!img.naturalWidth || getComputedStyle(img).objectFit !== 'contain') return;
    if (img.dataset.w0 === undefined) { img.dataset.w0 = img.style.width; img.dataset.h0 = img.style.height; }
    img.style.width = img.dataset.w0; img.style.height = img.dataset.h0;
    var w = img.clientWidth, h = img.clientHeight, r = img.naturalWidth / img.naturalHeight;
    if (!w || !h) return;
    if (w / h > r * 1.02) img.style.width = (h * r) + 'px';          // empty space left/right
    else if (w / h < r / 1.02) img.style.height = (w / r) + 'px';    // empty space above/below
  }
  function all() { Array.prototype.forEach.call(document.querySelectorAll('body.detail-page img'), fit); }
  Array.prototype.forEach.call(document.querySelectorAll('body.detail-page img'), function (img) {
    if (img.complete) fit(img); else img.addEventListener('load', function () { fit(img); });
  });
  window.__detailFit = all;
  window.addEventListener('load', all);
  var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(all, 120); });
})();

/* Card layout for project / publication pages.
   Each "heading + content" block becomes a card in a mixed grid:
   - short text sections -> 3 cards per row, showing a few lines with "Read more" (all the same size)
   - image galleries and sections that already contain their own cards -> full-width, collapsible, open by default */
(function () {
  var sections = Array.prototype.filter.call(document.querySelectorAll('body.detail-page section'), function (s) {
    return s.querySelector(':scope > .container > h3:first-child');
  });
  if (!sections.length) return;
  var PEEK_LINES = 5, uid = 0, cards = [];
  var chev = '<span class="fold-chev" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 6l5 5 5-5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';

  function h3text(h) { return (h.firstChild && h.firstChild.nodeType === 3 ? h.firstChild.textContent : h.textContent).trim(); }

  function makeCard(kind, title, nodes, extra) {
    var card = document.createElement('div'), head = document.createElement('div'), body = document.createElement('div'),
        inner = document.createElement('div'), h = document.createElement('h3');
    card.className = 'fold-card fold-' + kind + (extra ? ' ' + extra : '');
    head.className = 'fold-card-head'; h.textContent = title; head.appendChild(h);
    body.className = 'fold-card-body'; body.id = 'fold-' + (++uid); inner.className = 'fold-card-inner';
    nodes.forEach(function (n) { inner.appendChild(n); });
    body.appendChild(inner); card.appendChild(head); card.appendChild(body);
    var c = { el: card, head: head, body: body, inner: inner, kind: kind, open: kind !== 'text', toggles: false, timer: 0, more: null };
    cards.push(c); return c;
  }

  function peekPx(c) {
    var cs = getComputedStyle(c.inner), lh = parseFloat(cs.lineHeight);
    if (!lh) lh = parseFloat(cs.fontSize) * 1.65;
    return Math.round(lh * PEEK_LINES);
  }
  function closedPx(c) { return c.kind === 'text' ? peekPx(c) : 0; }

  function render(c, animate) {
    var b = c.body, target;
    clearTimeout(c.timer);
    c.el.classList.toggle('is-open', c.open);
    if (c.head.getAttribute('role')) c.head.setAttribute('aria-expanded', c.open ? 'true' : 'false');
    if (c.more) c.more.firstChild.textContent = c.open ? 'Show less' : 'Read more';
    if (!animate) { b.style.height = c.open ? 'auto' : closedPx(c) + 'px'; return; }
    if (c.open) {
      b.style.height = b.offsetHeight + 'px';
      void b.offsetHeight;
      b.style.height = c.inner.scrollHeight + 'px';
      c.timer = setTimeout(function () { b.style.height = 'auto'; if (window.__detailFit) window.__detailFit(); }, 450);
    } else {
      b.style.height = b.offsetHeight + 'px';
      void b.offsetHeight;
      b.style.height = closedPx(c) + 'px';
    }
  }
  function toggle(c) { c.open = !c.open; render(c, true); }

  function enable(c) {
    c.toggles = true;
    c.head.setAttribute('role', 'button'); c.head.setAttribute('tabindex', '0'); c.head.setAttribute('aria-controls', c.body.id);
    if (c.kind !== 'text') c.head.insertAdjacentHTML('beforeend', chev);
    c.head.addEventListener('click', function () { toggle(c); });
    c.head.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(c); } });
    if (c.kind === 'text') {
      var m = document.createElement('button'); m.type = 'button'; m.className = 'fold-more';
      m.appendChild(document.createTextNode('Read more')); m.insertAdjacentHTML('beforeend', chev);
      m.setAttribute('aria-controls', c.body.id); m.addEventListener('click', function () { toggle(c); });
      c.more = m; c.el.appendChild(m);
    }
  }

  /* ---- group consecutive sections that share a parent, one grid per group ---- */
  var groups = [], cur = null;
  sections.forEach(function (s) {
    if (cur && cur.last.nextElementSibling === s) { cur.items.push(s); cur.last = s; }
    else { cur = { items: [s], last: s, parent: s.parentNode }; groups.push(cur); }
  });

  groups.forEach(function (g) {
    var grid = document.createElement('div');
    grid.className = 'container fold-grid d2c_service_wrapper';
    g.parent.insertBefore(grid, g.items[0]);
    g.items.forEach(function (s) {
      var container = s.querySelector(':scope > .container'), h = container.firstElementChild, title = h3text(h);
      var rest = Array.prototype.slice.call(container.childNodes).filter(function (n) { return n !== h; });
      var media = container.querySelectorAll('img, iframe, model-viewer, video').length;
      var allCards = container.querySelectorAll('.d2c_card_wrapper').length;
      var topCard = null;
      Array.prototype.forEach.call(container.children, function (e) {
        Array.prototype.forEach.call(e.children || [], function (x) { if (x.classList.contains('d2c_card_wrapper') && !topCard) topCard = x; });
        if (e !== h && e.classList && e.classList.contains('d2c_card_wrapper') && !topCard) topCard = e;
      });
      var c;
      if (allCards >= 2 && !media && !container.querySelector('a')) {      // e.g. two small cards -> one grid card each
        var subs = Array.prototype.slice.call(container.querySelectorAll('.d2c_card_wrapper'));
        subs.forEach(function (sc, i) {
          var t = sc.querySelector('h4, h5'), ttl = t ? t.textContent.trim() : (subs.length > 1 ? title + ' \u00b7 ' + (i + 1) : title);
          if (t) t.parentNode.removeChild(t);
          var cc = makeCard('text', ttl, Array.prototype.slice.call(sc.childNodes), '');
          grid.appendChild(cc.el);
        });
        s.parentNode.removeChild(s);
        return;
      }
      if (allCards === 1 && topCard && !media) {                         // plain text section -> card
                c = makeCard('text', title, Array.prototype.slice.call(topCard.childNodes), '');
      } else if (allCards === 0 && media >= 2) {                         // image gallery
        c = makeCard('gallery', title, rest, 'wide');
        var grow = c.inner.querySelector(':scope > .row'), gn = grow ? grow.children.length : 0;
        c.el.style.setProperty('--cols', Math.min(Math.max(gn, 1), 4));
      } else if (allCards === 0 && media === 1) {                        // single figure
        c = makeCard('plain', title, rest, '');
      } else {                                                          // already made of cards (or mixed)
        c = makeCard('bare', title, rest, 'wide');
      }
      grid.appendChild(c.el);
      s.parentNode.removeChild(s);
    });
  });

  /* decide which text cards actually need "Read more" (the rest just show everything) */
  function settle() {
    cards.forEach(function (c) {
      if (c.kind === 'text') {
        var need = c.inner.scrollHeight > peekPx(c) + 8;
        if (need && !c.toggles) { enable(c); render(c, false); }
        else if (!need && !c.toggles) { c.open = true; c.el.classList.add('is-static'); c.body.style.height = 'auto'; }
        else if (c.toggles && !c.open) { c.body.style.height = peekPx(c) + 'px'; }
      } else if (c.kind === 'plain') {                                    // single picture: same card, nothing to fold
        c.open = true; c.el.classList.add('is-static'); c.body.style.height = 'auto';
      } else if (!c.toggles) { enable(c); render(c, false); }
    });
    if (window.__detailFit) window.__detailFit();
  }
  settle();
  window.addEventListener('load', settle);
  var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(settle, 150); });
})();
