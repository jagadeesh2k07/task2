'use strict';

/* ===== Live particle background — same as portfolio ===== */
const canvas = document.getElementById('particleCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1
    };
  }

  for (let i = 0; i < 110; i++) particles.push(createParticle());

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(251, 146, 60, ${p.alpha})`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(251, 146, 60, ${0.06 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
}

/* ===== Form helpers ===== */
const $ = id => document.getElementById(id);

function setErr(grp, errId, msg) {
  const g = $(grp), e = $(errId);
  if (!g || !e) return;
  g.classList.add('has-error');
  g.classList.remove('has-ok');
  e.textContent = msg;
}

function setOk(grp, errId) {
  const g = $(grp), e = $(errId);
  if (!g || !e) return;
  g.classList.remove('has-error');
  g.classList.add('has-ok');
  e.textContent = '';
}

function clear(grp, errId) {
  const g = $(grp), e = $(errId);
  if (!g || !e) return;
  g.classList.remove('has-error', 'has-ok');
  e.textContent = '';
}

function showToast(id, msg, type = 'ok') {
  const t = $(id);
  if (!t) return;
  t.textContent = msg;
  t.className = `toast ${type}`;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 4000);
}

function setLoad(btnId, txtId, loadId, on) {
  const b = $(btnId), t = $(txtId), l = $(loadId);
  if (!b || !t || !l) return;
  b.disabled = on;
  t.classList.toggle('hidden', on);
  l.classList.toggle('hidden', !on);
}

const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const validPhone = v => /^[+]?[\d\s\-()]{7,15}$/.test(v.trim());

function toggleEye(inputId, iconId) {
  const inp  = $(inputId);
  const icon = $(iconId);
  if (!inp || !icon) return;
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  icon.className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
}

function forgotPw(e) {
  e.preventDefault();
  alert('Password reset flow goes here — connect to PHP in Task 3.');
}

const TAKEN = ['test@gmail.com', 'admin@site.com', 'user@example.com'];

function checkEmail(val, hintId) {
  const hint = $(hintId);
  if (!hint || !validEmail(val)) return;
  hint.style.color = 'var(--text-muted)';
  hint.textContent = 'Checking…';

  setTimeout(() => {
    if (TAKEN.includes(val.toLowerCase())) {
      hint.style.color = 'var(--err)';
      hint.textContent = '✗ Email already registered.';
      setErr('grp-remail', 'err-remail', '');
    } else {
      hint.style.color = 'var(--ok)';
      hint.textContent = '✓ Email is available.';
      setOk('grp-remail', 'err-remail');
    }
  }, 650);
}

/* ===== Password strength — tied to actual rules, not raw length =====
   Categories: lowercase, uppercase, number, symbol.
   A long password that only repeats one character class never
   outranks a shorter password that actually meets the rules. */
function categories(pw) {
  let c = 0;
  if (/[a-z]/.test(pw)) c++;
  if (/[A-Z]/.test(pw)) c++;
  if (/[0-9]/.test(pw)) c++;
  if (/[^A-Za-z0-9]/.test(pw)) c++;
  return c;
}

function strengthLevel(pw) {
  if (!pw) return 0;
  const len = pw.length;
  const cat = categories(pw);
  if (len < 8) return 1;                              // Weak — under minimum length
  if (cat <= 2) return 2;                              // Fair — long but low variety
  if (cat === 3) return len >= 12 ? 4 : 3;             // Good / Strong
  return len >= 12 ? 5 : 4;                            // cat === 4 → Strong / Very strong
}

function updateBar(pw) {
  const fill = $('str-fill');
  const txt  = $('str-txt');
  if (!fill || !txt) return;

  const map = [
    { w:'0%',   c:'transparent', t:'' },
    { w:'20%',  c:'#ef4444',     t:'Weak' },
    { w:'40%',  c:'#f97316',     t:'Fair' },
    { w:'65%',  c:'#eab308',     t:'Good' },
    { w:'85%',  c:'#84cc16',     t:'Strong' },
    { w:'100%', c:'#4ade80',     t:'Very strong ✓' },
  ];
  const s = strengthLevel(pw);
  fill.style.width      = map[s].w;
  fill.style.background = map[s].c;
  txt.textContent       = pw ? map[s].t : '';
  txt.style.color       = map[s].c;
}

/* Live checkmarks against each individual password rule */
function updatePwRules(pw) {
  const rules = [
    { id: 'rule-len',    test: pw.length >= 8 },
    { id: 'rule-upper',  test: /[A-Z]/.test(pw) },
    { id: 'rule-num',    test: /[0-9]/.test(pw) },
    { id: 'rule-symbol', test: /[^A-Za-z0-9]/.test(pw) },
  ];
  rules.forEach(r => {
    const li = $(r.id);
    if (!li) return;
    const icon = li.querySelector('i');
    li.classList.toggle('met', r.test);
    if (icon) icon.className = r.test ? 'fas fa-check-circle' : 'fas fa-circle';
  });
}

/* ===== Login page ===== */
(function initLogin() {
  const form = $('loginForm');
  if (!form) return;

  $('email').addEventListener('blur', function () {
    const v = this.value.trim();
    if (!v)              return setErr('grp-email', 'err-email', 'Email is required.');
    if (!validEmail(v))  return setErr('grp-email', 'err-email', 'Enter a valid email address.');
    setOk('grp-email', 'err-email');
  });
  $('email').addEventListener('input', function () {
    if (this.value.trim()) clear('grp-email', 'err-email');
  });

  $('password').addEventListener('blur', function () {
    const v = this.value;
    if (!v)        return setErr('grp-pass', 'err-pass', 'Password is required.');
    if (v.length < 6) return setErr('grp-pass', 'err-pass', 'At least 6 characters required.');
    setOk('grp-pass', 'err-pass');
  });
  $('password').addEventListener('input', function () {
    if (this.value) clear('grp-pass', 'err-pass');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let ok = true;

    const email = $('email').value.trim();
    const pw    = $('password').value;

    if (!email)             { setErr('grp-email', 'err-email', 'Email is required.');           ok = false; }
    else if (!validEmail(email)) { setErr('grp-email', 'err-email', 'Enter a valid email.'); ok = false; }
    else                     setOk('grp-email', 'err-email');

    if (!pw)         { setErr('grp-pass', 'err-pass', 'Password is required.');      ok = false; }
    else if (pw.length < 6) { setErr('grp-pass', 'err-pass', 'At least 6 characters.'); ok = false; }
    else             setOk('grp-pass', 'err-pass');

    if (!ok) return;

    setLoad('loginBtn', 'loginTxt', 'loginLoad', true);
    setTimeout(() => {
      setLoad('loginBtn', 'loginTxt', 'loginLoad', false);
      if (email === 'wrong@test.com') {
        showToast('toast', '✗ Incorrect email or password.', 'bad');
      } else {
        showToast('toast', '✓ Signed in! Redirecting…', 'ok');
        setTimeout(() => { window.location.href = "https://portfolio-lilac-nine-74.vercel.app/"; }, 1300);
      }
    }, 1200);
  });
})();

/* ===== Register page ===== */
(function initRegister() {
  const form = $('registerForm');
  if (!form) return;

  $('rpw').addEventListener('input', function () {
    updateBar(this.value);
    updatePwRules(this.value);
    clear('grp-rpw', 'err-rpw');
    const cv = $('cpw').value;
    if (cv) matchCheck(this.value, cv);
  });

  $('cpw').addEventListener('input', function () {
    matchCheck($('rpw').value, this.value);
  });

  let timer;
  $('remail').addEventListener('input', function () {
    clear('grp-remail', 'err-remail');
    const h = $('hint-email');
    if (h) h.textContent = '';
    clearTimeout(timer);
    const v = this.value.trim();
    if (validEmail(v)) {
      timer = setTimeout(() => checkEmail(v, 'hint-email'), 600);
    }
  });

  $('fname').addEventListener('blur', function () {
    const v = this.value.trim();
    if (!v || v.length < 2) setErr('grp-fname', 'err-fname', 'Enter your first name.');
    else setOk('grp-fname', 'err-fname');
  });

  $('lname').addEventListener('blur', function () {
    const v = this.value.trim();
    if (!v) setErr('grp-lname', 'err-lname', 'Enter your last name.');
    else setOk('grp-lname', 'err-lname');
  });

  $('remail').addEventListener('blur', function () {
    const v = this.value.trim();
    if (!v)             setErr('grp-remail', 'err-remail', 'Email is required.');
    else if (!validEmail(v)) setErr('grp-remail', 'err-remail', 'Enter a valid email.');
  });

  $('phone').addEventListener('blur', function () {
    const v = this.value.trim();
    if (v && !validPhone(v)) setErr('grp-phone', 'err-phone', 'Enter a valid phone number.');
    else clear('grp-phone', 'err-phone');
  });

  $('rpw').addEventListener('blur', function () {
    const v = this.value;
    if (!v)          return setErr('grp-rpw', 'err-rpw', 'Password is required.');
    if (v.length < 8) return setErr('grp-rpw', 'err-rpw', 'Use at least 8 characters.');
    if (categories(v) < 2) return setErr('grp-rpw', 'err-rpw', 'Too weak — mix in uppercase, numbers, or symbols.');
    setOk('grp-rpw', 'err-rpw');
  });

  $('cpw').addEventListener('blur', function () {
    matchCheck($('rpw').value, this.value);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let ok = true;

    const fn    = $('fname').value.trim();
    const ln    = $('lname').value.trim();
    const email = $('remail').value.trim();
    const phone = $('phone').value.trim();
    const pw    = $('rpw').value;
    const cpw   = $('cpw').value;
    const terms = $('terms').checked;

    if (!fn || fn.length < 2)  { setErr('grp-fname',  'err-fname',  'First name required.');       ok = false; } else setOk('grp-fname',  'err-fname');
    if (!ln)                   { setErr('grp-lname',  'err-lname',  'Last name required.');         ok = false; } else setOk('grp-lname',  'err-lname');
    if (!email)                { setErr('grp-remail', 'err-remail', 'Email is required.');          ok = false; }
    else if (!validEmail(email)) { setErr('grp-remail', 'err-remail', 'Enter a valid email.');       ok = false; }
    else setOk('grp-remail', 'err-remail');

    if (phone && !validPhone(phone)) { setErr('grp-phone', 'err-phone', 'Enter a valid phone.'); ok = false; }

    if (!pw)           { setErr('grp-rpw', 'err-rpw', 'Password required.');          ok = false; }
    else if (pw.length < 8)  { setErr('grp-rpw', 'err-rpw', 'At least 8 characters.'); ok = false; }
    else if (categories(pw) < 2) { setErr('grp-rpw', 'err-rpw', 'Too weak — mix in uppercase, numbers, or symbols.'); ok = false; }
    else setOk('grp-rpw', 'err-rpw');

    if (!cpw)    { setErr('grp-cpw', 'err-cpw', 'Confirm your password.'); ok = false; }
    else if (pw !== cpw) { setErr('grp-cpw', 'err-cpw', 'Passwords do not match.');  ok = false; }
    else setOk('grp-cpw', 'err-cpw');

    if (!terms) { setErr('grp-terms', 'err-terms', 'You must agree to continue.'); ok = false; }
    else clear('grp-terms', 'err-terms');

    if (!ok) return;

    setLoad('regBtn', 'regTxt', 'regLoad', true);
    setTimeout(() => {
      setLoad('regBtn', 'regTxt', 'regLoad', false);
      showToast('reg-toast', `✓ Account created! Welcome, ${fn}. Redirecting to sign in…`, 'ok');
      setTimeout(() => { window.location.href = 'login.html'; }, 2000);
    }, 1400);
  });
})();

function matchCheck(pw, cpw) {
  const ok = $('match-ok');
  if (!cpw) { clear('grp-cpw', 'err-cpw'); if (ok) ok.classList.add('hidden'); return; }
  if (pw === cpw) {
    setOk('grp-cpw', 'err-cpw');
    if (ok) ok.classList.remove('hidden');
  } else {
    setErr('grp-cpw', 'err-cpw', 'Passwords do not match.');
    if (ok) ok.classList.add('hidden');
  }
}