/* ============================================================
   آرک‌بس | معماری سبز و انرژی پاک — اسکریپت اصلی
   Vanilla JavaScript (ES6+) — V1.0
   ============================================================ */
'use strict';

/* ---------- Helpers ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. Preloader ---------- */
const preloader = $('#preloader');
window.addEventListener('load', () => {
  setTimeout(() => preloader.classList.add('done'), 400);
});
setTimeout(() => preloader.classList.add('done'), 4000);

/* ---------- 2. Header & scroll-top: scroll state ---------- */
const header = $('#siteHeader');
const scrollTopBtn = $('#scrollTop');
const onScrollHeader = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 30);
  if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
};
window.addEventListener('scroll', onScrollHeader, { passive: true });
onScrollHeader();

/* ---------- 3. Mobile navigation ---------- */
const hamburger = $('#hamburger');
const siteNav = $('#siteNav');

const closeNav = () => {
  siteNav.classList.remove('open');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
};

hamburger.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

/* Dropdown accordion in mobile */
$$('.dropdown-trigger', siteNav).forEach((trigger) => {
  trigger.addEventListener('click', (e) => {
    if (window.innerWidth > 992) return;
    e.preventDefault();
    trigger.closest('.has-dropdown').classList.toggle('open');
  });
});

/* Close drawer when a link is tapped */
$$('.site-nav a', siteNav).forEach((link) => {
  link.addEventListener('click', () => {
    if (!link.closest('.mega-menu')) closeNav();
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeNav(); closeSearch(); }
});

/* ---------- 4. Hero slider (Swiper) — با fallback اگر CDN در دسترس نبود ---------- */
let heroSwiper = null;
if (typeof Swiper !== 'undefined') {
  heroSwiper = new Swiper('#heroSwiper', {
    effect: 'fade',
    fadeEffect: { crossFade: true },
    speed: 1000,
    loop: true,
    autoplay: { delay: 6000, disableOnInteraction: false },
    pagination: { el: '.hero-pagination', clickable: true },
    navigation: {
      prevEl: '.hero-btn--prev',
      nextEl: '.hero-btn--next',
    },
    allowTouchMove: true,
  });

  /* Re-trigger content entrance animation on slide change */
  const animateActiveSlide = () => {
    const active = heroSwiper.slides[heroSwiper.activeIndex];
    if (!active) return;
    const content = active.querySelector('.hero-slide__content');
    if (!content) return;
    content.classList.remove('is-animating');
    void content.offsetWidth; /* reflow to restart animation */
    content.classList.add('is-animating');
  };
  heroSwiper.on('slideChangeTransitionStart', animateActiveSlide);
  animateActiveSlide();
} else {
  /* اگر Swiper لود نشد فقط اسلاید اول نمایش داده شود */
  document.documentElement.classList.add('no-swiper');
}

/* ---------- 5. AOS (scroll animations) — با fallback ---------- */
if (!prefersReducedMotion && typeof AOS !== 'undefined') {
  try {
    AOS.init({
      duration: 750,
      easing: 'ease-out-cubic',
      once: true,
      offset: 90,
    });
    document.documentElement.classList.remove('aos-not-ready');
  } catch (err) {
    document.documentElement.classList.remove('aos-not-ready');
  }
} else {
  /* AOS در دسترس نیست (یا کاربر حرکت کمتری می‌خواهد) → عناصر همیشه نمایش داده شوند */
  document.documentElement.classList.remove('aos-not-ready');
  $$('[data-aos]').forEach((el) => el.removeAttribute('data-aos'));
}

/* ---------- 6. Animated counters ---------- */
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
}, { threshold: 0.5 });
$$('.stat__num').forEach((el) => counterObserver.observe(el));

/* ---------- 7. Gallery filter ---------- */
const filterBtns = $$('.filter-btn');
const projectCards = $$('.project-card');
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    projectCards.forEach((card) => {
      const show = filter === 'all' || card.dataset.cat === filter;
      card.classList.toggle('is-hidden', !show);
    });
  });
});

