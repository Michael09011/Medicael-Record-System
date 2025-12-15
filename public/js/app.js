async function fetchPatients() {
  const res = await fetch('/api/patients?includeEncounters=1');
  if (!res.ok) {
    showAlert('환자 목록을 불러오는데 실패했습니다.');
    return [];
  }
  return res.json();
}

async function fetchStaff() {
  try {
    const res = await fetch('/api/users/staff');
    if (!res.ok) return [];
    return res.json();
  } catch (e) { return []; }
}

function renderStaff(list) {
  const grid = document.getElementById('staffList');
  if (!grid) return;
  grid.innerHTML = '';
  if (!list || list.length === 0) {
    grid.innerHTML = '<div class="text-muted">등록된 직원이 없습니다.</div>';
    return;
  }
  list.forEach(u => {
    const card = document.createElement('div');
    card.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
    card.innerHTML = `
      <div class="card h-100 shadow-sm staff-card">
        <div class="card-body">
          <h5 class="card-title mb-1">${u.name}</h5>
                <div class="text-muted small">역할: ${roleLabel(u.role)}</div>
                <div class="mt-2">전화: ${u.phone || '-'}</div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function visitTypeLabel(type) {
  const map = { OUTPATIENT: '외래', INPATIENT: '입원', EMERGENCY: '응급' };
  return type ? (map[type] || type) : '';
}

function statusLabel(s) {
  const map = { OPEN: '진행중', CLOSED: '완료' };
  return s ? (map[s] || s) : '';
}

function insuranceLabel(code) {
  if (!code) return '-';
  const map = { LOCAL: '지역', WORK: '직장', AUTO: '자동차보험', TYPE1: '1종보호', TYPE2: '2종보호' };
  return map[code] || code;
}

function roleLabel(role) {
  if (!role) return '-';
  const map = {
    'DOCTOR': '의사',
    'NURSE': '간호사',
    'THERAPIST': '치료사',
    'PHYSIOTHERAPIST': '물리치료사',
    'OCCUPATIONAL_THERAPIST': '작업치료사',
    'ADMIN': '관리자',
    'RECEPTION': '접수',
    'LAB': '검사실'
  };
  return map[role] || role;
}

function formatPhone(v) {
  if (!v) return '';
  const d = v.replace(/\D/g, '');
  // 서울(02) 처리: 2-3-4 or 2-4-4, 일반: 3-3-4 or 3-4-4
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

function showAlert(msg) {
  const a = document.getElementById('alert');
  a.innerHTML = `<div class="alert alert-warning">${msg}</div>`;
}

function renderPatients(list) {
  const grid = document.getElementById('patientsGrid');
  grid.innerHTML = '';
  // sort patients by latest encounter visitDate (newest first). Patients without encounters go last.
  list.sort((a,b) => {
    const aLast = (a.Encounters && a.Encounters.length) ? Math.max(...a.Encounters.map(x => new Date(x.visitDate).getTime())) : 0;
    const bLast = (b.Encounters && b.Encounters.length) ? Math.max(...b.Encounters.map(x => new Date(x.visitDate).getTime())) : 0;
    return bLast - aLast;
  });
  list.forEach(p => {
    const lastVisit = (p.Encounters && p.Encounters.length) ? new Date(Math.max(...p.Encounters.map(x => new Date(x.visitDate).getTime()))) : null;
    const card = document.createElement('div');
    card.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
    card.innerHTML = `
      <div class="card h-100 shadow-sm patient-card" data-id="${p.id}" style="cursor:pointer">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h5 class="card-title mb-1">${p.name}</h5>
              <div class="text-muted small">생년월일: ${p.birthDate || '-'}</div>
            </div>
            <div class="text-end">
              <div class="text-muted small">${lastVisit ? lastVisit.toLocaleString() : '미진료'}</div>
              <div class="badge bg-secondary mt-1">${p.phone || '-'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
    card.querySelector('.patient-card').addEventListener('click', () => showPatientDetail(p.id));
    grid.appendChild(card);
  });
}

// attach phone formatting to patient form phone input
const pfPhoneEl = document.getElementById('pf_phone');
if (pfPhoneEl) {
  pfPhoneEl.addEventListener('input', (e) => {
    const pos = e.target.selectionStart;
    const before = e.target.value;
    e.target.value = formatPhone(e.target.value);
    // try to preserve caret approximately
    try { e.target.selectionStart = e.target.selectionEnd = pos; } catch (err) {}
  });
}

document.getElementById('refresh').addEventListener('click', async () => {
  if (!getLoggedInUser()) return showAlert('로그인해야 합니다');
  const list = await fetchPatients();
  renderPatients(list);
});

document.getElementById('search').addEventListener('input', async (e) => {
  const q = e.target.value.trim().toLowerCase();
  if (!getLoggedInUser()) return showAlert('로그인해야 합니다');
  const list = await fetchPatients();
  if (!q) return renderPatients(list);
  renderPatients(list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.phone || '').toLowerCase().includes(q)));
});

// initial account UI and load
refreshAccountUI();
// hide staff section by default on main page
const _staffSectionInit = document.getElementById('staffSection');
if (_staffSectionInit) _staffSectionInit.style.display = 'none';
if (!getLoggedInUser()) {
  const grid = document.getElementById('patientsGrid');
  if (grid) grid.innerHTML = '<div class="alert alert-info">환자 목록을 보려면 <a href="/login.html">로그인</a>하세요.</div>';
} else {
  fetchPatients().then(renderPatients).catch(() => showAlert('초기 로드 실패'));
  // load staff only when logged in
  fetchStaff().then(renderStaff).catch(() => {});
}

