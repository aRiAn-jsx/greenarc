/* ============================================================
   آرک‌بس — لایه مشترک همه صفحات
   هدر / فوتر / جستجو / چت‌بات / اسکرول‌تاپ / AOS / آکاردئون
   Vanilla JS — V2.0
   ============================================================ */
'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const BRAND = {
  name: 'آرک‌بس',
  phone: '۰۲۱-۸۸۷۷۶۵۴۳',
  phoneDir: 'tel:+982188776543',
  email: 'info@arcbes.ir',
  address: 'تهران، خیابان ولیعصر، بالاتر از پارک‌وی، کوچه سبز، پلاک ۱۲',
};

const NAV_ITEMS = [
  { href: 'index.html', label: 'خانه', icon: 'fa-house' },
  { href: 'blog.html', label: 'مقالات', icon: 'fa-newspaper' },
  { href: 'about.html', label: 'درباره ما', icon: 'fa-users' },
  { href: 'contact.html', label: 'ارتباط با ما', icon: 'fa-headset' },
];

const fullPath = location.pathname;
const path = location.pathname.split('/').pop() || 'index.html';
const isBlogPath = fullPath.includes('/blog/') || fullPath.includes('/blog') && path !== 'blog.html';

/* ---------- Logo SVG ---------- */
const LOGO_SVG = `<svg viewBox="0 0 48 48" aria-hidden="true">
  <defs><linearGradient id="logog" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#2ECC71"/><stop offset="1" stop-color="#1ABC9C"/>
  </linearGradient></defs>
  <rect width="48" height="48" rx="13" fill="url(#logog)"/>
  <path d="M13 34h7V18h-7zM20.5 34h7V11h-7zM28 34h7V24h-7z" fill="#fff"/>
  <path d="M36.5 14c-4.4.6-6.4 3-6.9 6.9 3.9-.5 6.3-2.5 6.9-6.9z" fill="#F1C40F"/>
</svg>`;

/* ---------- Header ---------- */
const renderNav = () => NAV_ITEMS.map((item) => {
  const isActive = path === item.href || (item.href === 'blog.html' && fullPath.includes('/blog'));
  if (item.children) {
    return `<li class="has-dropdown">
      <a href="${item.href}" class="dropdown-trigger ${isActive ? 'active' : ''}">${item.label} <i class="fa-solid fa-chevron-down"></i></a>
      <div class="mega-menu">
        <div class="mega-menu__col">${item.children.slice(0, 3).map(lnk).join('')}</div>
        <div class="mega-menu__col">${item.children.slice(3).map(lnk).join('')}</div>
      </div>
    </li>`;
  }
  return `<li><a href="${item.href}" class="${isActive ? 'active' : ''}">${item.label}</a></li>`;
}).join('');

const lnk = (l) => `<a href="${l.href}"><i class="fa-solid ${l.icon}"></i><span><strong>${l.title}</strong><small>${l.desc}</small></span></a>`;

const renderHeader = () => {
  const mount = $('#headerMount');
  if (!mount) return;
  mount.innerHTML = `
  <header class="site-header" id="siteHeader">
    <div class="container header-inner">
      <a href="index.html" class="logo" aria-label="آرک‌بس - صفحه اصلی">
        ${LOGO_SVG}
        <span class="logo__text">آرک<span>بس</span></span>
      </a>
      <nav class="site-nav" id="siteNav" aria-label="منوی اصلی">
        <ul class="site-nav__list">${renderNav()}</ul>
        <div class="site-nav__mobile-cta">
          <a href="login.html" class="btn btn--primary"><i class="fa-solid fa-user-plus"></i> ورود / ثبت‌نام</a>
        </div>
      </nav>
      <div class="header-actions">
        <button class="icon-btn" id="searchOpen" aria-label="جستجو"><i class="fa-solid fa-magnifying-glass"></i></button>
        <a href="login.html" class="btn btn--primary btn--sm header-actions__login"><i class="fa-solid fa-user-plus"></i> ورود / ثبت‌نام</a>
        <a href="admin/index.html" class="icon-btn header-actions__admin" aria-label="پنل مدیریت" title="پنل مدیریت"><i class="fa-solid fa-gauge-high"></i></a>
        <button class="hamburger" id="hamburger" aria-label="باز کردن منو" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>`;
  bindHeader();
};