/* ---------- 8. Contact form ---------- */
const contactForm = $('#contactForm');
if (contactForm) {
  const btnSubmit = $('.btn', contactForm);
  const successBox = $('.form-success', contactForm);

  const setInvalid = (field, invalid) => field.classList.toggle('invalid', invalid);

  const validate = () => {
    let ok = true;
    $$('.form-field', contactForm).forEach((field) => {
      const input = $('input, textarea', field);
      const isEmail = input.type === 'email';
      const empty = !input.value.trim();
      const badEmail = isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      const invalid = empty || badEmail;
      setInvalid(field, invalid);
      if (invalid) ok = false;
    });
    return ok;
  };

  $$('.form-field input, .form-field textarea', contactForm).forEach((input) => {
    input.addEventListener('input', () => input.closest('.form-field').classList.remove('invalid'));
    input.addEventListener('blur', () => validate());
  });

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;
    btnSubmit.classList.add('is-loading');
    successBox.hidden = true;
    /* شبیه‌سازی ارسال به سرور (POST /api/contact/send) */
    setTimeout(() => {
      btnSubmit.classList.remove('is-loading');
      successBox.hidden = false;
      contactForm.reset();
      setTimeout(() => { successBox.hidden = true; }, 6000);
    }, 1400);
  });
}

/* ---------- 9. Search overlay ---------- */
const searchOverlay = $('#searchOverlay');
const searchInput = $('#searchInput');
const searchResults = $('#searchResults');

/* داده‌های جستجو — در نسخه نهایی از GET /api/search استفاده می‌شود */
const searchData = [
  { icon: 'fa-building', title: 'ویلای آفتاب', cat: 'نمونه‌کار — مسکونی', href: '#works' },
  { icon: 'fa-building', title: 'برج بهار', cat: 'نمونه‌کار — اداری', href: '#works' },
  { icon: 'fa-building', title: 'دفتر مرکزی سپید', cat: 'نمونه‌کار — پایدار', href: '#works' },
  { icon: 'fa-building', title: 'پاساژ ارغوان', cat: 'نمونه‌کار — تجاری', href: '#works' },
  { icon: 'fa-newspaper', title: 'آینده معماری خورشیدی؛ از سقف تا نما', cat: 'مقاله — انرژی', href: '#blog' },
  { icon: 'fa-newspaper', title: 'مسکن پایدار؛ طراحی برای نسل‌های بعد', cat: 'مقاله — مسکونی', href: '#blog' },
  { icon: 'fa-newspaper', title: 'مصالح سبز؛ انتخاب هوشمندانه در پروژه‌ها', cat: 'مقاله — مصالح', href: '#blog' },
  { icon: 'fa-seedling', title: 'معماری پایدار و انرژی سبز', cat: 'بخش سایت', href: '#services' },
];

let highlightIndex = -1;
const ESC = 'Escape';

const openSearch = () => {
  searchOverlay.classList.add('open');
  searchOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => searchInput.focus(), 60);
};
const closeSearch = () => {
  searchOverlay.classList.remove('open');
  searchOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  searchInput.value = '';
  highlightIndex = -1;
};

$('#searchOpen').addEventListener('click', openSearch);
$('#searchClose').addEventListener('click', closeSearch);

const renderResults = (list) => {
  if (!list.length) {
    searchResults.innerHTML = '<div class="search-empty">نتیجه‌ای یافت نشد؛ عبارت دیگری را امتحان کنید.</div>';
    highlightIndex = -1;
    return;
  }
  searchResults.innerHTML = '';
  list.forEach((item, i) => {
    const a = document.createElement('a');
    a.className = 'search-result';
    a.href = item.href;
    a.dataset.index = i;
    a.innerHTML = `<i class="fa-solid ${item.icon}"></i><span>${item.title}</span><span class="search-result__cat">${item.cat}</span>`;
    searchResults.appendChild(a);
  });
  highlightIndex = 0;
  applyHighlight();
};

const applyHighlight = () => {
  $$('.search-result', searchResults).forEach((el, i) => {
    el.classList.toggle('highlighted', i === highlightIndex);
  });
  const active = $('.search-result.highlighted', searchResults);
  if (active) active.scrollIntoView({ block: 'nearest' });
};

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim();
  if (!q) { searchResults.innerHTML = ''; highlightIndex = -1; return; }
  const filtered = searchData.filter((item) => item.title.includes(q));
  renderResults(filtered);
});

searchResults.addEventListener('click', (e) => {
  const link = e.target.closest('.search-result');
  if (link) { closeSearch(); }
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key !== ESC) return;
  closeSearch();
  e.stopPropagation();
});

/* ---------- 10. Scroll to top ---------- */
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

/* ---------- 11. Scrollspy: active nav link ---------- */
const sections = $$('main section[id]');
const navLinks = $$('.site-nav__list > li > a[href^="#"]');
const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach((sec) => spyObserver.observe(sec));
