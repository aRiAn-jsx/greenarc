/* ============================================================
   آرک‌بس — اسکریپت مخصوص صفحه اصلی
   Hero Swiper / شمارنده‌ها / فیلتر گالری
   Vanilla JS — V2.0  (uses globals from layout.js: $, $$, prefersReducedMotion)
   ============================================================ */
'use strict';

/* ---------- 1. Hero slider ---------- */
let heroSwiper = null;
if (typeof Swiper !== 'undefined' && $('#heroSwiper')) {
  heroSwiper = new Swiper('#heroSwiper', {
    effect: 'fade',
    fadeEffect: { crossFade: true },
    speed: 1000,
    loop: true,
    autoplay: { delay: 6200, disableOnInteraction: false },
    pagination: { el: '.hero-pagination', clickable: true },
    navigation: { prevEl: '.hero-btn--prev', nextEl: '.hero-btn--next' },
  });

  const animateActiveSlide = () => {
    const active = heroSwiper.slides[heroSwiper.activeIndex];
    if (!active) return;
    const content = active.querySelector('.hero-slide__content');
    if (!content) return;
    content.classList.remove('is-animating');
    void content.offsetWidth;
    content.classList.add('is-animating');
  };
  heroSwiper.on('slideChangeTransitionStart', animateActiveSlide);
  animateActiveSlide();
} else {
  document.documentElement.classList.add('no-swiper');
}

/* ---------- 2. Animated counters ---------- */
const formatFa = (n) => n.toLocaleString('fa-IR');
const animateCount = (el) => {
  const target = parseInt(el.dataset.target, 10) || 0;
  const suffix = el.dataset.suffix || '';
  if (prefersReducedMotion) {
    el.textContent = formatFa(target) + suffix;
    return;
  }
  const duration = 1800;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = formatFa(Math.round(target * eased)) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
$$('.stat__num').forEach((el) => counterObserver.observe(el));