const bindHeader = () => {
  const header = $('#siteHeader');
  const scrollTopBtn = $('#scrollTop');

  const onScroll = () => {
    const hero = $('#home') || $('.page-hero');
    const pastHero = hero ? window.scrollY > hero.offsetHeight - 80 : window.scrollY > 30;
    header.classList.toggle('is-scrolled', pastHero);
    if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const hamburger = $('#hamburger');
  const siteNav = $('#siteNav');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }
  $$('.dropdown-trigger', siteNav).forEach((tr) => {
    tr.addEventListener('click', (e) => {
      if (window.innerWidth <= 992) {
        e.preventDefault();
        tr.closest('.has-dropdown').classList.toggle('open');
      }
    });
  });
  $$('.site-nav a', siteNav).forEach((a) => {
    a.addEventListener('click', () => { if (!a.closest('.mega-menu')) closeNav(); });
  });
  const closeNav = () => {
    if (!siteNav) return;
    siteNav.classList.remove('open');
    if (hamburger) { hamburger.classList.remove('active'); hamburger.setAttribute('aria-expanded', 'false'); }
    document.body.style.overflow = '';
  };
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeNav(); closeSearch(); } });
};

/* ---------- Search overlay ---------- */
const SEARCH_DATA = [
  { icon: 'fa-computer', title: 'شبیه‌سازی انرژی ساختمان', cat: 'خدمت', href: 'services.html#simulation' },
  { icon: 'fa-sun', title: 'روشنایی طبیعی و آسایش حرارتی', cat: 'خدمت', href: 'services.html#lighting' },
  { icon: 'fa-wind', title: 'تحلیل جریان هوا (تهویه طبیعی)', cat: 'خدمت', href: 'services.html#airflow' },
  { icon: 'fa-file-shield', title: 'مشاوره مبحث ۱۹ و رده‌بندی انرژی', cat: 'خدمت', href: 'services.html#mabhase19' },
  { icon: 'fa-graduation-cap', title: 'آموزش دیزاین‌بیلدر و هانی‌بی', cat: 'خدمت', href: 'services.html#training' },
  { icon: 'fa-video', title: 'وبینار معماری پایدار و شبیه‌سازی انرژی', cat: 'وبینار', href: 'webinar.html' },
  { icon: 'fa-newspaper', title: 'روش نیاز انرژی و روش کارایی انرژی در مبحث ۱۹', cat: 'مقاله', href: 'blog/energy-methods-mabhase19.html' },
  { icon: 'fa-newspaper', title: 'چک درستی نتایج شبیه‌سازی انرژی', cat: 'مقاله', href: 'blog/validation-energy-simulation.html' },
  { icon: 'fa-newspaper', title: 'دسته‌بندی اقلیمی ویرایش پنجم مبحث ۱۹', cat: 'مقاله', href: 'blog/climate-classification-mabhase19.html' },
  { icon: 'fa-building', title: 'ویلای آفتاب — نمای مسکونی پایدار', cat: 'نمونه‌کار', href: 'portfolio.html' },
  { icon: 'fa-users', title: 'درباره آرک‌بس', cat: 'صفحه', href: 'about.html' },
  { icon: 'fa-headset', title: 'تماس و مشاوره رایگان', cat: 'صفحه', href: 'contact.html' },
];

let highlightIndex = -1;
let searchOpen = false;

const renderSearch = () => {
  const mount = $('#searchMount');
  if (!mount) return;
  mount.innerHTML = `
  <div class="search-overlay" id="searchOverlay" aria-hidden="true">
    <button class="search-overlay__close" id="searchClose" aria-label="بستن جستجو"><i class="fa-solid fa-xmark"></i></button>
    <div class="search-overlay__inner">
      <div class="search-overlay__field">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="search" id="searchInput" placeholder="جستجو در خدمات، مقالات، وبینارها..." autocomplete="off">
      </div>
      <div class="search-overlay__results" id="searchResults"></div>
      <div class="search-overlay__hint">
        <span><i class="fa-solid fa-arrow-up"></i> / <i class="fa-solid fa-arrow-down"></i> جابجایی</span>
        <span><i class="fa-solid fa-arrow-left"></i> انتخاب</span>
        <span><kbd>Esc</kbd> بستن</span>
      </div>
    </div>
  </div>`;
  bindSearch();
};

