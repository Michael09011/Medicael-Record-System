async function postJson(url, payload) {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const text = await res.text();
    try { return { ok: res.ok, body: JSON.parse(text) }; } catch (e) { return { ok: res.ok, body: text }; }
  } catch (err) {
    console.error('postJson error', err);
    return { ok: false, body: { error: err.message } };
  }
}

function formatPhone(v) {
  if (!v) return '';
  const d = (v + '').replace(/\D/g, '');
  if (d.startsWith('02')) {
    if (d.length <= 2) return d;
    if (d.length <= 5) return d.replace(/(02)(\d{0,3})/, '$1-$2');
    if (d.length <= 9) return d.replace(/(02)(\d{3})(\d{0,4})/, '$1-$2-$3');
    return d.replace(/(02)(\d{4})(\d{0,4})/, '$1-$2-$3');
  } else {
    if (d.length <= 3) return d;
    if (d.length <= 6) return d.replace(/(\d{3})(\d{0,3})/, '$1-$2');
    if (d.length <= 10) return d.replace(/(\d{3})(\d{3})(\d{0,4})/, '$1-$2-$3');
    return d.replace(/(\d{3})(\d{4})(\d{0,4})/, '$1-$2-$3');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('authLoginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const loginIdEl = document.getElementById('a_loginId');
      const passwordEl = document.getElementById('a_password');
      const loginId = loginIdEl ? loginIdEl.value.trim() : '';
      const password = passwordEl ? passwordEl.value : '';
      const r = await postJson('/api/auth/login', { loginId, password });
      console.log('login response', r);
      if (r.ok) {
        sessionStorage.setItem('emr_user', JSON.stringify(r.body));
        window.location.href = '/';
      } else {
        alert((r.body && r.body.error) || '로그인 실패');
      }
    });
  }

  const toSignup = document.getElementById('toSignup');
  if (toSignup) toSignup.addEventListener('click', (e) => { /* navigation handled by href */ });

  const toLogin = document.getElementById('toLogin');
  if (toLogin) toLogin.addEventListener('click', (e) => { /* navigation handled by href */ });

  const toReset = document.getElementById('toReset');
  if (toReset) toReset.addEventListener('click', (e) => { /* navigation handled by href */ });

  const signupBtn = document.getElementById('authSignupBtn');
  if (signupBtn) {
    signupBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const nameEl = document.getElementById('s_name');
      const loginIdEl = document.getElementById('s_loginId');
      const passwordEl = document.getElementById('s_password');
      const name = nameEl ? nameEl.value.trim() : '';
      const loginId = loginIdEl ? loginIdEl.value.trim() : '';
      const password = passwordEl ? passwordEl.value : '';
      const roleEl = document.getElementById('s_role');
      const role = roleEl ? roleEl.value : 'DOCTOR';
      const phoneEl = document.getElementById('s_phone');
      const birthEl = document.getElementById('s_birthDate');
      const addrEl = document.getElementById('s_address');
      const phone = phoneEl ? phoneEl.value.trim() : '';
      const birthDate = birthEl ? birthEl.value : null;
      const address = addrEl ? addrEl.value.trim() : '';
      if (!name || !loginId || !password) { alert('이름/아이디/비밀번호는 필수입니다'); return; }
      // client-side validation
      if (phone) {
        const digits = phone.replace(/\D/g, '');
        if (digits.length < 9 || digits.length > 11) { alert('전화번호 형식이 올바르지 않습니다'); return; }
      }
      if (birthDate) {
        const d = new Date(birthDate);
        if (isNaN(d.getTime())) { alert('생년월일 형식이 올바르지 않습니다'); return; }
      }
      const r = await postJson('/api/users', { name, loginId, password, role, phone, birthDate, address });
      console.log('signup response', r);
      if (r.ok) {
        alert('회원가입 완료');
        sessionStorage.setItem('emr_user', JSON.stringify(r.body));
        window.location.href = '/';
      } else {
        alert((r.body && r.body.error) || '회원가입 실패');
      }
    });
  }

  const requestResetBtn = document.getElementById('requestResetBtn');
  if (requestResetBtn) {
    requestResetBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const loginIdEl = document.getElementById('r_loginId');
      const loginId = loginIdEl ? loginIdEl.value.trim() : '';
      const r = await postJson('/api/auth/request-reset', { loginId });
      console.log('request-reset response', r);
      if (r.ok) {
        alert('토큰이 생성되었습니다. (실제로는 이메일로 전송됩니다) 토큰: ' + r.body.token);
        const step1 = document.getElementById('resetStep1');
        const step2 = document.getElementById('resetStep2');
        if (step1) step1.style.display = 'none';
        if (step2) step2.style.display = '';
        const tokenEl = document.getElementById('r_token');
        if (tokenEl) tokenEl.value = r.body.token;
      } else alert((r.body && r.body.error) || '토큰 요청 실패');
    });
  }

  const doResetBtn = document.getElementById('doResetBtn');
  if (doResetBtn) {
    doResetBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const tokenEl = document.getElementById('r_token');
      const newPasswordEl = document.getElementById('r_newPassword');
      const token = tokenEl ? tokenEl.value.trim() : '';
      const newPassword = newPasswordEl ? newPasswordEl.value : '';
      const r = await postJson('/api/auth/reset', { token, newPassword });
      console.log('reset response', r);
      if (r.ok) { alert('비밀번호가 변경되었습니다.'); window.location.href = '/login.html'; }
      else alert((r.body && r.body.error) || '비밀번호 변경 실패');
    });
  }
  // phone auto-format for signup
  const sPhone = document.getElementById('s_phone');
  if (sPhone) {
    sPhone.addEventListener('input', (e) => {
      const pos = e.target.selectionStart;
      e.target.value = formatPhone(e.target.value);
      try { e.target.selectionStart = e.target.selectionEnd = pos; } catch (e) {}
    });
  }
});