// --- Patient Detail / Encounter UI ---
const patientModalEl = document.getElementById('patientModal');
const patientModal = new bootstrap.Modal(patientModalEl);
const patientFormModalEl = document.getElementById('patientFormModal');
const patientFormModal = new bootstrap.Modal(patientFormModalEl);

document.getElementById('newPatient').addEventListener('click', () => {
  if (!getLoggedInUser()) return showAlert('로그인해야 합니다');
  openPatientForm();
});

// menu actions
const menuNewPatient = document.getElementById('menuNewPatient');
if (menuNewPatient) menuNewPatient.addEventListener('click', (ev) => { ev.preventDefault(); if (!getLoggedInUser()) return showAlert('로그인해야 합니다'); openPatientForm(); });
const menuPatients = document.getElementById('menuPatients');
if (menuPatients) menuPatients.addEventListener('click', (ev) => {
  ev.preventDefault();
  // show patients view, hide staff view
  const grid = document.getElementById('patientsGrid');
  const staffSection = document.getElementById('staffSection');
  if (grid) grid.style.display = '';
  if (staffSection) staffSection.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
const menuStaff = document.getElementById('menuStaff');
if (menuStaff) menuStaff.addEventListener('click', (ev) => {
  ev.preventDefault();
  if (!getLoggedInUser()) return showAlert('로그인해야 합니다');
  // show staff view, hide patients
  const grid = document.getElementById('patientsGrid');
  const staffSection = document.getElementById('staffSection');
  if (grid) grid.style.display = 'none';
  if (staffSection) staffSection.style.display = '';
  // ensure staff loaded
  fetchStaff().then(renderStaff).catch(() => {});
  // scroll to staff area
  const el = document.getElementById('staffSection');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
});
const menuStartEncounter = document.getElementById('menuStartEncounter');
if (menuStartEncounter) menuStartEncounter.addEventListener('click', async (ev) => {
  ev.preventDefault();
  if (!getLoggedInUser()) return showAlert('로그인해야 합니다');
  // start encounter for currently opened patient in modal
  const currentPatientId = document.getElementById('patientId') ? document.getElementById('patientId').value : null;
  if (!currentPatientId) return showAlert('환자가 선택되어 있지 않습니다. 먼저 환자 상세를 열어주세요.');
  const payload = { patientId: currentPatientId, visitDate: new Date().toISOString(), visitType: 'OUTPATIENT', status: 'OPEN' };
  const res = await fetch('/api/encounters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (res.ok) {
    showPatientDetail(currentPatientId);
  } else {
    showAlert('진료 시작 실패');
  }
});

const menuAdminBtn = document.getElementById('menuAdmin');
if (menuAdminBtn) menuAdminBtn.addEventListener('click', (ev) => { ev.preventDefault(); window.location.href = '/admin.html'; });

// account dropdown handlers and modals
const loginModalEl = document.getElementById('loginModal');
const loginModal = loginModalEl ? new bootstrap.Modal(loginModalEl) : null;
const signupModalEl = document.getElementById('signupModal');
const signupModal = signupModalEl ? new bootstrap.Modal(signupModalEl) : null;

const acctLogin = document.getElementById('acctLogin');
  if (acctLogin) acctLogin.addEventListener('click', (ev) => { ev.preventDefault(); window.location.href = '/login.html'; });
const acctSignup = document.getElementById('acctSignup');
  if (acctSignup) acctSignup.addEventListener('click', (ev) => { ev.preventDefault(); window.location.href = '/signup.html'; });

function setLoggedInUser(user) {
  // store minimal user in sessionStorage
  if (user) sessionStorage.setItem('emr_user', JSON.stringify(user));
  else sessionStorage.removeItem('emr_user');
  refreshAccountUI();
  // update patient list visibility on login/logout
  const grid = document.getElementById('patientsGrid');
  if (!user) {
    if (grid) grid.innerHTML = '<div class="alert alert-info">환자 목록을 보려면 <a href="/login.html">로그인</a>하세요.</div>';
  } else {
    // load patients after login
    fetchPatients().then(renderPatients).catch(() => showAlert('환자 로드 실패'));
  }
}

function getLoggedInUser() {
  const s = sessionStorage.getItem('emr_user');
  return s ? JSON.parse(s) : null;
}

function refreshAccountUI() {
  const user = getLoggedInUser();
  const acctBtn = document.getElementById('accountDropdown');
  const acctLoginEl = document.getElementById('acctLogin');
  const acctSignupEl = document.getElementById('acctSignup');
  const acctLogoutEl = document.getElementById('acctLogout');
  const acctProfileEl = document.getElementById('acctProfile');
  if (user) {
    if (acctBtn) acctBtn.textContent = user.name || user.loginId || '내 계정';
    if (acctLoginEl) acctLoginEl.style.display = 'none';
    if (acctSignupEl) acctSignupEl.style.display = 'none';
    if (acctLogoutEl) acctLogoutEl.style.display = '';
    if (acctProfileEl) acctProfileEl.style.display = '';
  } else {
    if (acctBtn) acctBtn.textContent = '계정';
    if (acctLoginEl) acctLoginEl.style.display = '';
    if (acctSignupEl) acctSignupEl.style.display = '';
    if (acctLogoutEl) acctLogoutEl.style.display = 'none';
    if (acctProfileEl) acctProfileEl.style.display = 'none';
  }
  // show admin menu if role is ADMIN
  const menuAdmin = document.getElementById('menuAdmin');
  if (menuAdmin) menuAdmin.style.display = (user && user.role === 'ADMIN') ? '' : 'none';
    // show refresh button only when logged in
    const refreshBtn = document.getElementById('refresh');
    if (refreshBtn) refreshBtn.style.display = user ? '' : 'none';
    // show staff menu only when logged in
    const menuStaff = document.getElementById('menuStaff');
    if (menuStaff) menuStaff.style.display = user ? '' : 'none';
}

// Register account-related actions after header is injected.
window.registerAccountActions = function() {
  const acctLoginEl = document.getElementById('acctLogin');
  if (acctLoginEl) acctLoginEl.onclick = (ev) => { ev.preventDefault(); window.location.href = '/login.html'; };

  const acctSignupEl = document.getElementById('acctSignup');
  if (acctSignupEl) acctSignupEl.onclick = (ev) => { ev.preventDefault(); window.location.href = '/signup.html'; };

  const acctProfileEl = document.getElementById('acctProfile');
  if (acctProfileEl) acctProfileEl.onclick = (ev) => { ev.preventDefault(); openProfileModal(); };

  const acctLogoutEl = document.getElementById('acctLogout');
  if (acctLogoutEl) acctLogoutEl.onclick = (ev) => { ev.preventDefault(); setLoggedInUser(null); showAlert('로그아웃되었습니다.'); };
};

// helper to return prototype auth headers from sessionStorage
function getAuthHeaders() {
  const u = getLoggedInUser();
  const h = { 'Content-Type': 'application/json' };
  if (u && u.id) {
    h['x-user-id'] = u.id;
    if (u.role) h['x-user-role'] = u.role;
  }
  return h;
}

// --- Translation helper (uses server proxy at /api/translate) ---
async function translateText(text, target, source = 'auto') {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source, target })
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body.translatedText || null;
  } catch (err) { return null; }
}