const bindSearch = () => {
  const overlay = $('#searchOverlay');
  const input = $('#searchInput');
  const results = $('#searchResults');
  if (!overlay) return;

  const openSearch = () => {
    searchOpen = true;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input && input.focus(), 60);
  };
  const closeSearch = () => {
    searchOpen = false;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (input) input.value = '';
    highlightIndex = -1;
  };

  $('#searchOpen') && $('#searchOpen').addEventListener('click', openSearch);
  $('#searchClose') && $('#searchClose').addEventListener('click', closeSearch);

  const applyHighlight = () => {
    $$('.search-result', results).forEach((el, i) => el.classList.toggle('highlighted', i === highlightIndex));
    const active = $('.search-result.highlighted', results);
    if (active) active.scrollIntoView({ block: 'nearest' });
  };

  const render = (list) => {
    if (!list.length) {
      results.innerHTML = '<div class="search-empty">نتیجه‌ای یافت نشد؛ عبارت دیگری را امتحان کنید.</div>';
      highlightIndex = -1;
      return;
    }
    results.innerHTML = '';
    list.forEach((item) => {
      const a = document.createElement('a');
      a.className = 'search-result';
      a.href = item.href;
      a.innerHTML = `<i class="fa-solid ${item.icon}"></i><span>${item.title}</span><span class="search-result__cat">${item.cat}</span>`;
      results.appendChild(a);
    });
    highlightIndex = 0;
    applyHighlight();
  };

  input && input.addEventListener('input', () => {
    const q = input.value.trim();
    if (!q) { results.innerHTML = ''; highlightIndex = -1; return; }
    render(SEARCH_DATA.filter((it) => it.title.includes(q) || it.cat.includes(q)));
  });
  results && results.addEventListener('click', (e) => {
    if (e.target.closest('.search-result')) closeSearch();
  });
  input && input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); closeSearch(); }
  });
};

/* ---------- Chatbot ---------- */
const CHAT_KNOWLEDGE = [
  {
    keys: ['سلام', 'درود', 'hi', 'hello', 'عرض سلام'],
    reply: 'سلام! 👋 به آرک‌بس خوش آمدید. من دستیار هوشمند سایت هستم. درباره‌ی خدمات شبیه‌سازی انرژی، مشاوره مبحث ۱۹، آموزش یا وبینارها می‌توانم راهنمایی‌تان کنم.'
  },
  {
    keys: ['شبیه', 'انرژی', 'سیمولیشن', 'simulation', 'دیزاین'],
    reply: 'خدمت شبیه‌سازی انرژی ساختمان شامل تحلیل مصرف انرژی با نرم‌افزارهای معتبر (مانند دیزاین‌بیلدر و هانی‌بی)، بهینه‌سازی عملکرد حرارتی و کاهش هزینه‌های جاری است. می‌توانید از صفحه خدمات جزئیات کامل را ببینید: services.html#simulation'
  },
  {
    keys: ['مبحث ۱۹', 'مبحث نوزده', 'برچسب', 'رده انرژی', 'قانون'],
    reply: 'مشاوره مبحث ۱۹ مقررات ملی ساختمان شامل احراز رده‌های انرژی، تطابق با آخرین ویرایش قوانین (از جمله دسته‌بندی اقلیمی ویرایش پنجم بر اساس ASHRAE) و اخذ برچسب انرژی است. جزئیات: services.html#mabhase19'
  },
  {
    keys: ['آموزش', 'دوره', 'کلاس', 'یادگیری', 'هانی بی', 'هانی‌بی'],
    reply: 'دوره‌های آموزشی آرک‌بس به صورت حضوری، آنلاین و آفلاین با رویکرد پروژه‌محور برگزار می‌شود: آموزش دیزاین‌بیلدر، هانی‌بی، و تحلیل انرژی. برای ثبت‌نام با ما تماس بگیرید: ۰۲۱-۸۸۷۷۶۵۴۳'
  },
  {
    keys: ['وبینار', 'سمینار', 'کارگاه', 'آنلاین'],
    reply: 'وبینارهای تخصصی آرک‌بس به‌صورت زنده برگزار می‌شوند و شامل گواهی حضور و فایل ضبط‌شده هستند. برنامه جلسات آینده و ثبت‌نام رایگان: webinar.html'
  },
  {
    keys: ['قیمت', 'هزینه', 'تعرفه', 'پول', 'چقدر'],
    reply: 'لطفاً برای دریافت تعرفه دقیق پروژه یا دوره، از فرم مشاوره رایگان استفاده کنید یا با ۰۲۱-۸۸۷۷۶۵۴۳ تماس بگیرید تا کارشناسان ما بر اساس نیاز شما قیمت‌گذاری کنند.'
  },
  {
    keys: ['تماس', 'تلفن', 'شماره', 'آدرس', 'کجا', 'موقعیت'],
    reply: `راه‌های ارتباطی: ☎️ ${BRAND.phone} | ✉️ ${BRAND.email} | 📍 ${BRAND.address} | صفحه تماس: contact.html`
  },
  {
    keys: ['نمونه', 'پروژه', 'کار', 'نمونه‌کار'],
    reply: 'در صفحه نمونه‌کارها می‌توانید پروژه‌های مسکونی، اداری، تجاری و پایدار آرک‌بس را با جزئیات ببینید: portfolio.html'
  },
  {
    keys: ['ورود', 'ثبت', 'حساب', 'عضویت'],
    reply: 'برای ورود یا ثبت‌نام و استفاده از حساب کاربری خود به این صفحه بروید (شماره موبایل + کد یکبارمصرف، با امنیت کامل): login.html'
  },
];

