'use strict';
(function () {
  const AUTOPLAY_MS = 4200;
  let portal = null;
  let items = [];
  let index = 0;
  let timer = null;
  let progressTimer = null;
  let autoEnabled = false;

  const el = {};

  function build() {
    if (portal) return;
    portal = document.createElement('div');
    portal.className = 'slideshow-portal';
    portal.setAttribute('role', 'dialog');
    portal.setAttribute('aria-modal', 'true');
    portal.innerHTML =
      '<div class="slideshow-portal__top">' +
      '  <div class="slideshow-portal__counter"><b>0</b> / <span>0</span></div>' +
      '  <button type="button" class="slideshow-portal__close" aria-label="بستن اسلایدشو"><i class="fa-solid fa-xmark"></i></button>' +
      '</div>' +
      '<div class="slideshow-portal__stage">' +
      '  <div class="slideshow-portal__progress"><b></b></div>' +
      '  <button type="button" class="slideshow-portal__nav slideshow-portal__nav--prev" aria-label="قبلی"><i class="fa-solid fa-chevron-right"></i></button>' +
      '  <img class="slideshow-portal__img" src="" alt="">' +
      '  <button type="button" class="slideshow-portal__nav slideshow-portal__nav--next" aria-label="بعدی"><i class="fa-solid fa-chevron-left"></i></button>' +
      '</div>' +
      '<div class="slideshow-portal__caption"><h3></h3><p></p></div>' +
      '<div class="slideshow-portal__thumbs" aria-label="تصاویر"></div>';
    document.body.appendChild(portal);

    el.counter = portal.querySelector('.slideshow-portal__counter');
    el.counterB = el.counter.querySelector('b');
    el.counterTotal = el.counter.querySelector('span');
    el.close = portal.querySelector('.slideshow-portal__close');
    el.img = portal.querySelector('.slideshow-portal__img');
    el.stage = portal.querySelector('.slideshow-portal__stage');
    el.capH = portal.querySelector('.slideshow-portal__caption h3');
    el.capP = portal.querySelector('.slideshow-portal__caption p');
    el.thumbs = portal.querySelector('.slideshow-portal__thumbs');
    el.progress = portal.querySelector('.slideshow-portal__progress b');
    el.prev = portal.querySelector('.slideshow-portal__nav--prev');
    el.next = portal.querySelector('.slideshow-portal__nav--next');

    el.close.addEventListener('click', close);
    el.prev.addEventListener('click', () => { go(index - 1); restartAuto(); });
    el.next.addEventListener('click', () => { go(index + 1); restartAuto(); });
    portal.addEventListener('click', (e) => {
      if (e.target === portal || e.target === el.stage) close();
    });
    document.addEventListener('keydown', (e) => {
      if (!portal.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') { go(index - 1); restartAuto(); }
      if (e.key === 'ArrowLeft') { go(index + 1); restartAuto(); }
    });
  }

  function stopAuto() {
    if (timer) clearInterval(timer);
    if (progressTimer) clearInterval(progressTimer);
    timer = progressTimer = null;
    el.progress.style.width = '0%';
  }

  function startAuto() {
    stopAuto();
    if (!autoEnabled || items.length < 2) return;
    const step = () => { el.progress.style.width = '0%'; go(index + 1); };
    timer = setInterval(step, AUTOPLAY_MS);
    progressTimer = setInterval(() => {
      const w = el.progress.style.width || '0%';
      const p = parseFloat(w) + (100 / (AUTOPLAY_MS / 100));
      el.progress.style.width = (p > 100 ? 100 : p) + '%';
    }, 100);
  }

  function restartAuto() {
    if (!autoEnabled) return;
    stopAuto();
    startAuto();
  }

  function drawThumbs() {
    el.thumbs.innerHTML = '';
    items.forEach((it, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'تصویر ' + (i + 1));
      const im = document.createElement('img');
      im.src = it.src;
      im.alt = it.title || '';
      im.loading = 'lazy';
      b.appendChild(im);
      b.addEventListener('click', () => { go(i); restartAuto(); });
      if (i === index) b.classList.add('active');
      el.thumbs.appendChild(b);
    });
  }

  function go(i) {
    if (!items.length) return;
    index = (i + items.length) % items.length;
    const it = items[index];
    el.img.classList.remove('show');
    setTimeout(() => {
      el.img.src = it.src;
      el.img.alt = it.title || '';
      el.img.classList.add('show');
    }, 60);
    el.counterB.textContent = String(index + 1).padStart(2, '0');
    el.counterTotal.textContent = String(items.length).padStart(2, '0');
    el.capH.textContent = it.title || '';
    el.capP.textContent = it.caption || '';
    Array.from(el.thumbs.children).forEach((b, bi) => b.classList.toggle('active', bi === index));
  }

  function close() {
    stopAuto();
    portal.classList.remove('open');
    portal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  window.ArcbesSlideshow = {
    open(list, startIndex, autoplay) {
      build();
      items = list || [];
      if (!items.length) return;
      index = Math.max(0, (typeof startIndex === 'number' ? startIndex : 0));
      autoEnabled = autoplay !== false && items.length > 1;
      drawThumbs();
      go(index);
      portal.classList.add('open');
      portal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      startAuto();
      el.close.focus();
    },
    close
  };
})();