// Profile modal handling: attach click to dropdown and initialize modal at runtime
const acctProfile = document.getElementById('acctProfile');
if (acctProfile) acctProfile.addEventListener('click', (ev) => { ev.preventDefault(); openProfileModal(); });

async function openProfileModal() {
  const user = getLoggedInUser();
  if (!user) return showAlert('로그인되어 있지 않습니다');
  try {
    const res = await fetch('/api/users/me', { headers: getAuthHeaders() });
    if (!res.ok) return showAlert('프로필을 불러오지 못했습니다');
    const p = await res.json();
    // populate fields
    const modalEl = document.getElementById('profileModal');
    if (!modalEl) return showAlert('프로필 모달을 찾을 수 없습니다');
    modalEl.querySelector('#p_name').value = p.name || '';
    modalEl.querySelector('#p_phone').value = p.phone || '';
    modalEl.querySelector('#p_birthDate').value = p.birthDate || '';
    modalEl.querySelector('#p_address').value = p.address || '';
    modalEl.querySelector('#p_password').value = '';
    modalEl.querySelector('#profileError').textContent = '';

    // attach save handler (rebind to ensure it exists even if script ran earlier)
    const profileSaveBtn = modalEl.querySelector('#profileSaveBtn');
    if (profileSaveBtn) {
      profileSaveBtn.onclick = async (ev) => {
        ev.preventDefault();
        const payload = {
          name: modalEl.querySelector('#p_name').value.trim(),
          phone: modalEl.querySelector('#p_phone').value.trim(),
          birthDate: modalEl.querySelector('#p_birthDate').value || null,
          address: modalEl.querySelector('#p_address').value.trim()
        };
        const pwd = modalEl.querySelector('#p_password').value;
        if (pwd) payload.password = pwd;
        try {
          const res2 = await fetch('/api/users/me', { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) });
          const body = await res2.json().catch(() => ({}));
          if (!res2.ok) { modalEl.querySelector('#profileError').textContent = body.error || '저장 실패'; return; }
          const cur = getLoggedInUser() || {};
          const updated = { id: body.id || cur.id, loginId: body.loginId || cur.loginId, name: body.name || cur.name, role: body.role || cur.role };
          setLoggedInUser(updated);
          // hide modal
          bootstrap.Modal.getOrCreateInstance(modalEl).hide();
          showAlert('프로필이 저장되었습니다.');
        } catch (err) { modalEl.querySelector('#profileError').textContent = '저장 중 오류'; }
      };
    }

    // show modal
    new bootstrap.Modal(modalEl).show();
  } catch (err) { showAlert('프로필을 불러오는 중 오류'); }
}

// login submit
const loginSubmit = document.getElementById('loginSubmit');
if (loginSubmit) loginSubmit.addEventListener('click', async (ev) => {
  ev.preventDefault();
  const id = document.getElementById('login_loginId').value.trim();
  const pw = document.getElementById('login_password').value;
  if (!id || !pw) { document.getElementById('loginError').textContent = '아이디와 비밀번호를 입력하세요'; return; }
  // NOTE: no backend auth implemented — simulate success for any credentials
  const user = { loginId: id, name: id, role: 'ADMIN' };
  setLoggedInUser(user);
  if (loginModal) loginModal.hide();
});