const CHAT_FALLBACK = 'سؤال خوبی بود! برای پاسخ دقیق‌تر، از فرم مشاوره رایگان استفاده کنید یا با کارشناسان ما تماس بگیرید: ۰۲۱-۸۸۷۷۶۵۴۳';

const renderChatbot = () => {
  const mount = $('#chatbotMount');
  if (!mount) return;
  mount.innerHTML = `
  <button class="chatbot-fab" id="chatFab" aria-label="پشتیبانی آنلاین">
    <i class="fa-solid fa-comment-dots"></i>
    <span class="chatbot-fab__ping"></span>
  </button>
  <div class="chatbot" id="chatbot" aria-hidden="true">
    <div class="chatbot__head">
      <div class="chatbot__avatar"><i class="fa-solid fa-leaf"></i></div>
      <div><strong>دستیار آرک‌بس</strong><span class="chatbot__online"><i></i> آنلاین — پاسخ در چند ثانیه</span></div>
      <button id="chatClose" aria-label="بستن چت"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="chatbot__body" id="chatBody"></div>
    <div class="chatbot__chips" id="chatChips"></div>
    <form class="chatbot__input" id="chatForm">
      <input type="text" id="chatText" placeholder="پیام خود را بنویسید..." autocomplete="off" maxlength="300">
      <button type="submit" aria-label="ارسال"><i class="fa-solid fa-paper-plane"></i></button>
    </form>
  </div>`;
  bindChatbot();
};

let chatOpen = false;
const bindChatbot = () => {
  const fab = $('#chatFab');
  const box = $('#chatbot');
  const body = $('#chatBody');
  const chips = $('#chatChips');
  const form = $('#chatForm');
  const input = $('#chatText');
  if (!fab) return;

  const openChat = () => {
    chatOpen = true;
    box.classList.add('open');
    box.setAttribute('aria-hidden', 'false');
    if (!body.children.length) greet();
    setTimeout(() => input && input.focus(), 120);
  };
  const closeChat = () => {
    chatOpen = false;
    box.classList.remove('open');
    box.setAttribute('aria-hidden', 'true');
  };
  fab.addEventListener('click', () => chatOpen ? closeChat() : openChat());
  $('#chatClose').addEventListener('click', closeChat);

  const scrollBody = () => body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' });

  const addMsg = (text, isUser) => {
    const d = document.createElement('div');
    d.className = isUser ? 'chat-msg chat-msg--user' : 'chat-msg chat-msg--bot';
    d.innerHTML = `<span>${text.replace(/\n/g, '<br>')}</span>`;
    body.appendChild(d);
    scrollBody();
    return d;
  };

  const typing = () => {
    const d = document.createElement('div');
    d.className = 'chat-msg chat-msg--bot chat-msg--typing';
    d.innerHTML = '<span class="typing-dots"><i></i><i></i><i></i></span>';
    body.appendChild(d);
    scrollBody();
    return d;
  };

  const setChips = (list) => {
    chips.innerHTML = '';
    list.forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = c;
      b.addEventListener('click', () => { input.value = ''; answer(c); });
      chips.appendChild(b);
    });
  };

  const intent = (text) => {
    const t = text.trim();
    const hit = CHAT_KNOWLEDGE.find((k) => k.keys.some((key) => t.includes(key)));
    return hit ? hit.reply : CHAT_FALLBACK;
  };

  const answer = (text) => {
    addMsg(text, true);
    const t = typing();
    setTimeout(() => {
      t.remove();
      addMsg(intent(text));
      setChips(['شبیه‌سازی انرژی', 'مبحث ۱۹', 'وبینارها', 'آموزش‌ها', 'تماس و مشاوره']);
    }, 650 + Math.random() * 500);
  };

  const greet = () => {
    addMsg('سلام! 🌿 به آرک‌بس خوش آمدید. چطور می‌توانم کمکتان کنم؟');
    setChips(['شبیه‌سازی انرژی', 'مبحث ۱۹', 'وبینارها', 'آموزش‌ها', 'تماس و مشاوره']);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    input.value = '';
    answer(v);
  });
};

