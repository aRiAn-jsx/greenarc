'use strict';
(function () {
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const esc = (s) => String(s || '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  const VIEWS = {
    dashboard: ['داشبورد مدیریت', 'نمای کلی فعالیت‌های آرک‌بس'],
    users: ['کاربران ثبت‌نامی', 'مدیریت حساب‌های کاربری سایت'],
    consult: ['درخواست‌های مشاوره', 'پیگیری درخواست‌های فرم مشاوره'],
    webinars: ['شرکت‌کنندگان وبینار', 'مدیریت حاضران و ثبت‌نام‌ها'],
    messages: ['پیام‌های تماس', 'مطالعه و پاسخ به پیام‌های کاربران'],
    gallery: ['مدیریت گالری', 'آپلود، ویرایش و نمایش اسلایدی تصاویر'],
    posts: ['مدیریت بلاگ و مقالات', 'افزودن و ویرایش مقالات سایت'],
    logs: ['گزارشات و لاگ سیستم', 'لاگ تمام درخواست‌ها و عملیات'],
    settings: ['تنظیمات', 'پروفایل، اعلان‌ها، امنیت و سایت']
  };

  const DB = {
    users: [
      { id: 1, name: 'مریم توکلی', phone: '09121234567', email: 'm.tavakoli@example.com', date: '1405/05/14', status: 'active' },
      { id: 2, name: 'کاوه رستمی', phone: '09125554321', email: 'k.rostami@example.com', date: '1405/05/10', status: 'active' },
      { id: 3, name: 'سارا نیک‌بخت', phone: '09123332211', email: 's.nikbakht@example.com', date: '1405/05/02', status: 'active' },
      { id: 4, name: 'رضا قاسمی', phone: '09127778899', email: 'r.ghasemi@example.com', date: '1405/04/28', status: 'blocked' },
      { id: 5, name: 'الهام شریفی', phone: '09124445566', email: 'e.sharifi@example.com', date: '1405/04/20', status: 'active' },
      { id: 6, name: 'محمد امینی', phone: '09126667788', email: 'm.amini@example.com', date: '1405/04/15', status: 'active' },
      { id: 7, name: 'نیلوفر صادقی', phone: '09128889900', email: 'n.sadeghi@example.com', date: '1405/04/11', status: 'active' },
      { id: 8, name: 'حمید رستگار', phone: '09129990011', email: 'h.rastegar@example.com', date: '1405/03/30', status: 'blocked' }
    ],
    consults: [
      { id: 1, name: 'فرهاد موسوی', phone: '09121112233', type: 'شبیه‌سازی انرژی', date: '1405/05/15', status: 'new' },
      { id: 2, name: 'نگین کریمی', phone: '09125556677', type: 'مبحث ۱۹', date: '1405/05/14', status: 'new' },
      { id: 3, name: 'پرویز عبدی', phone: '09127778899', type: 'نور روز و روشنایی', date: '1405/05/12', status: 'process' },
      { id: 4, name: 'شهلا رحیمی', phone: '09129990011', type: 'مبحث ۱۹', date: '1405/05/10', status: 'done' },
      { id: 5, name: 'آرش نادری', phone: '09123334455', type: 'شبیه‌سازی انرژی', date: '1405/05/08', status: 'process' },
      { id: 6, name: 'لیلا حمیدی', phone: '09125556677', type: 'جریان هوا (CFD)', date: '1405/05/05', status: 'done' }
    ],
    webinars: [
      { id: 1, name: 'امیر کاظمی', email: 'a.kazemi@example.com', webinar: 'اعتبارسنجی نتایج شبیه‌سازی', date: '1405/05/16', status: 'joined' },
      { id: 2, name: 'سمیرا حیدری', email: 's.heydari@example.com', webinar: 'اعتبارسنجی نتایج شبیه‌سازی', date: '1405/05/16', status: 'joined' },
      { id: 3, name: 'بهرام صدر', email: 'b.sadr@example.com', webinar: 'پوسته‌های ساختمانی', date: '1405/05/15', status: 'registered' },
      { id: 4, name: 'مینا کاویانی', email: 'm.kaviani@example.com', webinar: 'پوسته‌های ساختمانی', date: '1405/05/15', status: 'registered' },
      { id: 5, name: 'حسین ملکی', email: 'h.maleki@example.com', webinar: 'مقدمه هانی‌بی', date: '1405/05/13', status: 'joined' },
      { id: 6, name: 'الهام زرگر', email: 'e.zargar@example.com', webinar: 'مقدمه هانی‌بی', date: '1405/05/12', status: 'registered' },
      { id: 7, name: 'پویا دانش', email: 'p.danesh@example.com', webinar: 'همایش معماری اقلیمی', date: '1405/05/11', status: 'joined' }
    ],
    messages: [
      { id: 1, from: 'رضا عباسی', subject: 'درخواست همکاری در پروژه مسکونی', date: '1405/05/15', read: false },
      { id: 2, from: 'تهمینه فرخ', subject: 'سؤال درباره دوره هانی‌بی', date: '1405/05/14', read: false },
      { id: 3, from: 'مهدی راد', subject: 'استعلام هزینه شبیه‌سازی', date: '1405/05/12', read: true },
      { id: 4, from: 'شیرین گلشن', subject: 'رزرو جایگاه همایش مرداد', date: '1405/05/10', read: false },
      { id: 5, from: 'علی پورکاوه', subject: 'پیشنهاد همکاری آموزشی', date: '1405/05/07', read: true }
    ],
    gallery: [
      { id: 1, cat: 'مسکونی', title: 'ویلای آفتاب', src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80' },
      { id: 2, cat: 'اداری', title: 'برج بهار', src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80' },
      { id: 3, cat: 'پایدار', title: 'دفتر مرکزی سپید', src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80' },
      { id: 4, cat: 'تجاری', title: 'پاساژ ارغوان', src: 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=1200&q=80' },
      { id: 5, cat: 'مسکونی', title: 'خانه مهر', src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80' },
      { id: 6, cat: 'اداری', title: 'دفتر نوآوران', src: 'https://images.unsplash.com/photo-1481026469463-66327c86e544?auto=format&fit=crop&w=1200&q=80' },
      { id: 7, cat: 'مسکونی', title: 'مجتمع سرو', src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' },
      { id: 8, cat: 'آموزش', title: 'کارگاه هانی‌بی', src: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80' },
      { id: 9, cat: 'پایدار', title: 'مجموعه کارین', src: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80' }
    ],
    monthly: [
      { m: 'فروردین', u: 12, c: 5 },
      { m: 'اردیبهشت', u: 18, c: 7 },
      { m: 'خرداد', u: 15, c: 9 },
      { m: 'تیر', u: 22, c: 10 },
      { m: 'مرداد', u: 26, c: 11 }
    ],
    posts: [
      { id: 1, title: 'روش نیاز انرژی و روش کارایی انرژی در مبحث ۱۹', cat: 'مبحث ۱۹', slug: 'energy-methods-mabhase19', date: '1405/05/05' },
      { id: 2, title: 'چک درستی نتایج شبیه‌سازی انرژی', cat: 'شبیه‌سازی', slug: 'validation-energy-simulation', date: '1405/05/02' },
      { id: 3, title: 'دسته‌بندی اقلیمی ویرایش پنجم مبحث ۱۹', cat: 'اقلیم', slug: 'climate-classification-mabhase19', date: '1405/04/28' }
    ]
  };

  const state = {
    view: 'dashboard',
    uFilter: 'all', usersQuery: '',
    cFilter: 'all',
    wFilter: 'all',
    galQuery: '', galCat: 'all'
  };

  // helper: fetch API with fallback to mock DB
  async function apiFetch(path, opts={}) {
    try {
      const r = await fetch('../api' + path, {credentials:'include', headers:{'Content-Type':'application/json'}, ...opts});
      const j = await r.json();
      if (j.ok) return j.data;
      throw new Error(j.error);
    } catch(e){ return null; }
  }

  let toastTimer = null;
  function toast(msg) {
    const t = $('#adminToast');
    if (!t) return;
    t.querySelector('span').textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  const pill = (status) => {
    if (status === 'active' || status === 'joined' || status === 'done') return '<span class="state-pill state-pill--ok">' + { active: 'فعال', joined: 'حضور یافته', done: 'انجام‌شده' }[status] + '</span>';
    if (status === 'blocked') return '<span class="state-pill state-pill--bad">مسدود</span>';
    if (status === 'registered') return '<span class="state-pill state-pill--wait">ثبت‌نام کرده</span>';
    if (status === 'process') return '<span class="state-pill state-pill--wait">در حال بررسی</span>';
    if (status === 'new') return '<span class="state-pill state-pill--bad">جدید</span>';
    return '<span class="state-pill">' + esc(status) + '</span>';
  };

  /* ---------- view switching ---------- */
  function switchView(name) {
    state.view = name;
    $$('.admin-nav button').forEach((b) => b.classList.toggle('active', b.dataset.view === name));
    $$('.admin-view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + name));
    const meta = VIEWS[name];
    $('#viewTitle').textContent = meta[0];
    $('#viewSub').textContent = meta[1];
    $('#adminSide').classList.remove('open');
    if (name === 'dashboard') renderDashboard();
    if (name === 'users') renderUsers();
    if (name === 'consult') renderConsults();
    if (name === 'webinars') renderWebinars();
    if (name === 'messages') renderMessages();
    if (name === 'gallery') renderGallery();
    if (name === 'posts') renderPosts();
    if (name === 'logs') renderLogs();
    window.scrollTo(0, 0);
  }
  $$('.admin-nav button').forEach((b) => b.addEventListener('click', () => switchView(b.dataset.view)));
  $$('[data-goto]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); switchView(a.dataset.goto); }));

  $('#sideToggle').addEventListener('click', () => $('#adminSide').classList.toggle('open'));
  $('#logoutBtn').addEventListener('click', () => {
    toast('در حال خروج از سیستم...');
    setTimeout(() => { window.location.href = '../login.html'; }, 900);
  });

  const now = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  $('#todayJalali').textContent = now;

  function renderBadges() {
    $$('[data-badge]').forEach((b) => {
      const key = b.dataset.badge;
      let n = 0;
      if (key === 'users') n = DB.users.length;
      else if (key === 'consult') n = DB.consults.length;
      else if (key === 'webinars') n = DB.webinars.length;
      else if (key === 'messages') n = DB.messages.filter((m) => !m.read).length;
      else if (key === 'posts') n = DB.posts.length;
      else if (key === 'logs') n = 0;
      else n = DB.gallery.length;
      b.textContent = n;
      // try real API for posts/logs count async
      if (key === 'posts') apiFetch('/admin/posts').then(d=>{ if(d) b.textContent=d.length; });
      if (key === 'logs') apiFetch('/admin/logs').then(d=>{ if(d) b.textContent=d.length; });
    });
  }

  /* ---------- dashboard ---------- */
  function renderDashboard() {
    const stats = [
      { icon: 'fa-users', color: 'green', val: DB.users.length, label: 'کاربران ثبت‌نامی', grow: '+۱۲٪ این ماه' },
      { icon: 'fa-headset', color: 'gold', val: DB.consults.length, label: 'درخواست مشاوره', grow: '+۳ مورد جدید' },
      { icon: 'fa-chalkboard-user', color: 'blue', val: DB.webinars.length, label: 'شرکت‌کنندگان وبینار', grow: '+۷ حضور' },
      { icon: 'fa-envelope', color: 'red', val: DB.messages.filter((m) => !m.read).length, label: 'پیام خوانده‌نشده', grow: 'نیازمند پاسخ' }
    ];
    $('#dashStats').innerHTML = stats.map((s) => (
      '<div class="admin-stat">' +
      '  <span class="admin-stat__icon admin-stat__icon--' + s.color + '"><i class="fa-solid ' + s.icon + '"></i></span>' +
      '  <strong>' + s.val + '</strong>' +
      '  <span>' + s.label + ' — ' + s.grow + '</span>' +
      '</div>'
    )).join('');

    const max = Math.max.apply(null, DB.monthly.flatMap((m) => [m.u, m.c]));
    $('#dashChart').innerHTML = DB.monthly.map((m) => (
      '<div class="bar">' +
      '  <div style="display:flex;gap:4px;align-items:flex-end;width:100%;height:100%;justify-content:center;">' +
      '    <b style="height:' + Math.round((m.u / max) * 100) + '%" title="کاربران"></b>' +
      '    <b style="height:' + Math.round((m.c / max) * 100) + '%;background:linear-gradient(180deg,#f7d45f,#e0ad00);" title="درخواست‌ها"></b>' +
      '  </div>' +
      '  <strong>' + m.u + ' / ' + m.c + '</strong>' +
      '  <span>' + m.m + '</span>' +
      '</div>'
    )).join('');

    const activity = [];
    DB.users.forEach((u) => activity.push({ icon: 'fa-user-plus', text: 'ثبت‌نام جدید: ' + u.name, time: u.date }));
    DB.consults.forEach((c) => activity.push({ icon: 'fa-headset', text: 'درخواست مشاوره: ' + c.name + ' (' + c.type + ')', time: c.date }));
    DB.webinars.forEach((w) => activity.push({ icon: 'fa-chalkboard-user', text: 'حضور در وبینار: ' + w.name, time: w.date }));
    activity.sort((a, b) => (a.time < b.time ? 1 : -1));
    $('#dashActivity').innerHTML = activity.slice(0, 7).map((a) => (
      '<div class="admin-list-item">' +
      '  <span class="avatar"><i class="fa-solid ' + a.icon + '"></i></span>' +
      '  <div><strong>' + esc(a.text) + '</strong><span>آرک‌بس</span></div>' +
      '  <time>' + a.time + '</time>' +
      '</div>'
    )).join('');

    $('#dashRecentConsult').innerHTML = DB.consults.slice(0, 5).map((c) => (
      '<tr><td><strong class="t-green">' + esc(c.name) + '</strong></td><td>' + esc(c.type) + '</td><td>' + c.date + '</td><td>' + pill(c.status) + '</td></tr>'
    )).join('');
  }

  /* ---------- users ---------- */
  const filteredUsers = () => DB.users.filter((u) =>
    (state.uFilter === 'all' || u.status === state.uFilter) &&
    (!state.usersQuery || (u.name + u.phone + u.email).toLowerCase().includes(state.usersQuery.toLowerCase()))
  );
  function renderUsers() {
    $('#usersCount').textContent = DB.users.length;
    const list = filteredUsers();
    $('#usersEmpty').hidden = list.length > 0;
    $('#usersTbody').innerHTML = list.map((u) => (
      '<tr data-id="' + u.id + '">' +
      '  <td><strong class="t-green">' + esc(u.name) + '</strong></td>' +
      '  <td dir="ltr">' + esc(u.phone) + '</td>' +
      '  <td dir="ltr">' + esc(u.email) + '</td>' +
      '  <td>' + u.date + '</td>' +
      '  <td>' + pill(u.status) + '</td>' +
      '  <td><div class="actions-cell">' +
      '    <button class="act-ok" data-act="toggle" title="' + (u.status === 'active' ? 'مسدود کردن' : 'فعال کردن') + '"><i class="fa-solid ' + (u.status === 'active' ? 'fa-ban' : 'fa-check') + '"></i></button>' +
      '    <button class="act-edit" data-act="edit" title="ویرایش"><i class="fa-solid fa-pen"></i></button>' +
      '    <button class="act-del" data-act="delete" title="حذف"><i class="fa-solid fa-trash"></i></button>' +
      '  </div></td>' +
      '</tr>'
    )).join('');
  }
  $('#usersSearch').addEventListener('input', (e) => { state.usersQuery = e.target.value.trim(); renderUsers(); });
  $$('#usersChips .chip').forEach((c) => c.addEventListener('click', () => {
    $$('#usersChips .chip').forEach((x) => x.classList.remove('active'));
    c.classList.add('active');
    state.uFilter = c.dataset.ufilter;
    renderUsers();
  }));
  $('#usersTbody').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const row = btn.closest('tr');
    const u = DB.users.find((x) => x.id === Number(row.dataset.id));
    if (btn.dataset.act === 'toggle') {
      u.status = u.status === 'active' ? 'blocked' : 'active';
      toast(u.status === 'active' ? 'کاربر فعال شد' : 'کاربر مسدود شد');
      renderUsers(); renderBadges();
    } else if (btn.dataset.act === 'edit') {
      const name = prompt('نام جدید کاربر:', u.name);
      if (name && name.trim()) { u.name = name.trim(); toast('نام کاربر به‌روزرسانی شد'); renderUsers(); renderDashboard(); }
    } else if (btn.dataset.act === 'delete') {
      if (confirm('آیا از حذف کاربر «' + u.name + '» مطمئن هستید؟')) {
        DB.users = DB.users.filter((x) => x.id !== u.id);
        toast('کاربر حذف شد');
        renderUsers(); renderBadges();
      }
    }
  });
  $('#addUserBtn').addEventListener('click', () => {
    const name = prompt('نام کاربر جدید:');
    if (!name || !name.trim()) return;
    const phone = prompt('شماره موبایل:') || '09xxxxxxxxx';
    DB.users.unshift({ id: Date.now(), name: name.trim(), phone, email: '—', date: '1405/05/19', status: 'active' });
    renderUsers(); renderBadges(); state.uFilter = 'all';
    $$('#usersChips .chip').forEach((x) => x.classList.toggle('active', x.dataset.ufilter === 'all'));
    toast('کاربر جدید اضافه شد');
  });

  /* ---------- consults ---------- */
  const filteredConsults = () => DB.consults.filter((c) => state.cFilter === 'all' || c.status === state.cFilter);
  function renderConsults() {
    $('#consultCount').textContent = DB.consults.length;
    const list = filteredConsults();
    $('#consultEmpty').hidden = list.length > 0;
    $('#consultTbody').innerHTML = list.map((c) => (
      '<tr data-id="' + c.id + '">' +
      '  <td><strong class="t-green">' + esc(c.name) + '</strong></td>' +
      '  <td dir="ltr">' + esc(c.phone) + '</td>' +
      '  <td>' + esc(c.type) + '</td>' +
      '  <td>' + c.date + '</td>' +
      '  <td><select class="status-select" data-status>' +
      '    <option value="new"' + (c.status === 'new' ? ' selected' : '') + '>جدید</option>' +
      '    <option value="process"' + (c.status === 'process' ? ' selected' : '') + '>در حال بررسی</option>' +
      '    <option value="done"' + (c.status === 'done' ? ' selected' : '') + '>انجام‌شده</option>' +
      '  </select></td>' +
      '  <td><div class="actions-cell">' +
      '    <button class="act-eye" data-act="view" title="مشاهده جزئیات"><i class="fa-solid fa-eye"></i></button>' +
      '    <button class="act-del" data-act="delete" title="حذف"><i class="fa-solid fa-trash"></i></button>' +
      '  </div></td>' +
      '</tr>'
    )).join('');
  }
  $$('#consultChips .chip').forEach((c) => c.addEventListener('click', () => {
    $$('#consultChips .chip').forEach((x) => x.classList.remove('active'));
    c.classList.add('active');
    state.cFilter = c.dataset.cfilter;
    renderConsults();
  }));
  $('#consultTbody').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const row = btn.closest('tr');
    const c = DB.consults.find((x) => x.id === Number(row.dataset.id));
    if (btn.dataset.act === 'view') {
      alert('درخواست مشاوره\nنام: ' + c.name + '\nشماره: ' + c.phone + '\nنوع: ' + c.type + '\nتاریخ: ' + c.date);
    } else if (btn.dataset.act === 'delete') {
      if (confirm('حذف درخواست «' + c.name + '»؟')) {
        DB.consults = DB.consults.filter((x) => x.id !== c.id);
        toast('درخواست حذف شد');
        renderConsults(); renderBadges();
      }
    }
  });
  $('#consultTbody').addEventListener('change', (e) => {
    if (!e.target.matches('[data-status]')) return;
    const row = e.target.closest('tr');
    const c = DB.consults.find((x) => x.id === Number(row.dataset.id));
    c.status = e.target.value;
    toast('وضعیت درخواست به‌روزرسانی شد');
    renderConsults(); renderDashboard();
  });

  /* ---------- webinars ---------- */
  const filteredWebinars = () => DB.webinars.filter((w) => state.wFilter === 'all' || w.status === state.wFilter);
  function renderWebinars() {
    $('#webinarsCount').textContent = DB.webinars.length;
    const list = filteredWebinars();
    $('#webinarsEmpty').hidden = list.length > 0;
    $('#webinarsTbody').innerHTML = list.map((w) => (
      '<tr data-id="' + w.id + '">' +
      '  <td><strong class="t-green">' + esc(w.name) + '</strong></td>' +
      '  <td dir="ltr">' + esc(w.email) + '</td>' +
      '  <td>' + esc(w.webinar) + '</td>' +
      '  <td>' + w.date + '</td>' +
      '  <td>' + pill(w.status) + '</td>' +
      '  <td><div class="actions-cell">' +
      '    <button class="act-ok" data-act="toggle" title="تغییر وضعیت حضور"><i class="fa-solid fa-user-check"></i></button>' +
      '    <button class="act-del" data-act="delete" title="حذف"><i class="fa-solid fa-trash"></i></button>' +
      '  </div></td>' +
      '</tr>'
    )).join('');
  }
  $$('#webChips .chip').forEach((c) => c.addEventListener('click', () => {
    $$('#webChips .chip').forEach((x) => x.classList.remove('active'));
    c.classList.add('active');
    state.wFilter = c.dataset.wfilter;
    renderWebinars();
  }));
  $('#webinarsTbody').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const row = btn.closest('tr');
    const w = DB.webinars.find((x) => x.id === Number(row.dataset.id));
    if (btn.dataset.act === 'toggle') {
      w.status = w.status === 'joined' ? 'registered' : 'joined';
      toast(w.status === 'joined' ? 'حضور ثبت شد' : 'وضعیت به ثبت‌نام تغییر کرد');
      renderWebinars(); renderBadges();
    } else if (btn.dataset.act === 'delete') {
      if (confirm('حذف ' + w.name + ' از شرکت‌کنندگان؟')) {
        DB.webinars = DB.webinars.filter((x) => x.id !== w.id);
        toast('شرکت‌کننده حذف شد');
        renderWebinars(); renderBadges();
      }
    }
  });

  /* ---------- messages ---------- */
  function renderMessages() {
    $('#messagesCount').textContent = DB.messages.length;
    $('#messagesEmpty').hidden = DB.messages.length > 0;
    $('#messagesTbody').innerHTML = DB.messages.map((m) => (
      '<tr data-id="' + m.id + '"' + (!m.read ? ' style="background:rgba(26,188,156,0.045);"' : '') + '>' +
      '  <td><strong class="' + (!m.read ? 't-green' : '') + '">' + esc(m.from) + '</strong></td>' +
      '  <td>' + esc(m.subject) + '</td>' +
      '  <td>' + m.date + '</td>' +
      '  <td>' + (m.read ? '<span class="state-pill">خوانده‌شده</span>' : '<span class="state-pill state-pill--bad">جدید</span>') + '</td>' +
      '  <td><div class="actions-cell">' +
      '    <button class="act-eye" data-act="view" title="مشاهده پیام"><i class="fa-solid fa-envelope"></i></button>' +
      (!m.read ? '    <button class="act-ok" data-act="read" title="علامت‌گذاری خوانده‌شده"><i class="fa-solid fa-check"></i></button>' : '') +
      '    <button class="act-del" data-act="delete" title="حذف"><i class="fa-solid fa-trash"></i></button>' +
      '  </div></td>' +
      '</tr>'
    )).join('');
  }
  $('#messagesTbody').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const row = btn.closest('tr');
    const m = DB.messages.find((x) => x.id === Number(row.dataset.id));
    if (btn.dataset.act === 'view') {
      alert('پیام از ' + m.from + '\n' + m.date + '\n\n' + m.subject);
      if (!m.read) { m.read = true; renderMessages(); renderBadges(); }
    } else if (btn.dataset.act === 'read') {
      m.read = true;
      toast('پیام خوانده‌شده علامت خورد');
      renderMessages(); renderBadges();
    } else if (btn.dataset.act === 'delete') {
      if (confirm('حذف پیام از «' + m.from + '»؟')) {
        DB.messages = DB.messages.filter((x) => x.id !== m.id);
        toast('پیام حذف شد');
        renderMessages(); renderBadges();
      }
    }
  });
  $('#readAllBtn').addEventListener('click', () => {
    DB.messages.forEach((m) => { m.read = true; });
    toast('همه پیام‌ها خوانده‌شده شدند');
    renderMessages(); renderBadges();
  });

  /* ---------- gallery ---------- */
  const galleryCats = () => ['all'].concat(Array.from(new Set(DB.gallery.map((g) => g.cat))));
  const filteredGallery = () => DB.gallery.filter((g) =>
    (state.galCat === 'all' || g.cat === state.galCat) &&
    (!state.galQuery || g.title.toLowerCase().includes(state.galQuery.toLowerCase()))
  );

  function renderGallery() {
    $('#galleryCount').textContent = DB.gallery.length;
    const cats = galleryCats();
    $('#galChips').innerHTML = cats.map((c) =>
      '<button class="chip' + (state.galCat === c ? ' active' : '') + '" data-gcat="' + c + '">' +
      (c === 'all' ? 'همه' : esc(c)) + ' <span style="opacity:.7;font-size:10px;">(' + (c === 'all' ? DB.gallery.length : DB.gallery.filter((g) => g.cat === c).length) + ')</span></button>'
    ).join('');
    $$('#galChips .chip').forEach((c) => c.addEventListener('click', () => {
      state.galCat = c.dataset.gcat;
      renderGallery();
    }));

    const list = filteredGallery();
    $('#galEmpty').hidden = list.length > 0;
    $('#galGrid').innerHTML = list.map((g) => (
      '<div class="gal-admin-item" data-id="' + g.id + '">' +
      '  <div class="gal-admin-item__actions">' +
      '    <button data-act="view" title="مشاهده اسلایدی"><i class="fa-solid fa-expand"></i></button>' +
      '    <button data-act="edit" title="ویرایش عنوان"><i class="fa-solid fa-pen"></i></button>' +
      '    <button class="del" data-act="delete" title="حذف"><i class="fa-solid fa-trash"></i></button>' +
      '  </div>' +
      '  <div class="gal-admin-item__thumb" data-act="view"><img src="' + g.src + '" alt="' + esc(g.title) + '" loading="lazy"></div>' +
      '  <div class="gal-admin-item__body"><div><strong>' + esc(g.title) + '</strong><span>' + esc(g.cat) + '</span></div></div>' +
      '</div>'
    )).join('');
  }

  $('#galSearch').addEventListener('input', (e) => {
    state.galQuery = e.target.value.trim().toLowerCase();
    renderGallery();
  });

  $('#galGrid').addEventListener('click', (e) => {
    const actEl = e.target.closest('[data-act]');
    if (!actEl) return;
    const item = actEl.closest('.gal-admin-item');
    const g = DB.gallery.find((x) => x.id === Number(item.dataset.id));
    const act = actEl.dataset.act;
    if (act === 'view') {
      window.ArcbesSlideshow.open(filteredGallery().map((x) => ({ src: x.src, title: x.title, caption: x.cat })), filteredGallery().findIndex((x) => x.id === g.id), true);
    } else if (act === 'edit') {
      const title = prompt('عنوان جدید تصویر:', g.title);
      if (title && title.trim()) { g.title = title.trim(); toast('عنوان تصویر به‌روزرسانی شد'); renderGallery(); }
    } else if (act === 'delete') {
      if (confirm('حذف «' + g.title + '» از گالری؟')) {
        DB.gallery = DB.gallery.filter((x) => x.id !== g.id);
        toast('تصویر از گالری حذف شد');
        renderGallery(); renderBadges();
      }
    }
  });

  $('#galSlideAll').addEventListener('click', () => {
    const list = filteredGallery();
    if (!list.length) { toast('تصویری برای نمایش وجود ندارد'); return; }
    window.ArcbesSlideshow.open(list.map((x) => ({ src: x.src, title: x.title, caption: x.cat })), 0, true);
  });

  $('#galUploadBtn').addEventListener('click', () => $('#galUpload').click());
  $('#galUpload').addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    let done = 0;
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        DB.gallery.unshift({ id: Date.now() + Math.random(), cat: 'جدید', title: f.name.replace(/\.\w+$/, ''), src: reader.result });
        done++;
        if (done === files.length) {
          state.galCat = 'all';
          renderGallery(); renderBadges();
          toast(files.length + ' تصویر به گالری اضافه شد');
          $('#galUpload').value = '';
          const list = filteredGallery();
          window.ArcbesSlideshow.open(list.slice(0, files.length).map((x) => ({ src: x.src, title: x.title, caption: x.cat })), 0, false);
        }
      };
      reader.readAsDataURL(f);
    });
  });

  /* ---------- posts (blog) ---------- */
  async function renderPosts(){
    const tbody=$('#postsTbody'), empty=$('#postsEmpty'), countEl=$('#postsCount');
    let list = await apiFetch('/admin/posts');
    if(!list) list = DB.posts;
    else DB.posts = list;
    if(countEl) countEl.textContent=list.length;
    if(empty) empty.hidden = list.length>0;
    if(tbody) tbody.innerHTML = list.map(p=>(
      '<tr data-id="'+p.id+'">'
      +'<td><strong class="t-green">'+esc(p.title)+'</strong></td>'
      +'<td>'+esc(p.cat||'')+'</td>'
      +'<td dir="ltr" style="font-size:11px;">'+esc(p.slug||'')+'</td>'
      +'<td>'+(p.created_at||p.date||'')+'</td>'
      +'<td><div class="actions-cell">'
      +'<button class="act-edit" data-act="edit"><i class="fa-solid fa-pen"></i></button>'
      +'<button class="act-del" data-act="delete"><i class="fa-solid fa-trash"></i></button>'
      +'</div></td></tr>'
    )).join('');
  }
  const postsTbody = $('#postsTbody');
  if(postsTbody){
    postsTbody.addEventListener('click', async (e)=>{
      const btn=e.target.closest('button[data-act]'); if(!btn) return;
      const tr=btn.closest('tr'); const id=Number(tr.dataset.id);
      if(btn.dataset.act==='delete'){
        if(!confirm('حذف مقاله؟')) return;
        const r = await apiFetch('/admin/posts/delete', {method:'POST', body: JSON.stringify({id})});
        if(r!==null || !r){ DB.posts = DB.posts.filter(x=>x.id!==id); }
        toast('مقاله حذف شد'); renderPosts(); renderBadges();
      } else if(btn.dataset.act==='edit'){
        const p = DB.posts.find(x=>x.id===id);
        const t = prompt('عنوان جدید:', p.title);
        if(t && t.trim()){
          const r = await apiFetch('/admin/posts/update', {method:'POST', body: JSON.stringify({id, title:t.trim()})});
          if(r===null) p.title=t.trim();
          toast('به‌روزرسانی شد'); renderPosts();
        }
      }
    });
  }
  const addPostBtn=$('#addPostBtn');
  if(addPostBtn) addPostBtn.addEventListener('click', async ()=>{
    const title=prompt('عنوان مقاله:'); if(!title||!title.trim()) return;
    const cat=prompt('دسته (مبحث ۱۹ / شبیه‌سازی / اقلیم):','مبحث ۱۹')||'عمومی';
    const body=prompt('متن خلاصه:','متن مقاله...')||'...';
    const slug=title.trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-_]/g,'')||'post-'+Date.now();
    const payload={title:title.trim(), cat, body, slug};
    const r=await apiFetch('/admin/posts', {method:'POST', body: JSON.stringify(payload)});
    if(r!==null){ /* api returns id */ DB.posts.unshift({id:r.id||Date.now(), title:payload.title, cat, slug: r.slug||slug, date: new Date().toLocaleDateString('fa-IR')}); }
    else { DB.posts.unshift({id:Date.now(), title:payload.title, cat, slug, date: new Date().toLocaleDateString('fa-IR')}); }
    toast('مقاله افزوده شد'); renderPosts(); renderBadges();
  });

  /* ---------- logs ---------- */
  async function renderLogs(){
    const tbody=$('#logsTbody'), empty=$('#logsEmpty'), countEl=$('#logsCount');
    let list = await apiFetch('/admin/logs');
    if(!list){ // fallback mock
      list = [
        {created_at: new Date().toISOString().slice(0,19).replace('T',' '), username:'admin', action:'auth.verify', detail:'09120000000', ip:'127.0.0.1'},
        {created_at: new Date().toISOString().slice(0,19).replace('T',' '), username:'system', action:'contact.store', detail:'تست کاربر', ip:'127.0.0.1'},
      ];
    }
    if(countEl) countEl.textContent=list.length;
    if(empty) empty.hidden = list.length>0;
    if(tbody) tbody.innerHTML = list.slice(0,100).map(l=>(
      '<tr><td style="font-size:11px;direction:ltr;">'+esc(l.created_at||'')+'</td>'
      +'<td>'+esc(l.username|| l.user_id || '-')+'</td>'
      +'<td><span class="state-pill">'+esc(l.action||'')+'</span></td>'
      +'<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;">'+esc(l.detail||'')+'</td>'
      +'<td dir="ltr" style="font-size:11px;">'+esc(l.ip||'')+'</td></tr>'
    )).join('');
  }
  const refreshLogsBtn=$('#refreshLogsBtn');
  if(refreshLogsBtn) refreshLogsBtn.addEventListener('click', renderLogs);

  /* ---------- settings ---------- */
  $('#profileForm').addEventListener('submit', (e) => { e.preventDefault(); toast('پروفایل با موفقیت ذخیره شد'); });
  $('#saveNotifBtn').addEventListener('click', () => toast('تنظیمات اعلان‌ها ذخیره شد'));
  $('#saveSecBtn').addEventListener('click', () => toast('تنظیمات امنیتی ذخیره شد'));
  $('#saveSiteBtn').addEventListener('click', () => toast('تنظیمات سایت ذخیره شد'));

  /* ---------- init ---------- */
  renderBadges();
  renderDashboard();
})();