// signup submit
const signupSubmit = document.getElementById('signupSubmit');
if (signupSubmit) signupSubmit.addEventListener('click', async (ev) => {
  ev.preventDefault();
  const name = document.getElementById('signup_name').value.trim();
  const id = document.getElementById('signup_loginId').value.trim();
  const pw = document.getElementById('signup_password').value;
  const role = document.getElementById('signup_role').value || 'DOCTOR';
  if (!name || !id || !pw) { document.getElementById('signupError').textContent = '모든 항목을 입력하세요'; return; }
  // NOTE: backend user creation not implemented — simulate account creation and login
  const user = { loginId: id, name, role };
  setLoggedInUser(user);
  if (signupModal) signupModal.hide();
});

// logout
const acctLogout = document.getElementById('acctLogout');
if (acctLogout) acctLogout.addEventListener('click', (ev) => { ev.preventDefault(); setLoggedInUser(null); showAlert('로그아웃되었습니다.'); });

// initialize UI from session
refreshAccountUI();

document.getElementById('savePatientBtn').addEventListener('click', submitPatientForm);
document.getElementById('editPatientBtn').addEventListener('click', () => {
  const id = document.getElementById('patientId').value;
  if (id) openPatientForm(id);
});
document.getElementById('deletePatientBtn').addEventListener('click', async () => {
  const id = document.getElementById('patientId').value;
  if (!id) return;
  if (!confirm('삭제하시겠습니까?')) return;
  const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
  if (res.ok) {
    patientModal.hide();
    const list = await fetchPatients();
    renderPatients(list);
  } else {
    showAlert('삭제에 실패했습니다.');
  }
});

function openPatientForm(id) {
  // reset
  document.getElementById('patientForm').reset();
  document.getElementById('patientId').value = '';
  document.getElementById('patientFormLabel').textContent = id ? '환자 수정' : '신규 환자 등록';
  if (!id) {
    patientFormModal.show();
    return;
  }
  // load patient
  fetch(`/api/patients/${id}`).then(r => r.json()).then(p => {
    document.getElementById('patientId').value = p.id;
    document.getElementById('pf_name').value = p.name || '';
    document.getElementById('pf_birthDate').value = p.birthDate || '';
    document.getElementById('pf_gender').value = p.gender || '';
    document.getElementById('pf_phone').value = p.phone || '';
    document.getElementById('pf_address').value = p.address || '';
    document.getElementById('pf_insuranceType').value = p.insuranceType || '';
    patientFormModal.show();
  }).catch(() => showAlert('환자 정보를 불러오지 못했습니다.'));
}