/* ---------- Footer ---------- */
const renderFooter = () => {
  const mount = $('#footerMount');
  if (!mount) return;
  mount.innerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col footer-col--about">
          <a href="index.html" class="logo logo--footer">
            ${LOGO_SVG}
            <span class="logo__text">آرک<span>بس</span></span>
          </a>
          <p>آرک‌بس با رویکرد طراحی یکپارچه اقلیمی، خدمات معماری پایدار، شبیه‌سازی انرژی ساختمان، مشاوره مبحث ۱۹ مقررات ملی و آموزش‌های تخصصی را در سراسر ایران ارائه می‌دهد.</p>
          <div class="social-row">
            <a href="#" aria-label="اینستاگرام"><i class="fa-brands fa-instagram"></i></a>
            <a href="#" aria-label="لینکدین"><i class="fa-brands fa-linkedin-in"></i></a>
            <a href="#" aria-label="تلگرام"><i class="fa-brands fa-telegram"></i></a>
            <a href="#" aria-label="آپارات"><i class="fa-solid fa-clapperboard"></i></a>
          </div>
        </div>
        <div class="footer-col">
          <h4>دسترسی سریع</h4>
          <ul>
            <li><a href="about.html"><i class="fa-solid fa-angles-left"></i> درباره ما</a></li>
            <li><a href="services.html"><i class="fa-solid fa-angles-left"></i> خدمات</a></li>
            <li><a href="portfolio.html"><i class="fa-solid fa-angles-left"></i> نمونه‌کارها</a></li>
            <li><a href="blog.html"><i class="fa-solid fa-angles-left"></i> مقالات</a></li>
            <li><a href="webinar.html"><i class="fa-solid fa-angles-left"></i> وبینارها</a></li>
            <li><a href="news.html"><i class="fa-solid fa-angles-left"></i> اخبار</a></li>
            <li><a href="contact.html"><i class="fa-solid fa-angles-left"></i> ارتباط با ما</a></li>
            <li><a href="login.html"><i class="fa-solid fa-angles-left"></i> ورود / ثبت‌نام</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>خدمات</h4>
          <ul>
            <li><a href="services.html#simulation"><i class="fa-solid fa-angles-left"></i> شبیه‌سازی انرژی</a></li>
            <li><a href="services.html#lighting"><i class="fa-solid fa-angles-left"></i> روشنایی طبیعی</a></li>
            <li><a href="services.html#airflow"><i class="fa-solid fa-angles-left"></i> تحلیل جریان هوا</a></li>
            <li><a href="services.html#mabhase19"><i class="fa-solid fa-angles-left"></i> مشاوره مبحث ۱۹</a></li>
            <li><a href="services.html#training"><i class="fa-solid fa-angles-left"></i> آموزش‌های تخصصی</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>اطلاعات تماس</h4>
          <ul class="footer-contact">
            <li><i class="fa-solid fa-location-dot"></i> ${BRAND.address}</li>
            <li><i class="fa-solid fa-phone"></i> <a href="${BRAND.phoneDir}" dir="ltr">${BRAND.phone}</a></li>
            <li><i class="fa-solid fa-envelope"></i> <a href="mailto:${BRAND.email}" dir="ltr">${BRAND.email}</a></li>
            <li><i class="fa-regular fa-clock"></i> شنبه تا پنجشنبه، ۹ تا ۱۸</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© ۱۴۰۵ آرک‌بس — تمامی حقوق محفوظ است.</p>
        <p>طراحی‌شده با <i class="fa-solid fa-heart"></i> و احترام به طبیعت</p>
      </div>
    </div>
  </footer>`;
};

/* ---------- Preloader & scroll-top ---------- */
const renderChrome = () => {
  const p = $('#preloaderMount');
  if (p) p.innerHTML = `
    <div class="preloader" id="preloader" aria-hidden="true">
      <div class="preloader__logo">آرک‌بس</div>
      <div class="preloader__dots"><span></span><span></span><span></span></div>
    </div>`;
  const s = $('#scrollTopMount');
  if (s) s.innerHTML = `<button class="scroll-top" id="scrollTop" aria-label="بازگشت به بالا"><i class="fa-solid fa-arrow-up"></i></button>`;
  const preloader = $('#preloader');
  if (preloader) {
    window.addEventListener('load', () => setTimeout(() => preloader.classList.add('done'), 300));
    setTimeout(() => preloader.classList.add('done'), 3200);
  }
};

/* ---------- Generic: accordion (FAQ) ---------- */
const initAccordions = () => {
  $$('[data-accordion]').forEach((item) => {
    const btn = $('[data-accordion-btn]', item);
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = item.classList.contains('open');
      $$('[data-accordion]').forEach((i) => i.classList.remove('open'));
      if (!open) item.classList.add('open');
    });
  });
};

/* ---------- Generic: countdown (وبینار) ---------- */
const initCountdowns = () => {
  $$('[data-countdown]').forEach((el) => {
    const target = new Date(el.dataset.countdown + 'T18:00:00');
    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
      const diff = Math.max(0, target - new Date());
      if (diff <= 0) { el.textContent = 'بزودی اعلام می‌شود'; return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor(diff / 3600000) % 24;
      const m = Math.floor(diff / 60000) % 60;
      const s = Math.floor(diff / 1000) % 60;
      el.innerHTML = `${pad(d)} روز : ${pad(h)} ساعت : ${pad(m)} دقیقه : ${pad(s)} ثانیه`;
      setTimeout(tick, 1000);
    };
    tick();
  });
};

/* ---------- AOS ---------- */
const initAOS = () => {
  if (!prefersReducedMotion && typeof AOS !== 'undefined') {
    try {
      AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 80 });
      document.documentElement.classList.remove('aos-not-ready');
    } catch (e) {
      document.documentElement.classList.remove('aos-not-ready');
    }
  } else {
    document.documentElement.classList.remove('aos-not-ready');
    $$('[data-aos]').forEach((el) => el.removeAttribute('data-aos'));
  }
};

/* ---------- Bottom nav (mobile) ---------- */
const BOTTOM_NAV = [
  { href: 'index.html', label: 'خانه', icon: 'fa-house' },
  { href: 'blog.html', label: 'مقالات', icon: 'fa-newspaper' },
  { href: 'about.html', label: 'درباره ما', icon: 'fa-users' },
  { href: 'contact.html', label: 'تماس', icon: 'fa-headset' },
];

const renderBottomNav = () => {
  const existing = $('#bottomNav');
  if (existing) existing.remove();
  const bar = document.createElement('nav');
  bar.id = 'bottomNav';
  bar.className = 'bottom-nav';
  bar.setAttribute('aria-label', 'منوی پایین');
  bar.innerHTML = BOTTOM_NAV.map((item) => {
    const active = path === item.href || (item.href === 'blog.html' && fullPath.includes('/blog'));
    return `<a href="${item.href}" class="bottom-nav__item ${active ? 'active' : ''}">
      <i class="fa-solid ${item.icon}"></i>
      <span>${item.label}</span>
    </a>`;
  }).join('');
  document.body.appendChild(bar);
};

/* ---------- Run ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderChrome();
  renderHeader();
  renderSearch();
  renderFooter();
  renderChatbot();
  renderBottomNav();
  initAOS();
  initAccordions();
  initCountdowns();
});