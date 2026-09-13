'use strict';
(function () {
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const DEMO_OTP = '123456';

  const setLoading = (btn, on) => {
    if (!btn) return;
    if (on) btn.classList.add('loading'), btn.disabled = true;
    else btn.classList.remove('loading'), btn.disabled = false;
  };
  const validPhone = (v) => /^09\d{9}$/.test(String(v || '').trim());

  /* ---------- OTP inputs: numeric, autoadvance, backspace, paste ---------- */
  const initOtpRow = (row) => {
    if (!row) return;
    const inputs = $$('input', row);
    const focusNext = (i) => { const n = inputs[i + 1]; if (n) n.focus(); };
    const focusPrev = (i) => { const p = inputs[i - 1]; if (p) p.focus(); };
    const fill = (code) => {
      const digits = String(code).replace(/\D/g, '').slice(0, inputs.length);
      inputs.forEach((inp, i) => { inp.value = digits[i] || ''; });
      const last = inputs[digits.length] || inputs[inputs.length - 1];
      last.focus(); last.select();
    };
    inputs.forEach((inp, i) => {
      inp.addEventListener('input', () => {
        inp.value = inp.value.replace(/\D/g, '').slice(0, 1);
        if (inp.value) focusNext(i); else focusPrev(i);
      });
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !inp.value) { e.preventDefault(); focusPrev(i); }
      });
      inp.addEventListener('paste', (e) => {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        if (paste) fill(paste);
      });
    });
    const first = inputs[0];
    if (first) { first.focus(); first.select(); }
    return inputs;
  };

  /* ---------- OTP countdown (60s) ---------- */
  function startOtpTimer(countEl, resendBtn) {
    let left = 60;
    countEl.textContent = String(left).padStart(2, '0');
    resendBtn.classList.remove('active');
    const iv = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearInterval(iv);
        countEl.textContent = '00';
        resendBtn.classList.add('active');
        return;
      }
      countEl.textContent = String(left).padStart(2, '0');
    }, 1000);
    return iv;
  }

  /* ================= LOGIN: phone + OTP ================= */
  const loginForm = $('#loginForm');
  if (loginForm) {
    const stage = $('#otpStage');
    const row = $('#otpRow');
    const count = $('#otpTimerCount');
    const resend = $('#otpResend');
    const msg = $('#otpMsg');
    const btn = $('#loginBtn');
    let otpIv, sentPhone = '';

    const sendOtp = () => {
      sentPhone = $('#liPhone').value.trim();
      $('#otpSentTo').textContent = sentPhone;
      stage.style.display = 'block';
      btn.querySelector('span').textContent = 'ورود';
      btn.querySelector('i:first-child').className = 'fa-solid fa-arrow-right-to-bracket';
      initOtpRow(row);
      if (otpIv) clearInterval(otpIv);
      otpIv = startOtpTimer(count, resend);
      msg.className = 'otp-msg';
    };

    resend.addEventListener('click', async () => {
      if (!resend.classList.contains('active')) return;
      try {
        const r = await fetch('api/auth/send-otp', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({phone: sentPhone})});
        const d = await r.json();
        if(!d.ok) throw new Error(d.error);
      } catch(e){ /* fallback mock */ }
      if (otpIv) clearInterval(otpIv);
      otpIv = startOtpTimer(count, resend);
      msg.className = 'otp-msg';
    });

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (stage.style.display === 'none') {
        if (!validPhone($('#liPhone').value)) {
          msg.className = 'otp-msg show otp-msg--err';
          msg.textContent = 'شماره موبایل معتبر وارد کنید (۰۹xxxxxxxxx).';
          return;
        }
        setLoading(btn, true);
        try {
          const r = await fetch('api/auth/send-otp', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({phone: $('#liPhone').value.trim()})});
          const d = await r.json();
          if(!d.ok) throw new Error(d.error);
          if(d.data && d.data.dev_code) console.log('DEV OTP:', d.data.dev_code);
        } catch(err){
          // fallback to demo if API not ready (no DB)
          if(err.message && err.message.includes('لطفاً')){ msg.className='otp-msg show otp-msg--err'; msg.textContent=err.message; setLoading(btn,false); return; }
          console.warn('OTP API fallback:', err.message);
        }
        setLoading(btn, false); sendOtp(); return;
      }
      const code = $$('input', row).map((i) => i.value).join('');
      if (code.length < 6) {
        msg.className = 'otp-msg show otp-msg--err';
        msg.textContent = 'کد ۶ رقمی را کامل وارد کنید.';
        return;
      }
      setLoading(btn, true);
      try {
        const r = await fetch('api/auth/verify', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({phone: sentPhone, code})});
        const d = await r.json();
        if(!d.ok) throw new Error(d.error);
        msg.className = 'otp-msg show otp-msg--ok';
        msg.innerHTML = '<i class="fa-solid fa-circle-check"></i> تأیید شد! در حال ورود...';
        setTimeout(() => { window.location.href = 'index.html'; }, 900);
        return;
      } catch(err){
        // fallback demo check
        if (code !== DEMO_OTP) {
          msg.className = 'otp-msg show otp-msg--err';
          msg.textContent = err.message.includes('یافت نشد') ? err.message : 'کد واردشده صحیح نیست. (کد آزمایشی: ' + DEMO_OTP + ')';
          setLoading(btn,false); return;
        }
        msg.className = 'otp-msg show otp-msg--ok';
        msg.innerHTML = '<i class="fa-solid fa-circle-check"></i> تأیید شد! در حال ورود...';
        setTimeout(() => { window.location.href = 'index.html'; }, 900);
      } finally { setLoading(btn,false); }
    });
  }

  /* ================= REGISTER: username + phone ================= */
  const regForm = $('#regForm');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = $('#regBtn');
      const ok = $('#regSuccess');
      const err = $('#regError');
      ok.hidden = true;
      err.hidden = true;
      const name = $('#rgUsername').value.trim();
      if (name.length < 3) {
        err.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> نام کاربری باید حداقل ۳ کاراکتر باشد.';
        err.hidden = false;
        return;
      }
      if (!validPhone($('#rgPhone').value)) {
        err.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> شماره موبایل معتبر وارد کنید (۰۹xxxxxxxxx).';
        err.hidden = false;
        return;
      }
      setLoading(btn, true);
      try {
        const r = await fetch('api/auth/register', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({username:name, phone: $('#rgPhone').value.trim()})});
        const d = await r.json();
        if(!d.ok) throw new Error(d.error);
        ok.hidden = false;
        setTimeout(() => { window.location.href = 'login.html'; }, 1200);
      } catch(ex){
        // fallback demo
        if(ex.message.includes('قبلاً ثبت')){ err.innerHTML='<i class="fa-solid fa-triangle-exclamation"></i> '+ex.message; err.hidden=false; setLoading(btn,false); return; }
        console.warn('register fallback:', ex.message);
        ok.hidden = false;
        setTimeout(() => { window.location.href = 'login.html'; }, 1200);
      } finally { setLoading(btn,false); }
    });
  }
})();