async function submitPatientForm() {
  const id = document.getElementById('patientId').value;
  const payload = {
    name: document.getElementById('pf_name').value,
    birthDate: document.getElementById('pf_birthDate').value || null,
    gender: document.getElementById('pf_gender').value || null,
    phone: document.getElementById('pf_phone').value || null,
    address: document.getElementById('pf_address').value || null,
    insuranceType: document.getElementById('pf_insuranceType').value || null
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/patients/${id}` : '/api/patients';
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (res.ok) {
    patientFormModal.hide();
    const list = await fetchPatients();
    renderPatients(list);
    if (id) {
      // refresh detail
      showPatientDetail(id);
    }
  } else {
    const err = await res.json().catch(() => ({}));
    showAlert(err.error || '저장 실패');
  }
}

async function showPatientDetail(patientId) {
  const res = await fetch(`/api/patients/${patientId}`);
  if (!res.ok) return showAlert('환자 상세를 불러오지 못했습니다.');
  const patient = await res.json();
  const genderText = patient.gender ? (patient.gender === 'M' ? '남자' : (patient.gender === 'F' ? '여자' : patient.gender)) : '-';

  document.getElementById('patientModalLabel').textContent = `환자: ${patient.name}`;
  document.getElementById('patientInfo').innerHTML = `
    <div><strong>이름:</strong> ${patient.name}</div>
    <div><strong>생년월일:</strong> ${patient.birthDate || '-'} </div>
    <div><strong>성별:</strong> ${genderText} </div>
    <div><strong>전화:</strong> ${patient.phone || '-'} </div>
    <div><strong>주소:</strong> ${patient.address || '-'} </div>
    <div><strong>보험 유형:</strong> ${insuranceLabel(patient.insuranceType)}</div>
  `;
  document.getElementById('patientId').value = patient.id;

  const elList = document.getElementById('encounterList');
  elList.innerHTML = '';
  const encounters = (patient.Encounters || []).slice();
  // sort encounters by visitDate desc (newest first)
  encounters.sort((a,b) => new Date(b.visitDate) - new Date(a.visitDate));
  if (encounters.length === 0) {
    elList.innerHTML = '<div class="text-muted">진료 기록이 없습니다.</div>';
    document.getElementById('encounterDetail').style.display = 'none';
  } else {
    encounters.forEach(enc => {
      const wrap = document.createElement('div');
      wrap.className = 'd-flex align-items-center mb-1';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'list-group-item list-group-item-action flex-grow-1 text-start';
      btn.textContent = `${new Date(enc.visitDate).toLocaleString()} — ${visitTypeLabel(enc.visitType)} [${statusLabel(enc.status)}]`;
      btn.dataset.encId = enc.id;
      btn.addEventListener('click', () => showEncounterDetail(enc.id));
      const del = document.createElement('button');
      del.className = 'btn btn-sm btn-outline-danger ms-2';
      del.textContent = '삭제';
      del.addEventListener('click', async (ev) => {
        ev.stopPropagation();
        if (!confirm('진료를 삭제하시겠습니까?')) return;
        const r = await fetch(`/api/encounters/${enc.id}`, { method: 'DELETE' });
        if (r.ok) {
          showPatientDetail(patient.id);
        } else {
          showAlert('삭제 실패');
        }
      });
      wrap.appendChild(btn);
      wrap.appendChild(del);
      elList.appendChild(wrap);
    });
    document.getElementById('encounterDetail').style.display = 'none';
  }

  patientModal.show();
}

// start new encounter
document.getElementById('startEncounterBtn').addEventListener('click', async () => {
  const pid = document.querySelector('#patientId').value || document.getElementById('patientId').value;
  // patientId is set when opening form; when viewing patient detail we set patientId hidden field
  const currentPatientId = document.getElementById('patientId').value;
  if (!currentPatientId) return showAlert('환자 정보가 없습니다.');
  const payload = { patientId: currentPatientId, visitDate: new Date().toISOString(), visitType: 'OUTPATIENT', status: 'OPEN' };
  const res = await fetch('/api/encounters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (res.ok) {
    // refresh patient detail
    showPatientDetail(currentPatientId);
  } else {
    showAlert('진료 시작 실패');
  }
});

async function showEncounterDetail(encounterId) {
  // set global current encounter id for other handlers
  window.__currentEncounterId = encounterId;
  const res = await fetch(`/api/encounters/${encounterId}`);
  if (!res.ok) return showAlert('진료 상세를 불러오지 못했습니다.');
  const e = await res.json();

  document.getElementById('encounterDetail').style.display = 'block';

  // update encounter list button text if present
  try {
    const listBtn = document.querySelector(`#encounterList button[data-enc-id="${encounterId}"]`);
    if (listBtn) {
      listBtn.textContent = `${new Date(e.visitDate).toLocaleString()} — ${visitTypeLabel(e.visitType)} [${statusLabel(e.status)}]`;
    }
  } catch (err) {
    console.warn('encounter list update failed', err);
  }

  // populate visitType select and attach save handler
  const visitSelect = document.getElementById('enc_visitType');
  if (visitSelect) visitSelect.value = e.visitType || '';
  const saveBtn = document.getElementById('saveVisitTypeBtn');
  if (saveBtn) {
    saveBtn.onclick = async () => {
      const newType = document.getElementById('enc_visitType').value || null;
      const payload = { visitType: newType };
      const res = await fetch(`/api/encounters/${encounterId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        showEncounterDetail(encounterId);
      } else {
        const err = await res.json().catch(() => ({}));
        showAlert(err.error || '진료유형 저장 실패');
      }
    };
  }

  // SOAP
  const soapEl = document.getElementById('soap');
  const records = (e.MedicalRecords || []).slice();
  // sort medical records by createdAt desc (newest first)
  records.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const soapListEl = document.getElementById('soapList');
  if (!soapListEl) {
    console.warn('soapList element not found');
  } else {
    if (records.length === 0) {
      soapListEl.innerHTML = '<div class="text-muted">진료기록이 없습니다.</div>';
    } else {
      // render list area
      soapListEl.innerHTML = records.map(r => `
        <div class="mb-3 border-bottom pb-2" data-id="${r.id}">
          <div><strong>주관적:</strong> ${r.subjective || '-'}</div>
          <div><strong>객관적:</strong> ${r.objective || '-'}</div>
          <div><strong>평가:</strong> ${r.assessment || '-'}</div>
          <div><strong>계획:</strong> ${r.plan || '-'}</div>
          <div class="mt-1">
            <button class="btn btn-sm btn-outline-secondary me-2" data-action="edit-soap" data-id="${r.id}">수정</button>
            <button class="btn btn-sm btn-danger" data-action="delete-soap" data-id="${r.id}">삭제</button>
          </div>
          <div class="text-muted small">작성: ${new Date(r.createdAt).toLocaleString()}${r.User ? ' — 작성자: ' + r.User.name + ' (' + r.User.role + ')' : ''}${e.User ? ' — 담당의: ' + e.User.name + ' (' + e.User.role + ')' : ''}</div>
        </div>
      `).join('');
    }
  }

  // Prescriptions
  const prescEl = document.getElementById('prescList');
  const presc = e.Prescriptions || [];
  if (presc.length === 0) {
    prescEl.innerHTML = '<div class="text-muted">처방이 없습니다.</div>';
  } else {
    prescEl.innerHTML = presc.map(p => `
      <div class="mb-3 border-bottom pb-2" data-id="${p.id}">
        <div class="d-flex justify-content-between align-items-start">
          <div><span class="text-muted">${new Date(p.createdAt).toLocaleString()}</span></div>
          <div><button class="btn btn-sm btn-danger" data-action="delete-presc" data-id="${p.id}">삭제 처방</button></div>
        </div>
        <div class="mt-1"><small class="text-muted">작성자: ${p.User ? (p.User.name + ' (' + p.User.role + ')') : '-'}</small></div>
        <div class="mt-2"><strong>메모:</strong> ${p.note ? (p.note.length > 200 ? p.note.substring(0,200) + '...' : p.note) : '<span class="text-muted">(없음)</span>'}</div>
        <div class="mt-2">
          <strong>처방 약 목록:</strong>
          <div class="mt-1" id="presc-${p.id}-meds">
            ${(p.PrescriptionMedications && p.PrescriptionMedications.length) ? p.PrescriptionMedications.map(pm => `
              <div class="d-flex align-items-center mb-1" data-pm-id="${pm.id}">
                <div class="flex-grow-1 presc-med-display" data-pm-id="${pm.id}">${(pm.Medication && pm.Medication.name) || pm.medicationId} — <span class="pm-dosage">${pm.dosage || '-'}</span> / <span class="pm-frequency">${pm.frequency || '-'}</span> / <span class="pm-days">${pm.days || '-'}</span>일</div>
                <button class="btn btn-sm btn-outline-secondary ms-2" data-action="edit-presc-med" data-id="${pm.id}">편집</button>
                <button class="btn btn-sm btn-outline-danger ms-2" data-action="delete-presc-med" data-id="${pm.id}">삭제</button>
              </div>
            `).join('') : '<div class="text-muted">없음</div>'}
          </div>
        </div>

        <div class="mt-2">
          <div class="input-group input-group-sm">
            <input type="text" class="form-control" placeholder="약 검색" data-presc-search-id="${p.id}" />
            <input type="text" class="form-control" placeholder="용량" data-presc-dosage-id="${p.id}" />
            <input type="text" class="form-control" placeholder="횟수" data-presc-frequency-id="${p.id}" />
            <input type="number" class="form-control" placeholder="일수" data-presc-days-id="${p.id}" style="max-width:100px" />
            <button class="btn btn-primary" data-action="add-presc-med" data-presc-id="${p.id}">약 추가</button>
          </div>
          <div class="list-group mt-1" id="presc-${p.id}-suggestions" style="position:relative; z-index:50"></div>
        </div>
      </div>
    `).join('');
  }

  // Physical Therapy
  const ptEl = document.getElementById('ptList');
  const pts = e.PhysicalTherapyRecords || [];
  if (pts.length === 0) {
    ptEl.innerHTML = '<div class="text-muted">물리치료 기록이 없습니다.</div>';
  } else {
    ptEl.innerHTML = pts.map(t => `
      <div class="mb-2 border-bottom pb-2" data-id="${t.id}">
        <div><strong>일자:</strong> ${new Date(t.treatmentDate).toLocaleString()}</div>
        <div><strong>종류:</strong> ${t.treatmentType || '-'} | <strong>부위:</strong> ${t.bodyPart || '-'}</div>
        <div><small class="text-muted">작성자: ${t.User ? (t.User.name + ' (' + t.User.role + ')') : '-'}</small></div>
        <div><strong>시간:</strong> ${t.durationMin || '-'} 분 | <strong>강도:</strong> ${t.intensity || '-'}</div>
        <div><strong>반응:</strong> ${t.patientResponse || '-'}</div>
        <div class="mt-1"><button class="btn btn-sm btn-danger" data-action="delete-pt" data-id="${t.id}">삭제</button></div>
      </div>
    `).join('');
  }

  // Occupational Therapy
  const otEl = document.getElementById('otList');
  const ots = e.OccupationalTherapyRecords || [];
  if (!otEl) {
    // nothing
  } else if (ots.length === 0) {
    otEl.innerHTML = '<div class="text-muted">작업치료 기록이 없습니다.</div>';
  } else {
    otEl.innerHTML = '<h6 class="mt-2">작업치료 (OT)</h6>' + ots.map(t => `
      <div class="mb-2 border-bottom pb-2" data-id="${t.id}">
        <div><strong>일자:</strong> ${new Date(t.treatmentDate).toLocaleString()}</div>
        <div><strong>종류:</strong> ${t.treatmentType || '-'} | <strong>부위:</strong> ${t.bodyPart || '-'}</div>
        <div><small class="text-muted">작성자: ${t.User ? (t.User.name + ' (' + t.User.role + ')') : '-'}</small></div>
        <div><strong>시간:</strong> ${t.durationMin || '-'} 분 | <strong>강도:</strong> ${t.intensity || '-'}</div>
        <div><strong>반응:</strong> ${t.patientResponse || '-'}</div>
        <div class="mt-1"><button class="btn btn-sm btn-danger" data-action="delete-ot" data-id="${t.id}">삭제</button></div>
      </div>
    `).join('');
  }

  // attach handlers for dynamic buttons
  attachEncounterActionHandlers(encounterId);
}

function attachEncounterActionHandlers(encounterId) {
  // delete SOAP
  document.querySelectorAll('[data-action="delete-soap"]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      if (!confirm('삭제하시겠습니까?')) return;
      const res = await fetch(`/api/encounters/medical_records/${id}`, { method: 'DELETE' });
      if (res.ok) showEncounterDetail(encounterId);
    };
  });

  // edit SOAP (simple inline load into new fields)
  document.querySelectorAll('[data-action="edit-soap"]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const res = await fetch(`/api/encounters/${encounterId}`);
      const e = await res.json();
      const rec = (e.MedicalRecords || []).find(r => String(r.id) === String(id));
      if (!rec) return;
      // populate new fields for edit (we'll reuse add fields but save as PUT)
      document.getElementById('new_subjective').value = rec.subjective || '';
      document.getElementById('new_objective').value = rec.objective || '';
      document.getElementById('new_assessment').value = rec.assessment || '';
      document.getElementById('new_plan').value = rec.plan || '';
      // set data-edit attribute
      document.getElementById('addSoapBtn').dataset.editId = id;
    };
  });

  // delete prescription
  document.querySelectorAll('[data-action="delete-presc"]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      if (!confirm('삭제하시겠습니까?')) return;
      const res = await fetch(`/api/encounters/prescriptions/${id}`, { method: 'DELETE' });
      if (res.ok) showEncounterDetail(encounterId);
    };
  });

  // delete prescription medication
  document.querySelectorAll('[data-action="delete-presc-med"]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      if (!confirm('삭제하시겠습니까?')) return;
      const res = await fetch(`/api/prescriptions/medications/${id}`, { method: 'DELETE' });
      if (res.ok) showEncounterDetail(encounterId);
    };
  });

  // edit prescription medication (inline)
  document.querySelectorAll('[data-action="edit-presc-med"]').forEach(btn => {
    btn.onclick = (ev) => {
      const pmId = btn.dataset.id;
      const wrapper = btn.closest('[data-pm-id]');
      const display = wrapper.querySelector('.presc-med-display');
      const currentDosage = wrapper.querySelector('.pm-dosage').textContent === '-' ? '' : wrapper.querySelector('.pm-dosage').textContent;
      const currentFreq = wrapper.querySelector('.pm-frequency').textContent === '-' ? '' : wrapper.querySelector('.pm-frequency').textContent;
      const currentDays = wrapper.querySelector('.pm-days').textContent === '-' ? '' : wrapper.querySelector('.pm-days').textContent.replace('일','').trim();

      // build edit UI
      const editHtml = `
        <div class="d-flex w-100 align-items-center" data-editing-pm-id="${pmId}">
          <div class="flex-grow-1">
            <input class="form-control form-control-sm pm-edit-dosage" placeholder="용량" value="${currentDosage}">
          </div>
          <div class="ms-2" style="width:140px"><input class="form-control form-control-sm pm-edit-frequency" placeholder="횟수" value="${currentFreq}"></div>
          <div class="ms-2" style="width:100px"><input class="form-control form-control-sm pm-edit-days" placeholder="일수" value="${currentDays}"></div>
          <button class="btn btn-sm btn-primary ms-2 pm-edit-save">저장</button>
          <button class="btn btn-sm btn-secondary ms-2 pm-edit-cancel">취소</button>
        </div>
      `;
      // hide display and append edit UI
      display.style.display = 'none';
      wrapper.insertAdjacentHTML('beforeend', editHtml);

      // attach save/cancel
      wrapper.querySelector('.pm-edit-cancel').onclick = () => {
        const editRow = wrapper.querySelector('[data-editing-pm-id]');
        if (editRow) editRow.remove();
        display.style.display = '';
      };

      wrapper.querySelector('.pm-edit-save').onclick = async () => {
        const newDosage = wrapper.querySelector('.pm-edit-dosage').value;
        const newFreq = wrapper.querySelector('.pm-edit-frequency').value;
        const newDays = wrapper.querySelector('.pm-edit-days').value;
        const payload = { dosage: newDosage || null, frequency: newFreq || null, days: newDays ? parseInt(newDays,10) : null };
        const res = await fetch(`/api/prescriptions/medications/${pmId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) {
          showEncounterDetail(encounterId);
        } else {
          showAlert('수정 실패');
        }
      };
    };
  });

  // add medication search handlers
  document.querySelectorAll('[data-action="add-presc-med"]').forEach(btn => {
    btn.onclick = async (ev) => {
      const prescId = btn.dataset.prescId;
      const searchInput = document.querySelector(`[data-presc-search-id="${prescId}"]`);
      const dosageInput = document.querySelector(`[data-presc-dosage-id="${prescId}"]`);
      const freqInput = document.querySelector(`[data-presc-frequency-id="${prescId}"]`);
      const daysInput = document.querySelector(`[data-presc-days-id="${prescId}"]`);
      const q = searchInput.value.trim();
      if (!q) return showAlert('약을 검색해서 선택하세요');
      // try find first exact match from suggestions area (assume user selected by clicking suggestion that set data-med-id)
      const sugg = document.querySelector(`#presc-${prescId}-suggestions .list-group-item.active`);
      let medId = null;
      if (sugg) medId = sugg.dataset.medId;
      if (!medId) {
        // fallback: search by API and take first
        const r = await fetch(`/api/medications?q=${encodeURIComponent(q)}`);
        const list = await r.json();
        if (!list || list.length === 0) {
          // if no medication found, create a new medication entry automatically
          const createRes = await fetch('/api/medications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: q, unit: null, description: 'Created from quick add' }) });
          if (!createRes.ok) return showAlert('약을 찾을 수 없어 생성하려 했지만 실패했습니다. 관리자에게 문의하세요.');
          const created = await createRes.json();
          medId = created.id;
        } else {
          medId = list[0].id;
        }
      }
      const payload = { medicationId: medId, dosage: dosageInput.value || null, frequency: freqInput.value || null, days: parseInt(daysInput.value || '0', 10) || null };
      const res = await fetch(`/api/prescriptions/${prescId}/medications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        showEncounterDetail(encounterId);
      } else {
        showAlert('처방 약 추가 실패');
      }
    };
  });

  // medication search suggestions
  document.querySelectorAll('[data-presc-search-id]').forEach(input => {
    let timer = null;
    input.oninput = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const q = input.value.trim();
        const prescId = input.getAttribute('data-presc-search-id');
        const box = document.getElementById(`presc-${prescId}-suggestions`);
        if (!q) { box.innerHTML = ''; return; }
        const r = await fetch(`/api/medications?q=${encodeURIComponent(q)}`);
        const list = await r.json();
        box.innerHTML = list.slice(0,10).map(m => `<button type="button" class="list-group-item list-group-item-action" data-med-id="${m.id}">${m.name}</button>`).join('');
        box.querySelectorAll('.list-group-item').forEach(btn => btn.onclick = () => {
          box.querySelectorAll('.list-group-item').forEach(x=>x.classList.remove('active'));
          btn.classList.add('active');
          input.value = btn.textContent;
        });
      }, 300);
    };
  });

  // delete PT
  document.querySelectorAll('[data-action="delete-pt"]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      if (!confirm('삭제하시겠습니까?')) return;
      const res = await fetch(`/api/encounters/pt_records/${id}`, { method: 'DELETE' });
      if (res.ok) showEncounterDetail(encounterId);
    };
  });

  // delete OT
  document.querySelectorAll('[data-action="delete-ot"]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      if (!confirm('삭제하시겠습니까?')) return;
      const res = await fetch(`/api/encounters/ot_records/${id}`, { method: 'DELETE' });
      if (res.ok) showEncounterDetail(encounterId);
    };
  });
}

// Add handlers for adding new records
document.getElementById('addSoapBtn').addEventListener('click', async () => {
  // decide whether new or edit
  const editId = document.getElementById('addSoapBtn').dataset.editId;
  const encounterId = getCurrentEncounterId();
  const payload = {
    subjective: document.getElementById('new_subjective').value,
    objective: document.getElementById('new_objective').value,
    assessment: document.getElementById('new_assessment').value,
    plan: document.getElementById('new_plan').value
  };
  if (!encounterId) return showAlert('Encounter 정보가 없습니다.');
  if (editId) {
    const res = await fetch(`/api/encounters/medical_records/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    delete document.getElementById('addSoapBtn').dataset.editId;
    if (res.ok) showEncounterDetail(encounterId);
  } else {
    const user = sessionStorage.getItem('emr_user');
    const u = user ? JSON.parse(user) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (u) { headers['x-user-id'] = u.id; headers['x-user-role'] = u.role; }
    const res = await fetch(`/api/encounters/${encounterId}/medical_records`, { method: 'POST', headers, body: JSON.stringify(payload) });
    if (res.ok) showEncounterDetail(encounterId);
  }
  // clear fields
  document.getElementById('new_subjective').value = '';
  document.getElementById('new_objective').value = '';
  document.getElementById('new_assessment').value = '';
  document.getElementById('new_plan').value = '';
});

document.getElementById('addPrescBtn').addEventListener('click', async () => {
  const encounterId = getCurrentEncounterId();
  const payload = { note: document.getElementById('new_presc_note').value };
  if (!encounterId) return showAlert('Encounter 정보가 없습니다.');
  const user = sessionStorage.getItem('emr_user');
  const u = user ? JSON.parse(user) : null;
  const headers = { 'Content-Type': 'application/json' };
  if (u) { headers['x-user-id'] = u.id; headers['x-user-role'] = u.role; }
  const res = await fetch(`/api/encounters/${encounterId}/prescriptions`, { method: 'POST', headers, body: JSON.stringify(payload) });
  if (res.ok) {
    document.getElementById('new_presc_note').value = '';
    showEncounterDetail(encounterId);
  }
});

document.getElementById('addPtBtn').addEventListener('click', async () => {
  const encounterId = getCurrentEncounterId();
  const payload = {
    treatmentDate: new Date().toISOString(),
    treatmentType: document.getElementById('new_pt_type').value,
    bodyPart: document.getElementById('new_pt_part').value,
    durationMin: parseInt(document.getElementById('new_pt_duration').value || '0', 10),
    intensity: document.getElementById('new_pt_intensity').value,
    patientResponse: document.getElementById('new_pt_response').value
  };
  if (!encounterId) return showAlert('Encounter 정보가 없습니다.');
  const user = sessionStorage.getItem('emr_user');
  const u = user ? JSON.parse(user) : null;
  const headers = { 'Content-Type': 'application/json' };
  if (u) { headers['x-user-id'] = u.id; headers['x-user-role'] = u.role; }
  // determine kind
  const kindSel = document.getElementById('new_therapy_kind');
  const kind = kindSel ? kindSel.value : 'PT';
  const endpoint = kind === 'OT' ? `/api/encounters/${encounterId}/ot_records` : `/api/encounters/${encounterId}/pt_records`;
  const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) });
  if (res.ok) {
    if (document.getElementById('new_therapy_kind')) document.getElementById('new_therapy_kind').value = 'PT';
    document.getElementById('new_pt_type').value = '';
    document.getElementById('new_pt_part').value = '';
    document.getElementById('new_pt_duration').value = '';
    document.getElementById('new_pt_response').value = '';
    showEncounterDetail(encounterId);
  }
});

function getCurrentEncounterId() {
  // find selected encounter id from encounterList active item (simple approach: find first button that is not hidden?)
  // We can store current encounter id globally when showEncounterDetail called
  return window.__currentEncounterId || null;
}

// (previous wrapper removed) showEncounterDetail now sets window.__currentEncounterId itself
